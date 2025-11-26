using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("BaiTracNghiem")]
public partial class BaiTracNghiem
{
    [Key]
    public int BaiTracNghiemId { get; set; }

    public int KhoaHocId { get; set; }

    [StringLength(200)]
    public string TenBaiThi { get; set; } = null!;

    public string? MoTa { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ThoiGianBatDau { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ThoiGianKetThuc { get; set; }

    public int? ThoiLuongLamBai { get; set; }

    [StringLength(50)]
    public string? LoaiBaiThi { get; set; }

    public bool? ChoXemKetQua { get; set; }

    public bool? TronCauHoi { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? DiemToiDa { get; set; }

    public int? SoLanLamToiDa { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    [InverseProperty("BaiTracNghiem")]
    public virtual ICollection<BaiLamTracNghiem> BaiLamTracNghiems { get; set; } = new List<BaiLamTracNghiem>();

    [InverseProperty("BaiTracNghiem")]
    public virtual ICollection<CauHoi> CauHois { get; set; } = new List<CauHoi>();

    [InverseProperty("BaiTracNghiem")]
    public virtual ICollection<GiaoBaiTracNghiem> GiaoBaiTracNghiems { get; set; } = new List<GiaoBaiTracNghiem>();

    [ForeignKey("KhoaHocId")]
    [InverseProperty("BaiTracNghiems")]
    public virtual KhoaHoc KhoaHoc { get; set; } = null!;
}
