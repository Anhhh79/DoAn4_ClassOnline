using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
	[Area("Student")]
	public class KhoaHoc_1Controller : Controller
	{
		private readonly ApplicationDbContext _context;

		public KhoaHoc_1Controller(ApplicationDbContext context)
		{
			_context = context;
		}

		// ⭐ NHẬN ID KHÓA HỌC VÀ LẤY THÔNG TIN TỪ CSDL ⭐
		public async Task<IActionResult> Index(int? id)
		{
			// Kiểm tra đăng nhập
			var userId = HttpContext.Session.GetInt32("UserId");
			if (userId == null)
			{
				TempData["Error"] = "Vui lòng đăng nhập!";
				return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
			}

			// Kiểm tra ID có hợp lệ không
			if (id == null || id <= 0)
			{
				TempData["Error"] = "ID khóa học không hợp lệ!";
				return RedirectToAction("Index", "KhoaHoc");
			}

			// ⭐ LẤY THÔNG TIN KHÓA HỌC TỪ CSDL ⭐
			var khoaHoc = await _context.KhoaHocs
				.Include(k => k.GiaoVien)
				.Include(k => k.Khoa)
				.Include(k => k.HocKy)
				.Include(k => k.ThamGiaKhoaHocs)
				.FirstOrDefaultAsync(k => k.KhoaHocId == id);

			// Kiểm tra khóa học có tồn tại không
			if (khoaHoc == null)
			{
				TempData["Error"] = "Không tìm thấy khóa học!";
				return RedirectToAction("Index", "KhoaHoc");
			}

			// ⭐ KIỂM TRA SINH VIÊN CÓ THAM GIA KHÓA HỌC KHÔNG ⭐
			var daThamGia = await _context.ThamGiaKhoaHocs
				.AnyAsync(tg => tg.KhoaHocId == id && tg.SinhVienId == userId);

			if (!daThamGia)
			{
				TempData["Error"] = "Bạn không có quyền truy cập khóa học này!";
				return RedirectToAction("Index", "KhoaHoc");
			}

			// ⭐ LƯU LỊCH SỬ TRUY CẬP ⭐
			var lichSu = new LichSuTruyCap
			{
				UserId = userId.Value,
				KhoaHocId = id.Value,
				ThoiGianTruyCap = DateTime.Now
			};
			_context.LichSuTruyCaps.Add(lichSu);
			await _context.SaveChangesAsync();

			// ⭐ TRUYỀN DỮ LIỆU SANG VIEW ⭐
			ViewBag.KhoaHocId = khoaHoc.KhoaHocId;
			ViewBag.TenKhoaHoc = khoaHoc.TenKhoaHoc;
			ViewBag.TenGiaoVien = khoaHoc.GiaoVien?.FullName ?? "Chưa có thông tin";
			ViewBag.LinkHocOnline = khoaHoc.LinkHocOnline;
			ViewBag.SoLuongSinhVien = khoaHoc.ThamGiaKhoaHocs?.Count ?? 0;

			return View();
		}
	}
}
