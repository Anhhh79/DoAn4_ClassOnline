using DoAn4_ClassOnline.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Areas.Student.Controllers
{
	[Area("Student")]
	public class DocumentController : Controller
	{
		public IActionResult Index()
		{
			return PartialView(); // Trả về partial view (chỉ phần nội dung, không layout)
		}
	}
}
