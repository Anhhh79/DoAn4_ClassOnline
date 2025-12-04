using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
	[Area("Teacher")]
	public class TracNghiemController : Controller
	{
		private readonly ApplicationDbContext _context;

		public TracNghiemController(ApplicationDbContext context)
		{
			_context = context;
		}

		public IActionResult Index()
		{
			return PartialView("_IndexPartial");
		}
		public IActionResult TaoBaiTracNghiem()
		{
			return View();
		}

        public IActionResult ThemBaiTracNghiem()
        {
            return View();
        }

        public IActionResult ChinhSuaTracNghiem()
        {
            return View();
        }

        // Action để load partial view
        public async Task<IActionResult> GetBaiTracNghiem(int khoaHocId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (userId == null)
            {
                return Unauthorized();
            }

            // Lấy danh sách bài trắc nghiệm theo khóa học
            var baiTracNghiems = await _context.BaiTracNghiems
                .Where(b => b.KhoaHocId == khoaHocId)
                .Include(b => b.KhoaHoc)
                .Include(b => b.GiaoBaiTracNghiems)
                .OrderByDescending(b => b.NgayTao)
                .ToListAsync();

            // Kiểm tra quyền truy cập (chỉ giảng viên của khóa học mới xem được)
            var khoaHoc = await _context.KhoaHocs
                .FirstOrDefaultAsync(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == userId);

            if (khoaHoc == null)
            {
                return Forbid();
            }

            ViewBag.KhoaHocId = khoaHocId;
            return PartialView("_IndexPartial", baiTracNghiems);
        }

        // Action xóa bài trắc nghiệm
        [HttpPost]
        public async Task<IActionResult> XoaBaiTracNghiem(int baiTracNghiemId, int khoaHocId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                
                // Kiểm tra quyền
                var baiTN = await _context.BaiTracNghiems
                    .Include(b => b.KhoaHoc)
                    .FirstOrDefaultAsync(b => b.BaiTracNghiemId == baiTracNghiemId 
                        && b.KhoaHoc.GiaoVienId == userId);

                if (baiTN == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài trắc nghiệm!" });
                }

                _context.BaiTracNghiems.Remove(baiTN);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Xóa thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
