using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("GiaoBaiTracNghiem")]
public partial class GiaoBaiTracNghiem
{
    [Key]
    public int GiaoBaiId { get; set; }

    public int BaiTracNghiemId { get; set; }

    public int? SinhVienId { get; set; }

    public int KhoaHocId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayGiao { get; set; }

    [ForeignKey("BaiTracNghiemId")]
    [InverseProperty("GiaoBaiTracNghiems")]
    public virtual BaiTracNghiem BaiTracNghiem { get; set; } = null!;

    [ForeignKey("KhoaHocId")]
    [InverseProperty("GiaoBaiTracNghiems")]
    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    [ForeignKey("SinhVienId")]
    [InverseProperty("GiaoBaiTracNghiems")]
    public virtual User? SinhVien { get; set; }
}
