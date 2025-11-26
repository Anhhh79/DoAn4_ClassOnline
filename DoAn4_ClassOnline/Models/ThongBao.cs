using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("ThongBao")]
[Index("KhoaHocId", Name = "IX_ThongBao_KhoaHocId")]
public partial class ThongBao
{
    [Key]
    public int ThongBaoId { get; set; }

    public int KhoaHocId { get; set; }

    [StringLength(200)]
    public string TieuDe { get; set; } = null!;

    public string NoiDung { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayCapNhat { get; set; }

    [ForeignKey("KhoaHocId")]
    [InverseProperty("ThongBaos")]
    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    [InverseProperty("ThongBao")]
    public virtual ICollection<ThongBaoFile> ThongBaoFiles { get; set; } = new List<ThongBaoFile>();
}
