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
                
                // Lấy danh sách các khoa từ database và chỉ lấy các khoa đang active
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
                // Log error
                _logger.LogError(ex, "Lỗi khi load danh sách khoa");
                ViewBag.KhoaList = new List<dynamic>();
                ViewBag.ErrorMessage = ex.Message;
                return View();
            }
        }

        // Hàm helper để lấy icon dựa trên tên khoa - CHUYỂN THÀNH STATIC
        private static string GetIconByKhoaName(string tenKhoa)
        {
            if (string.IsNullOrEmpty(tenKhoa))
                return "bi-book";

            tenKhoa = tenKhoa.ToLower();

            // Công nghệ thông tin
            if (tenKhoa.Contains("công nghệ thông tin") || tenKhoa.Contains("cntt") || 
                tenKhoa.Contains("it") || tenKhoa.Contains("phần mềm"))
                return "bi-laptop";

            // Điện - Điện tử
            if (tenKhoa.Contains("điện") || tenKhoa.Contains("điện tử") || 
                tenKhoa.Contains("tự động") || tenKhoa.Contains("ddt"))
                return "bi-lightning-charge";

            // Cơ khí
            if (tenKhoa.Contains("cơ khí") || tenKhoa.Contains("ck") || 
                tenKhoa.Contains("chế tạo máy"))
                return "bi-gear-wide-connected";

            // Xây dựng
            if (tenKhoa.Contains("xây dựng") || tenKhoa.Contains("kiến trúc") || 
                tenKhoa.Contains("xd"))
                return "bi-building";

            // Kinh tế
            if (tenKhoa.Contains("kinh tế") || tenKhoa.Contains("quản trị") || 
                tenKhoa.Contains("kế toán"))
                return "bi-graph-up-arrow";

            // Khoa học xã hội
            if (tenKhoa.Contains("xã hội") || tenKhoa.Contains("nhân văn") || 
                tenKhoa.Contains("ngoại ngữ"))
                return "bi-book";

            // Y dược
            if (tenKhoa.Contains("y") || tenKhoa.Contains("dược") || 
                tenKhoa.Contains("điều dưỡng"))
                return "bi-hospital";

            // Hóa học
            if (tenKhoa.Contains("hóa") || tenKhoa.Contains("sinh học"))
                return "bi-flask";

            // Vật lý
            if (tenKhoa.Contains("vật lý"))
                return "bi-atom";

            // Mặc định
            return "bi-book";
        }

        // Trang chi tiết khoa
        public async Task<IActionResult> ChiTietKhoa(int? khoaId)
        {
            try
            {
                // Nếu người dùng không truyền mã khoa, redirect về trang chủ
                if (!khoaId.HasValue)
                    return RedirectToAction("Index");

                // Lấy thông tin khoa từ database
                var khoa = await _context.Khoas
                    .Where(k => k.KhoaId == khoaId && k.IsActive == true)
                    .FirstOrDefaultAsync();

                if (khoa == null)
                {
                    TempData["Error"] = "Không tìm thấy thông tin khoa!";
                    return RedirectToAction("Index");
                }

                ViewBag.KhoaId = khoa.KhoaId;
                ViewBag.TenKhoa = khoa.TenKhoa;
                ViewBag.MoTa = khoa.MoTa;

                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi load chi tiết khoa");
                TempData["Error"] = "Có lỗi xảy ra khi tải thông tin khoa!";
                return RedirectToAction("Index");
            }
        }
    }
}
