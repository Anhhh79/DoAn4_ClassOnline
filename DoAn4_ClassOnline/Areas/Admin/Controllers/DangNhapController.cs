using DoAn4_ClassOnline.Models;
using DoAn4_ClassOnline.Services;
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
        private readonly IEmailService _emailService;

        // Dictionary lưu OTP tạm thời (trong production nên dùng Redis hoặc Cache)
        private static Dictionary<string, (string Otp, DateTime Expiry)> _otpStore = new();

        public DangNhapController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
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
                1 => RedirectToAction("Index", "QuanLyTaiKhoan", new { area = "Admin" }),
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
        #endregion Quên Mật Khẩu

        #region Quên Mật Khẩu

        // Bước 1: Kiểm tra email và gửi OTP
        [HttpPost]
        public async Task<IActionResult> SendOTP([FromBody] SendOtpRequest request)
        {
            try
            {
                // Kiểm tra email có tồn tại không
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Email không tồn tại trong hệ thống!"
                    });
                }

                // Tạo OTP 6 số ngẫu nhiên
                var otp = new Random().Next(100000, 999999).ToString();

                // Lưu OTP vào dictionary với thời gian hết hạn 5 phút
                _otpStore[request.Email] = (otp, DateTime.Now.AddMinutes(5));

                // Tạo nội dung email
                var emailBody = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                            .otp-box {{ background: white; padding: 20px; text-align: center; 
                                       border-radius: 10px; margin: 20px 0; border: 2px dashed #667eea; }}
                            .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; 
                                        letter-spacing: 5px; }}
                            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>🔐 Mã Xác Nhận OTP</h1>
                                <p>Hệ thống quản lý lớp học CLASS ONLINE</p>
                            </div>
                            <div class='content'>
                                <p>Xin chào <strong>{user.FullName}</strong>,</p>
                                <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP bên dưới để xác thực:</p>
                                
                                <div class='otp-box'>
                                    <p style='margin: 0; color: #666;'>Mã OTP của bạn là:</p>
                                    <div class='otp-code'>{otp}</div>
                                    <p style='margin: 10px 0 0 0; color: #999; font-size: 14px;'>
                                        Mã có hiệu lực trong <strong>5 phút</strong>
                                    </p>
                                </div>

                                <p style='color: #d9534f;'>
                                    <strong>⚠️ Lưu ý:</strong> Không chia sẻ mã này với bất kỳ ai!
                                </p>
                                
                                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                            </div>
                            <div class='footer'>
                                <p>© 2025 CLASS ONLINE - Hệ thống quản lý lớp học</p>
                                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                // Gửi email
                var emailSent = await _emailService.SendEmailAsync(
                    request.Email,
                    "Mã OTP Đặt Lại Mật Khẩu - CLASS ONLINE",
                    emailBody
                );

                if (!emailSent)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không thể gửi email. Vui lòng thử lại!"
                    });
                }

                return Json(new
                {
                    success = true,
                    message = "Mã OTP đã được gửi đến email của bạn!"
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = $"Lỗi: {ex.Message}"
                });
            }
        }

        // Bước 2: Xác thực OTP
        [HttpPost]
        public IActionResult VerifyOTP([FromBody] VerifyOtpRequest request)
        {
            try
            {
                // Kiểm tra email có trong store không
                if (!_otpStore.ContainsKey(request.Email))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại!"
                    });
                }

                var (storedOtp, expiry) = _otpStore[request.Email];

                // Kiểm tra OTP đã hết hạn chưa
                if (DateTime.Now > expiry)
                {
                    _otpStore.Remove(request.Email);
                    return Json(new
                    {
                        success = false,
                        message = "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại!"
                    });
                }

                // Kiểm tra OTP có đúng không
                if (storedOtp != request.Otp)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Mã OTP không chính xác!"
                    });
                }

                return Json(new
                {
                    success = true,
                    message = "Xác thực thành công!"
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = $"Lỗi: {ex.Message}"
                });
            }
        }

        // Bước 3: Đặt lại mật khẩu
        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                // Kiểm tra OTP có hợp lệ không
                if (!_otpStore.ContainsKey(request.Email))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Phiên làm việc đã hết hạn. Vui lòng thử lại!"
                    });
                }

                // Tìm user
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không tìm thấy tài khoản!"
                    });
                }

                // Kiểm tra mật khẩu mới và xác nhận
                if (request.NewPassword != request.ConfirmPassword)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Mật khẩu xác nhận không khớp!"
                    });
                }

                // Hash mật khẩu mới
                user.PasswordHash = HashPassword(request.NewPassword);

                await _context.SaveChangesAsync();

                // Xóa OTP khỏi store
                _otpStore.Remove(request.Email);

                return Json(new
                {
                    success = true,
                    message = "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = $"Lỗi: {ex.Message}"
                });
            }
        }

        // Gửi lại OTP
        [HttpPost]
        public async Task<IActionResult> ResendOTP([FromBody] SendOtpRequest request)
        {
            // Xóa OTP cũ nếu có
            if (_otpStore.ContainsKey(request.Email))
            {
                _otpStore.Remove(request.Email);
            }

            // Gọi lại hàm SendOTP
            return await SendOTP(request);
        }

        #endregion Private Methods & Models
    }

    // Request Models
    public class SendOtpRequest
    {
        public string Email { get; set; }
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
