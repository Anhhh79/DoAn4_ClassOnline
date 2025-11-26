using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("TaiLieu")]
[Index("KhoaHocId", Name = "IX_TaiLieu_KhoaHocId")]
public partial class TaiLieu
{
    [Key]
    public int TaiLieuId { get; set; }

    public int? ChuDeId { get; set; }

    public int KhoaHocId { get; set; }

    [StringLength(200)]
    public string TenTaiLieu { get; set; } = null!;

    public string? MoTa { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    public int? ThuTu { get; set; }

    [ForeignKey("ChuDeId")]
    [InverseProperty("TaiLieus")]
    public virtual ChuDe? ChuDe { get; set; }

    [ForeignKey("KhoaHocId")]
    [InverseProperty("TaiLieus")]
    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    [InverseProperty("TaiLieu")]
    public virtual ICollection<TaiLieuFile> TaiLieuFiles { get; set; } = new List<TaiLieuFile>();
}
