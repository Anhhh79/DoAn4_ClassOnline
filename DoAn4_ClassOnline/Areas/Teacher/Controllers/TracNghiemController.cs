using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
	[Area("Teacher")]
	public class TracNghiemController : Controller
	{
		public IActionResult Index()
		{
			return PartialView("_IndexPartial");
		}
		public IActionResult TaoBaiTracNghiem()
		{
			return View();
		}
	}
}
