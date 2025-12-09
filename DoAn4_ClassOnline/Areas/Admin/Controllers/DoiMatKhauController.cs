using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DoAn4_ClassOnline.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class DoiMatKhauController : Controller
    {
        private readonly ApplicationDbContext _context;

        public DoiMatKhauController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ⭐ ENDPOINT THAY ĐỔI MẬT KHẨU (DÙNG CHUNG CHO TEACHER & STUDENT)
        [HttpPost]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                // ⭐ LẤY THÔNG TIN USER TỪ SESSION
                var userId = HttpContext.Session.GetInt32("UserId");

                if (!userId.HasValue)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!"
                    });
                }

                // Validate input
                if (string.IsNullOrEmpty(request.OldPassword))
                {
                    return Json(new { success = false, message = "Vui lòng nhập mật khẩu cũ!" });
                }

                if (string.IsNullOrEmpty(request.NewPassword))
                {
                    return Json(new { success = false, message = "Vui lòng nhập mật khẩu mới!" });
                }

                if (request.NewPassword.Length < 6)
                {
                    return Json(new { success = false, message = "Mật khẩu mới phải có ít nhất 6 ký tự!" });
                }

                if (request.NewPassword != request.ConfirmPassword)
                {
                    return Json(new { success = false, message = "Mật khẩu xác nhận không khớp!" });
                }

                // Tìm user
                var user = await _context.Users.FindAsync(userId.Value);

                if (user == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy người dùng!" });
                }

                // Kiểm tra mật khẩu cũ
                string hashedOldPassword = HashPassword(request.OldPassword);
                
                if (user.PasswordHash != hashedOldPassword)
                {
                    return Json(new { success = false, message = "Mật khẩu cũ không chính xác!" });
                }

                // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
                if (request.OldPassword == request.NewPassword)
                {
                    return Json(new { success = false, message = "Mật khẩu mới phải khác mật khẩu cũ!" });
                }

                // Cập nhật mật khẩu mới
                user.PasswordHash = HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                // ⭐ XÓA SESSION ĐỂ BẮT NGƯỜI DÙNG ĐĂNG NHẬP LẠI
                HttpContext.Session.Clear();

                return Json(new
                {
                    success = true,
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // ⭐ HÀM HASH MẬT KHẨU (DÙNG CHUNG VỚI DANGNHAPCONTROLLER)
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
    }

    // Request Model
    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
        public string ConfirmPassword { get; set; } = "";
    }
}