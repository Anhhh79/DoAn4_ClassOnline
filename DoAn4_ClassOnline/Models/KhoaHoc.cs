using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("KhoaHoc")]
[Index("GiaoVienId", Name = "IX_KhoaHoc_GiaoVienId")]
[Index("HocKyId", Name = "IX_KhoaHoc_HocKyId")]
[Index("KhoaId", Name = "IX_KhoaHoc_KhoaId")]
public partial class KhoaHoc
{
    [Key]
    public int KhoaHocId { get; set; }

    [StringLength(200)]
    public string TenKhoaHoc { get; set; } = null!;

    public string? MoTa { get; set; }

    [StringLength(255)]
    public string? HinhAnh { get; set; }

    public int KhoaId { get; set; }

    public int HocKyId { get; set; }

    public int GiaoVienId { get; set; }

    [StringLength(100)]
    public string? MatKhau { get; set; }

    [StringLength(500)]
    public string? LinkHocOnline { get; set; }

    public int? SoLuongSinhVien { get; set; }

    [StringLength(50)]
    public string? TrangThaiKhoaHoc { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    public bool? IsPublic { get; set; }

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<BaiTap> BaiTaps { get; set; } = new List<BaiTap>();

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<BaiTracNghiem> BaiTracNghiems { get; set; } = new List<BaiTracNghiem>();

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<ChuDe> ChuDes { get; set; } = new List<ChuDe>();

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<GiaoBaiTracNghiem> GiaoBaiTracNghiems { get; set; } = new List<GiaoBaiTracNghiem>();

    [ForeignKey("GiaoVienId")]
    [InverseProperty("KhoaHocs")]
    public virtual User GiaoVien { get; set; } = null!;

    [ForeignKey("HocKyId")]
    [InverseProperty("KhoaHocs")]
    public virtual HocKy HocKy { get; set; } = null!;

    [ForeignKey("KhoaId")]
    [InverseProperty("KhoaHocs")]
    public virtual Khoa Khoa { get; set; } = null!;

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<LichSuTruyCap> LichSuTruyCaps { get; set; } = new List<LichSuTruyCap>();

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<TaiLieu> TaiLieus { get; set; } = new List<TaiLieu>();

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<ThamGiaKhoaHoc> ThamGiaKhoaHocs { get; set; } = new List<ThamGiaKhoaHoc>();

    [InverseProperty("KhoaHoc")]
    public virtual ICollection<ThongBao> ThongBaos { get; set; } = new List<ThongBao>();
}
