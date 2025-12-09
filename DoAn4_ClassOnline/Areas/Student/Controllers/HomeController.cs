using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
    [Area("Student")]
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ApplicationDbContext context, ILogger<HomeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                _logger.LogInformation("Bắt đầu load danh sách khoa");
                
                var khoaList = await _context.Khoas
                    .Where(k => k.IsActive == true)
                    .OrderBy(k => k.TenKhoa)
                    .Select(k => new
                    {
                        k.KhoaId,
                        k.TenKhoa,
                        Icon = GetIconByKhoaName(k.TenKhoa)
                    })
                    .ToListAsync();

                _logger.LogInformation($"Đã load {khoaList.Count} khoa");

                ViewBag.KhoaList = khoaList;

                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi load danh sách khoa");
                ViewBag.KhoaList = new List<dynamic>();
                ViewBag.ErrorMessage = ex.Message;
                return View();
            }
        }

        private static string GetIconByKhoaName(string tenKhoa)
        {
            if (string.IsNullOrEmpty(tenKhoa))
                return "bi-book";

            tenKhoa = tenKhoa.ToLower();

            if (tenKhoa.Contains("công nghệ thông tin") || tenKhoa.Contains("cntt") || 
                tenKhoa.Contains("it") || tenKhoa.Contains("phần mềm"))
                return "bi-laptop";

            if (tenKhoa.Contains("điện") || tenKhoa.Contains("điện tử") || 
                tenKhoa.Contains("tự động") || tenKhoa.Contains("ddt"))
                return "bi-lightning-charge";

            if (tenKhoa.Contains("cơ khí") || tenKhoa.Contains("ck") || 
                tenKhoa.Contains("chế tạo máy"))
                return "bi-gear-wide-connected";

            if (tenKhoa.Contains("xây dựng") || tenKhoa.Contains("kiến trúc") || 
                tenKhoa.Contains("xd"))
                return "bi-building";

            if (tenKhoa.Contains("kinh tế") || tenKhoa.Contains("quản trị") || 
                tenKhoa.Contains("kế toán"))
                return "bi-graph-up-arrow";

            if (tenKhoa.Contains("xã hội") || tenKhoa.Contains("nhân văn") || 
                tenKhoa.Contains("ngoại ngữ"))
                return "bi-book";

            if (tenKhoa.Contains("y") || tenKhoa.Contains("dược") || 
                tenKhoa.Contains("điều dưỡng"))
                return "bi-hospital";

            if (tenKhoa.Contains("hóa") || tenKhoa.Contains("sinh học"))
                return "bi-flask";

            if (tenKhoa.Contains("vật lý"))
                return "bi-atom";

            return "bi-book";
        }

        // ⭐ TRANG CHI TIẾT KHOA - LOAD KHÓA HỌC THEO KHOA
        public async Task<IActionResult> ChiTietKhoa(int? khoaId)
        {
            try
            {
                if (!khoaId.HasValue)
                    return RedirectToAction("Index");

                // Lấy thông tin khoa
                var khoa = await _context.Khoas
                    .Where(k => k.KhoaId == khoaId && k.IsActive == true)
                    .FirstOrDefaultAsync();

                if (khoa == null)
                {
                    TempData["Error"] = "Không tìm thấy thông tin khoa!";
                    return RedirectToAction("Index");
                }

                // ⭐ LẤY HỌC KỲ MỚI NHẤT (IsActive = true và ThuTuHocKy lớn nhất)
                var hocKyMoi = await _context.HocKies
                    .Where(hk => hk.IsActive == true)
                    .OrderByDescending(hk => hk.ThuTuHocKy)
                    .FirstOrDefaultAsync();

                // ⭐ LẤY DANH SÁCH TẤT CẢ HỌC KỲ (để hiển thị dropdown)
                var danhSachHocKy = await _context.HocKies
                    .Where(hk => hk.IsActive == true)
                    .OrderByDescending(hk => hk.NgayBatDau)      // ✅ Mới nhất trước (2025-09-01 > 2024-09-01)
                    .ThenByDescending(hk => hk.ThuTuHocKy)       // ✅ Nếu cùng năm thì HK3 > HK2 > HK1
                    .ToListAsync();  // ✅ Trả về List<HocKy> trực tiếp

                hocKyMoi = danhSachHocKy.FirstOrDefault();  // ✅ Lấy phần tử đầu tiên (mới nhất)

                ViewBag.KhoaId = khoa.KhoaId;
                ViewBag.TenKhoa = khoa.TenKhoa;
                ViewBag.MoTa = khoa.MoTa;
                ViewBag.HocKyMoi = hocKyMoi;
                ViewBag.DanhSachHocKy = danhSachHocKy;

                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi load chi tiết khoa");
                TempData["Error"] = "Có lỗi xảy ra khi tải thông tin khoa!";
                return RedirectToAction("Index");
            }
        }

        // ⭐ API ENDPOINT - LẤY KHÓA HỌC THEO KHOA VÀ HỌC KỲ (AJAX)
        [HttpGet]
        public async Task<IActionResult> GetKhoaHocByKhoaAndHocKy(int khoaId, int? hocKyId)
        {
            try
            {
                _logger.LogInformation($"=== GetKhoaHocByKhoaAndHocKy ===");
                _logger.LogInformation($"KhoaId: {khoaId}, HocKyId: {hocKyId}");
                
                var sinhVienId = HttpContext.Session.GetInt32("UserId");

                var query = _context.KhoaHocs
                    .Where(kh => kh.KhoaId == khoaId && kh.IsPublic == true)
                    .AsQueryable();

                if (hocKyId.HasValue && hocKyId.Value > 0)
                {
                    _logger.LogInformation($"Lọc theo học kỳ: {hocKyId.Value}");
                    query = query.Where(kh => kh.HocKyId == hocKyId.Value);
                }

                var khoaHocs = await query
                    .Include(kh => kh.GiaoVien)
                    .Include(kh => kh.HocKy)
                    .Include(kh => kh.ThamGiaKhoaHocs)
                    .OrderByDescending(kh => kh.CreatedAt)
                    .Select(kh => new
                    {
                        kh.KhoaHocId,
                        kh.TenKhoaHoc,
                        kh.MoTa,
                        kh.HinhAnh,
                        TenGiaoVien = kh.GiaoVien.FullName,  // ✅ SỬA: HoTen thay vì FullName
                        HocKy = new
                        {
                            kh.HocKy.HocKyId,
                            kh.HocKy.TenHocKy,
                            kh.HocKy.NamHoc
                        },
                        SoSinhVien = kh.ThamGiaKhoaHocs.Count,
                        DaThamGia = sinhVienId.HasValue && kh.ThamGiaKhoaHocs.Any(tg => tg.SinhVienId == sinhVienId.Value),
                        CoMatKhau = !string.IsNullOrEmpty(kh.MatKhau)  // ✅ THÊM: Thông tin có mật khẩu
                    })
                    .ToListAsync();

                // ⭐ DEBUG LOG - XEM DỮ LIỆU TRẢ VỀ
                foreach (var kh in khoaHocs)
                {
                    _logger.LogInformation($"Khóa học: {kh.TenKhoaHoc}, CoMatKhau: {kh.CoMatKhau}");
                }

                _logger.LogInformation($"Tìm thấy {khoaHocs.Count} khóa học");

                return Json(new { success = true, data = khoaHocs });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách khóa học");
                return Json(new { success = false, message = ex.Message });
            }
        }

        // ⭐ API - GHI DANH KHÓA HỌC
        [HttpPost]
        public async Task<IActionResult> GhiDanhKhoaHoc(int khoaHocId, string? matKhau)
        {
            try
            {
                var sinhVienId = HttpContext.Session.GetInt32("UserId");
                
                if (!sinhVienId.HasValue)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập để ghi danh!" });
                }

                var khoaHoc = await _context.KhoaHocs
                    .FirstOrDefaultAsync(kh => kh.KhoaHocId == khoaHocId && kh.IsPublic == true);

                if (khoaHoc == null)
                {
                    return Json(new { success = false, message = "Khóa học không tồn tại hoặc không công khai!" });
                }

                var daThamGia = await _context.ThamGiaKhoaHocs
                    .AnyAsync(tg => tg.KhoaHocId == khoaHocId && tg.SinhVienId == sinhVienId.Value);

                if (daThamGia)
                {
                    return Json(new { success = false, message = "Bạn đã tham gia khóa học này rồi!" });
                }

                // ⭐ KIỂM TRA MẬT KHẨU
                if (!string.IsNullOrEmpty(khoaHoc.MatKhau))
                {
                    if (string.IsNullOrEmpty(matKhau))
                    {
                        return Json(new { success = false, message = "Khóa học này yêu cầu mật khẩu!", requirePassword = true });
                    }

                    if (matKhau.Trim() != khoaHoc.MatKhau.Trim())
                    {
                        return Json(new { success = false, message = "Mật khẩu không chính xác!" });
                    }
                }

                var thamGia = new ThamGiaKhoaHoc
                {
                    KhoaHocId = khoaHocId,
                    SinhVienId = sinhVienId.Value,
                    NgayThamGia = DateTime.Now,
                    TrangThai = "DangHoc"
                };

                _context.ThamGiaKhoaHocs.Add(thamGia);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Sinh viên {sinhVienId} ghi danh khóa học {khoaHocId}");

                return Json(new { success = true, message = "Ghi danh thành công!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi ghi danh khóa học");
                return Json(new { success = false, message = "Có lỗi xảy ra: " + ex.Message });
            }
        }
    }
}
