using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(int? hocKyId)
        {
            // Lấy UserId từ Session
            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (userId == null)
            {
                TempData["Error"] = "Vui lòng đăng nhập!";
                return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
            }

            // Query lấy khóa học của giảng viên đang đăng nhập
            var query = _context.KhoaHocs
                .Where(k => k.GiaoVienId == userId) // SỬA: Dùng GiaoVienId
                .Include(k => k.GiaoVien)
                .Include(k => k.Khoa)
                .Include(k => k.HocKy)
                .Include(k => k.ThamGiaKhoaHocs)
                .AsQueryable();

            // Lọc theo học kỳ nếu có
            if (hocKyId.HasValue && hocKyId.Value > 0)
            {
                query = query.Where(k => k.HocKyId == hocKyId.Value);
            }

            var khoaHocs = await query
                .OrderByDescending(k => k.CreatedAt)
                .ToListAsync();

            // Lấy danh sách học kỳ để hiển thị dropdown
            var hocKyList = await _context.HocKies
                .OrderByDescending(h => h.HocKyId)
                .ToListAsync();

            ViewBag.HocKyList = hocKyList;
            ViewBag.SelectedHocKy = hocKyId ?? 0;

            return View(khoaHocs);
        }

        public async Task<IActionResult> DanhSach(int khoaHocId)
        {
            // Kiểm tra quyền truy cập
            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (userId == null)
            {
                TempData["Error"] = "Vui lòng đăng nhập!";
                return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
            }

            // Lấy thông tin khóa học và danh sách sinh viên
            var khoaHoc = await _context.KhoaHocs
                .Include(k => k.GiaoVien)
                .Include(k => k.Khoa)
                .Include(k => k.HocKy)
                .Include(k => k.ThamGiaKhoaHocs)
                    .ThenInclude(t => t.SinhVien)
                .FirstOrDefaultAsync(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == userId);

            if (khoaHoc == null)
            {
                TempData["Error"] = "Không tìm thấy khóa học hoặc bạn không có quyền truy cập!";
                return RedirectToAction("Index");
            }

            return View("_DanhSachThamGia", khoaHoc);
        }
    }
}
