using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("LichSuTruyCap")]
public partial class LichSuTruyCap
{
    [Key]
    public int TruyCapId { get; set; }

    public int UserId { get; set; }

    public int? KhoaHocId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ThoiGianTruyCap { get; set; }

    [StringLength(100)]
    public string? HanhDong { get; set; }

    [ForeignKey("KhoaHocId")]
    [InverseProperty("LichSuTruyCaps")]
    public virtual KhoaHoc? KhoaHoc { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("LichSuTruyCaps")]
    public virtual User User { get; set; } = null!;
}
