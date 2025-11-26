using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("BaiTapNop")]
[Index("SinhVienId", Name = "IX_BaiTapNop_SinhVienId")]
public partial class BaiTapNop
{
    [Key]
    public int BaiNopId { get; set; }

    public int BaiTapId { get; set; }

    public int SinhVienId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayNop { get; set; }

    [StringLength(50)]
    public string? TrangThai { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Diem { get; set; }

    public string? NhanXet { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayCham { get; set; }

    [ForeignKey("BaiTapId")]
    [InverseProperty("BaiTapNops")]
    public virtual BaiTap BaiTap { get; set; } = null!;

    [InverseProperty("BaiNop")]
    public virtual ICollection<BaiTapNopFile> BaiTapNopFiles { get; set; } = new List<BaiTapNopFile>();

    [ForeignKey("SinhVienId")]
    [InverseProperty("BaiTapNops")]
    public virtual User SinhVien { get; set; } = null!;
}
