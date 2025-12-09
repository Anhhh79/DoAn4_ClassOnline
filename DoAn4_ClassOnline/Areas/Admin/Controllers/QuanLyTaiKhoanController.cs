using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class QuanLyTaiKhoanController : Controller
    {
        private readonly ApplicationDbContext _context;

        public QuanLyTaiKhoanController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(string? searchTerm, int? khoaId)
        {
            // Lấy danh sách tài khoản từ database
            var query = _context.Users
                .Include(u => u.Khoa)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsQueryable();

            // Tìm kiếm theo tên hoặc email
            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => 
                    u.FullName.Contains(searchTerm) || 
                    u.Email.Contains(searchTerm) ||
                    u.MaSo.Contains(searchTerm));
            }

            // Lọc theo khoa
            if (khoaId.HasValue && khoaId.Value > 0)
            {
                query = query.Where(u => u.KhoaId == khoaId.Value);
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            // Lấy danh sách khoa để hiển thị trong dropdown
            ViewBag.Khoas = await _context.Khoas
                .Where(k => k.IsActive == true)
                .OrderBy(k => k.TenKhoa)
                .ToListAsync();

            return View(users);
        }

        // API khóa/mở tài khoản
        [HttpPost]
        public async Task<IActionResult> ToggleAccountStatus(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy tài khoản!" });
                }

                // Đảo trạng thái
                user.IsActive = !user.IsActive;
                await _context.SaveChangesAsync();

                return Json(new 
                { 
                    success = true, 
                    message = user.IsActive == true ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!",
                    isActive = user.IsActive
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // API lấy chi tiết tài khoản
        [HttpGet]
        public async Task<IActionResult> GetUserDetail(int userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Khoa)
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy tài khoản!" });
                }

                var role = user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "Chưa có vai trò";

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        fullName = user.FullName,
                        ngaySinh = user.NgaySinh?.ToString("dd/MM/yyyy") ?? "Chưa cập nhật",
                        email = user.Email,
                        phoneNumber = user.PhoneNumber ?? "Chưa cập nhật",
                        gioiTinh = user.GioiTinh ?? "Chưa cập nhật",
                        maSo = user.MaSo ?? "Chưa có",
                        khoa = user.Khoa?.TenKhoa ?? "Chưa có khoa",
                        chucVu = role,
                        avatar = user.Avatar ?? "/assets/image/tải xuống.jpg"
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }
}
