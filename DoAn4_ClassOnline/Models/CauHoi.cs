using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("CauHoi")]
public partial class CauHoi
{
    [Key]
    public int CauHoiId { get; set; }

    public int BaiTracNghiemId { get; set; }

    public string NoiDungCauHoi { get; set; } = null!;

    [StringLength(50)]
    public string? LoaiCauHoi { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Diem { get; set; }

    public int? ThuTu { get; set; }

    [StringLength(500)]
    public string? HinhAnh { get; set; }

    [ForeignKey("BaiTracNghiemId")]
    [InverseProperty("CauHois")]
    public virtual BaiTracNghiem BaiTracNghiem { get; set; } = null!;

    [InverseProperty("CauHoi")]
    public virtual ICollection<DapAn> DapAns { get; set; } = new List<DapAn>();

    [InverseProperty("CauHoi")]
    public virtual ICollection<TraLoiSinhVien> TraLoiSinhViens { get; set; } = new List<TraLoiSinhVien>();
}
