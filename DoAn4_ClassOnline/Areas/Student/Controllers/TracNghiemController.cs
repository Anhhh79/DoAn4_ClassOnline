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
                .OrderBy(bt => bt.ThoiGianBatDau)
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
                // Thông tin bài làm của sinh viên
                SoLanDaLam = bt.BaiLamTracNghiems.Count,
                DiemCaoNhat = bt.BaiLamTracNghiems.Any() 
                    ? bt.BaiLamTracNghiems.Max(bl => bl.Diem) 
                    : (decimal?)null,
                DaLam = bt.BaiLamTracNghiems.Any()
            }).ToList();

            // ⭐ CHIA BÀI TRẮC NGHIỆM THEO LOẠI ⭐
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
    }
}
