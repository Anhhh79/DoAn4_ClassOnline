using DoAn4_ClassOnline.Services;
using Microsoft.AspNetCore.Mvc;

namespace DoAn4_ClassOnline.Areas.Teacher.Controllers
{
    [Area("Teacher")]
    public class WordImportController : Controller
    {
        private readonly WordParserService _wordParser;
        private readonly ILogger<WordImportController> _logger;

        public WordImportController(ILogger<WordImportController> logger)
        {
            _wordParser = new WordParserService();
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> ParseWordFile(IFormFile file)
        {
            try
            {
                // Validation
                if (file == null || file.Length == 0)
                {
                    return Json(new { 
                        success = false, 
                        message = "Vui lòng chọn file!" 
                    });
                }

                // Kiểm tra định dạng file
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".doc" && extension != ".docx")
                {
                    return Json(new { 
                        success = false, 
                        message = "Chỉ hỗ trợ file Word (.doc, .docx)!" 
                    });
                }

                // Kiểm tra kích thước file (max 10MB)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return Json(new { 
                        success = false, 
                        message = "File quá lớn! Tối đa 10MB." 
                    });
                }

                _logger.LogInformation($"📄 Parsing Word file: {file.FileName} ({file.Length} bytes)");

                // Đọc file Word
                using (var stream = file.OpenReadStream())
                {
                    var questions = _wordParser.ParseWordDocument(stream);

                    if (questions.Count == 0)
                    {
                        return Json(new { 
                            success = false, 
                            message = "Không tìm thấy câu hỏi nào trong file!\n\nĐịnh dạng đúng:\nCâu 1: Nội dung?\nA. Đáp án A\nB. Đáp án B\nC. Đáp án C\nD. Đáp án D\nĐáp án: A" 
                        });
                    }

                    _logger.LogInformation($"✅ Found {questions.Count} questions");

                    // Chuẩn bị dữ liệu trả về
                    var result = questions.Select((q, index) => new
                    {
                        index = index + 1,
                        text = q.NoiDung,
                        options = q.DapAn,
                        answer = q.DapAnDung,
                        point = Math.Round(10.0m / questions.Count, 2)
                    }).ToList();

                    return Json(new { 
                        success = true, 
                        message = $"Đã đọc thành công {questions.Count} câu hỏi từ file {file.FileName}!", 
                        questions = result 
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error parsing Word file");
                return Json(new { 
                    success = false, 
                    message = $"Lỗi khi xử lý file: {ex.Message}" 
                });
            }
        }
    }
}