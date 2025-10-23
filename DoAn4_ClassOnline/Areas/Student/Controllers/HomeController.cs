using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
    [Area("Student")]
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        // Trang chi tiết khoa
        public IActionResult ChiTietKhoa(string maKhoa)
        {
            // Nếu người dùng không truyền mã khoa, gán mặc định là CNTT
            if (string.IsNullOrEmpty(maKhoa))
                maKhoa = "CNTT";

            // Tạo danh sách khoa mẫu (có thể thay bằng truy vấn DB sau này)
            var khoaList = new List<dynamic>
    {
        new { MaKhoa = "CNTT", TenKhoa = "Khoa Công nghệ thông tin" },
        new { MaKhoa = "DDT", TenKhoa = "Khoa Điện - Điện tử" },
        new { MaKhoa = "CK", TenKhoa = "Khoa Kỹ thuật cơ khí" },
        new { MaKhoa = "XD", TenKhoa = "Khoa Kỹ thuật xây dựng" },
        new { MaKhoa = "KHXH", TenKhoa = "Khoa Khoa học xã hội" }
    };

            // Tìm tên khoa dựa vào mã khoa
            var khoa = khoaList.FirstOrDefault(k => k.MaKhoa == maKhoa);
            var tenKhoa = khoa != null ? khoa.TenKhoa : "Không xác định";

            

            ViewBag.MaKhoa = maKhoa;
            ViewBag.TenKhoa = tenKhoa;

            return View();
        }


    }
}
