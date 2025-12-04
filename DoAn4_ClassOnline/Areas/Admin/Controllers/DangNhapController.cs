using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToHomePage();
            }

            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string email, string password, bool rememberMe, string? returnUrl = null)
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

                // LƯU THÔNG TIN VÀO SESSION (MỚI)
                SaveUserToSession(user, roleId);

                // Đăng nhập
                await SignInUser(user, roleId, rememberMe);
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
        public async Task<IActionResult> Logout()
        {
            // XÓA toàn bộ Session
            HttpContext.Session.Clear();

            // Đăng xuất Authentication (xóa cookie)
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
        }

        #region Private Methods

        // LƯU THÔNG TIN USER VÀO SESSION (MỚI)
        private void SaveUserToSession(User user, int? roleId)
        {
            HttpContext.Session.SetInt32("UserId", user.UserId);
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("Email", user.Email);
            HttpContext.Session.SetString("FullName", user.FullName);
            HttpContext.Session.SetString("Avatar", user.Avatar ?? "~/assets/image/logo.png");
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

        private async Task SignInUser(User user, int? roleId, bool rememberMe)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("Username", user.Username),
                new Claim("RoleId", roleId?.ToString() ?? "3"),
                new Claim(ClaimTypes.Role, GetRoleName(roleId))
            };

            if (!string.IsNullOrEmpty(user.Avatar))
            {
                claims.Add(new Claim("Avatar", user.Avatar));
            }

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = rememberMe,
                ExpiresUtc = rememberMe ? DateTimeOffset.UtcNow.AddDays(30) : DateTimeOffset.UtcNow.AddHours(2)
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);
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
            var roleId = User.FindFirstValue("RoleId");

            return roleId switch
            {
                "1" => RedirectToAction("Index", "Home", new { area = "Admin" }),
                "2" => RedirectToAction("Index", "Home", new { area = "Teacher" }),
                "3" => RedirectToAction("Index", "Home", new { area = "Student" }),
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
