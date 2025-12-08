using DoAn4_ClassOnline.Areas.Teacher.Models;
using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class QuanLyKhoaHocController : Controller
    {
        private readonly ApplicationDbContext _context;

        public QuanLyKhoaHocController(ApplicationDbContext context)
        {
            _context = context;
        }

        //lấy danh sách khóa học của giảng viên
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }

                // Lấy danh sách khóa học của giảng viên
                var khoaHocs = await _context.KhoaHocs
                    .Where(k => k.GiaoVienId == userId)
                    .Include(k => k.GiaoVien)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.ThamGiaKhoaHocs)
                    .OrderByDescending(k => k.CreatedAt)
                    .ToListAsync();

                // Lấy danh sách học kỳ cho dropdown
                ViewBag.HocKyList = await _context.HocKies
                    .OrderByDescending(h => h.HocKyId)
                    .Select(h => new
                    {
                        h.HocKyId,
                        h.TenHocKy,
                        h.NamHoc,
                        Ten = h.TenHocKy + " / " + h.NamHoc
                    })
                    .ToListAsync();

                ViewBag.KhoaList = await _context.Khoas
                    .Select(k => new
                    {
                        k.KhoaId,
                        k.TenKhoa
                    }).ToListAsync();

                return View(khoaHocs);
            }
            catch (Exception)
            {
                return View("Error");
            }

        }

        // Load lại danh sách khóa học (trả về JSON cho AJAX)
        [HttpGet]
        public async Task<IActionResult> DanhSachKhoaHoc()
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }

                // Lấy danh sách khóa học của giảng viên
                var khoaHocs = await _context.KhoaHocs
                    .Where(k => k.GiaoVienId == userId)
                    .Include(k => k.GiaoVien)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.ThamGiaKhoaHocs)
                    .OrderByDescending(k => k.CreatedAt)
                    .Select(k => new
                    {
                        k.KhoaHocId,
                        k.TenKhoaHoc,
                        k.HinhAnh,
                        GiaoVienName = k.GiaoVien.FullName,
                        k.HocKyId,
                        TenKhoa = k.Khoa.TenKhoa,
                        TenHocKy = k.HocKy.TenHocKy,
                        NamHoc = k.HocKy.NamHoc,
                        SoLuongSinhVien = k.ThamGiaKhoaHocs.Count,
                        k.TrangThaiKhoaHoc
                    })
                    .ToListAsync();

                return Json(new { success = true, data = khoaHocs });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        //lấy thông tin khóa học theo id
        [HttpGet]
        public async Task<IActionResult> QuanLyKhoaHoc(int? id)
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");

                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }
                // Lấy thông tin khóa học 
                if (id == null)
                    return NotFound();

                var khoaHoc = await _context.KhoaHocs
                    .Where(k => k.KhoaHocId == id)
                    .Include(k => k.Khoa)
                    .Include(k => k.HocKy)
                    .Include(k => k.GiaoVien)
                    .Include(k => k.ThamGiaKhoaHocs)
                       .ThenInclude(t => t.SinhVien)
                    .FirstOrDefaultAsync();

                if (khoaHoc == null)
                    return NotFound();

                // 🆕 Lấy thời gian truy cập cuối cùng của từng sinh viên trong khóa học này
                var lichSuTruyCaps = await _context.LichSuTruyCaps
                    .Where(l => l.KhoaHocId == id)
                    .GroupBy(l => l.UserId)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        ThoiGianCuoi = g.Max(l => l.ThoiGianTruyCap)
                    })
                    .ToDictionaryAsync(x => x.UserId, x => x.ThoiGianCuoi);

                ViewBag.LichSuTruyCap = lichSuTruyCaps;


                // Lấy danh sách học kỳ cho dropdown
                ViewBag.HocKyList = await _context.HocKies
                    .OrderByDescending(h => h.HocKyId)
                    .Select(h => new
                    {
                        h.HocKyId,
                        h.TenHocKy,
                        h.NamHoc,
                        Ten = h.TenHocKy + " / " + h.NamHoc
                    })
                    .ToListAsync();

                ViewBag.KhoaList = await _context.Khoas
                    .Select(k => new
                    {
                        k.KhoaId,
                        k.TenKhoa
                    }).ToListAsync();


                return View(khoaHoc);
            }
            catch (Exception)
            {
                return View("Error");
            }
        }

        // lấy thông tin chi tiết sinh viên theo id
        [HttpGet]
        public async Task<IActionResult> ThongTinSinhVien(int? id)
        {
            try
            {
                // Lấy UserId từ Session
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                {
                    TempData["Error"] = "Vui lòng đăng nhập!";
                    return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
                }

                // Kiểm tra id
                if (id == null)
                    return Json(new { success = false, message = "ID không hợp lệ" });

                // ✅ Lấy thông tin chi tiết sinh viên với Select để tránh circular reference
                var sinhVien = await _context.Users
                    .Where(s => s.UserId == id)
                    .Include(s => s.Khoa)
                    .Select(s => new
                    {
                        s.UserId,
                        s.FullName,
                        s.Email,
                        s.Avatar,
                        s.MaSo,
                        s.PhoneNumber,
                        s.GioiTinh,
                        NgaySinh = s.NgaySinh.HasValue ? s.NgaySinh.Value.ToString("dd/MM/yyyy") : null,
                        s.DiaChi,
                        s.KhoaId,
                        TenKhoa = s.Khoa != null ? s.Khoa.TenKhoa : null
                    })
                    .FirstOrDefaultAsync();

                if (sinhVien == null)
                    return Json(new { success = false, message = "Không tìm thấy sinh viên" });

                return Json(new { success = true, sinhVien });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // thêm kho học mới
        [HttpPost]
        public async Task<IActionResult> ThemKhoaHoc([FromForm] ThongTinKhoaHoc vm)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });

                if (!ModelState.IsValid)
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });

                string imgPath = "/assets/image/default.jpg";

                // SAVE FILE
                if (vm.AnhKhoaHoc != null)
                {
                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/image");

                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    // Giữ nguyên tên file người dùng upload
                    string fileName = vm.AnhKhoaHoc.FileName;
                    string fullPath = Path.Combine(folderPath, fileName);

                    // Nếu file chưa tồn tại thì mới lưu
                    if (!System.IO.File.Exists(fullPath))
                    {
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await vm.AnhKhoaHoc.CopyToAsync(stream);
                        }
                    }

                    // Đường dẫn lưu vào DB
                    imgPath = "/assets/image/" + fileName;
                }

                var model = new KhoaHoc
                {
                    TenKhoaHoc = vm.TenKhoaHoc,
                    MoTa = vm.MoTa,
                    KhoaId = vm.KhoaId,
                    HocKyId = vm.HocKyId,
                    LinkHocOnline = vm.LinkHocOnline,
                    MatKhau = vm.MatKhau,
                    GiaoVienId = (int)userId,
                    HinhAnh = imgPath,
                    TrangThaiKhoaHoc = vm.TrangThaiKhoaHoc ?? "DangMo",
                    CreatedAt = DateTime.Now
                };

                _context.KhoaHocs.Add(model);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Thêm khóa học thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // khóa khóa học
        [HttpPost]
        public async Task<IActionResult> KhoaKhoaHoc(int khoaHocId)
        {
            try
            {
                if (khoaHocId <= 0)
                    return Json(new { success = false, message = "ID khóa học không hợp lệ!" });

                var khoaHoc = await _context.KhoaHocs.FindAsync(khoaHocId);
                if (khoaHoc == null)
                    return Json(new { success = false, message = "Không tìm thấy khóa học!" });

                khoaHoc.TrangThaiKhoaHoc = "DangKhoa";

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Khóa khóa học thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }

        }

        // mở khóa học
        [HttpPost]
        public async Task<IActionResult> MoKhoaKhoaHoc(int khoaHocId)
        {
            try
            {
                if (khoaHocId <= 0)
                    return Json(new { success = false, message = "ID khóa học không hợp lệ!" });
                var khoaHoc = await _context.KhoaHocs.FindAsync(khoaHocId);
                if (khoaHoc == null)
                    return Json(new { success = false, message = "Không tìm thấy khóa học!" });
                khoaHoc.TrangThaiKhoaHoc = "DangMo";
                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Mở khóa khóa học thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // cập nhật thông tin khóa học
        [HttpPost]
        public async Task<IActionResult> CapNhatKhoaHoc([FromForm] ThongTinKhoaHoc vm)
        {
            try
            {
                if (!ModelState.IsValid)
                    return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });

                var khoaHoc = await _context.KhoaHocs.FindAsync(vm.KhoaHocId);

                if (khoaHoc == null)
                    return Json(new { success = false, message = "Không tìm thấy khóa học!" });

                // Cập nhật thông tin cơ bản
                khoaHoc.TenKhoaHoc = vm.TenKhoaHoc;
                khoaHoc.KhoaId = vm.KhoaId;
                khoaHoc.HocKyId = vm.HocKyId;
                khoaHoc.LinkHocOnline = vm.LinkHocOnline;
                khoaHoc.MatKhau = vm.MatKhau;

                // =======================================
                //       CẬP NHẬT ẢNH KHÓA HỌC (điều kiện)
                // =======================================
                if (vm.AnhKhoaHoc != null && vm.AnhKhoaHoc.Length > 0)
                {
                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/image");
                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    string oldImageName = Path.GetFileName(khoaHoc.HinhAnh ?? "");
                    string newImageName = vm.AnhKhoaHoc.FileName;

                    // ❗ Nếu ẢNH MỚI TRÙNG ẢNH CŨ → KHÔNG LƯU, KHÔNG XÓA
                    if (string.Equals(oldImageName, newImageName, StringComparison.OrdinalIgnoreCase))
                    {
                        // Giữ nguyên ảnh cũ – không làm gì
                    }
                    else
                    {
                        // ẢNH MỚI KHÁC ẢNH CŨ → LƯU file mới
                        string newFilePath = Path.Combine(folderPath, newImageName);

                        using (var stream = new FileStream(newFilePath, FileMode.Create))
                        {
                            await vm.AnhKhoaHoc.CopyToAsync(stream);
                        }

                        // Ghi tên ảnh mới vào DB
                        khoaHoc.HinhAnh = "/assets/image/" + newImageName;
                    }
                }

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Cập nhật khóa học thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }



        // ===============================
        // XUẤT DANH SÁCH SINH VIÊN
        // ===============================
        [HttpGet]
        public async Task<IActionResult> XuatDanhSachSinhVien(int khoaHocId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });

            var khoaHoc = await GetKhoaHocAsync(khoaHocId, userId.Value);
            if (khoaHoc == null)
                return NotFound("Không tìm thấy khóa học!");

            var truyCapCuoiDict = await GetLichSuTruyCapAsync(khoaHocId);

            // ✅ Sử dụng cú pháp giống TracNghiemController
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Danh sách sinh viên");

            AddHeader(ws, "DANH SÁCH SINH VIÊN", khoaHoc.TenKhoaHoc);
            AddTableTitle(ws);
            FillData(ws, khoaHoc, truyCapCuoiDict);
            FormatTable(ws);

            // Xuất file - Sử dụng GetAsByteArray() giống TracNghiemController
            var stream = new MemoryStream(package.GetAsByteArray());

            string fileName = $"DanhSach_SinhVien_{khoaHoc.TenKhoaHoc}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                .Replace(" ", "_");

            return File(
                stream,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }


        // ===============================
        // DATABASE HELPERS
        // ===============================

        private async Task<KhoaHoc> GetKhoaHocAsync(int khoaHocId, int giaoVienId)
        {
            return await _context.KhoaHocs
                .Where(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == giaoVienId)
                .Include(k => k.ThamGiaKhoaHocs)
                    .ThenInclude(t => t.SinhVien)
                        .ThenInclude(s => s.Khoa)
                .FirstOrDefaultAsync();
        }

        private async Task<Dictionary<int, DateTime?>> GetLichSuTruyCapAsync(int khoaHocId)
        {
            return await _context.LichSuTruyCaps
                .Where(l => l.KhoaHocId == khoaHocId)
                .GroupBy(l => l.UserId)
                .Select(g => new { g.Key, Last = g.Max(x => x.ThoiGianTruyCap) })
                .ToDictionaryAsync(x => x.Key, x => x.Last);
        }


        // ===============================
        // EXCEL HELPERS
        // ===============================

        private void AddHeader(ExcelWorksheet ws, string title, string tenKhoaHoc)
        {
            // Title
            ws.Cells[1, 1].Value = title;
            ws.Cells[1, 1, 1, 9].Merge = true;
            ws.Cells[1, 1].Style.Font.Size = 16;
            ws.Cells[1, 1].Style.Font.Bold = true;
            ws.Cells[1, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Course name
            ws.Cells[2, 1].Value = $"Khóa học: {tenKhoaHoc}";
            ws.Cells[2, 1, 2, 9].Merge = true;
            ws.Cells[2, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Export time
            ws.Cells[3, 1].Value = $"Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}";
            ws.Cells[3, 1, 3, 9].Merge = true;
            ws.Cells[3, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
        }

        private void AddTableTitle(ExcelWorksheet ws)
        {
            string[] titles =
            {
        "STT", "Họ và tên", "Mã số sinh viên", "Giới tính",
        "Email", "Số điện thoại", "Khoa", "Ngày tham gia", "Truy cập cuối"
    };

            for (int i = 0; i < titles.Length; i++)
                ws.Cells[5, i + 1].Value = titles[i];

            var range = ws.Cells[5, 1, 5, titles.Length];
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
            range.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            range.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
        }

        private void FillData(
            ExcelWorksheet ws,
            KhoaHoc khoaHoc,
            Dictionary<int, DateTime?> truyCapCuoiDict)
        {
            int row = 6;
            int stt = 1;

            foreach (var tg in khoaHoc.ThamGiaKhoaHocs.OrderBy(t => t.SinhVien.FullName))
            {
                ws.Cells[row, 1].Value = stt++;
                ws.Cells[row, 2].Value = tg.SinhVien.FullName;
                ws.Cells[row, 3].Value = tg.SinhVien.MaSo ?? "Chưa có";
                ws.Cells[row, 4].Value = tg.SinhVien.GioiTinh ?? "Chưa cập nhật";
                ws.Cells[row, 5].Value = tg.SinhVien.Email;
                ws.Cells[row, 6].Value = tg.SinhVien.PhoneNumber ?? "Chưa cập nhật";
                ws.Cells[row, 7].Value = tg.SinhVien.Khoa?.TenKhoa ?? "Chưa cập nhật";

                ws.Cells[row, 8].Style.Numberformat.Format = "dd/MM/yyyy";
                ws.Cells[row, 8].Value = tg.NgayThamGia;

                ws.Cells[row, 9].Style.Numberformat.Format = "dd/MM/yyyy HH:mm";

                if (truyCapCuoiDict.TryGetValue(tg.SinhVienId, out var lastAccess))
                    ws.Cells[row, 9].Value = lastAccess;

                row++;
            }
        }

        private void FormatTable(ExcelWorksheet ws)
        {
            if (ws.Dimension == null)
                return;

            var range = ws.Cells[ws.Dimension.Address];

            range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;

            range.AutoFitColumns();
        }


    }
}