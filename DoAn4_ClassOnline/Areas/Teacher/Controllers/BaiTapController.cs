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


        // Action xóa bài tập
        [HttpPost]
        public async Task<IActionResult> XoaBaiTap([FromBody] int baiTapId)
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
                if (baiTapId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Lấy thông tin bài tập và kiểm tra quyền
                var baiTap = await _context.BaiTaps
                    .Include(bt => bt.KhoaHoc)
                    .Include(bt => bt.BaiTapFiles)
                    .Include(bt => bt.BaiTapNops)
                        .ThenInclude(bn => bn.BaiTapNopFiles)
                    .FirstOrDefaultAsync(bt => bt.BaiTapId == baiTapId);

                if (baiTap == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Kiểm tra quyền truy cập
                if (baiTap.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền xóa bài tập này!" });
                }

                // Xóa files bài tập trên server
                var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "baitap", baiTap.BaiTapId.ToString());
                if (Directory.Exists(uploadPath))
                {
                    try
                    {
                        Directory.Delete(uploadPath, true);
                    }
                    catch (Exception)
                    {
                        // Log lỗi xóa file nhưng vẫn tiếp tục xóa database
                        // _logger.LogWarning(ex, "Không thể xóa thư mục files của bài tập {BaiTapId}", baiTapId);
                    }
                }

                // Xóa files bài nộp của sinh viên trên server
                foreach (var baiNop in baiTap.BaiTapNops)
                {
                    var baiNopPath = Path.Combine(_env.WebRootPath, "assets", "baitapnop", baiNop.BaiNopId.ToString());
                    if (Directory.Exists(baiNopPath))
                    {
                        try
                        {
                            Directory.Delete(baiNopPath, true);
                        }
                        catch (Exception)
                        {
                            // Bỏ qua lỗi xóa file
                        }
                    }
                }

                // Xóa dữ liệu trong database (cascade delete sẽ xóa BaiTapFiles, BaiTapNops và BaiTapNopFiles)
                _context.BaiTaps.Remove(baiTap);
                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Xóa bài tập thành công!"
                });
            }
            catch (Exception ex)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi xóa bài tập");
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action load dữ liệu bài tập để sửa
        [HttpGet]
        public async Task<IActionResult> GetBaiTapById(int baiTapId)
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
                if (baiTapId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Lấy thông tin bài tập và kiểm tra quyền
                var baiTap = await _context.BaiTaps
                    .AsNoTracking()
                    .Include(bt => bt.KhoaHoc)
                    .Include(bt => bt.BaiTapFiles)
                    .FirstOrDefaultAsync(bt => bt.BaiTapId == baiTapId);

                if (baiTap == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Kiểm tra quyền truy cập
                if (baiTap.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền truy cập bài tập này!" });
                }

                // Trả về dữ liệu bài tập
                var result = new
                {
                    baiTapId = baiTap.BaiTapId,
                    khoaHocId = baiTap.KhoaHocId,
                    tieuDe = baiTap.TieuDe,
                    moTa = baiTap.MoTa,
                    thoiGianBatDau = baiTap.ThoiGianBatDau?.ToString("yyyy-MM-ddTHH:mm"),
                    thoiGianKetThuc = baiTap.ThoiGianKetThuc?.ToString("yyyy-MM-ddTHH:mm"),
                    choPhepNopTre = baiTap.ChoPhepNopTre ?? false,
                    diemToiDa = baiTap.DiemToiDa ?? 10,
                    ngayTao = baiTap.NgayTao,
                    danhSachFile = baiTap.BaiTapFiles.Select(f => new
                    {
                        fileId = f.FileId,
                        tenFile = f.TenFile,
                        duongDan = f.DuongDan,
                        kichThuoc = f.KichThuoc,
                        loaiFile = f.LoaiFile,
                        loaiFileBaiTap = f.LoaiFileBaiTap
                    }).ToList()
                };

                return Json(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi lấy thông tin bài tập");
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action xóa file bài tập
        [HttpPost]
        public async Task<IActionResult> XoaFileBaiTap([FromBody] int fileId)
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
                if (fileId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy file!" });
                }

                // Lấy thông tin file và kiểm tra quyền
                var baiTapFile = await _context.BaiTapFiles
                    .Include(f => f.BaiTap)
                        .ThenInclude(bt => bt.KhoaHoc)
                    .FirstOrDefaultAsync(f => f.FileId == fileId);

                if (baiTapFile == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy file!" });
                }

                // Kiểm tra quyền truy cập
                if (baiTapFile.BaiTap.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền xóa file này!" });
                }

                // Xóa file vật lý trên server
                var filePath = Path.Combine(_env.WebRootPath, baiTapFile.DuongDan.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    try
                    {
                        System.IO.File.Delete(filePath);
                    }
                    catch (Exception)
                    {
                        // Log lỗi nhưng vẫn tiếp tục xóa database
                        // _logger.LogWarning(ex, "Không thể xóa file vật lý {FilePath}", filePath);
                    }
                }

                // Xóa bản ghi trong database
                _context.BaiTapFiles.Remove(baiTapFile);
                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Xóa file thành công!"
                });
            }
            catch (Exception ex)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi xóa file bài tập");
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action cập nhật bài tập
        [HttpPost]
        public async Task<IActionResult> CapNhatBaiTap([FromForm] CapNhatBaiTapViewModel model, List<IFormFile>? files)
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
                    .FirstOrDefaultAsync(bt => bt.BaiTapId == model.BaiTapId);

                if (baiTap == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Kiểm tra quyền truy cập
                if (baiTap.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền cập nhật bài tập này!" });
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

                // Cập nhật thông tin bài tập
                baiTap.TieuDe = model.TieuDe.Trim();
                baiTap.MoTa = model.MoTa?.Trim();
                baiTap.ThoiGianBatDau = model.ThoiGianBatDau;
                baiTap.ThoiGianKetThuc = model.ThoiGianKetThuc;

                // Xử lý upload files mới nếu có
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
                }

                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Cập nhật bài tập thành công!",
                    data = new
                    {
                        baiTapId = baiTap.BaiTapId,
                        tieuDe = baiTap.TieuDe
                    }
                });
            }
            catch (Exception ex)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi cập nhật bài tập");
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action xem danh sách nộp bài
        [HttpGet]
        public async Task<IActionResult> GetDanhSachNopBai(int baiTapId)
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
                if (baiTapId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Lấy thông tin bài tập và kiểm tra quyền
                var baiTap = await _context.BaiTaps
                    .AsNoTracking()
                    .Include(bt => bt.KhoaHoc)
                    .FirstOrDefaultAsync(bt => bt.BaiTapId == baiTapId);

                if (baiTap == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Kiểm tra quyền truy cập
                if (baiTap.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền xem danh sách nộp bài này!" });
                }

                // Lấy danh sách nộp bài
                var danhSachNopBai = await _context.BaiTapNops
                    .AsNoTracking()
                    .Where(bn => bn.BaiTapId == baiTapId)
                    .Include(bn => bn.SinhVien)
                    .Include(bn => bn.BaiTapNopFiles)
                    .OrderByDescending(bn => bn.NgayNop)
                    .ThenBy(bn => bn.SinhVien.FullName)
                    .Select(bn => new
                    {
                        baiNopId = bn.BaiNopId,
                        sinhVienId = bn.SinhVienId,
                        tenSinhVien = bn.SinhVien.FullName ?? "",
                        maSinhVien = bn.SinhVien.MaSo ?? "",
                        email = bn.SinhVien.Email ?? "",
                        avatar = bn.SinhVien.Avatar ?? "~/assets/image/default.jpg",
                        trangThai = bn.TrangThai ?? "ChuaNop",
                        ngayNop = bn.NgayNop,
                        diem = bn.Diem,
                        nhanXet = bn.NhanXet,
                        ngayCham = bn.NgayCham,
                        danhSachFile = bn.BaiTapNopFiles.Select(f => new
                        {
                            fileId = f.FileId,
                            tenFile = f.TenFile,
                            duongDan = f.DuongDan,
                            kichThuoc = f.KichThuoc,
                            loaiFile = f.LoaiFile
                        }).ToList()
                    })
                    .ToListAsync();

                // Đếm số lượng đã nộp và chưa nộp
                var daNop = danhSachNopBai.Count(bn => bn.trangThai == "DaNop");
                var chuaNop = danhSachNopBai.Count(bn => bn.trangThai == "ChuaNop");

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        baiTap = new
                        {
                            baiTapId = baiTap.BaiTapId,
                            tieuDe = baiTap.TieuDe,
                            thoiGianKetThuc = baiTap.ThoiGianKetThuc,
                            diemToiDa = baiTap.DiemToiDa ?? 10
                        },
                        thongKe = new
                        {
                            daNop,
                            chuaNop,
                            tongSo = danhSachNopBai.Count
                        },
                        danhSachNopBai
                    }
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action chấm điểm bài nộp
        [HttpPost]
        public async Task<IActionResult> ChamDiem([FromBody] ChamDiemViewModel model)
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
                if (model.BaiNopId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài nộp!" });
                }

                // Validate điểm
                if (model.Diem < 0)
                {
                    return Json(new { success = false, message = "Điểm không được âm!" });
                }

                // Lấy thông tin bài nộp và kiểm tra quyền
                var baiNop = await _context.BaiTapNops
                    .Include(bn => bn.BaiTap)
                        .ThenInclude(bt => bt.KhoaHoc)
                    .FirstOrDefaultAsync(bn => bn.BaiNopId == model.BaiNopId);

                if (baiNop == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài nộp!" });
                }

                // Kiểm tra quyền truy cập
                if (baiNop.BaiTap.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền chấm điểm bài nộp này!" });
                }

                // Kiểm tra điểm tối đa
                var diemToiDa = baiNop.BaiTap.DiemToiDa ?? 10;
                if (model.Diem > diemToiDa)
                {
                    return Json(new { success = false, message = $"Điểm không được vượt quá {diemToiDa}!" });
                }

                // Cập nhật điểm
                baiNop.Diem = model.Diem;
                baiNop.NgayCham = DateTime.Now;

                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Chấm điểm thành công!",
                    data = new
                    {
                        baiNopId = baiNop.BaiNopId,
                        diem = baiNop.Diem,
                        ngayCham = baiNop.NgayCham
                    }
                });
            }
            catch (Exception ex)
            {
                // Có thể thêm log: _logger.LogError(ex, "Lỗi chấm điểm");
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Action xuất CSV danh sách nộp bài
        [HttpGet]
        public async Task<IActionResult> XuatCSVDanhSachNopBai(int baiTapId)
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
                if (baiTapId <= 0)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Lấy thông tin bài tập và kiểm tra quyền
                var baiTap = await _context.BaiTaps
                    .AsNoTracking()
                    .Include(bt => bt.KhoaHoc)
                    .FirstOrDefaultAsync(bt => bt.BaiTapId == baiTapId);

                if (baiTap == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài tập!" });
                }

                // Kiểm tra quyền truy cập
                if (baiTap.KhoaHoc.GiaoVienId != userId)
                {
                    return Json(new { success = false, message = "Bạn không có quyền xuất dữ liệu này!" });
                }

                // Lấy danh sách nộp bài
                var danhSachNopBai = await _context.BaiTapNops
                    .AsNoTracking()
                    .Where(bn => bn.BaiTapId == baiTapId)
                    .Include(bn => bn.SinhVien)
                    .OrderBy(bn => bn.SinhVien.FullName)
                    .Select(bn => new
                    {
                        MaSinhVien = bn.SinhVien.MaSo ?? "",
                        TenSinhVien = bn.SinhVien.FullName ?? "",
                        Email = bn.SinhVien.Email ?? "",
                        TrangThai = bn.TrangThai ?? "ChuaNop",
                        NgayNop = bn.NgayNop,
                        Diem = bn.Diem,
                        ThoiGianKetThuc = baiTap.ThoiGianKetThuc
                    })
                    .ToListAsync();

                // Tạo CSV content
                var csv = new System.Text.StringBuilder();

                // BOM để hỗ trợ tiếng Việt trong Excel
                csv.Append("\uFEFF");

                // Header
                csv.AppendLine("STT,MSSV,Họ và tên,Email,Trạng thái,Thời gian nộp,Trạng thái nộp,Điểm");

                // Data rows
                int stt = 1;
                foreach (var item in danhSachNopBai)
                {
                    var trangThai = item.TrangThai == "DaNop" ? "Đã nộp" : "Chưa nộp";
                    var ngayNop = item.NgayNop.HasValue ? item.NgayNop.Value.ToString("dd/MM/yyyy HH:mm") : "--";

                    // Tính trạng thái nộp (sớm/đúng hạn/trễ)
                    string trangThaiNop = "--";
                    if (item.NgayNop.HasValue && item.ThoiGianKetThuc.HasValue)
                    {
                        var timeSpan = item.NgayNop.Value - item.ThoiGianKetThuc.Value;
                        if (timeSpan.TotalMinutes < -1)
                        {
                            var absDays = Math.Abs(timeSpan.Days);
                            var absHours = Math.Abs(timeSpan.Hours);
                            var absMinutes = Math.Abs(timeSpan.Minutes);

                            if (absDays > 0)
                                trangThaiNop = $"Nộp sớm {absDays} ngày";
                            else if (absHours > 0)
                                trangThaiNop = $"Nộp sớm {absHours} giờ";
                            else
                                trangThaiNop = $"Nộp sớm {absMinutes} phút";
                        }
                        else if (Math.Abs(timeSpan.TotalMinutes) < 1)
                        {
                            trangThaiNop = "Đúng hạn";
                        }
                        else
                        {
                            var days = timeSpan.Days;
                            var hours = timeSpan.Hours;
                            var minutes = timeSpan.Minutes;

                            if (days > 0)
                                trangThaiNop = $"Nộp trễ {days} ngày";
                            else if (hours > 0)
                                trangThaiNop = $"Nộp trễ {hours} giờ";
                            else
                                trangThaiNop = $"Nộp trễ {minutes} phút";
                        }
                    }

                    var diem = item.Diem.HasValue ? item.Diem.Value.ToString() : "--";

                    // Escape CSV values (xử lý dấu phẩy và dấu ngoặc kép)
                    csv.AppendLine($"{stt}," +
                                  $"\"{EscapeCsv(item.MaSinhVien)}\"," +
                                  $"\"{EscapeCsv(item.TenSinhVien)}\"," +
                                  $"\"{EscapeCsv(item.Email)}\"," +
                                  $"\"{trangThai}\"," +
                                  $"\"{ngayNop}\"," +
                                  $"\"{trangThaiNop}\"," +
                                  $"\"{diem}\"");
                    stt++;
                }

                // Tạo file name
                var safeFileName = $"DanhSachNopBai_{baiTap.TieuDe}_{DateTime.Now:yyyyMMdd_HHmmss}.csv"
                    .Replace(" ", "_")
                    .Replace("/", "_")
                    .Replace("\\", "_");

                // Return file
                var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
                return File(bytes, "text/csv", safeFileName);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Helper method để escape giá trị CSV
        private string EscapeCsv(string? value)
        {
            if (string.IsNullOrEmpty(value))
                return "";

            // Escape dấu ngoặc kép bằng cách thêm một dấu ngoặc kép nữa
            return value.Replace("\"", "\"\"");
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

    // ViewModel cho form cập nhật bài tập
    public class CapNhatBaiTapViewModel
    {
        public int BaiTapId { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public bool ChoPhepNopTre { get; set; }
        public decimal? DiemToiDa { get; set; } = 10;
    }

    // ViewModel cho chấm điểm
    public class ChamDiemViewModel
    {
        public int BaiNopId { get; set; }
        public decimal Diem { get; set; }
    }
}

