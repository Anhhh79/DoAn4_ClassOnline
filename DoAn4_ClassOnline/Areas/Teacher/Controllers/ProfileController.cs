using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetUserInfo()
        {
            try
            {
                var user = new
                {
                    userId = HttpContext.Session.GetInt32("UserId"),
                    username = HttpContext.Session.GetString("Username") ?? "",
                    email = HttpContext.Session.GetString("Email") ?? "",
                    fullName = HttpContext.Session.GetString("FullName") ?? "",
                    avatar = HttpContext.Session.GetString("Avatar") ?? "/assets/image/logo.png",
                    phoneNumber = HttpContext.Session.GetString("PhoneNumber") ?? "",
                    maSo = HttpContext.Session.GetString("MaSo") ?? "",
                    gioiTinh = HttpContext.Session.GetString("GioiTinh") ?? "",
                    ngaySinh = HttpContext.Session.GetString("NgaySinh") ?? "",
                    diaChi = HttpContext.Session.GetString("DiaChi") ?? "",
                    roleId = HttpContext.Session.GetInt32("RoleId"),
                    roleName = HttpContext.Session.GetString("RoleName") ?? ""
                };

                return Json(new { success = true, user });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateUserInfo([FromBody] UpdateUserRequest request)
        {
            try
            {
                // Validate
                if (string.IsNullOrEmpty(request.FullName) || string.IsNullOrEmpty(request.Email))
                {
                    return Json(new { success = false, message = "Vui lòng điền đầy đủ thông tin!" });
                }

                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                {
                    return Json(new { success = false, message = "Phiên đăng nhập đã hết hạn!" });
                }

                // Tìm user trong database
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy người dùng!" });
                }

                // Cập nhật thông tin
                user.FullName = request.FullName;
                user.Email = request.Email;
                user.PhoneNumber = request.PhoneNumber ?? "";
                user.GioiTinh = request.GioiTinh ?? "";

                // Parse ngày sinh nếu có
                if (!string.IsNullOrEmpty(request.NgaySinh))
                {
                    if (DateOnly.TryParseExact(request.NgaySinh, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out DateOnly ngaySinh))
                    {
                        user.NgaySinh = ngaySinh;
                    }
                }

                user.DiaChi = request.DiaChi ?? "";

                // Lưu vào database
                await _context.SaveChangesAsync();

                // Cập nhật Session
                HttpContext.Session.SetString("FullName", user.FullName);
                HttpContext.Session.SetString("Email", user.Email);
                HttpContext.Session.SetString("PhoneNumber", user.PhoneNumber ?? "");
                HttpContext.Session.SetString("GioiTinh", user.GioiTinh ?? "");
                HttpContext.Session.SetString("NgaySinh", user.NgaySinh?.ToString("dd/MM/yyyy") ?? "");
                HttpContext.Session.SetString("DiaChi", user.DiaChi ?? "");

                return Json(new { success = true, message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }

    public class UpdateUserRequest
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }
        public string? GioiTinh { get; set; }
        public string? NgaySinh { get; set; }
        public string? DiaChi { get; set; }
    }
}