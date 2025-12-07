using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class QuanLyHocKyController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
