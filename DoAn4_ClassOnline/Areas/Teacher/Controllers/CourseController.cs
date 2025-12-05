using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class CourseController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CourseController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ⭐ CẬP NHẬT ACTION INDEX ĐỂ NHẬN KHOAHOCID ⭐
        public async Task<IActionResult> Index(int? id)
        {
            if (id == null)
            {
                TempData["Error"] = "Không tìm thấy khóa học!";
                return RedirectToAction("Index", "Home");
            }

            var userId = HttpContext.Session.GetInt32("UserId");

            // Lấy thông tin khóa học từ database
            var khoaHoc = await _context.KhoaHocs
                .Include(k => k.GiaoVien)
                .Include(k => k.Khoa)
                .Include(k => k.HocKy)
                .FirstOrDefaultAsync(k => k.KhoaHocId == id && k.GiaoVienId == userId);

            if (khoaHoc == null)
            {
                TempData["Error"] = "Không có quyền truy cập khóa học này!";
                return RedirectToAction("Index", "Home");
            }

            // Truyền dữ liệu vào View
            ViewBag.KhoaHoc = khoaHoc;
            return View();
        }

        public IActionResult ThongBao()
        {
            return PartialView("_ThongBaoPartial");
        }

        public IActionResult TaiLieu()
        {
            return PartialView("_TaiLieuPartial");
        }

        public IActionResult BaiTap()
        {
            return PartialView("_BaiTapPartial");
        }

        public IActionResult DanhSachNopBai()
        {
            return View("_DanhSachNopBaiPartial");
        }

        public IActionResult TracNghiem()
        {
            return PartialView("_TracNghiemPartial");
        }
    }
}
