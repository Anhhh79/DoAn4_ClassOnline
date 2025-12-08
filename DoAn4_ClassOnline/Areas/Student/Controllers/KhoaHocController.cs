using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
    [Area("Student")]
    public class KhoaHocController : Controller
    {
        private readonly ApplicationDbContext _context;

        public KhoaHocController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (userId == null)
            {
                TempData["Error"] = "Vui lòng đăng nhập!";
                return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
            }

            // ⭐ LẤY HỌC KỲ HIỆN TẠI (MỚI NHẤT) ⭐
            var hocKyHienTai = await _context.HocKies
                .OrderByDescending(h => h.HocKyId)
                .FirstOrDefaultAsync();

            ViewBag.HocKyHienTaiId = hocKyHienTai?.HocKyId ?? 0;

            // ⭐ LẤY KHÓA HỌC CỦA HỌC KỲ HIỆN TẠI ⭐
            var khoaHocIds = await _context.ThamGiaKhoaHocs
                .Where(tg => tg.SinhVienId == userId 
                    && tg.TrangThai == "DangHoc"
                    && tg.KhoaHoc.TrangThaiKhoaHoc == "DangMo"
                    && tg.KhoaHoc.HocKyId == (hocKyHienTai != null ? hocKyHienTai.HocKyId : 0))
                .Select(tg => tg.KhoaHocId)
                .Distinct()
                .ToListAsync();

            // Lấy thông tin khóa học
            var khoaHocs = await _context.KhoaHocs
                .Where(k => khoaHocIds.Contains(k.KhoaHocId))
                .Include(k => k.GiaoVien)
                .Include(k => k.Khoa)
                .Include(k => k.HocKy)
                .Include(k => k.ThamGiaKhoaHocs)
                .OrderByDescending(k => k.CreatedAt)
                .ToListAsync();

            return View(khoaHocs);
        }

        // ⭐ API LẤY DANH SÁCH HỌC KỲ ⭐
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

        // ⭐ API LỌC KHÓA HỌC THEO HỌC KỲ - ĐÃ KHẮC PHỤC DUPLICATE ⭐
        [HttpGet]
        public async Task<IActionResult> GetKhoaHocByHocKy(int? hocKyId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            // ⭐ LẤY DANH SÁCH ID KHÓA HỌC (DISTINCT) ⭐
            var query = _context.ThamGiaKhoaHocs
                .Where(tg => tg.SinhVienId == userId 
                    && tg.TrangThai == "DangHoc"
                    && tg.KhoaHoc.TrangThaiKhoaHoc == "DangMo");

            // ⭐ LỌC THEO HỌC KỲ (NẾU KHÔNG PHẢI "TẤT CẢ") ⭐
            if (hocKyId.HasValue && hocKyId.Value > 0)
            {
                query = query.Where(tg => tg.KhoaHoc.HocKyId == hocKyId.Value);
            }

            var khoaHocIds = await query
                .Select(tg => tg.KhoaHocId)
                .Distinct()
                .ToListAsync();

            // ⭐ LẤY THÔNG TIN KHÓA HỌC (ĐẢM BẢO KHÔNG DUPLICATE) ⭐
            var khoaHocs = await _context.KhoaHocs
                .Where(k => khoaHocIds.Contains(k.KhoaHocId))
                .Include(k => k.GiaoVien)
                .Include(k => k.Khoa)
                .Include(k => k.HocKy)
                .Include(k => k.ThamGiaKhoaHocs)
                .OrderByDescending(k => k.CreatedAt)
                .Select(k => new
                {
                    khoaHocId = k.KhoaHocId,
                    tenKhoaHoc = k.TenKhoaHoc,
                    hinhAnh = k.HinhAnh ?? "/assets/image/tải xuống.jpg",
                    tenGiaoVien = k.GiaoVien.FullName,
                    tenKhoa = k.Khoa.TenKhoa,
                    tenHocKy = k.HocKy.TenHocKy,
                    namHoc = k.HocKy.NamHoc,
                    soLuongSinhVien = k.ThamGiaKhoaHocs.Count,
                    isPublic = k.IsPublic
                })
                .ToListAsync();

            return Json(new { success = true, khoaHocs });
        }
    }
}
