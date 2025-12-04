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

        //lấy danh sách khóa học của giảng viên
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

        //lấy thông tin khóa học theo id
        [HttpGet]
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
                    .Include(k => k.ThamGiaKhoaHocs)
                       .ThenInclude(t => t.SinhVien)
                    .FirstOrDefaultAsync();

                if (khoaHoc == null)
                    return NotFound();

                // 🆕 Lấy thời gian truy cập cuối cùng của từng sinh viên trong khóa học này
                var lichSuTruyCaps = await _context.LichSuTruyCaps
                    .Where(l => l.KhoaHocId == id)
                    .GroupBy(l => l.UserId)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        ThoiGianCuoi = g.Max(l => l.ThoiGianTruyCap)
                    })
                    .ToDictionaryAsync(x => x.UserId, x => x.ThoiGianCuoi);

                ViewBag.LichSuTruyCap = lichSuTruyCaps;


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

        // lấy thông tin chi tiết sinh viên theo id
        [HttpGet]
        public async Task<IActionResult> ThongTinSinhVien(int? id)
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

                // Kiểm tra id
                if (id == null)
                    return NotFound();

                // Lấy thông tin chi tiết sinh viên với các quan hệ
                var sinhVien = await _context.Users
                    .Where(s => s.UserId == id)
                     // Thông tin khoa
                    .FirstOrDefaultAsync();

                if (sinhVien == null)
                    return NotFound();

                return Json(new { success = true, sinhVien });
            }
            catch (Exception)
            {
                return View("Error");
            }
        }
    }
}
