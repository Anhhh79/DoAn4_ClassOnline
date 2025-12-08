using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
    [Area("Student")]
    public class LamBaiTracNghiemController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LamBaiTracNghiemController> _logger;

        public LamBaiTracNghiemController(ApplicationDbContext context, ILogger<LamBaiTracNghiemController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ⭐ TRANG LÀM BÀI TRẮC NGHIỆM ⭐
        public async Task<IActionResult> Index(int? baiTracNghiemId)
        {
            _logger.LogInformation($"🔍 LamBaiTracNghiem/Index - baiTracNghiemId: {baiTracNghiemId}");

            // Kiểm tra đăng nhập
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                TempData["Error"] = "Vui lòng đăng nhập!";
                return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
            }

            // Kiểm tra baiTracNghiemId
            if (baiTracNghiemId == null || baiTracNghiemId <= 0)
            {
                TempData["Error"] = "ID bài trắc nghiệm không hợp lệ!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ LẤY THÔNG TIN BÀI TRẮC NGHIỆM ⭐
            var baiTracNghiem = await _context.BaiTracNghiems
                .Include(bt => bt.KhoaHoc)
                .Include(bt => bt.CauHois)
                .FirstOrDefaultAsync(bt => bt.BaiTracNghiemId == baiTracNghiemId);

            if (baiTracNghiem == null)
            {
                TempData["Error"] = "Không tìm thấy bài trắc nghiệm!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ KIỂM TRA XEM ĐÃ ĐƯỢC GIAO CHƯA ⭐
            var duocGiao = await _context.GiaoBaiTracNghiems
                .AnyAsync(gb => gb.BaiTracNghiemId == baiTracNghiemId && gb.SinhVienId == userId);

            if (!duocGiao)
            {
                TempData["Error"] = "Bài trắc nghiệm chưa được giao cho bạn!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ KIỂM TRA THỜI GIAN THI ⭐
            var now = DateTime.Now;
            if (baiTracNghiem.ThoiGianBatDau.HasValue && now < baiTracNghiem.ThoiGianBatDau.Value)
            {
                TempData["Error"] = "Chưa đến giờ làm bài!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            if (baiTracNghiem.ThoiGianKetThuc.HasValue && now > baiTracNghiem.ThoiGianKetThuc.Value)
            {
                TempData["Error"] = "Đã hết thời gian làm bài!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ KIỂM TRA SỐ LẦN LÀM ⭐
            var soLanDaLam = await _context.BaiLamTracNghiems
                .Where(bl => bl.BaiTracNghiemId == baiTracNghiemId && bl.SinhVienId == userId)
                .CountAsync();

            if (soLanDaLam >= (baiTracNghiem.SoLanLamToiDa ?? int.MaxValue))
            {
                TempData["Error"] = "Bạn đã hết lượt làm bài!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ LẤY THÔNG TIN SINH VIÊN ⭐
            var sinhVien = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new { u.FullName, u.MaSo })
                .FirstOrDefaultAsync();

            // ⭐ TRUYỀN DỮ LIỆU SANG VIEW ⭐
            ViewBag.BaiTracNghiemId = baiTracNghiem.BaiTracNghiemId;
            ViewBag.TenBaiThi = baiTracNghiem.TenBaiThi;
            ViewBag.ThoiLuongLamBai = baiTracNghiem.ThoiLuongLamBai ?? 60;
            ViewBag.TenSinhVien = sinhVien?.FullName ?? "Sinh viên";
            ViewBag.MaSinhVien = sinhVien?.MaSo ?? "";
            ViewBag.SoCauHoi = baiTracNghiem.CauHois.Count;
            ViewBag.TronCauHoi = baiTracNghiem.TronCauHoi ?? false;

            _logger.LogInformation($"✅ Loaded bài trắc nghiệm: {baiTracNghiem.TenBaiThi}");

            return View();
        }

        // ⭐ API LẤY CÂU HỎI CỦA BÀI TRẮC NGHIỆM ⭐
        [HttpGet]
        public async Task<IActionResult> GetCauHoi(int baiTracNghiemId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            try
            {
                var cauHois = await _context.CauHois
                    .Where(ch => ch.BaiTracNghiemId == baiTracNghiemId)
                    .OrderBy(ch => ch.ThuTu)
                    .Select(ch => new
                    {
                        ch.CauHoiId,
                        ch.NoiDung,
                        ch.DapAnA,
                        ch.DapAnB,
                        ch.DapAnC,
                        ch.DapAnD,
                        ch.HinhAnh,
                        ch.Diem,
                        ch.ThuTu
                    })
                    .ToListAsync();

                return Json(new { success = true, cauHois });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error: {ex.Message}");
                return Json(new { success = false, message = "Có lỗi xảy ra!" });
            }
        }

        // ⭐ API NỘP BÀI ⭐
        [HttpPost]
        public async Task<IActionResult> NopBai([FromBody] NopBaiRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            try
            {
                // Lấy thông tin bài trắc nghiệm
                var baiTracNghiem = await _context.BaiTracNghiems
                    .Include(bt => bt.CauHois)
                    .FirstOrDefaultAsync(bt => bt.BaiTracNghiemId == request.BaiTracNghiemId);

                if (baiTracNghiem == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài trắc nghiệm!" });
                }

                // Tính điểm
                decimal tongDiem = 0;
                foreach (var traLoi in request.DanhSachTraLoi)
                {
                    var cauHoi = baiTracNghiem.CauHois
                        .FirstOrDefault(ch => ch.CauHoiId == traLoi.CauHoiId);

                    if (cauHoi != null && cauHoi.DapAnDung == traLoi.DapAnChon)
                    {
                        tongDiem += cauHoi.Diem ?? 0;
                    }
                }

                // Lưu bài làm
                var baiLam = new BaiLamTracNghiem
                {
                    BaiTracNghiemId = request.BaiTracNghiemId,
                    SinhVienId = userId.Value,
                    NgayBatDau = DateTime.Now.AddMinutes(-(baiTracNghiem.ThoiLuongLamBai ?? 0)),
                    NgayNop = DateTime.Now,
                    Diem = tongDiem,
                    TrangThai = "DaNop"
                };

                _context.BaiLamTracNghiems.Add(baiLam);

                // Lưu chi tiết trả lời
                foreach (var traLoi in request.DanhSachTraLoi)
                {
                    var chiTiet = new TraLoiSinhVien
                    {
                        BaiLamId = baiLam.BaiLamId,
                        CauHoiId = traLoi.CauHoiId,
                        DapAnChon = traLoi.DapAnChon,
                        ThoiGianTraLoi = DateTime.Now
                    };
                    _context.TraLoiSinhViens.Add(chiTiet);
                }

                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Nộp bài thành công!",
                    diem = tongDiem,
                    diemToiDa = baiTracNghiem.DiemToiDa ?? 10
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error: {ex.Message}");
                return Json(new { success = false, message = "Có lỗi xảy ra khi nộp bài!" });
            }
        }
    }

    // ⭐ MODEL CHO REQUEST NỘP BÀI ⭐
    public class NopBaiRequest
    {
        public int BaiTracNghiemId { get; set; }
        public List<TraLoiItem> DanhSachTraLoi { get; set; }
    }

    public class TraLoiItem
    {
        public int CauHoiId { get; set; }
        public string DapAnChon { get; set; }
    }
