using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoAn4_ClassOnline.Areas.Teacher.Models;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class TaiLieuController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public TaiLieuController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;

        }
        // Hàm load dữ liệu trang tài liệu
        [HttpGet]
        public async Task<IActionResult> GetListTaiLieu(int? khoaHocId)
        {
            try
            {
                // Kiểm tra đăng nhập
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });
                }

                // Kiểm tra tham số
                if (!khoaHocId.HasValue || khoaHocId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy khóa học!" });
                }

                // Kiểm tra quyền truy cập
                var khoaHoc = await _context.KhoaHocs
                    .AsNoTracking()
                    .FirstOrDefaultAsync(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == userId);

                if (khoaHoc == null)
                {
                    return Json(new { success = false, message = "Bạn không có quyền truy cập khóa học này!" });
                }

                // Lấy danh sách tài liệu
                var danhSachTaiLieu = await _context.TaiLieus
                    .Where(tl => tl.KhoaHocId == khoaHocId)
                    .Include(tl => tl.TaiLieuFiles)
                    .OrderBy(tl => tl.ThuTu)
                    .ThenByDescending(tl => tl.NgayTao)
                    .Select(tl => new
                    {
                        taiLieuId = tl.TaiLieuId,
                        tenTaiLieu = tl.TenTaiLieu,
                        moTa = tl.MoTa,
                        ngayTao = tl.NgayTao,
                        thuTu = tl.ThuTu,
                        danhSachFile = tl.TaiLieuFiles.Select(f => new
                        {
                            fileId = f.FileId,
                            tenFile = f.TenFile,
                            duongDan = f.DuongDan,
                            kichThuoc = f.KichThuoc,
                            loaiFile = f.LoaiFile,
                            ngayUpload = f.NgayUpload
                        })
                    })
                    .AsNoTracking()
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    data = danhSachTaiLieu
                });
            }
            catch (Exception ex)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi lấy tài liệu");
                return Json(new { success = false, message = "Lỗi hệ thống!" });
            }
        }

        // Hàm thêm tài liệu mới
        [HttpPost]
        public async Task<IActionResult> CreateTaiLieu([FromForm] ThongTinTaiLieu model)
        {
            if (!ModelState.IsValid)
                return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });

            var taiLieu = new TaiLieu
            {
                KhoaHocId = model.KhoaHocId,
                TenTaiLieu = model.TenTaiLieu,
                MoTa = model.MoTa,
                ThuTu = model.ThuTu,
                NgayTao = DateTime.Now
            };

            _context.TaiLieus.Add(taiLieu);
            await _context.SaveChangesAsync();

            // === Đây là đường dẫn đúng 100% ===
            var uploadFolder = Path.Combine(_env.WebRootPath, "assets", "tailieu");

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            foreach (var file in model.Files)
            {
                if (file == null || file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName);

                var newName = Guid.NewGuid().ToString("N") + ext;

                var filePath = Path.Combine(uploadFolder, newName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _context.TaiLieuFiles.Add(new TaiLieuFile
                {
                    TaiLieuId = taiLieu.TaiLieuId,
                    TenFile = file.FileName,
                    DuongDan = "/assets/tailieu/" + newName,
                    KichThuoc = file.Length,
                    LoaiFile = ext,
                    NgayUpload = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Thêm tài liệu thành công!" });
        }

        // Hàm xóa tài liệu
        [HttpPost]
        public async Task<IActionResult> DeleteTaiLieu(int taiLieuId)
        {
            try
            {
                var taiLieu = await _context.TaiLieus
                    .Include(tl => tl.TaiLieuFiles)
                    .FirstOrDefaultAsync(tl => tl.TaiLieuId == taiLieuId);

                if (taiLieu == null)
                    return Json(new { success = false, message = "Tài liệu không tồn tại!" });

                // ========== 1. XÓA FILE VẬT LÝ ==========
                foreach (var file in taiLieu.TaiLieuFiles)
                {
                    // Chuẩn hóa đường dẫn
                    string relativePath = file.DuongDan
                        .Replace("\\", "/")        // chuyển hết sang /
                        .TrimStart('/');           // bỏ dấu / đầu nếu có

                    string filePath = Path.Combine(_env.WebRootPath, relativePath);

                    if (System.IO.File.Exists(filePath))
                    {
                        try
                        {
                            System.IO.File.Delete(filePath);
                        }
                        catch (IOException ioEx)
                        {
                            // Không throw luôn → cho phép xóa tiếp file khác
                            Console.WriteLine("Lỗi khi xóa file: " + ioEx.Message);
                        }
                    }
                    Console.WriteLine("Path delete: " + filePath);
                }

                // ========== 2. XÓA RECORD DB ==========
                _context.TaiLieuFiles.RemoveRange(taiLieu.TaiLieuFiles);
                _context.TaiLieus.Remove(taiLieu);

                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Xóa tài liệu thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // hàm đưa dữ liệu tài liệu lên form chỉnh sửa
        [HttpGet]
        public async Task<IActionResult> GetTaiLieuForEdit(int taiLieuId)
        {
            try
            {
                var taiLieu = await _context.TaiLieus
                    .Include(tl => tl.TaiLieuFiles)
                    .FirstOrDefaultAsync(tl => tl.TaiLieuId == taiLieuId);

                if (taiLieu == null)
                    return Json(new { success = false, message = "Tài liệu không tồn tại!" });

                // Lấy base URL
                var request = HttpContext.Request;
                string baseUrl = $"{request.Scheme}://{request.Host}";

                var data = new
                {
                    taiLieuId = taiLieu.TaiLieuId,
                    tenTaiLieu = taiLieu.TenTaiLieu,
                    moTa = taiLieu.MoTa,
                    thuTu = taiLieu.ThuTu,
                    danhSachFile = taiLieu.TaiLieuFiles.Select(f => new
                    {
                        fileId = f.FileId,
                        tenFile = f.TenFile,
                        duongDan = baseUrl + f.DuongDan, // FULL URL
                        kichThuoc = f.KichThuoc,
                        loaiFile = f.LoaiFile,
                        ngayUpload = f.NgayUpload
                    })
                };

                return Json(new { success = true, data });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> DeleteFile(int fileId)
        {
            var file = await _context.TaiLieuFiles.FindAsync(fileId);
            if (file == null)
                return Json(new { success = false, message = "File không tồn tại!" });

            string fullPath = Path.Combine(_env.WebRootPath, file.DuongDan.TrimStart('/'));

            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);

            _context.TaiLieuFiles.Remove(file);
            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateTaiLieu([FromForm] ThongTinTaiLieu model, int taiLieuId)
        {
            var taiLieu = await _context.TaiLieus.FindAsync(taiLieuId);
            if (taiLieu == null)
                return Json(new { success = false, message = "Tài liệu không tồn tại!" });

            // ----------- Cập nhật thông tin cơ bản -----------
            taiLieu.TenTaiLieu = model.TenTaiLieu;
            taiLieu.MoTa = model.MoTa;
            taiLieu.ThuTu = model.ThuTu;

            // ----------- Thêm file mới nếu có upload -----------
            if (model.Files != null && model.Files.Any())
            {
                var uploadFolder = Path.Combine(_env.WebRootPath, "assets", "tailieu");
                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                foreach (var file in model.Files)
                {
                    if (file == null || file.Length == 0) continue;

                    var ext = Path.GetExtension(file.FileName);
                    var newName = Guid.NewGuid().ToString("N") + ext;
                    var filePath = Path.Combine(uploadFolder, newName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    _context.TaiLieuFiles.Add(new TaiLieuFile
                    {
                        TaiLieuId = taiLieu.TaiLieuId,
                        TenFile = file.FileName,
                        DuongDan = "/assets/tailieu/" + newName,
                        KichThuoc = file.Length,
                        LoaiFile = ext,
                        NgayUpload = DateTime.Now
                    });
                }
            }

            // ----------- Lưu thay đổi -----------
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Cập nhật tài liệu thành công!" });
        }

    }
}
