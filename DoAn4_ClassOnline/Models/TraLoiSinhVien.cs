using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("TraLoiSinhVien")]
public partial class TraLoiSinhVien
{
    [Key]
    public int TraLoiId { get; set; }

    public int BaiLamId { get; set; }

    public int CauHoiId { get; set; }

    public int? DapAnId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTraLoi { get; set; }

    [ForeignKey("BaiLamId")]
    [InverseProperty("TraLoiSinhViens")]
    public virtual BaiLamTracNghiem BaiLam { get; set; } = null!;

    [ForeignKey("CauHoiId")]
    [InverseProperty("TraLoiSinhViens")]
    public virtual CauHoi CauHoi { get; set; } = null!;

    [ForeignKey("DapAnId")]
    [InverseProperty("TraLoiSinhViens")]
    public virtual DapAn? DapAn { get; set; }

    [InverseProperty("TraLoi")]
    public virtual ICollection<TraLoiNhieuDapAn> TraLoiNhieuDapAns { get; set; } = new List<TraLoiNhieuDapAn>();
}
