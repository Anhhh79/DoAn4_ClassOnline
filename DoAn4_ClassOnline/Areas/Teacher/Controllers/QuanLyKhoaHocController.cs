using DoAn4_ClassOnline.Areas.Teacher.Models;
using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class QuanLyKhoaHocController : Controller
    {
        private readonly ApplicationDbContext _context;

        public QuanLyKhoaHocController(ApplicationDbContext context)
        {
            _context = context;
        }

        //lấy danh sách khóa học của giảng viên
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }

                // Lấy danh sách khóa học của giảng viên
                var khoaHocs = await _context.KhoaHocs
                    .Where(k => k.GiaoVienId == userId)
                    .Include(k => k.GiaoVien)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.ThamGiaKhoaHocs)
                    .OrderByDescending(k => k.CreatedAt)
                    .ToListAsync();

                // Lấy danh sách học kỳ cho dropdown
                ViewBag.HocKyList = await _context.HocKies
                    .OrderByDescending(h => h.HocKyId)
                    .Select(h => new
                    {
                        h.HocKyId,
                        h.TenHocKy,
                        h.NamHoc,
                        Ten = h.TenHocKy + " / " + h.NamHoc
                    })
                    .ToListAsync();

                ViewBag.KhoaList = await _context.Khoas
                    .Select(k => new
                    {
                        k.KhoaId,
                        k.TenKhoa
                    }).ToListAsync();

                return View(khoaHocs);
            }
            catch (Exception)
            {
                return View("Error");
            }

        }

        // Load lại danh sách khóa học (trả về JSON cho AJAX)
        [HttpGet]
        public async Task<IActionResult> DanhSachKhoaHoc()
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }

                // Lấy danh sách khóa học của giảng viên
                var khoaHocs = await _context.KhoaHocs
                    .Where(k => k.GiaoVienId == userId)
                    .Include(k => k.GiaoVien)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.ThamGiaKhoaHocs)
                    .OrderByDescending(k => k.CreatedAt)
                    .Select(k => new
                    {
                        k.KhoaHocId,
                        k.TenKhoaHoc,
                        k.HinhAnh,
                        GiaoVienName = k.GiaoVien.FullName,
                        k.HocKyId,
                        TenKhoa = k.Khoa.TenKhoa,
                        TenHocKy = k.HocKy.TenHocKy,
                        NamHoc = k.HocKy.NamHoc,
                        SoLuongSinhVien = k.ThamGiaKhoaHocs.Count
                    })
                    .ToListAsync();

                return Json(new { success = true, data = khoaHocs });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        //lấy thông tin khóa học theo id
        [HttpGet]
        public async Task<IActionResult> QuanLyKhoaHoc(int? id)
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }
                // Lấy thông tin khóa học 
                if (id == null)
                    return NotFound();

                var khoaHoc = await _context.KhoaHocs
                    .Where(k => k.KhoaHocId == id)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.GiaoVien)
                    .Include(k => k.ThamGiaKhoaHocs)
                       .ThenInclude(t => t.SinhVien)
                    .FirstOrDefaultAsync();

                if (khoaHoc == null)
                    return NotFound();

                // 🆕 Lấy thời gian truy cập cuối cùng của từng sinh viên trong khóa học này
                var lichSuTruyCaps = await _context.LichSuTruyCaps
                    .Where(l => l.KhoaHocId == id)
                    .GroupBy(l => l.UserId)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        ThoiGianCuoi = g.Max(l => l.ThoiGianTruyCap)
                    })
                    .ToDictionaryAsync(x => x.UserId, x => x.ThoiGianCuoi);

                ViewBag.LichSuTruyCap = lichSuTruyCaps;


                // Lấy danh sách học kỳ cho dropdown
                ViewBag.HocKyList = await _context.HocKies
                    .OrderByDescending(h => h.HocKyId)
                    .Select(h => new
                    {
                        h.HocKyId,
                        h.TenHocKy,
                        h.NamHoc,
                        Ten = h.TenHocKy + " / " + h.NamHoc
                    })
                    .ToListAsync();

                ViewBag.KhoaList = await _context.Khoas
                    .Select(k => new
                    {
                        k.KhoaId,
                        k.TenKhoa
                    }).ToListAsync();


                return View(khoaHoc);
            }
            catch (Exception)
            {
                return View("Error");
            }
        }

        // lấy thông tin chi tiết sinh viên theo id
        [HttpGet]
        public async Task<IActionResult> ThongTinSinhVien(int? id)
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }

                // Kiểm tra id
                if (id == null)
                    return Json(new { success = false, message = "ID không hợp lệ" });

                // ✅ Lấy thông tin chi tiết sinh viên với Select để tránh circular reference
                var sinhVien = await _context.Users
                    .Where(s => s.UserId == id)
                    .Include(s => s.Khoa)
                    .Select(s => new
                    {
                        s.UserId,
                        s.FullName,
                        s.Email,
                        s.Avatar,
                        s.MaSo,
                        s.PhoneNumber,
                        s.GioiTinh,
                        NgaySinh = s.NgaySinh.HasValue ? s.NgaySinh.Value.ToString("dd/MM/yyyy") : null,
                        s.DiaChi,
                        s.KhoaId,
                        TenKhoa = s.Khoa != null ? s.Khoa.TenKhoa : null
                    })
                    .FirstOrDefaultAsync();

                if (sinhVien == null)
                    return Json(new { success = false, message = "Không tìm thấy sinh viên" });

                return Json(new { success = true, sinhVien });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // thêm kho học mới
        [HttpPost]
        public async Task<IActionResult> ThemKhoaHoc([FromForm] ThongTinKhoaHoc vm)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });

                if (!ModelState.IsValid)
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });

                string imgPath = "/assets/image/default.jpg";

                // SAVE FILE
                if (vm.AnhKhoaHoc != null)
                {
                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/image");

                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    // Giữ nguyên tên file người dùng upload
                    string fileName = vm.AnhKhoaHoc.FileName;
                    string fullPath = Path.Combine(folderPath, fileName);

                    // Nếu file chưa tồn tại thì mới lưu
                    if (!System.IO.File.Exists(fullPath))
                    {
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await vm.AnhKhoaHoc.CopyToAsync(stream);
                        }
                    }

                    // Đường dẫn lưu vào DB
                    imgPath = "/assets/image/" + fileName;
                }

                var model = new KhoaHoc
                {
                    TenKhoaHoc = vm.TenKhoaHoc,
                    MoTa = vm.MoTa,
                    KhoaId = vm.KhoaId,
                    HocKyId = vm.HocKyId,
                    LinkHocOnline = vm.LinkHocOnline,
                    MatKhau = vm.MatKhau,
                    GiaoVienId = (int)userId,
                    HinhAnh = imgPath,
                    TrangThaiKhoaHoc = vm.TrangThaiKhoaHoc ?? "DangMo",
                    CreatedAt = DateTime.Now
                };

                _context.KhoaHocs.Add(model);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Thêm khóa học thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }



    }
}