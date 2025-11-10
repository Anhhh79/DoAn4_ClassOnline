using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class QuanLyKhoaHocController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
