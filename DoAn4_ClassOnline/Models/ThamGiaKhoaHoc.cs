using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("ThamGiaKhoaHoc")]
[Index("KhoaHocId", Name = "IX_ThamGiaKhoaHoc_KhoaHocId")]
[Index("SinhVienId", Name = "IX_ThamGiaKhoaHoc_SinhVienId")]
public partial class ThamGiaKhoaHoc
{
    [Key]
    public int ThamGiaId { get; set; }

    public int KhoaHocId { get; set; }

    public int SinhVienId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayThamGia { get; set; }

    [StringLength(50)]
    public string? TrangThai { get; set; }

    [ForeignKey("KhoaHocId")]
    [InverseProperty("ThamGiaKhoaHocs")]
    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    [ForeignKey("SinhVienId")]
    [InverseProperty("ThamGiaKhoaHocs")]
    public virtual User SinhVien { get; set; } = null!;
}
