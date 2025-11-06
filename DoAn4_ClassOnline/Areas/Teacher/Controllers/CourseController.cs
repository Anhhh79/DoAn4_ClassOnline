using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class CourseController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult ThongBao()
        {
            return PartialView("_ThongBaoPartial");
        }

        public IActionResult TaiLieu()
        {
            return PartialView("_TaiLieuPartial");
        }

        public IActionResult BaiTap()
        {
            return PartialView("_BaiTapPartial");
        }

        public IActionResult DanhSachNopBai()
        {
            return View("_DanhSachNopBaiPartial");
        }
    }
}
