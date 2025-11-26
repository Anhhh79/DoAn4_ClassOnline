using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("BaiLamTracNghiem")]
[Index("SinhVienId", Name = "IX_BaiLamTracNghiem_SinhVienId")]
public partial class BaiLamTracNghiem
{
    [Key]
    public int BaiLamId { get; set; }

    public int BaiTracNghiemId { get; set; }

    public int SinhVienId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayBatDau { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayNop { get; set; }

    public int? ThoiGianConLai { get; set; }

    [StringLength(50)]
    public string? TrangThai { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Diem { get; set; }

    public int? SoLanLam { get; set; }

    [ForeignKey("BaiTracNghiemId")]
    [InverseProperty("BaiLamTracNghiems")]
    public virtual BaiTracNghiem BaiTracNghiem { get; set; } = null!;

    [ForeignKey("SinhVienId")]
    [InverseProperty("BaiLamTracNghiems")]
    public virtual User SinhVien { get; set; } = null!;

    [InverseProperty("BaiLam")]
    public virtual ICollection<TraLoiSinhVien> TraLoiSinhViens { get; set; } = new List<TraLoiSinhVien>();
}
