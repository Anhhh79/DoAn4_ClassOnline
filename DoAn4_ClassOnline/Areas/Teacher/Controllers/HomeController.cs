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

        public async Task<IActionResult> Index()
        {
            // Lấy danh sách khóa học kèm thông tin giáo viên, khoa, học kỳ
            var khoaHocs = await _context.KhoaHocs
                .Include(k => k.GiaoVien)
                .Include(k => k.Khoa)
                .Include(k => k.HocKy)
                .OrderByDescending(k => k.CreatedAt)
                .ToListAsync();

            return View(khoaHocs);
        }

        public IActionResult DanhSach()
        {
            return View("_DanhSachThamGia");
        }

    }
}
