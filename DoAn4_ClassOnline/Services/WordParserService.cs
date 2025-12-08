using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.Text.RegularExpressions;

namespace DoAn4_ClassOnline.Services
{
    public class WordParserService
    {
        public class QuestionData
        {
            public string NoiDung { get; set; } = "";
            public List<string> DapAn { get; set; } = new();
            public string DapAnDung { get; set; } = "";
        }

        public List<QuestionData> ParseWordDocument(Stream fileStream)
        {
            var questions = new List<QuestionData>();

            try
            {
                using (WordprocessingDocument doc = WordprocessingDocument.Open(fileStream, false))
                {
                    var body = doc.MainDocumentPart?.Document.Body;
                    if (body == null) return questions;

                    var text = GetFullText(body);
                    questions = ParseQuestionsFromText(text);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi đọc file Word: {ex.Message}");
            }

            return questions;
        }

        private string GetFullText(Body body)
        {
            return string.Join("\n", body.Descendants<Paragraph>()
                .Select(p => p.InnerText));
        }

        private List<QuestionData> ParseQuestionsFromText(string text)
        {
            var questions = new List<QuestionData>();
            
            // Pattern để tìm câu hỏi: "Câu 1:", "Câu 2:", ...
            var questionPattern = @"Câu\s+(\d+)[:\.\)]\s*(.+?)(?=Câu\s+\d+|$)";
            var questionMatches = Regex.Matches(text, questionPattern, 
                RegexOptions.Singleline | RegexOptions.IgnoreCase);

            foreach (Match qMatch in questionMatches)
            {
                var questionText = qMatch.Groups[2].Value.Trim();
                var question = new QuestionData();

                // Tách nội dung câu hỏi và đáp án
                var lines = questionText.Split(new[] { '\n', '\r' }, 
                    StringSplitOptions.RemoveEmptyEntries);
                
                if (lines.Length == 0) continue;
                
                question.NoiDung = lines[0].Trim();

                // Pattern để tìm đáp án: A. B. C. D. hoặc A) B) C) D)
                var answerPattern = @"^([A-D])[\.\)]\s*(.+)$";
                
                foreach (var line in lines.Skip(1))
                {
                    var trimmedLine = line.Trim();
                    var answerMatch = Regex.Match(trimmedLine, answerPattern);
                    
                    if (answerMatch.Success)
                    {
                        var optionText = answerMatch.Groups[2].Value.Trim();
                        question.DapAn.Add(optionText);
                    }
                }

                // Tìm đáp án đúng (tìm dòng có "Đáp án:" hoặc "*")
                var correctAnswerPattern = @"(?:Đáp\s*án|Đ[áa]p\s*[áa]n)[:\s]*([A-D])|\*\s*([A-D])";
                var correctMatch = Regex.Match(questionText, correctAnswerPattern, 
                    RegexOptions.IgnoreCase);
                
                if (correctMatch.Success)
                {
                    question.DapAnDung = correctMatch.Groups[1].Value != "" 
                        ? correctMatch.Groups[1].Value 
                        : correctMatch.Groups[2].Value;
                }

                // Đảm bảo có đủ 4 đáp án
                while (question.DapAn.Count < 4)
                {
                    question.DapAn.Add("");
                }

                // Chỉ thêm câu hỏi nếu có đủ thông tin
                if (!string.IsNullOrEmpty(question.NoiDung) && 
                    question.DapAn.Count >= 2 && 
                    !string.IsNullOrEmpty(question.DapAnDung))
                {
                    questions.Add(question);
                }
            }

            return questions;
        }
    }
}