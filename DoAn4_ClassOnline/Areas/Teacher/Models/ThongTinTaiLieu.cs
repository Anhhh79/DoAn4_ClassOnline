namespace DoAn4_ClassOnline.Areas.Teacher.Models
{
    public class ThongTinTaiLieu
    {
        public int KhoaHocId { get; set; }
        public string TenTaiLieu { get; set; }
        public string MoTa { get; set; }
        public int ThuTu { get; set; }

        public List<IFormFile> Files { get; set; }
    }
}
