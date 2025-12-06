using System.ComponentModel.DataAnnotations;

namespace DoAn4_ClassOnline.Areas.Teacher.Models
{
    public class ThongTinKhoaHoc
    {
        [Key]
        public int KhoaHocId { get; set; }

        [Required(ErrorMessage = "Tên khóa học không được bỏ trống!")]
        public string TenKhoaHoc { get; set; } = null!;

        public string? MoTa { get; set; } = "không có";

        // File upload
        public IFormFile? AnhKhoaHoc { get; set; }

        // File name lưu vào DB
        public string? HinhAnh { get; set; } = "/assets/image/default.jpg";

        [Required(ErrorMessage = "Vui lòng chọn Khóa!")]
        public int KhoaId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn học kỳ!")]
        public int HocKyId { get; set; }

        // Không Required vì tự gán trong Controller
        public int GiaoVienId { get; set; }

        public string? MatKhau { get; set; }
        public string? LinkHocOnline { get; set; }
        public string? TrangThaiKhoaHoc { get; set; } = "DangMo";

        public DateTime? CreatedAt { get; set; }
    }

}
