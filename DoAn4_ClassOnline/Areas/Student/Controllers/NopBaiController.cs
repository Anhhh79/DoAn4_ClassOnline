using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
	[Area("Student")]
	public class NopBaiController : Controller
	{
		private readonly ApplicationDbContext _context;
		private readonly ILogger<NopBaiController> _logger;

		// ⭐ Định nghĩa constants cho TrangThai
		private const string TRANG_THAI_CHUA_NOP = "ChuaNop";
		private const string TRANG_THAI_DA_NOP = "DaNop";

		public NopBaiController(ApplicationDbContext context, ILogger<NopBaiController> logger)
		{
			_context = context;
			_logger = logger;
		}

		public async Task<IActionResult> Index(int khoaHocId)
		{
			// Lấy SinhVienId từ Session
			var sinhVienId = HttpContext.Session.GetInt32("UserId");
			
			if (sinhVienId == null)
			{
				ViewBag.BaiTaps = new List<BaiTap>();
				ViewBag.ErrorMessage = "Vui lòng đăng nhập!";
				return PartialView();
			}

			if (khoaHocId <= 0)
			{
				ViewBag.BaiTaps = new List<BaiTap>();
				ViewBag.ErrorMessage = "Không tìm thấy khóa học!";
				return PartialView();
			}

			// Lấy danh sách bài tập của khóa học
			var baiTaps = await _context.BaiTaps
				.Where(bt => bt.KhoaHocId == khoaHocId)
				.Include(bt => bt.BaiTapFiles)
				.Include(bt => bt.BaiTapNops.Where(bn => bn.SinhVienId == sinhVienId))
					.ThenInclude(bn => bn.BaiTapNopFiles)
				.OrderBy(bt => bt.ThoiGianBatDau)
				.AsNoTracking()
				.ToListAsync();

			ViewBag.BaiTaps = baiTaps;
			ViewBag.SinhVienId = sinhVienId;
			ViewBag.KhoaHocId = khoaHocId;

			return PartialView();
		}

		[HttpPost]
		public async Task<IActionResult> NopBai(int baiTapId, IFormFile file)
		{
			try
			{
				var sinhVienId = HttpContext.Session.GetInt32("UserId");
				if (sinhVienId == null)
				{
					return Json(new { success = false, message = "Vui lòng đăng nhập!" });
				}

				if (file == null || file.Length == 0)
				{
					return Json(new { success = false, message = "Vui lòng chọn file để nộp!" });
				}

				// Kiểm tra bài tập có tồn tại
				var baiTap = await _context.BaiTaps.FindAsync(baiTapId);
				if (baiTap == null)
				{
					return Json(new { success = false, message = "Bài tập không tồn tại!" });
				}

				// Kiểm tra hạn nộp
				if (baiTap.ThoiGianKetThuc.HasValue && DateTime.Now > baiTap.ThoiGianKetThuc.Value && baiTap.ChoPhepNopTre != true)
				{
					return Json(new { success = false, message = "Đã hết hạn nộp bài!" });
				}

				// ⭐ TÌM HOẶC TẠO MỚI BaiTapNop với TrangThai
				var baiNop = await _context.BaiTapNops
					.FirstOrDefaultAsync(bn => bn.BaiTapId == baiTapId && bn.SinhVienId == sinhVienId);

				bool isNewRecord = false;
				if (baiNop == null)
				{
					// Tạo record mới với TrangThai = "ChuaNop" ban đầu
					baiNop = new BaiTapNop
					{
						BaiTapId = baiTapId,
						SinhVienId = sinhVienId.Value,
						TrangThai = TRANG_THAI_CHUA_NOP
					};
					_context.BaiTapNops.Add(baiNop);
					isNewRecord = true;
				}

				// ⭐ CẬP NHẬT TrangThai và NgayNop
				baiNop.NgayNop = DateTime.Now;
				baiNop.TrangThai = TRANG_THAI_DA_NOP;

				await _context.SaveChangesAsync();

				// Upload file
				var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "baitapnop");
				if (!Directory.Exists(uploadFolder))
				{
					Directory.CreateDirectory(uploadFolder);
				}

				var ext = Path.GetExtension(file.FileName);
				var newFileName = Guid.NewGuid().ToString("N") + ext;
				var filePath = Path.Combine(uploadFolder, newFileName);

				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					await file.CopyToAsync(stream);
				}

				// Lưu thông tin file
				var baiTapNopFile = new BaiTapNopFile
				{
					BaiNopId = baiNop.BaiNopId,
					TenFile = file.FileName,
					DuongDan = "/assets/baitapnop/" + newFileName,
					KichThuoc = file.Length,
					LoaiFile = ext,
					NgayUpload = DateTime.Now
				};

				_context.BaiTapNopFiles.Add(baiTapNopFile);
				await _context.SaveChangesAsync();

				_logger.LogInformation($"Sinh viên {sinhVienId} nộp bài {baiTapId} - {(isNewRecord ? "Tạo mới" : "Cập nhật")}");

				// ⭐ TRẢ VỀ DỮ LIỆU ĐẦY ĐỦ ĐỂ CẬP NHẬT UI ⭐
				return Json(new 
				{ 
					success = true, 
					message = "Nộp bài thành công!",
					data = new 
					{
						baiNopId = baiNop.BaiNopId,
						fileName = file.FileName,
						filePath = "/assets/baitapnop/" + newFileName,
						fileExtension = ext,
						ngayNop = DateTime.Now.ToString("dd/MM/yyyy - HH:mm"),
						trangThai = baiNop.TrangThai
					}
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Lỗi khi nộp bài");
				return Json(new { success = false, message = "Lỗi: " + ex.Message });
			}
		}

		[HttpPost]
		public async Task<IActionResult> HuyBai(int baiNopId)
		{
			try
			{
				var sinhVienId = HttpContext.Session.GetInt32("UserId");
				if (sinhVienId == null)
				{
					return Json(new { success = false, message = "Vui lòng đăng nhập!" });
				}

				var baiNop = await _context.BaiTapNops
					.Include(bn => bn.BaiTapNopFiles)
					.FirstOrDefaultAsync(bn => bn.BaiNopId == baiNopId && bn.SinhVienId == sinhVienId);

				if (baiNop == null)
				{
					return Json(new { success = false, message = "Bài nộp không tồn tại!" });
				}

				// ⭐ CHỈ XÓA FILES VÀ CẬP NHẬT TrangThai - KHÔNG XÓA RECORD
				// Xóa file vật lý
				foreach (var file in baiNop.BaiTapNopFiles)
				{
					var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", file.DuongDan.TrimStart('/'));
					if (System.IO.File.Exists(filePath))
					{
						System.IO.File.Delete(filePath);
					}
				}

				// Xóa records file trong database
				_context.BaiTapNopFiles.RemoveRange(baiNop.BaiTapNopFiles);

				// ⭐ CẬP NHẬT TrangThai thay vì xóa BaiTapNop
				baiNop.TrangThai = TRANG_THAI_CHUA_NOP;
				baiNop.NgayNop = null; // Reset ngày nộp

				await _context.SaveChangesAsync();

				_logger.LogInformation($"Sinh viên {sinhVienId} hủy bài nộp {baiNopId}");

				return Json(new 
				{ 
					success = true, 
					message = "Hủy bài nộp thành công!",
					trangThai = baiNop.TrangThai
				});
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Lỗi khi hủy bài nộp");
				return Json(new { success = false, message = "Lỗi: " + ex.Message });
			}
		}
	}
}
