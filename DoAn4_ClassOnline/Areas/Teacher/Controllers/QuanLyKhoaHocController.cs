using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class QuanLyKhoaHocController : Controller
    {
        private readonly ApplicationDbContext _context;

        public QuanLyKhoaHocController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                //if (userId == null)
                //{
                //    TempData["Error"] = "Vui lòng đăng nhập!";
                //    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                //}

                // Lấy danh sách khóa học của giảng viên
                var khoaHocs = await _context.KhoaHocs
                    .Where(k => k.GiaoVienId == 2)
                    .Include(k => k.GiaoVien)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.ThamGiaKhoaHocs)
                    .OrderByDescending(k => k.CreatedAt)
                    .ToListAsync();

                // Lấy danh sách học kỳ cho dropdown
                ViewBag.HocKyList = await _context.HocKies
                    .OrderByDescending(h => h.HocKyId)
                    .Select(h => new
                    {
                        h.HocKyId,
                        h.TenHocKy,
                        h.NamHoc,
                        Ten = h.TenHocKy + " / " + h.NamHoc
                    })
                    .ToListAsync();

                ViewBag.KhoaList = await _context.Khoas
                    .Select(k => new
                    {
                        k.KhoaId,
                        k.TenKhoa
                    }).ToListAsync();

                return View(khoaHocs);
            }
            catch (Exception)
            {
                return View("Error");
            }

        }



        public async Task<IActionResult> QuanLyKhoaHoc(int? id)
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                //if (userId == null)
                //{
                //    TempData["Error"] = "Vui lòng đăng nhập!";
                //    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                //}
                // Lấy thông tin khóa học 
                if (id == null)
                    return NotFound();

                var khoaHoc = await _context.KhoaHocs
                    .Where(k => k.KhoaHocId == id)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.GiaoVien)
                    .FirstOrDefaultAsync();

                if (khoaHoc == null)
                    return NotFound();

                // Lấy danh sách học kỳ cho dropdown
                ViewBag.HocKyList = await _context.HocKies
                    .OrderByDescending(h => h.HocKyId)
                    .Select(h => new
                    {
                        h.HocKyId,
                        h.TenHocKy,
                        h.NamHoc,
                        Ten = h.TenHocKy + " / " + h.NamHoc
                    })
                    .ToListAsync();

                ViewBag.KhoaList = await _context.Khoas
                    .Select(k => new
                    {
                        k.KhoaId,
                        k.TenKhoa
                    }).ToListAsync();


                return View(khoaHoc);
            }
            catch (Exception)
            {
                return View("Error");
            }
        }
    }
}
