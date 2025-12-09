using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
	[Area("Student")]
	public class NotificationController : Controller
	{
		private readonly ApplicationDbContext _context;
		private readonly ILogger<NotificationController> _logger;

		public NotificationController(ApplicationDbContext context, ILogger<NotificationController> logger)
		{
			_context = context;
			_logger = logger;
		}

		// ⭐ NHẬN KHOAHOCID TỪ QUERY STRING ⭐
		public async Task<IActionResult> Index(int? khoaHocId)
		{
			_logger.LogInformation($"🔔 Notification/Index - khoaHocId: {khoaHocId}");

			// Kiểm tra đăng nhập
			var userId = HttpContext.Session.GetInt32("UserId");
			if (userId == null)
			{
				return Content("<div class='alert alert-warning'>Vui lòng đăng nhập!</div>");
			}

			// Kiểm tra khoaHocId
			if (khoaHocId == null || khoaHocId <= 0)
			{
				return Content("<div class='alert alert-warning'>Không xác định được khóa học!</div>");
			}

			// ⭐ LẤY DANH SÁCH THÔNG BÁO THEO KHÓA HỌC ⭐
			var thongBaos = await _context.ThongBaos
				.Where(tb => tb.KhoaHocId == khoaHocId)
				.OrderByDescending(tb => tb.NgayTao) // Mới nhất lên đầu
				.ToListAsync(); // ⭐ THAY ĐỔI: LẤY TOÀN BỘ ENTITY THAY VÌ SELECT ⭐

			_logger.LogInformation($"✅ Loaded {thongBaos.Count} thông báo");
			
			// ⭐ LOG CHI TIẾT TỪNG THÔNG BÁO ⭐
			foreach (var tb in thongBaos)
			{
				_logger.LogInformation($"   📌 ID: {tb.ThongBaoId}, Tiêu đề: {tb.TieuDe}, Ngày tạo: {tb.NgayTao}");
			}

			ViewBag.ThongBaos = thongBaos;
			ViewBag.KhoaHocId = khoaHocId;
			
			_logger.LogInformation($"🎯 ViewBag.ThongBaos Count: {thongBaos.Count}");

			return PartialView();
		}
	}
}
