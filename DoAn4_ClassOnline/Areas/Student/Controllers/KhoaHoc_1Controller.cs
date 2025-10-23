using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
	[Area("Student")]
	public class KhoaHoc_1Controller : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
