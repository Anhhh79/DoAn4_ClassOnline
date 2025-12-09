using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
	[Area("Student")]
	public class DocumentController : Controller
	{
		private readonly ApplicationDbContext _context;

		public DocumentController(ApplicationDbContext context)
		{
			_context = context;
		}

		public async Task<IActionResult> Index(int khoaHocId)
		{
			// Kiểm tra khoaHocId có hợp lệ không
			if (khoaHocId <= 0)
			{
				ViewBag.TaiLieus = new List<TaiLieu>();
				ViewBag.KhoaHocId = 0;
				ViewBag.ErrorMessage = "Không tìm thấy khóa học!";
				return PartialView();
			}

			// Lấy danh sách tài liệu theo KhoaHocId từ database
			var taiLieus = await _context.TaiLieus
				.Where(tl => tl.KhoaHocId == khoaHocId)
				.Include(tl => tl.TaiLieuFiles)
				.OrderBy(tl => tl.ThuTu)
				.ThenByDescending(tl => tl.NgayTao)
				.AsNoTracking()
				.ToListAsync();

			ViewBag.TaiLieus = taiLieus;
			ViewBag.KhoaHocId = khoaHocId;

			return PartialView();
		}
	}
}
