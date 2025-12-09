using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
    [Area("Student")]
    public class TracNghiemController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TracNghiemController> _logger;

        public TracNghiemController(ApplicationDbContext context, ILogger<TracNghiemController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ⭐ NHẬN KHOAHOCID TỪ QUERY STRING ⭐
        public async Task<IActionResult> Index(int? khoaHocId)
        {
            _logger.LogInformation($"🔍 TracNghiem/Index - khoaHocId: {khoaHocId}");

            // Kiểm tra đăng nhập
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Content("<div class='alert alert-warning'>Vui lòng đăng nhập!</div>");
            }

            _logger.LogInformation($"🔍 UserId: {userId}");

            // Kiểm tra khoaHocId
            if (khoaHocId == null || khoaHocId <= 0)
            {
                return Content("<div class='alert alert-warning'>Không xác định được khóa học!</div>");
            }

            // ⭐ KIỂM TRA TỔNG SỐ BÀI TRẮC NGHIỆM TRONG KHÓA HỌC ⭐
            var totalBaiTracNghiem = await _context.BaiTracNghiems
                .Where(bt => bt.KhoaHocId == khoaHocId)
                .CountAsync();

            _logger.LogInformation($"📊 Total BaiTracNghiem: {totalBaiTracNghiem}");

            // ⭐ KIỂM TRA SỐ BÀI ĐÃ ĐƯỢC GIAO ⭐
            var totalBaiDuocGiao = await _context.GiaoBaiTracNghiems
                .Where(gb => gb.KhoaHocId == khoaHocId && gb.SinhVienId == userId)
                .CountAsync();

            _logger.LogInformation($"📊 Total assigned to student: {totalBaiDuocGiao}");

            // ⭐ LẤY DANH SÁCH BÀI TRẮC NGHIỆM ĐÃ ĐƯỢC GIAO ⭐
            var baiTracNghiems = await _context.BaiTracNghiems
                .Where(bt => bt.KhoaHocId == khoaHocId)
                // ⭐ CHỈ LẤY BÀI ĐÃ ĐƯỢC GIAO CHO SINH VIÊN ⭐
                .Where(bt => bt.GiaoBaiTracNghiems.Any(gb => 
                    gb.KhoaHocId == khoaHocId && 
                    gb.SinhVienId == userId))
                .Include(bt => bt.BaiLamTracNghiems
                    .Where(bl => bl.SinhVienId == userId))
                .OrderByDescending(bt => bt.NgayTao) // ⭐ SẮP XẾP THEO NGÀY TẠO MỚI NHẤT ⭐
                .ToListAsync();

            _logger.LogInformation($"✅ Loaded {baiTracNghiems.Count} bài trắc nghiệm");

            // ⭐ CHUYỂN ĐỔI SANG DYNAMIC LIST ĐỂ VIEW CÓ THỂ SỬ DỤNG ⭐
            var baiTracNghiemList = baiTracNghiems.Select(bt => new
            {
                bt.BaiTracNghiemId,
                bt.TenBaiThi,
                bt.MoTa,
                bt.ThoiGianBatDau,
                bt.ThoiGianKetThuc,
                bt.ThoiLuongLamBai,
                bt.LoaiBaiThi,
                bt.ChoXemKetQua,
                bt.SoLanLamToiDa,
                bt.DiemToiDa,
                bt.NgayTao, // ⭐ THÊM NGÀY TẠO VÀO OBJECT ⭐
                // Thông tin bài làm của sinh viên
                SoLanDaLam = bt.BaiLamTracNghiems.Count,
                DiemCaoNhat = bt.BaiLamTracNghiems.Any() 
                    ? bt.BaiLamTracNghiems.Max(bl => bl.Diem) 
                    : (decimal?)null,
                DaLam = bt.BaiLamTracNghiems.Any()
            }).ToList();

            // ⭐ CHIA BÀI TRẮC NGHIỆM THEO LOẠI (ĐÃ ĐƯỢC SẮP XẾP THEO NGÀY TẠO) ⭐
            var baiTap = baiTracNghiemList.Where(b => b.LoaiBaiThi == "Bài tập").Cast<dynamic>().ToList();
            var baiThi = baiTracNghiemList.Where(b => b.LoaiBaiThi == "Bài thi").Cast<dynamic>().ToList();

            _logger.LogInformation($"📚 Bài tập: {baiTap.Count}, Bài thi: {baiThi.Count}");

            ViewBag.BaiTap = baiTap;
            ViewBag.BaiThi = baiThi;
            ViewBag.KhoaHocId = khoaHocId;

            return PartialView();
        }

        // ⭐ API LẤY THÔNG TIN CHI TIẾT BÀI TRẮC NGHIỆM ⭐
        [HttpGet]
        public async Task<IActionResult> GetChiTietBaiTracNghiem(int baiTracNghiemId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            var baiTracNghiem = await _context.BaiTracNghiems
                .Where(bt => bt.BaiTracNghiemId == baiTracNghiemId)
                .Include(bt => bt.BaiLamTracNghiems.Where(bl => bl.SinhVienId == userId))
                .Include(bt => bt.CauHois)
                .FirstOrDefaultAsync();

            if (baiTracNghiem == null)
            {
                return Json(new { success = false, message = "Không tìm thấy bài trắc nghiệm!" });
            }

            return Json(new
            {
                success = true,
                data = new
                {
                    baiTracNghiem.BaiTracNghiemId,
                    baiTracNghiem.TenBaiThi,
                    baiTracNghiem.MoTa,
                    baiTracNghiem.ThoiGianBatDau,
                    baiTracNghiem.ThoiGianKetThuc,
                    baiTracNghiem.ThoiLuongLamBai,
                    baiTracNghiem.LoaiBaiThi,
                    baiTracNghiem.ChoXemKetQua,
                    baiTracNghiem.SoLanLamToiDa,
                    SoCauHoi = baiTracNghiem.CauHois.Count,
                    SoLanDaLam = baiTracNghiem.BaiLamTracNghiems.Count,
                    DiemCaoNhat = baiTracNghiem.BaiLamTracNghiems.Any()
                        ? baiTracNghiem.BaiLamTracNghiems.Max(bl => bl.Diem)
                        : (decimal?)null
                }
            });
        }

        // ⭐ ACTION XEM KẾT QUẢ BÀI LÀM ⭐
        public async Task<IActionResult> XemKetQua(int baiTracNghiemId)
        {
            _logger.LogInformation($"🔍 XemKetQua - baiTracNghiemId: {baiTracNghiemId}");

            // Kiểm tra đăng nhập
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                TempData["Error"] = "Vui lòng đăng nhập!";
                return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
            }

            // Lấy thông tin bài làm MỚI NHẤT của sinh viên
            var baiLam = await _context.BaiLamTracNghiems
                .Where(bl => bl.BaiTracNghiemId == baiTracNghiemId && bl.SinhVienId == userId && bl.NgayNop != null)
                .OrderByDescending(bl => bl.NgayNop)
                .Include(bl => bl.BaiTracNghiem)
                    .ThenInclude(bt => bt.CauHois)
                        .ThenInclude(ch => ch.DapAns)
                .Include(bl => bl.TraLoiSinhViens)
                    .ThenInclude(tl => tl.DapAn)
                .Include(bl => bl.SinhVien)
                .FirstOrDefaultAsync();

            if (baiLam == null)
            {
                TempData["Error"] = "Không tìm thấy bài làm hoặc bạn chưa nộp bài!";
                return RedirectToAction("Index", "TracNghiem", new { khoaHocId = baiLam?.BaiTracNghiem.KhoaHocId });
            }

            // Kiểm tra quyền xem kết quả
            if (baiLam.BaiTracNghiem.ChoXemKetQua != true)
            {
                TempData["Error"] = "Giảng viên chưa cho phép xem kết quả!";
                return RedirectToAction("Index", "TracNghiem", new { khoaHocId = baiLam.BaiTracNghiem.KhoaHocId });
            }

            // Truyền dữ liệu sang View
            ViewBag.BaiTracNghiemId = baiTracNghiemId;
            ViewBag.BaiLamId = baiLam.BaiLamId;
            ViewBag.TenBaiThi = baiLam.BaiTracNghiem.TenBaiThi;
            ViewBag.TenSinhVien = baiLam.SinhVien.FullName;
            ViewBag.MaSinhVien = baiLam.SinhVien.MaSo;
            ViewBag.SoCauHoi = baiLam.BaiTracNghiem.CauHois.Count;
            ViewBag.Diem = baiLam.Diem ?? 0;
            ViewBag.DiemToiDa = baiLam.BaiTracNghiem.DiemToiDa ?? 10;
            ViewBag.NgayNop = baiLam.NgayNop?.ToString("dd/MM/yyyy HH:mm");

            return View();
        }

        // ⭐ API LẤY CHI TIẾT BÀI LÀM VỚI ĐÁP ÁN ĐÚNG/SAI ⭐
        [HttpGet]
        public async Task<IActionResult> GetChiTietBaiLam(int baiLamId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            try
            {
                var baiLam = await _context.BaiLamTracNghiems
                    .Where(bl => bl.BaiLamId == baiLamId && bl.SinhVienId == userId)
                    .Include(bl => bl.BaiTracNghiem)
                        .ThenInclude(bt => bt.CauHois)
                            .ThenInclude(ch => ch.DapAns)
                    .Include(bl => bl.TraLoiSinhViens)
                    .FirstOrDefaultAsync();

                if (baiLam == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài làm!" });
                }

                // Xử lý dữ liệu câu hỏi với trả lời của sinh viên
                var cauHois = baiLam.BaiTracNghiem.CauHois.OrderBy(ch => ch.ThuTu).Select(ch =>
                {
                    // Lấy trả lời của sinh viên
                    var traLoi = baiLam.TraLoiSinhViens.FirstOrDefault(tl => tl.CauHoiId == ch.CauHoiId);
                    var dapAnChon = traLoi?.DapAnId;

                    // Tìm đáp án đúng
                    var dapAnDung = ch.DapAns.FirstOrDefault(da => da.LaDapAnDung == true);
                    var dapAnDungId = dapAnDung?.DapAnId;

                    // Kiểm tra trả lời đúng/sai
                    bool? laDung = null;
                    if (dapAnChon.HasValue && dapAnDungId.HasValue)
                    {
                        laDung = dapAnChon.Value == dapAnDungId.Value;
                    }

                    // Lấy list đáp án
                    var dapAns = ch.DapAns.OrderBy(da => da.ThuTu).Select((da, index) => new
                    {
                        dapAnId = da.DapAnId,
                        noiDung = da.NoiDungDapAn,
                        key = ((char)('A' + index)).ToString(),
                        laDapAnDung = da.LaDapAnDung == true,
                        duocChon = da.DapAnId == dapAnChon
                    }).ToList();

                    return new
                    {
                        cauHoiId = ch.CauHoiId,
                        noiDung = ch.NoiDungCauHoi,
                        hinhAnh = ch.HinhAnh,
                        diem = ch.Diem,
                        dapAns = dapAns,
                        dapAnChon = dapAnChon.HasValue ? dapAns.FirstOrDefault(da => da.dapAnId == dapAnChon)?.key : null,
                        dapAnDung = dapAnDungId.HasValue ? dapAns.FirstOrDefault(da => da.dapAnId == dapAnDungId)?.key : null,
                        laDung = laDung
                    };
                }).ToList();

                return Json(new
                {
                    success = true,
                    cauHois = cauHois
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading chi tiet bai lam");
                return Json(new { success = false, message = "Có lỗi xảy ra!" });
            }
        }
    }
}
