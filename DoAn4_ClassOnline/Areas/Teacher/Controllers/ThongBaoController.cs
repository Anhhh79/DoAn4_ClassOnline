using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoAn4_ClassOnline.Areas.Teacher.Models;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class ThongBaoController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ThongBaoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Action trả về danh sách thông báo dưới dạng JSON
        [HttpGet]
        public async Task<IActionResult> DanhSachThongBaos(int khoaHocId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });

                var thongBaos = await _context.ThongBaos
                    .Where(tb => tb.KhoaHocId == khoaHocId)
                    .OrderByDescending(tb => tb.NgayTao)
                    .Select(tb => new ThongBao_Model
                    {
                        ThongBaoId = tb.ThongBaoId,
                        TieuDe = tb.TieuDe,
                        NoiDung = tb.NoiDung,
                        NgayTao = (DateTime)tb.NgayTao
                    })
                    .ToListAsync();

                return Json(new { success = true, data = thongBaos });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        // Action tạo thông báo mới
        [HttpPost]
        public async Task<IActionResult> TaoThongBao(int khoaHocId, string tieuDe, string noiDung)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });

                if (string.IsNullOrWhiteSpace(tieuDe) || string.IsNullOrWhiteSpace(noiDung))
                    return Json(new { success = false, message = "Tiêu đề và nội dung không được để trống!" });

                if (khoaHocId <= 0)
                    return Json(new { success = false, message = "Khóa học không hợp lệ!" });

                var khoaHoc = await _context.KhoaHocs.FindAsync(khoaHocId);
                if (khoaHoc == null)
                    return Json(new { success = false, message = "Khóa học không tồn tại!" });

                // TODO: Kiểm tra quyền của user nếu cần

                var thongBaoMoi = new ThongBao
                {
                    KhoaHocId = khoaHocId,
                    TieuDe = tieuDe,
                    NoiDung = noiDung,
                    NgayTao = DateTime.UtcNow,
                };

                _context.ThongBaos.Add(thongBaoMoi);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Tạo thông báo thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetThongBao(int id)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });

                var tb = await _context.ThongBaos.FindAsync(id);

                if (tb == null)
                    return Json(new { success = false, message = "Không tìm thấy thông báo!" });

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        id = tb.ThongBaoId,
                        tieuDe = tb.TieuDe,
                        noiDung = tb.NoiDung
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }


        [HttpPost]
        public async Task<IActionResult> SuaThongBao(int thongBaoId, string tieuDe, string noiDung)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");

                // Kiểm tra đăng nhập
                if (userId == null)
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });

                // Validate dữ liệu
                if (string.IsNullOrWhiteSpace(tieuDe))
                    return Json(new { success = false, message = "Tiêu đề không được để trống!" });

                if (string.IsNullOrWhiteSpace(noiDung))
                    return Json(new { success = false, message = "Nội dung không được để trống!" });

                // Lấy thông báo cần sửa
                var thongBao = await _context.ThongBaos.FindAsync(thongBaoId);
                if (thongBao == null)
                    return Json(new { success = false, message = "Thông báo không tồn tại!" });

                // (Tuỳ chọn) kiểm tra quyền
                // if (thongBao.NguoiTaoId != userId) return Json(new { success = false, message = "Bạn không có quyền sửa thông báo này!" });

                // Cập nhật dữ liệu
                thongBao.TieuDe = tieuDe;
                thongBao.NoiDung = noiDung;
                thongBao.NgayCapNhat = DateTime.Now; // Nếu bạn có trường NgaySua

                _context.ThongBaos.Update(thongBao);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Cập nhật thông báo thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }

        // Action xóa thông báo
        [HttpDelete]
        public async Task<IActionResult> XoaThongBao(int id)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });

                var tb = await _context.ThongBaos.FindAsync(id);
                if (tb == null)
                    return Json(new { success = false, message = "Không tìm thấy thông báo!" });

                _context.ThongBaos.Remove(tb);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Xóa thông báo thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi server khi xóa thông báo: " + ex.Message });
            }
        }

    }
}