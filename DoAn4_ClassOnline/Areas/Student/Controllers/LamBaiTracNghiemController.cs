using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
    [Area("Student")]
    public class LamBaiTracNghiemController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LamBaiTracNghiemController> _logger;

        public LamBaiTracNghiemController(ApplicationDbContext context, ILogger<LamBaiTracNghiemController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ⭐ TRANG LÀM BÀI TRẮC NGHIỆM ⭐
        public async Task<IActionResult> Index(int? baiTracNghiemId)
        {
            _logger.LogInformation($"🔍 LamBaiTracNghiem/Index - baiTracNghiemId: {baiTracNghiemId}");

            // Kiểm tra đăng nhập
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                TempData["Error"] = "Vui lòng đăng nhập!";
                return RedirectToAction("Index", "DangNhap", new { area = "Admin" });
            }

            // Kiểm tra baiTracNghiemId
            if (baiTracNghiemId == null || baiTracNghiemId <= 0)
            {
                TempData["Error"] = "ID bài trắc nghiệm không hợp lệ!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ LẤY THÔNG TIN BÀI TRẮC NGHIỆM ⭐
            var baiTracNghiem = await _context.BaiTracNghiems
                .Include(bt => bt.KhoaHoc)
                .Include(bt => bt.CauHois)
                .FirstOrDefaultAsync(bt => bt.BaiTracNghiemId == baiTracNghiemId);

            if (baiTracNghiem == null)
            {
                TempData["Error"] = "Không tìm thấy bài trắc nghiệm!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ KIỂM TRA XEM ĐÃ ĐƯỢC GIAO CHƯA ⭐
            var duocGiao = await _context.GiaoBaiTracNghiems
                .AnyAsync(gb => gb.BaiTracNghiemId == baiTracNghiemId && gb.SinhVienId == userId);

            if (!duocGiao)
            {
                TempData["Error"] = "Bài trắc nghiệm chưa được giao cho bạn!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ KIỂM TRA THỜI GIAN THI ⭐
            var now = DateTime.Now;
            if (baiTracNghiem.ThoiGianBatDau.HasValue && now < baiTracNghiem.ThoiGianBatDau.Value)
            {
                TempData["Error"] = "Chưa đến giờ làm bài!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            if (baiTracNghiem.ThoiGianKetThuc.HasValue && now > baiTracNghiem.ThoiGianKetThuc.Value)
            {
                TempData["Error"] = "Đã hết thời gian làm bài!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ KIỂM TRA SỐ LẦN LÀM ⭐
            var soLanDaLam = await _context.BaiLamTracNghiems
                .Where(bl => bl.BaiTracNghiemId == baiTracNghiemId && bl.SinhVienId == userId)
                .CountAsync();

            if (soLanDaLam >= (baiTracNghiem.SoLanLamToiDa ?? int.MaxValue))
            {
                TempData["Error"] = "Bạn đã hết lượt làm bài!";
                return RedirectToAction("Index", "KhoaHoc");
            }

            // ⭐ LẤY THÔNG TIN SINH VIÊN ⭐
            var sinhVien = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new { u.FullName, u.MaSo })
                .FirstOrDefaultAsync();

            // ⭐ TRUYỀN DỮ LIỆU SANG VIEW ⭐
            ViewBag.BaiTracNghiemId = baiTracNghiem.BaiTracNghiemId;
            ViewBag.TenBaiThi = baiTracNghiem.TenBaiThi;
            ViewBag.ThoiLuongLamBai = baiTracNghiem.ThoiLuongLamBai ?? 60;
            ViewBag.TenSinhVien = sinhVien?.FullName ?? "Sinh viên";
            ViewBag.MaSinhVien = sinhVien?.MaSo ?? "";
            ViewBag.SoCauHoi = baiTracNghiem.CauHois.Count;
            ViewBag.TronCauHoi = baiTracNghiem.TronCauHoi ?? false;
            ViewBag.ChoXemKetQua = baiTracNghiem.ChoXemKetQua ?? false; // ⭐ THÊM ⭐

            _logger.LogInformation($"✅ Loaded bài trắc nghiệm: {baiTracNghiem.TenBaiThi}");

            return View();
        }

        // ⭐ API LẤY CÂU HỎI CỦA BÀI TRẮC NGHIỆM - ĐÃ SỬA ⭐
        [HttpGet]
        public async Task<IActionResult> GetCauHoi(int baiTracNghiemId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            try
            {
                // ⭐ LẤY CÂU HỎI VÀ ĐÁP ÁN TỪ BẢNG DapAn ⭐
                var cauHois = await _context.CauHois
                    .Where(ch => ch.BaiTracNghiemId == baiTracNghiemId)
                    .Include(ch => ch.DapAns) // ⭐ THÊM INCLUDE ⭐
                    .OrderBy(ch => ch.ThuTu)
                    .Select(ch => new
                    {
                        ch.CauHoiId,
                        NoiDungCauHoi = ch.NoiDungCauHoi,
                        ch.HinhAnh,
                        ch.Diem,
                        ch.ThuTu,
                        // ⭐ LẤY ĐÁP ÁN TỪ COLLECTION DapAns ⭐
                        DapAnA = ch.DapAns.OrderBy(da => da.ThuTu).Skip(0).Take(1).Select(da => da.NoiDungDapAn).FirstOrDefault(),
                        DapAnB = ch.DapAns.OrderBy(da => da.ThuTu).Skip(1).Take(1).Select(da => da.NoiDungDapAn).FirstOrDefault(),
                        DapAnC = ch.DapAns.OrderBy(da => da.ThuTu).Skip(2).Take(1).Select(da => da.NoiDungDapAn).FirstOrDefault(),
                        DapAnD = ch.DapAns.OrderBy(da => da.ThuTu).Skip(3).Take(1).Select(da => da.NoiDungDapAn).FirstOrDefault()
                    })
                    .ToListAsync();

                return Json(new { success = true, cauHois });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error: {ex.Message}");
                return Json(new { success = false, message = "Có lỗi xảy ra!" });
            }
        }

        // ⭐ API NỘP BÀI - CẬP NHẬT ĐỂ TRẢ VỀ ChoXemKetQua ⭐
        //[HttpPost]
        //public async Task<IActionResult> NopBai([FromBody] NopBaiRequest? request)
        //{
        //    // ⭐ XỬ LÝ sendBeacon (Content-Type: text/plain hoặc application/json) ⭐
        //    if (request == null)
        //    {
        //        try
        //        {
        //            using var reader = new StreamReader(Request.Body);
        //            var body = await reader.ReadToEndAsync();
        //            request = JsonSerializer.Deserialize<NopBaiRequest>(body);
        //        }
        //        catch
        //        {
        //            return Json(new { success = false, message = "Dữ liệu không hợp lệ!" });
        //        }
        //    }

        //    var userId = HttpContext.Session.GetInt32("UserId");
        //    if (userId == null)
        //    {
        //        return Json(new { success = false, message = "Vui lòng đăng nhập!" });
        //    }

        //    try
        //    {
        //        // Lấy thông tin bài trắc nghiệm
        //        var baiTracNghiem = await _context.BaiTracNghiems
        //            .Include(bt => bt.CauHois)
        //                .ThenInclude(ch => ch.DapAns) // ⭐ THÊM ĐỂ LẤY ĐÁP ÁN ĐÚNG ⭐
        //            .FirstOrDefaultAsync(bt => bt.BaiTracNghiemId == request.BaiTracNghiemId);

        //        if (baiTracNghiem == null)
        //        {
        //            return Json(new { success = false, message = "Không tìm thấy bài trắc nghiệm!" });
        //        }

        //        // ⭐ TÍNH ĐIỂM - SỬA LẠI LOGIC ⭐
        //        decimal tongDiem = 0;
        //        foreach (var traLoi in request.DanhSachTraLoi)
        //        {
        //            var cauHoi = baiTracNghiem.CauHois
        //                .FirstOrDefault(ch => ch.CauHoiId == traLoi.CauHoiId);

        //            if (cauHoi != null && cauHoi.DapAns != null)
        //            {
        //                // Tìm đáp án đúng
        //                var dapAnDung = cauHoi.DapAns.FirstOrDefault(da => da.LaDapAnDung == true);
                        
        //                if (dapAnDung != null)
        //                {
        //                    // So sánh đáp án sinh viên chọn với đáp án đúng
        //                    var viTriDapAnDung = cauHoi.DapAns.OrderBy(da => da.ThuTu).ToList().IndexOf(dapAnDung);
        //                    var dapAnDungChar = ((char)('A' + viTriDapAnDung)).ToString();
                            
        //                    if (dapAnDungChar == traLoi.DapAnChon)
        //                    {
        //                        tongDiem += cauHoi.Diem ?? 0;
        //                    }
        //                }
        //            }
        //        }

        //        // Lưu bài làm
        //        var baiLam = new BaiLamTracNghiem
        //        {
        //            BaiTracNghiemId = request.BaiTracNghiemId,
        //            SinhVienId = userId.Value,
        //            NgayBatDau = DateTime.Now.AddMinutes(-(baiTracNghiem.ThoiLuongLamBai ?? 0)),
        //            NgayNop = DateTime.Now,
        //            Diem = tongDiem,
        //            TrangThai = "DaNop"
        //        };

        //        _context.BaiLamTracNghiems.Add(baiLam);
        //        await _context.SaveChangesAsync(); // ⭐ LƯU ĐỂ CÓ BaiLamId ⭐

        //        // ⭐ LƯU CHI TIẾT TRẢ LỜI - SỬA LẠI ⭐
        //        foreach (var traLoi in request.DanhSachTraLoi)
        //        {
        //            // Tìm DapAnId dựa vào đáp án chọn (A, B, C, D)
        //            var cauHoi = baiTracNghiem.CauHois.FirstOrDefault(ch => ch.CauHoiId == traLoi.CauHoiId);
                    
        //            if (cauHoi != null && !string.IsNullOrEmpty(traLoi.DapAnChon))
        //            {
        //                var dapAnList = cauHoi.DapAns.OrderBy(da => da.ThuTu).ToList();
        //                var index = traLoi.DapAnChon[0] - 'A'; // A=0, B=1, C=2, D=3
                        
        //                if (index >= 0 && index < dapAnList.Count)
        //                {
        //                    var dapAnId = dapAnList[index].DapAnId;
                            
        //                    var chiTiet = new TraLoiSinhVien
        //                    {
        //                        BaiLamId = baiLam.BaiLamId,
        //                        CauHoiId = traLoi.CauHoiId,
        //                        DapAnId = dapAnId,
        //                        NgayTraLoi = DateTime.Now
        //                    };
        //                    _context.TraLoiSinhViens.Add(chiTiet);
        //                }
        //            }
        //        }

        //        await _context.SaveChangesAsync();

        //        // ⭐ TRẢ VỀ KẾT QUẢ VỚI ChoXemKetQua ⭐
        //        return Json(new
        //        {
        //            success = true,
        //            message = "Nộp bài thành công!",
        //            diem = tongDiem,
        //            diemToiDa = baiTracNghiem.DiemToiDa ?? 10,
        //            choXemKetQua = baiTracNghiem.ChoXemKetQua ?? false // ⭐ THÊM ⭐
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError($"❌ Error: {ex.Message}");
        //        return Json(new { success = false, message = "Có lỗi xảy ra khi nộp bài!" });
        //    }
        //}

        // ⭐ API NỘP BÀI - SỬA LẠI LOGIC TÍNH ĐIỂM ĐỂ TRÁNH 9.96 ⭐
        [HttpPost]
        public async Task<IActionResult> NopBai([FromBody] NopBaiRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Vui lòng đăng nhập!" });
            }

            try
            {
                var baiTracNghiem = await _context.BaiTracNghiems
                    .Include(bt => bt.CauHois)
                        .ThenInclude(ch => ch.DapAns)
                    .FirstOrDefaultAsync(bt => bt.BaiTracNghiemId == request.BaiTracNghiemId);

                if (baiTracNghiem == null)
                {
                    return Json(new { success = false, message = "Không tìm thấy bài trắc nghiệm!" });
                }

                // ⭐ TÍNH ĐIỂM - SỬA LẠI ĐỂ TRÁNH SAI SỐ ⭐
                decimal tongDiem = 0;
                int soCauDung = 0;
                int tongSoCau = baiTracNghiem.CauHois.Count;

                foreach (var traLoi in request.DanhSachTraLoi)
                {
                    var cauHoi = baiTracNghiem.CauHois
                        .FirstOrDefault(ch => ch.CauHoiId == traLoi.CauHoiId);

                    if (cauHoi != null && cauHoi.DapAns != null && cauHoi.DapAns.Any())
                    {
                        var dapAnDung = cauHoi.DapAns.FirstOrDefault(da => da.LaDapAnDung == true);
                        
                        if (dapAnDung != null)
                        {
                            var danhSachDapAn = cauHoi.DapAns.OrderBy(da => da.ThuTu).ToList();
                            var viTri = danhSachDapAn.IndexOf(dapAnDung);
                            var dapAnDungChar = ((char)('A' + viTri)).ToString();
                            
                            if (dapAnDungChar == traLoi.DapAnChon)
                            {
                                // ⭐ DÙNG ĐIỂM CỦA CÂU HỎI HOẶC TÍNH THEO TỶ LỆ ⭐
                                if (cauHoi.Diem.HasValue && cauHoi.Diem.Value > 0)
                                {
                                    tongDiem += cauHoi.Diem.Value;
                                }
                                soCauDung++;
                            }
                        }
                    }
                }

                // ⭐ NẾU KHÔNG CÓ ĐIỂM RIÊNG, TÍNH THEO TỶ LỆ VÀ LÀM TRÒN ⭐
                if (tongDiem == 0 && tongSoCau > 0)
                {
                    decimal diemToiDa = baiTracNghiem.DiemToiDa ?? 10;
                    tongDiem = Math.Round((decimal)soCauDung / tongSoCau * diemToiDa, 2, MidpointRounding.AwayFromZero);
                }
                else
                {
                    // ⭐ LÀM TRÒN ĐẾN 2 CHỮ SỐ THẬP PHÂN ⭐
                    tongDiem = Math.Round(tongDiem, 2, MidpointRounding.AwayFromZero);
                }

                // Lưu bài làm
                var baiLam = new BaiLamTracNghiem
                {
                    BaiTracNghiemId = request.BaiTracNghiemId,
                    SinhVienId = userId.Value,
                    NgayBatDau = DateTime.Now.AddMinutes(-(baiTracNghiem.ThoiLuongLamBai ?? 0)),
                    NgayNop = DateTime.Now,
                    Diem = tongDiem, // ⭐ ĐÃ LÀM TRÒN ⭐
                    TrangThai = "DaNop"
                };

                _context.BaiLamTracNghiems.Add(baiLam);
                await _context.SaveChangesAsync();

                // Lưu chi tiết trả lời
                foreach (var traLoi in request.DanhSachTraLoi)
                {
                    var cauHoi = baiTracNghiem.CauHois.FirstOrDefault(ch => ch.CauHoiId == traLoi.CauHoiId);
                    
                    if (cauHoi != null && !string.IsNullOrEmpty(traLoi.DapAnChon))
                    {
                        var dapAnList = cauHoi.DapAns.OrderBy(da => da.ThuTu).ToList();
                        var index = traLoi.DapAnChon[0] - 'A';
                        
                        if (index >= 0 && index < dapAnList.Count)
                        {
                            var dapAnId = dapAnList[index].DapAnId;
                            
                            var chiTiet = new TraLoiSinhVien
                            {
                                BaiLamId = baiLam.BaiLamId,
                                CauHoiId = traLoi.CauHoiId,
                                DapAnId = dapAnId,
                                NgayTraLoi = DateTime.Now
                            };
                            _context.TraLoiSinhViens.Add(chiTiet);
                        }
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Nộp bài thành công - Điểm: {tongDiem}/{baiTracNghiem.DiemToiDa}");

                return Json(new
                {
                    success = true,
                    message = "Nộp bài thành công!",
                    diem = tongDiem,
                    diemToiDa = baiTracNghiem.DiemToiDa ?? 10,
                    choXemKetQua = baiTracNghiem.ChoXemKetQua ?? false
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error: {ex.Message}");
                return Json(new { success = false, message = "Có lỗi xảy ra khi nộp bài!" });
            }
        }
    }

    // ⭐ MODEL CHO REQUEST NỘP BÀI ⭐
    public class NopBaiRequest
    {
        public int BaiTracNghiemId { get; set; }
        public List<TraLoiItem> DanhSachTraLoi { get; set; } = new();
    }

    public class TraLoiItem
    {
        public int CauHoiId { get; set; }
        public string DapAnChon { get; set; } = "";
    }
}
