using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class TracNghiemController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TracNghiemController> _logger;

        public TracNghiemController(ApplicationDbContext context, ILogger<TracNghiemController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ⭐ SỬA ACTION INDEX ĐỂ LẤY DỮ LIỆU ⭐
        public async Task<IActionResult> Index(int? khoaHocId)
        {
            // Nếu không có khoaHocId, trả về view rỗng
            if (!khoaHocId.HasValue)
            {
                ViewBag.KhoaHocId = null;
                return PartialView("_IndexPartial", new List<BaiTracNghiem>());
            }

            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (userId == null)
            {
                return Unauthorized();
            }

            // Kiểm tra quyền truy cập (chỉ giảng viên của khóa học mới xem được)
            var khoaHoc = await _context.KhoaHocs
                .FirstOrDefaultAsync(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == userId);

            if (khoaHoc == null)
            {
                ViewBag.KhoaHocId = null;
                return PartialView("_IndexPartial", new List<BaiTracNghiem>());
            }

            // Lấy danh sách bài trắc nghiệm theo khóa học
            var baiTracNghiems = await _context.BaiTracNghiems
                .Where(b => b.KhoaHocId == khoaHocId)
                .Include(b => b.KhoaHoc)
                .Include(b => b.GiaoBaiTracNghiems)
                .OrderByDescending(b => b.NgayTao)
                .ToListAsync();

            ViewBag.KhoaHocId = khoaHocId;
            return PartialView("_IndexPartial", baiTracNghiems);
        }

        // ⭐ ACTION CHI TIẾT BÀI TRẮC NGHIỆM - ĐÃ SỬA ⭐
        public async Task<IActionResult> ChiTiet(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (userId == null)
            {
                TempData["Error"] = "Vui lòng đăng nhập!";
                return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
            }

            // ⭐ SỬA LẠI INCLUDE - CauHois THUỘC VỀ BaiTracNghiem, KHÔNG PHẢI GiaoBaiTracNghiem ⭐
            var baiTracNghiem = await _context.BaiTracNghiems
                .Include(b => b.KhoaHoc)
                    .ThenInclude(k => k.GiaoVien)
                .Include(b => b.GiaoBaiTracNghiems)
                    .ThenInclude(g => g.SinhVien) // ⭐ GiaoBaiTracNghiem chỉ có SinhVien
                .Include(b => b.CauHois) // ⭐ CauHois nằm trực tiếp trong BaiTracNghiem
                    .ThenInclude(c => c.DapAns)
                .Include(b => b.BaiLamTracNghiems)
                    .ThenInclude(bl => bl.SinhVien)
                .FirstOrDefaultAsync(b => b.BaiTracNghiemId == id);

            if (baiTracNghiem == null)
            {
                TempData["Error"] = "Không tìm thấy bài trắc nghiệm!";
                return RedirectToAction("Index");
            }

            // Kiểm tra quyền (chỉ giảng viên tạo bài mới xem được)
            if (baiTracNghiem.KhoaHoc.GiaoVienId != userId)
            {
                TempData["Error"] = "Bạn không có quyền xem bài trắc nghiệm này!";
                return RedirectToAction("Index");
            }

            return View("TaoBaiTracNghiem", baiTracNghiem);
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

        // Action để load partial view (giữ nguyên để tương thích)
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
        public async Task<IActionResult> XoaBaiTracNghiem([FromBody] XoaBaiTracNghiemRequest request)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                
                // Kiểm tra quyền
                var baiTN = await _context.BaiTracNghiems
                    .Include(b => b.KhoaHoc)
                    .FirstOrDefaultAsync(b => b.BaiTracNghiemId == request.BaiTracNghiemId 
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

        // ⭐ API CẬP NHẬT CÀI ĐẶT BÀI TRẮC NGHIỆM ⭐
        [HttpPost]
        public async Task<IActionResult> CapNhatCaiDat([FromBody] CapNhatCaiDatRequest request)
        {
            try
            {
                _logger.LogInformation($"Updating settings for BaiTracNghiem ID: {request.BaiTracNghiemId}");

                var userId = HttpContext.Session.GetInt32("UserId");
                
                if (userId == null)
                {
                    return Json(new { success = false, message = "Phiên đăng nhập đã hết hạn!" });
                }

                // Lấy bài trắc nghiệm và kiểm tra quyền
                var baiTracNghiem = await _context.BaiTracNghiems
                    .Include(b => b.KhoaHoc)
                    .FirstOrDefaultAsync(b => b.BaiTracNghiemId == request.BaiTracNghiemId);

                if (baiTracNghiem == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài trắc nghiệm!" });
                }

                // Kiểm tra quyền (chỉ giảng viên tạo bài mới được sửa)
                if (baiTracNghiem.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền chỉnh sửa bài trắc nghiệm này!" });
                }

                // Validation
                if (string.IsNullOrWhiteSpace(request.TenBaiThi))
                {
                    return Json(new { success = false, message = "Tên bài thi không được để trống!" });
                }

                if (request.ThoiLuongLamBai.HasValue && request.ThoiLuongLamBai.Value < 1)
                {
                    return Json(new { success = false, message = "Thời gian làm bài phải lớn hơn 0!" });
                }

                if (request.ThoiGianBatDau.HasValue && request.ThoiGianKetThuc.HasValue)
                {
                    if (request.ThoiGianKetThuc.Value <= request.ThoiGianBatDau.Value)
                    {
                        return Json(new { success = false, message = "Thời gian kết thúc phải sau thời gian bắt đầu!" });
                    }
                }

                // Cập nhật thông tin
                baiTracNghiem.TenBaiThi = request.TenBaiThi.Trim();
                baiTracNghiem.LoaiBaiThi = request.LoaiBaiThi;
                baiTracNghiem.ThoiLuongLamBai = request.ThoiLuongLamBai;
                baiTracNghiem.SoLanLamToiDa = request.SoLanLamToiDa;
                baiTracNghiem.ThoiGianBatDau = request.ThoiGianBatDau;
                baiTracNghiem.ThoiGianKetThuc = request.ThoiGianKetThuc;
                baiTracNghiem.TronCauHoi = request.TronCauHoi;
                baiTracNghiem.ChoXemKetQua = request.ChoXemKetQua;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Successfully updated settings for BaiTracNghiem ID: {request.BaiTracNghiemId}");

                return Json(new { 
                    success = true, 
                    message = "Cập nhật cài đặt thành công!",
                    data = new
                    {
                        tenBaiThi = baiTracNghiem.TenBaiThi,
                        loaiBaiThi = baiTracNghiem.LoaiBaiThi,
                        thoiLuongLamBai = baiTracNghiem.ThoiLuongLamBai,
                        soLanLamToiDa = baiTracNghiem.SoLanLamToiDa,
                        thoiGianBatDau = baiTracNghiem.ThoiGianBatDau?.ToString("yyyy-MM-ddTHH:mm"),
                        thoiGianKetThuc = baiTracNghiem.ThoiGianKetThuc?.ToString("yyyy-MM-ddTHH:mm"),
                        tronCauHoi = baiTracNghiem.TronCauHoi,
                        choXemKetQua = baiTracNghiem.ChoXemKetQua
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating settings");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // ⭐ API LẤY DANH SÁCH SINH VIÊN TRONG KHÓA HỌC - ĐÃ SỬA ⭐
        [HttpGet]
        public async Task<IActionResult> LayDanhSachSinhVien(int khoaHocId, int baiTracNghiemId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                
                if (userId == null)
                {
                    return Json(new { success = false, message = "Phiên đăng nhập đã hết hạn!" });
                }

                // Kiểm tra quyền
                var khoaHoc = await _context.KhoaHocs
                    .FirstOrDefaultAsync(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == userId);

                if (khoaHoc == null)
                {
                    return Json(new { success = false, message = "Bạn không có quyền xem khóa học này!" });
                }

                // ⭐ SỬA: Dùng ThamGiaKhoaHocs thay vì DangKyKhoaHocs ⭐
                var danhSachSinhVien = await _context.ThamGiaKhoaHocs
                    .Where(tg => tg.KhoaHocId == khoaHocId && tg.TrangThai == "DangHoc")
                    .Include(tg => tg.SinhVien)
                    .Select(tg => new
                    {
                        sinhVienId = tg.SinhVienId,
                        fullName = tg.SinhVien.FullName,
                        maSo = tg.SinhVien.MaSo,
                        avatar = tg.SinhVien.Avatar ?? "/assets/image/tải xuống.jpg",
                        email = tg.SinhVien.Email
                    })
                    .OrderBy(s => s.fullName)
                    .ToListAsync();

                // Bỏ logic kiểm tra "Tất cả" - Chỉ lấy danh sách cụ thể
                var sinhVienDaGiao = await _context.GiaoBaiTracNghiems
                    .Where(g => g.BaiTracNghiemId == baiTracNghiemId && g.SinhVienId != null)
                    .Select(g => g.SinhVienId)
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    danhSachSinhVien = danhSachSinhVien,
                    sinhVienDaGiao = sinhVienDaGiao
                    // Bỏ tatCaSinhVien
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading student list");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // ⭐ API LƯU GIAO BÀI CHO SINH VIÊN ⭐
        [HttpPost]
        public async Task<IActionResult> LuuGiaoBai([FromBody] LuuGiaoBaiRequest request)
        {
            try
            {
                _logger.LogInformation($"Saving giao bai for BaiTracNghiem ID: {request.BaiTracNghiemId}");

                var userId = HttpContext.Session.GetInt32("UserId");
                
                if (userId == null)
                {
                    return Json(new { success = false, message = "Phiên đăng nhập đã hết hạn!" });
                }

                // Kiểm tra quyền
                var baiTracNghiem = await _context.BaiTracNghiems
                    .Include(b => b.KhoaHoc)
                    .FirstOrDefaultAsync(b => b.BaiTracNghiemId == request.BaiTracNghiemId);

                if (baiTracNghiem == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài trắc nghiệm!" });
                }

                if (baiTracNghiem.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền giao bài trắc nghiệm này!" });
                }

                // Xóa các giao bài cũ
                var giaoBaiCu = await _context.GiaoBaiTracNghiems
                    .Where(g => g.BaiTracNghiemId == request.BaiTracNghiemId)
                    .ToListAsync();

                _context.GiaoBaiTracNghiems.RemoveRange(giaoBaiCu);

                // Thêm giao bài mới
                // ⭐ Kiểm tra danh sách sinh viên
                if (request.DanhSachSinhVienId == null || !request.DanhSachSinhVienId.Any())
                {
                    return Json(new { success = false, message = "Vui lòng chọn ít nhất một sinh viên!" });
                }

                var ngayGiao = DateTime.Now;
                
                // Luôn lưu từng sinh viên cụ thể
                foreach (var sinhVienId in request.DanhSachSinhVienId)
                {
                    var giaoBaiMoi = new GiaoBaiTracNghiem
                    {
                        BaiTracNghiemId = request.BaiTracNghiemId,
                        KhoaHocId = baiTracNghiem.KhoaHocId,
                        SinhVienId = sinhVienId,
                        NgayGiao = ngayGiao
                    };
                    _context.GiaoBaiTracNghiems.Add(giaoBaiMoi);
                }
                
                await _context.SaveChangesAsync();
                
                return Json(new
                {
                    success = true,
                    message = "Giao bài thành công!",
                    soSinhVien = request.DanhSachSinhVienId.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving giao bai");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // ⭐ API XUẤT EXCEL KẾT QUẢ TRẮC NGHIỆM ⭐
        [HttpGet]
        public async Task<IActionResult> XuatExcelKetQua(int baiTracNghiemId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                
                if (userId == null)
                {
                    return Unauthorized();
                }

                // Lấy dữ liệu bài trắc nghiệm với kết quả
                var baiTracNghiem = await _context.BaiTracNghiems
                    .Include(b => b.KhoaHoc)
                        .ThenInclude(k => k.GiaoVien)
                    .Include(b => b.BaiLamTracNghiems)
                        .ThenInclude(bl => bl.SinhVien)
                    .FirstOrDefaultAsync(b => b.BaiTracNghiemId == baiTracNghiemId);

                if (baiTracNghiem == null || baiTracNghiem.KhoaHoc.GiaoVienId != userId)
                {
                    return NotFound();
                }

                // ⭐ TẠO FILE EXCEL VỚI EPPLUS ⭐
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial; // Quan trọng!

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Kết quả thi");

                // ⭐ HEADER THÔNG TIN ⭐
                worksheet.Cells["A1"].Value = "KẾT QUẢ BÀI TRẮC NGHIỆM";
                worksheet.Cells["A1"].Style.Font.Bold = true;
                worksheet.Cells["A1"].Style.Font.Size = 16;
                
                worksheet.Cells["A2"].Value = $"Tên bài thi: {baiTracNghiem.TenBaiThi}";
                worksheet.Cells["A3"].Value = $"Khóa học: {baiTracNghiem.KhoaHoc.TenKhoaHoc}";
                worksheet.Cells["A4"].Value = $"Giảng viên: {baiTracNghiem.KhoaHoc.GiaoVien.FullName}";
                worksheet.Cells["A5"].Value = $"Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}";

                // ⭐ HEADER BẢNG ⭐
                var headers = new[] { "STT", "Mã SV", "Họ tên", "Điểm", "Số lần làm", "Ngày nộp", "Trạng thái" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[7, i + 1].Value = headers[i];
                    worksheet.Cells[7, i + 1].Style.Font.Bold = true;
                    worksheet.Cells[7, i + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    worksheet.Cells[7, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }

                // ⭐ DỮ LIỆU ⭐
                var baiLamList = baiTracNghiem.BaiLamTracNghiems.OrderByDescending(b => b.NgayNop).ToList();
                int row = 8;
                int stt = 1;

                foreach (var baiLam in baiLamList)
                {
                    worksheet.Cells[row, 1].Value = stt++;
                    worksheet.Cells[row, 2].Value = baiLam.SinhVien?.MaSo ?? "N/A";
                    worksheet.Cells[row, 3].Value = baiLam.SinhVien?.FullName ?? "N/A";
                    worksheet.Cells[row, 4].Value = baiLam.Diem?.ToString("F1") ?? "--";
                    worksheet.Cells[row, 5].Value = baiLam.SoLanLam ?? 0;
                    worksheet.Cells[row, 6].Value = baiLam.NgayNop?.ToString("dd/MM/yyyy HH:mm") ?? "Chưa nộp";
                    
                    // Xác định trạng thái
                    string trangThai;
                    if (baiLam.NgayNop.HasValue)
                        trangThai = "Đã nộp";
                    else if (baiLam.NgayBatDau.HasValue)
                        trangThai = "Đang làm";
                    else
                        trangThai = "Chưa làm";
                    
                    worksheet.Cells[row, 7].Value = trangThai;
                    row++;
                }

                // ⭐ AUTO-FIT COLUMNS ⭐
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                // ⭐ TRẢ VỀ FILE ⭐
                var stream = new MemoryStream(package.GetAsByteArray());
                var fileName = $"KetQua_{baiTracNghiem.TenBaiThi.Replace(" ", "_")}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(stream, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting Excel");
                return StatusCode(500, "Có lỗi xảy ra khi xuất file Excel");
            }
        }
    }

    // ⭐ MODEL REQUEST CẬP NHẬT CÀI ĐẶT ⭐
    public class CapNhatCaiDatRequest
    {
        public int BaiTracNghiemId { get; set; }
        public string TenBaiThi { get; set; } = "";
        public string? LoaiBaiThi { get; set; }
        public int? ThoiLuongLamBai { get; set; }
        public int? SoLanLamToiDa { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public bool? TronCauHoi { get; set; }
        public bool? ChoXemKetQua { get; set; }
    }

    // Model để nhận dữ liệu từ request xóa
    public class XoaBaiTracNghiemRequest
    {
        public int BaiTracNghiemId { get; set; }
        public int KhoaHocId { get; set; }
    }

    // ⭐ MODEL REQUEST LƯU GIAO BÀI ⭐
    public class LuuGiaoBaiRequest
    {
        public int BaiTracNghiemId { get; set; }
        public bool TatCaSinhVien { get; set; }
        public List<int>? DanhSachSinhVienId { get; set; }
    }
}
