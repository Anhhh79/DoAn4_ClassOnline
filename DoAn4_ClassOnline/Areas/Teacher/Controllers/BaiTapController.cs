using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class BaiTapController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BaiTapController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;

        }

        // Action load danh sách bài tập
        [HttpGet]
        public async Task<IActionResult> GetDanhSachBaiTaps(int? khoaHocId)
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

                // Lấy danh sách bài tập
                var danhSachBaiTap = await _context.BaiTaps
                    .Where(bt => bt.KhoaHocId == khoaHocId)
                    .Include(bt => bt.BaiTapFiles)
                    .Include(bt => bt.BaiTapNops)
                    .Include(bt => bt.KhoaHoc).ThenInclude(k => k.ThamGiaKhoaHocs)
                    .OrderByDescending(bt => bt.NgayTao)
                    .Select(bt => new
                    {
                        baiTapId = bt.BaiTapId,
                        tieuDe = bt.TieuDe,
                        moTa = bt.MoTa,
                        thoiGianBatDau = bt.ThoiGianBatDau,
                        thoiGianKetThuc = bt.ThoiGianKetThuc,
                        ngayTao = bt.NgayTao,
                        soBaiNop = bt.BaiTapNops.Count(n => n.TrangThai == "DaNop"),
                        soHocVien = bt.BaiTapNops.Count,
                        khoaHocId = bt.KhoaHocId,
                        danhSachFile = bt.BaiTapFiles.Select(f => new
                        {
                            fileId = f.FileId,
                            tenFile = f.TenFile,
                            duongDan = f.DuongDan,
                            kichThuoc = f.KichThuoc,
                            loaiFile = f.LoaiFile,
                            loaiFileBaiTap = f.LoaiFileBaiTap
                        })
                    })
                    .AsNoTracking()
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    data = danhSachBaiTap
                });
            }
            catch (Exception)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi lấy bài tập");
                return Json(new { success = false, message = "Lỗi hệ thống!" });
            }
        }

        // Action tạo bài tập mới
        [HttpPost]
        public async Task<IActionResult> TaoBaiTap([FromForm] BaiTapViewModel model, List<IFormFile>? files)
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
                if (model.KhoaHocId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy khóa học!" });
                }

                // Kiểm tra quyền truy cập
                var khoaHoc = await _context.KhoaHocs
                    .AsNoTracking()
                    .FirstOrDefaultAsync(k => k.KhoaHocId == model.KhoaHocId && k.GiaoVienId == userId);

                if (khoaHoc == null)
                {
                    return Json(new { success = false, message = "Bạn không có quyền tạo bài tập cho khóa học này!" });
                }

                // Validate dữ liệu
                if (string.IsNullOrWhiteSpace(model.TieuDe))
                {
                    return Json(new { success = false, message = "Vui lòng nhập tiêu đề bài tập!" });
                }

                if (model.ThoiGianBatDau.HasValue && model.ThoiGianKetThuc.HasValue
                    && model.ThoiGianKetThuc <= model.ThoiGianBatDau)
                {
                    return Json(new { success = false, message = "Thời gian kết thúc phải sau thời gian bắt đầu!" });
                }

                // Tạo bài tập mới
                var baiTap = new BaiTap
                {
                    KhoaHocId = model.KhoaHocId,
                    TieuDe = model.TieuDe.Trim(),
                    MoTa = model.MoTa?.Trim(),
                    ThoiGianBatDau = model.ThoiGianBatDau,
                    ThoiGianKetThuc = model.ThoiGianKetThuc,
                    NgayTao = DateTime.Now,
                    ChoPhepNopTre = model.ChoPhepNopTre,
                    DiemToiDa = model.DiemToiDa
                };

                _context.BaiTaps.Add(baiTap);
                await _context.SaveChangesAsync();

                // Xử lý upload files nếu có
                if (files != null && files.Any())
                {
                    var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "baitap", baiTap.BaiTapId.ToString());
                    if (!Directory.Exists(uploadPath))
                    {
                        Directory.CreateDirectory(uploadPath);
                    }

                    foreach (var file in files)
                    {
                        if (file.Length > 0)
                        {
                            // Lấy tên file an toàn
                            string safeFileName = Path.GetFileName(file.FileName);
                            safeFileName = string.Concat(safeFileName.Split(Path.GetInvalidFileNameChars()));
                            var fileName = $"{Guid.NewGuid()}_{safeFileName}";
                            var filePath = Path.Combine(uploadPath, fileName);


                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await file.CopyToAsync(stream);
                            }

                            var baiTapFile = new BaiTapFile
                            {
                                BaiTapId = baiTap.BaiTapId,
                                TenFile = safeFileName,
                                DuongDan = $"/uploads/baitap/{baiTap.BaiTapId}/{fileName}",
                                KichThuoc = file.Length,
                                LoaiFile = Path.GetExtension(file.FileName)?.ToLower(),
                                LoaiFileBaiTap = "DeBai"
                            };

                            _context.BaiTapFiles.Add(baiTapFile);
                        }
                    }

                    await _context.SaveChangesAsync();
                }

                return Json(new
                {
                    success = true,
                    message = "Tạo bài tập thành công!",
                    data = new
                    {
                        baiTapId = baiTap.BaiTapId,
                        tieuDe = baiTap.TieuDe,
                        ngayTao = baiTap.NgayTao
                    }
                });
            }
            catch (Exception ex)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi tạo bài tập");
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action giao bài tập
        [HttpPost]
        public async Task<IActionResult> GiaoBaiTap([FromBody] GiaoBaiTapViewModel model)
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
                if (model.BaiTapId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Lấy thông tin bài tập và kiểm tra quyền
                var baiTap = await _context.BaiTaps
                    .Include(bt => bt.KhoaHoc)
                    .FirstOrDefaultAsync(bt => bt.BaiTapId == model.BaiTapId
                        && bt.KhoaHoc.GiaoVienId == userId);

                if (baiTap == null)
                {
                    return Json(new { success = false, message = "Bạn không có quyền giao bài tập này!" });
                }

                // Lấy danh sách sinh viên cần giao
                List<int> danhSachSinhVienId = new List<int>();

                if (model.GiaoTatCa)
                {
                    // Giao cho tất cả sinh viên trong khóa học
                    danhSachSinhVienId = await _context.ThamGiaKhoaHocs
                        .Where(tg => tg.KhoaHocId == baiTap.KhoaHocId)
                        .Select(tg => tg.SinhVienId)
                        .ToListAsync();
                }
                else if (model.DanhSachSinhVienId != null && model.DanhSachSinhVienId.Any())
                {
                    // Giao cho sinh viên được chọn
                    // Kiểm tra các sinh viên có trong khóa học không
                    danhSachSinhVienId = await _context.ThamGiaKhoaHocs
                        .Where(tg => tg.KhoaHocId == baiTap.KhoaHocId
                            && model.DanhSachSinhVienId.Contains(tg.SinhVienId))
                        .Select(tg => tg.SinhVienId)
                        .ToListAsync();

                    if (danhSachSinhVienId.Count != model.DanhSachSinhVienId.Count)
                    {
                        return Json(new { success = false, message = "Một số sinh viên không thuộc khóa học này!" });
                    }
                }
                else
                {
                    return Json(new { success = false, message = "Vui lòng chọn sinh viên hoặc giao cho tất cả!" });
                }

                if (!danhSachSinhVienId.Any())
                {
                    return Json(new { success = false, message = "Không có sinh viên nào để giao bài!" });
                }

                // Tạo bản ghi nộp bài cho từng sinh viên (trạng thái chưa nộp)
                var danhSachBaiNop = new List<BaiTapNop>();
                var ngayGiao = DateTime.Now;

                foreach (var sinhVienId in danhSachSinhVienId)
                {
                    // Kiểm tra đã có bản ghi chưa
                    var daTonTai = await _context.BaiTapNops
                        .AnyAsync(bn => bn.BaiTapId == model.BaiTapId && bn.SinhVienId == sinhVienId);

                    if (!daTonTai)
                    {
                        danhSachBaiNop.Add(new BaiTapNop
                        {
                            BaiTapId = model.BaiTapId,
                            SinhVienId = sinhVienId,
                            TrangThai = "ChuaNop",
                            NgayNop = null,
                            Diem = null,
                            NhanXet = null
                        });
                    }
                }

                if (danhSachBaiNop.Any())
                {
                    _context.BaiTapNops.AddRange(danhSachBaiNop);
                    await _context.SaveChangesAsync();
                }

                // Cập nhật thời gian bắt đầu nếu chưa có
                if (baiTap.ThoiGianBatDau == null)
                {
                    baiTap.ThoiGianBatDau = ngayGiao;
                    await _context.SaveChangesAsync();
                }

                return Json(new
                {
                    success = true,
                    message = $"Đã giao bài tập cho {danhSachSinhVienId.Count} sinh viên!",
                    data = new
                    {
                        soSinhVien = danhSachSinhVienId.Count,
                        ngayGiao = ngayGiao
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action lấy danh sách sinh viên trong khóa học để chọn giao bài
        [HttpGet]
        public async Task<IActionResult> GetDanhSachSinhVien(int khoaHocId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (userId == null)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });
                }

                // Kiểm tra quyền giáo viên
                var isOwner = await _context.KhoaHocs
                    .AsNoTracking()
                    .AnyAsync(k => k.KhoaHocId == khoaHocId && k.GiaoVienId == userId);

                if (!isOwner)
                {
                    return Json(new { success = false, message = "Không có quyền truy cập!" });
                }

                // Lấy danh sách sinh viên của khóa học
                var danhSachSinhVien = await _context.ThamGiaKhoaHocs
                    .AsNoTracking()
                    .Where(tg => tg.KhoaHocId == khoaHocId)
                    .Include(tg => tg.SinhVien)
                    .Select(tg => new
                    {
                        sinhVienId = tg.SinhVienId,
                        hoTen = tg.SinhVien != null ? tg.SinhVien.FullName : "",
                        email = tg.SinhVien != null ? tg.SinhVien.Email : "",
                        maSinhVien = tg.SinhVien != null ? tg.SinhVien.MaSo : "",
                        ngayThamGia = tg.NgayThamGia
                    })
                    .OrderBy(sv => sv.hoTen)
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    data = danhSachSinhVien
                });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Lỗi hệ thống!" });
            }
        }

    }

    // ViewModel cho form tạo bài tập
    public class BaiTapViewModel
    {
        public int KhoaHocId { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public bool ChoPhepNopTre { get; set; } 
        public decimal? DiemToiDa { get; set; } = 10;
    }

    // ViewModel cho giao bài tập
    public class GiaoBaiTapViewModel
    {
        public int BaiTapId { get; set; }
        public bool GiaoTatCa { get; set; } // true = giao tất cả, false = giao cho danh sách
        public List<int>? DanhSachSinhVienId { get; set; } // Danh sách sinh viên được chọn
    }

}

