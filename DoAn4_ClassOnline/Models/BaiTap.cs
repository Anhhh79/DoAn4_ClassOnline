using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("BaiTap")]
public partial class BaiTap
{
    [Key]
    public int BaiTapId { get; set; }

    public int KhoaHocId { get; set; }

    [StringLength(200)]
    public string TieuDe { get; set; } = null!;

    public string? MoTa { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ThoiGianBatDau { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ThoiGianKetThuc { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    public bool? ChoPhepNopTre { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? DiemToiDa { get; set; }

    [InverseProperty("BaiTap")]
    public virtual ICollection<BaiTapFile> BaiTapFiles { get; set; } = new List<BaiTapFile>();

    [InverseProperty("BaiTap")]
    public virtual ICollection<BaiTapNop> BaiTapNops { get; set; } = new List<BaiTapNop>();

    [ForeignKey("KhoaHocId")]
    [InverseProperty("BaiTaps")]
    public virtual KhoaHoc KhoaHoc { get; set; } = null!;
}
