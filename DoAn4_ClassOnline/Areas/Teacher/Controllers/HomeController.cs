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

        // Action trả về View (không có dữ liệu)
        public IActionResult Index()
        {
            return View();
        }

        // API: Lấy danh sách khóa học (JSON)
        [HttpGet]
        public async Task<IActionResult> GetKhoaHocs(int? hocKyId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                
                if (userId == null)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });
                }

                // Query lấy khóa học
                var query = _context.KhoaHocs
                    .Where(k => k.GiaoVienId == userId && k.TrangThaiKhoaHoc == "DangMo")
                    .Include(k => k.GiaoVien)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.ThamGiaKhoaHocs)
                    .AsQueryable();

                // Lọc theo học kỳ
                if (hocKyId.HasValue && hocKyId.Value > 0)
                {
                    query = query.Where(k => k.HocKyId == hocKyId.Value);
                }

                var khoaHocs = await query
                    .OrderByDescending(k => k.CreatedAt)
                    .Select(k => new
                    {
                        khoaHocId = k.KhoaHocId,
                        tenKhoaHoc = k.TenKhoaHoc,
                        moTa = k.MoTa,
                        hinhAnh = k.HinhAnh,
                        tenGiaoVien = k.GiaoVien.FullName,
                        tenKhoa = k.Khoa.TenKhoa,
                        tenHocKy = k.HocKy.TenHocKy,
                        namHoc = k.HocKy.NamHoc,
                        soLuongSinhVien = k.ThamGiaKhoaHocs.Count,
                        isPublic = k.IsPublic,
                        createdAt = k.CreatedAt
                    })
                    .ToListAsync();

                return Json(new { success = true, khoaHocs });
            }
            catch (Exception ex)
            {
                return View("Error");
            }
        }

        // API: Lấy danh sách học kỳ
        [HttpGet]
        public async Task<IActionResult> GetHocKies()
        {
            try
            {
                var hocKies = await _context.HocKies
                    .OrderByDescending(h => h.HocKyId)
                    .Select(h => new
                    {
                        hocKyId = h.HocKyId,
                        tenHocKy = h.TenHocKy,
                        namHoc = h.NamHoc
                    })
                    .ToListAsync();

                return Json(new { success = true, hocKies });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // Action DanhSach giữ nguyên
        public async Task<IActionResult> DanhSach(int khoaHocId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");

                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }

                var khoaHoc = await _context.KhoaHocs
                    .Include(k => k.GiaoVien)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.ThamGiaKhoaHocs)
                        .ThenInclude(t => t.SinhVien)
                        .ThenInclude(sv => sv.Khoa)
                    .FirstOrDefaultAsync(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == userId);

                if (khoaHoc == null)
                {
                    TempData["Error"] = "Không tìm thấy khóa học!";
                    return RedirectToAction("Index");
                }

                ViewBag.KhoaList = await _context.Khoas
                   .Select(k => new
                   {
                       k.KhoaId,
                       k.TenKhoa
                   }).ToListAsync();

                return View("_DanhSachThamGia", khoaHoc);
            }
            catch(Exception)
            {
                return View("Error");
            }
            
        }
    }
}
