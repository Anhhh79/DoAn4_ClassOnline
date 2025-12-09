using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class QuanLyKhoaController : Controller
    {
        private readonly ApplicationDbContext _context;

        public QuanLyKhoaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Admin/QuanLyKhoa/Index
        public IActionResult Index()
        {
            return View();
        }

        // GET: Admin/QuanLyKhoa/GetDanhSachKhoa
        [HttpGet]
        public async Task<IActionResult> GetDanhSachKhoa(string? searchTerm)
        {
            try
            {
                var query = _context.Khoas
                    .Where(k => k.IsActive == true)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    searchTerm = searchTerm.ToLower();
                    query = query.Where(k => k.TenKhoa.ToLower().Contains(searchTerm));
                }

                // Lấy dữ liệu từ database trước
                var khoasFromDb = await query
                    .OrderBy(k => k.TenKhoa)
                    .ToListAsync();

                // Tính toán số giảng viên và sinh viên cho từng khoa
                var khoaIds = khoasFromDb.Select(k => k.KhoaId).ToList();

                var soGiangVienDict = await _context.Users
                    .Where(u => khoaIds.Contains(u.KhoaId.Value) && u.IsActive == true)
                    .Where(u => u.UserRoles.Any(ur => ur.RoleId == 2)) // Teacher
                    .GroupBy(u => u.KhoaId)
                    .Select(g => new { KhoaId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.KhoaId!.Value, x => x.Count);

                var soSinhVienDict = await _context.Users
                    .Where(u => khoaIds.Contains(u.KhoaId.Value) && u.IsActive == true)
                    .Where(u => u.UserRoles.Any(ur => ur.RoleId == 3)) // Student
                    .GroupBy(u => u.KhoaId)
                    .Select(g => new { KhoaId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.KhoaId!.Value, x => x.Count);

                // Map dữ liệu - Chỉ trả về KhoaId thay vì tạo mã khoa
                var khoas = khoasFromDb.Select(k => new
                {
                    khoaId = k.KhoaId,
                    tenKhoa = k.TenKhoa,
                    soGiangVien = soGiangVienDict.GetValueOrDefault(k.KhoaId, 0),
                    soSinhVien = soSinhVienDict.GetValueOrDefault(k.KhoaId, 0)
                }).ToList();

                return Json(new { success = true, data = khoas });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Admin/QuanLyKhoa/ThemKhoa
        [HttpPost]
        public async Task<IActionResult> ThemKhoa([FromBody] ThemKhoaRequest request)
        {
            try
            {
                // Validate
                if (string.IsNullOrWhiteSpace(request.TenKhoa))
                {
                    return Json(new { success = false, message = "Tên khoa không được để trống!" });
                }

                // Kiểm tra trùng tên khoa
                var exists = await _context.Khoas
                    .AnyAsync(k => k.TenKhoa.ToLower() == request.TenKhoa.ToLower());

                if (exists)
                {
                    return Json(new { success = false, message = "Tên khoa đã tồn tại!" });
                }

                // Tạo khoa mới
                var khoa = new Khoa
                {
                    TenKhoa = request.TenKhoa.Trim(),
                    MoTa = null,
                    IsActive = true
                };

                _context.Khoas.Add(khoa);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Thêm khoa thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // GET: Admin/QuanLyKhoa/LayThongTinKhoa
        [HttpGet]
        public async Task<IActionResult> LayThongTinKhoa(int khoaId)
        {
            try
            {
                var khoa = await _context.Khoas.FindAsync(khoaId);

                if (khoa == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy khoa!" });
                }

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        khoaId = khoa.KhoaId,
                        tenKhoa = khoa.TenKhoa
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Admin/QuanLyKhoa/CapNhatKhoa
        [HttpPost]
        public async Task<IActionResult> CapNhatKhoa([FromBody] CapNhatKhoaRequest request)
        {
            try
            {
                // Validate
                if (string.IsNullOrWhiteSpace(request.TenKhoa))
                {
                    return Json(new { success = false, message = "Tên khoa không được để trống!" });
                }

                var khoa = await _context.Khoas.FindAsync(request.KhoaId);

                if (khoa == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy khoa!" });
                }

                // Kiểm tra trùng tên khoa (trừ khoa hiện tại)
                var exists = await _context.Khoas
                    .AnyAsync(k => k.TenKhoa.ToLower() == request.TenKhoa.ToLower() &&
                                  k.KhoaId != request.KhoaId);

                if (exists)
                {
                    return Json(new { success = false, message = "Tên khoa đã tồn tại!" });
                }

                // Cập nhật TenKhoa
                khoa.TenKhoa = request.TenKhoa.Trim();
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Cập nhật khoa thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Admin/QuanLyKhoa/XoaKhoa
        [HttpPost]
        public async Task<IActionResult> XoaKhoa(int khoaId)
        {
            try
            {
                var khoa = await _context.Khoas.FindAsync(khoaId);

                if (khoa == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy khoa!" });
                }

                // Kiểm tra xem khoa có đang được sử dụng không
                var hasUsers = await _context.Users.AnyAsync(u => u.KhoaId == khoaId && u.IsActive == true);
                var hasCourses = await _context.KhoaHocs.AnyAsync(kh => kh.KhoaId == khoaId);

                if (hasUsers || hasCourses)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không thể xóa khoa đang hoạt động!"
                    });
                }

                _context.Khoas.Remove(khoa);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Xóa khoa thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }

    // Request Models
    public class ThemKhoaRequest
    {
        public string TenKhoa { get; set; } = null!;
    }

    public class CapNhatKhoaRequest
    {
        public int KhoaId { get; set; }
        public string TenKhoa { get; set; } = null!;
    }
}