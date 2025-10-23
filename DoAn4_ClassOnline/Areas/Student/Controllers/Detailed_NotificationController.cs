using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
	[Area("Student")]
	public class Detailed_NotificationController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
