using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
    [Area("Student")]
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");

            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return Json(new { success = false, message = "Không tìm thấy user!" });
            }

            // Cập nhật thông tin
            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;
            user.GioiTinh = request.GioiTinh;
            // ⭐ BỎ DiaChi - Không cho phép sinh viên thay đổi Khoa ⭐

            await _context.SaveChangesAsync();

            // ⭐ CẬP NHẬT SESSION ⭐
            HttpContext.Session.SetString("FullName", user.FullName);
            HttpContext.Session.SetString("PhoneNumber", user.PhoneNumber ?? "");
            HttpContext.Session.SetString("GioiTinh", user.GioiTinh ?? "");

            return Json(new { success = true, message = "Cập nhật thành công!" });
        }
    }

    public class UpdateProfileRequest
    {
        public string FullName { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string GioiTinh { get; set; } = "";
        // ⭐ BỎ DiaChi ⭐
    }
}
