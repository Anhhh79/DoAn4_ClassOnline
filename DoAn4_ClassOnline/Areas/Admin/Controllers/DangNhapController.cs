using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DoAn4_ClassOnline.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class DangNhapController : Controller
    {
        private readonly ApplicationDbContext _context;

        public DangNhapController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Index(string? returnUrl = null)
        {
            // ⭐ CHỈ KIỂM TRA SESSION THAY VÌ AUTHENTICATION ⭐
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId.HasValue)
            {
                return RedirectToHomePage();
            }

            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string email, string password, string? returnUrl = null)
        {
            try
            {
                // Hash mật khẩu nhập vào
                string hashedPassword = HashPassword(password);

                // Tìm user với email và mật khẩu đã hash
                var user = await _context.Users
                    .Include(u => u.UserRoles)
                    .FirstOrDefaultAsync(u => u.Email == email && u.PasswordHash == hashedPassword);

                if (user == null)
                {
                    TempData["Error"] = "Email hoặc mật khẩu không chính xác!";
                    return View("Index");
                }

                // Kiểm tra trạng thái
                if (user.IsActive != true)
                {
                    TempData["Error"] = "Tài khoản đã bị khóa!";
                    return View("Index");
                }

                // Lấy RoleId
                var userRole = user.UserRoles.FirstOrDefault();
                int? roleId = userRole?.RoleId;

                // ⭐ CHỈ LƯU SESSION - XÓA AUTHENTICATION ⭐
                SaveUserToSession(user, roleId);

                return RedirectByRole(roleId, returnUrl);
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Đăng nhập thất bại: {ex.Message}";
                return View("Index");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Logout()
        {
            // ⭐ CHỈ XÓA SESSION ⭐
            HttpContext.Session.Clear();

            return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
        }

        #region Private Methods

        // LƯU THÔNG TIN USER VÀO SESSION - CHỈ TỒN TẠI TRONG PHIÊN LÀM VIỆC
        private void SaveUserToSession(User user, int? roleId)
        {
            HttpContext.Session.SetInt32("UserId", user.UserId);
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("Email", user.Email);
            HttpContext.Session.SetString("FullName", user.FullName);
            HttpContext.Session.SetString("Avatar", user.Avatar ?? "");
            HttpContext.Session.SetString("PhoneNumber", user.PhoneNumber ?? "");
            HttpContext.Session.SetString("MaSo", user.MaSo ?? "");
            HttpContext.Session.SetString("GioiTinh", user.GioiTinh ?? "");
            HttpContext.Session.SetString("NgaySinh", user.NgaySinh?.ToString("dd/MM/yyyy") ?? "");
            HttpContext.Session.SetString("DiaChi", user.DiaChi ?? "");
            HttpContext.Session.SetInt32("RoleId", roleId ?? 3);
            HttpContext.Session.SetString("RoleName", GetRoleName(roleId));
        }

        // Hash mật khẩu bằng SHA256
        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                StringBuilder builder = new StringBuilder();
                foreach (byte b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }
                return builder.ToString();
            }
        }

        private IActionResult RedirectByRole(int? roleId, string? returnUrl)
        {
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }

            return roleId switch
            {
                1 => RedirectToAction("Index", "Home", new { area = "Admin" }),
                2 => RedirectToAction("Index", "Home", new { area = "Teacher" }),
                3 => RedirectToAction("Index", "Home", new { area = "Student" }),
                _ => RedirectToAction("Index", "Home", new { area = "Student" })
            };
        }

        private IActionResult RedirectToHomePage()
        {
            var roleId = HttpContext.Session.GetInt32("RoleId");

            return roleId switch
            {
                1 => RedirectToAction("Index", "Home", new { area = "Admin" }),
                2 => RedirectToAction("Index", "Home", new { area = "Teacher" }),
                3 => RedirectToAction("Index", "Home", new { area = "Student" }),
                _ => RedirectToAction("Index", "Home", new { area = "Student" })
            };
        }

        private string GetRoleName(int? roleId)
        {
            return roleId switch
            {
                1 => "Admin",
                2 => "Giảng Viên",
                3 => "Sinh Viên",
                _ => "Student"
            };
        }
        #endregion
    }
}
