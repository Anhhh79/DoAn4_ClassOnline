using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace DoAn4_ClassOnline.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class QuanLyHocKyController : Controller
    {
        private readonly ApplicationDbContext _context;

        public QuanLyHocKyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Admin/QuanLyHocKy/Index
        public IActionResult Index()
        {
            return View();
        }

        // GET: Admin/QuanLyHocKy/GetDanhSachHocKy
        [HttpGet]
        public async Task<IActionResult> GetDanhSachHocKy(string? searchTerm)
        {
            try
            {
                var query = _context.HocKies
                    .Where(h => h.IsActive == true)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    searchTerm = searchTerm.ToLower();
                    query = query.Where(h => h.TenHocKy.ToLower().Contains(searchTerm) ||
                                            h.NamHoc.ToLower().Contains(searchTerm));
                }

                // Lấy dữ liệu từ database
                var hocKysFromDb = await query
                    .OrderByDescending(h => h.NamHoc)
                    .ThenBy(h => h.ThuTuHocKy)
                    .ToListAsync();

                // Tính số khóa học cho từng học kỳ
                var hocKyIds = hocKysFromDb.Select(h => h.HocKyId).ToList();

                var soKhoaHocDict = await _context.KhoaHocs
                    .Where(kh => hocKyIds.Contains(kh.HocKyId))
                    .GroupBy(kh => kh.HocKyId)
                    .Select(g => new { HocKyId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.HocKyId, x => x.Count);

                // Map dữ liệu - Format ngày dd/MM/yyyy để hiển thị
                var hocKys = hocKysFromDb.Select(h => new
                {
                    hocKyId = h.HocKyId,
                    tenHocKy = h.TenHocKy,
                    namHoc = h.NamHoc,
                    thuTuHocKy = h.ThuTuHocKy,
                    ngayBatDau = h.NgayBatDau?.ToString("dd/MM/yyyy"),
                    ngayKetThuc = h.NgayKetThuc?.ToString("dd/MM/yyyy"),
                    soKhoaHoc = soKhoaHocDict.GetValueOrDefault(h.HocKyId, 0)
                }).ToList();

                return Json(new { success = true, data = hocKys });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Admin/QuanLyHocKy/ThemHocKy
        [HttpPost]
        public async Task<IActionResult> ThemHocKy([FromBody] ThemHocKyRequest request)
        {
            try
            {
                // Validate
                if (string.IsNullOrWhiteSpace(request.TenHocKy))
                {
                    return Json(new { success = false, message = "Tên học kỳ không được để trống!" });
                }

                if (string.IsNullOrWhiteSpace(request.NamHoc))
                {
                    return Json(new { success = false, message = "Năm học không được để trống!" });
                }

                if (request.ThuTuHocKy <= 0)
                {
                    return Json(new { success = false, message = "Thứ tự học kỳ phải lớn hơn 0!" });
                }

                // Parse ngày tháng từ string với format yyyy-MM-dd (từ Flatpickr)
                DateOnly? ngayBatDau = null;
                DateOnly? ngayKetThuc = null;

                if (!string.IsNullOrEmpty(request.NgayBatDauStr))
                {
                    if (DateOnly.TryParseExact(request.NgayBatDauStr, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedNgayBatDau))
                    {
                        ngayBatDau = parsedNgayBatDau;
                    }
                    else
                    {
                        return Json(new { success = false, message = "Định dạng ngày bắt đầu không hợp lệ!" });
                    }
                }

                if (!string.IsNullOrEmpty(request.NgayKetThucStr))
                {
                    if (DateOnly.TryParseExact(request.NgayKetThucStr, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedNgayKetThuc))
                    {
                        ngayKetThuc = parsedNgayKetThuc;
                    }
                    else
                    {
                        return Json(new { success = false, message = "Định dạng ngày kết thúc không hợp lệ!" });
                    }
                }

                // Validate ngày
                if (ngayBatDau.HasValue && ngayKetThuc.HasValue && ngayBatDau.Value > ngayKetThuc.Value)
                {
                    return Json(new { success = false, message = "Ngày bắt đầu phải trước ngày kết thúc!" });
                }

                // Kiểm tra trùng học kỳ
                var exists = await _context.HocKies
                    .AnyAsync(h => h.TenHocKy.ToLower() == request.TenHocKy.ToLower() &&
                                  h.NamHoc == request.NamHoc);

                if (exists)
                {
                    return Json(new { success = false, message = "Học kỳ này đã tồn tại trong năm học!" });
                }

                // Tạo học kỳ mới
                var hocKy = new HocKy
                {
                    TenHocKy = request.TenHocKy.Trim(),
                    NamHoc = request.NamHoc.Trim(),
                    ThuTuHocKy = request.ThuTuHocKy,
                    NgayBatDau = ngayBatDau,
                    NgayKetThuc = ngayKetThuc,
                    IsActive = true
                };

                _context.HocKies.Add(hocKy);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Thêm học kỳ thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // GET: Admin/QuanLyHocKy/LayThongTinHocKy
        [HttpGet]
        public async Task<IActionResult> LayThongTinHocKy(int hocKyId)
        {
            try
            {
                var hocKy = await _context.HocKies.FindAsync(hocKyId);

                if (hocKy == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy học kỳ!" });
                }

                // Trả về format yyyy-MM-dd cho Flatpickr
                return Json(new
                {
                    success = true,
                    data = new
                    {
                        hocKyId = hocKy.HocKyId,
                        tenHocKy = hocKy.TenHocKy,
                        namHoc = hocKy.NamHoc,
                        thuTuHocKy = hocKy.ThuTuHocKy,
                        ngayBatDau = hocKy.NgayBatDau?.ToString("yyyy-MM-dd"),
                        ngayKetThuc = hocKy.NgayKetThuc?.ToString("yyyy-MM-dd")
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Admin/QuanLyHocKy/CapNhatHocKy
        [HttpPost]
        public async Task<IActionResult> CapNhatHocKy([FromBody] CapNhatHocKyRequest request)
        {
            try
            {
                // Validate
                if (string.IsNullOrWhiteSpace(request.TenHocKy))
                {
                    return Json(new { success = false, message = "Tên học kỳ không được để trống!" });
                }

                if (string.IsNullOrWhiteSpace(request.NamHoc))
                {
                    return Json(new { success = false, message = "Năm học không được để trống!" });
                }

                if (request.ThuTuHocKy <= 0)
                {
                    return Json(new { success = false, message = "Thứ tự học kỳ phải lớn hơn 0!" });
                }

                var hocKy = await _context.HocKies.FindAsync(request.HocKyId);

                if (hocKy == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy học kỳ!" });
                }

                // Parse ngày tháng từ string với format yyyy-MM-dd (từ Flatpickr)
                DateOnly? ngayBatDau = null;
                DateOnly? ngayKetThuc = null;

                if (!string.IsNullOrEmpty(request.NgayBatDauStr))
                {
                    if (DateOnly.TryParseExact(request.NgayBatDauStr, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedNgayBatDau))
                    {
                        ngayBatDau = parsedNgayBatDau;
                    }
                    else
                    {
                        return Json(new { success = false, message = "Định dạng ngày bắt đầu không hợp lệ!" });
                    }
                }

                if (!string.IsNullOrEmpty(request.NgayKetThucStr))
                {
                    if (DateOnly.TryParseExact(request.NgayKetThucStr, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedNgayKetThuc))
                    {
                        ngayKetThuc = parsedNgayKetThuc;
                    }
                    else
                    {
                        return Json(new { success = false, message = "Định dạng ngày kết thúc không hợp lệ!" });
                    }
                }

                // Validate ngày
                if (ngayBatDau.HasValue && ngayKetThuc.HasValue && ngayBatDau.Value > ngayKetThuc.Value)
                {
                    return Json(new { success = false, message = "Ngày bắt đầu phải trước ngày kết thúc!" });
                }

                // Kiểm tra trùng học kỳ (trừ học kỳ hiện tại)
                var exists = await _context.HocKies
                    .AnyAsync(h => h.TenHocKy.ToLower() == request.TenHocKy.ToLower() &&
                                  h.NamHoc == request.NamHoc &&
                                  h.HocKyId != request.HocKyId);

                if (exists)
                {
                    return Json(new { success = false, message = "Học kỳ này đã tồn tại trong năm học!" });
                }

                // Cập nhật thông tin
                hocKy.TenHocKy = request.TenHocKy.Trim();
                hocKy.NamHoc = request.NamHoc.Trim();
                hocKy.ThuTuHocKy = request.ThuTuHocKy;
                hocKy.NgayBatDau = ngayBatDau;
                hocKy.NgayKetThuc = ngayKetThuc;

                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Cập nhật học kỳ thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Admin/QuanLyHocKy/XoaHocKy
        [HttpPost]
        public async Task<IActionResult> XoaHocKy(int hocKyId)
        {
            try
            {
                var hocKy = await _context.HocKies.FindAsync(hocKyId);

                if (hocKy == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy học kỳ!" });
                }

                // Kiểm tra xem học kỳ có đang được sử dụng không
                var hasCourses = await _context.KhoaHocs.AnyAsync(kh => kh.HocKyId == hocKyId);

                if (hasCourses)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không thể xóa học kỳ đang có khóa học!"
                    });
                }

                _context.HocKies.Remove(hocKy);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Xóa học kỳ thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }

    // Request Models - Nhận string cho ngày tháng
    public class ThemHocKyRequest
    {
        public string TenHocKy { get; set; } = null!;
        public string NamHoc { get; set; } = null!;
        public int ThuTuHocKy { get; set; }
        public string? NgayBatDauStr { get; set; }
        public string? NgayKetThucStr { get; set; }
    }

    public class CapNhatHocKyRequest
    {
        public int HocKyId { get; set; }
        public string TenHocKy { get; set; } = null!;
        public string NamHoc { get; set; } = null!;
        public int ThuTuHocKy { get; set; }
        public string? NgayBatDauStr { get; set; }
        public string? NgayKetThucStr { get; set; }
    }
}