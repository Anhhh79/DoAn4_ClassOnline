using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("ChuDe")]
public partial class ChuDe
{
    [Key]
    public int ChuDeId { get; set; }

    public int KhoaHocId { get; set; }

    [StringLength(200)]
    public string TenChuDe { get; set; } = null!;

    public string? MoTa { get; set; }

    public int? ThuTu { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    [ForeignKey("KhoaHocId")]
    [InverseProperty("ChuDes")]
    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    [InverseProperty("ChuDe")]
    public virtual ICollection<TaiLieu> TaiLieus { get; set; } = new List<TaiLieu>();
}
