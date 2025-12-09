using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DoAn4_ClassOnline.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class QuanLyTaiKhoanController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public QuanLyTaiKhoanController(ApplicationDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<IActionResult> Index(string? searchTerm, int? khoaId)
        {
            var query = _context.Users
                .Include(u => u.Khoa)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => 
                    u.FullName.Contains(searchTerm) || 
                    u.Email.Contains(searchTerm) ||
                    u.MaSo.Contains(searchTerm));
            }

            if (khoaId.HasValue && khoaId.Value > 0)
            {
                query = query.Where(u => u.KhoaId == khoaId.Value);
            }

            var users = await query
                .OrderBy(u => u.UserId)
                .Skip(1)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            ViewBag.Khoas = await _context.Khoas
                .Where(k => k.IsActive == true)
                .OrderBy(k => k.TenKhoa)
                .ToListAsync();

            ViewBag.Roles = await _context.Roles.ToListAsync();

            return View(users);
        }

        // ⭐ HÀM TẠO MÃ SỐ TỰ ĐỘNG
        private async Task<string> GenerateMaSo(int roleId)
        {
            // Lấy thông tin role để xác định prefix
            var role = await _context.Roles.FindAsync(roleId);
            string prefix = "";

            if (role != null)
            {
                // Student -> SV, Teacher -> GV, Admin -> AD
                prefix = role.RoleName switch
                {
                    "Student" => "SV",
                    "Teacher" => "GV",
                    "Admin" => "AD",
                    _ => "US" // User mặc định
                };
            }

            // Tìm mã số lớn nhất hiện có với prefix này
            var lastUser = await _context.Users
                .Where(u => u.MaSo != null && u.MaSo.StartsWith(prefix))
                .OrderByDescending(u => u.MaSo)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (lastUser != null && !string.IsNullOrEmpty(lastUser.MaSo))
            {
                // Lấy phần số từ mã (VD: SV001 -> 001)
                string numberPart = lastUser.MaSo.Substring(prefix.Length);
                
                if (int.TryParse(numberPart, out int currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
            }

            // Format: SV001, SV002, ..., SV999
            return $"{prefix}{nextNumber:D3}";
        }

        // ⭐ API THÊM TÀI KHOẢN MỚI (CÓ UPLOAD ẢNH)
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromForm] CreateUserRequest request)
        {
            try
            {
                // Validate
                if (string.IsNullOrEmpty(request.FullName))
                    return Json(new { success = false, message = "Vui lòng nhập họ và tên!" });

                if (string.IsNullOrEmpty(request.Email))
                    return Json(new { success = false, message = "Vui lòng nhập email!" });

                if (request.KhoaId <= 0)
                    return Json(new { success = false, message = "Vui lòng chọn khoa!" });

                if (request.RoleId <= 0)
                    return Json(new { success = false, message = "Vui lòng chọn chức vụ!" });

                // Kiểm tra email đã tồn tại
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);
                
                if (existingUser != null)
                    return Json(new { success = false, message = "Email đã tồn tại trong hệ thống!" });

                // Tạo username từ email
                string username = request.Email.Split('@')[0];
                
                // Kiểm tra username đã tồn tại
                var existingUsername = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username);
                
                if (existingUsername != null)
                {
                    username = username + new Random().Next(100, 999);
                }

                // ⭐ TỰ ĐỘNG TẠO MÃ SỐ DỰA TRÊN ROLE
                string maSo = await GenerateMaSo(request.RoleId);

                // Tạo mật khẩu mặc định và hash
                string defaultPassword = "123456";
                string passwordHash = HashPassword(defaultPassword);

                // ⭐ XỬ LÝ UPLOAD ẢNH
                string avatarPath = "/assets/image/tải xuống.jpg"; // Ảnh mặc định

                if (request.Avatar != null && request.Avatar.Length > 0)
                {
                    // Kiểm tra định dạng file
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var fileExtension = Path.GetExtension(request.Avatar.FileName).ToLower();
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return Json(new { success = false, message = "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)!" });
                    }

                    // Kiểm tra kích thước file (max 5MB)
                    if (request.Avatar.Length > 5 * 1024 * 1024)
                    {
                        return Json(new { success = false, message = "Kích thước ảnh không được vượt quá 5MB!" });
                    }

                    // Tạo tên file unique
                    string fileName = $"{Guid.NewGuid()}{fileExtension}";
                    string uploadFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "avatars");
                    
                    // Tạo thư mục nếu chưa tồn tại
                    if (!Directory.Exists(uploadFolder))
                    {
                        Directory.CreateDirectory(uploadFolder);
                    }

                    string filePath = Path.Combine(uploadFolder, fileName);

                    // Lưu file
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.Avatar.CopyToAsync(fileStream);
                    }

                    avatarPath = $"/uploads/avatars/{fileName}";
                }

                // Tạo user mới
                var newUser = new User
                {
                    Username = username,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    GioiTinh = request.GioiTinh,
                    NgaySinh = request.NgaySinh,
                    KhoaId = request.KhoaId,
                    MaSo = maSo,
                    Avatar = avatarPath, // ⭐ Đường dẫn ảnh
                    IsActive = true,
                    CreatedAt = DateTime.Now
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                // Gán role cho user
                var userRole = new UserRole
                {
                    UserId = newUser.UserId,
                    RoleId = request.RoleId
                };

                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();

                return Json(new 
                { 
                    success = true, 
                    message = $"Thêm tài khoản thành công!\nMã số: {maSo}\nMật khẩu: {defaultPassword}",
                    userId = newUser.UserId,
                    maSo = maSo
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

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

    public class CreateUserRequest
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }
        public string? GioiTinh { get; set; }
        public DateOnly? NgaySinh { get; set; }
        public int KhoaId { get; set; }
        public int RoleId { get; set; }
        public IFormFile? Avatar { get; set; } // ⭐ THÊM TRƯỜNG UPLOAD ẢNH
    }
}
