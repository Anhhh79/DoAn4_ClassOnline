using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("DapAn")]
public partial class DapAn
{
    [Key]
    public int DapAnId { get; set; }

    public int CauHoiId { get; set; }

    public string NoiDungDapAn { get; set; } = null!;

    public bool? LaDapAnDung { get; set; }

    public int? ThuTu { get; set; }

    [ForeignKey("CauHoiId")]
    [InverseProperty("DapAns")]
    public virtual CauHoi CauHoi { get; set; } = null!;

    [InverseProperty("DapAn")]
    public virtual ICollection<TraLoiNhieuDapAn> TraLoiNhieuDapAns { get; set; } = new List<TraLoiNhieuDapAn>();

    [InverseProperty("DapAn")]
    public virtual ICollection<TraLoiSinhVien> TraLoiSinhViens { get; set; } = new List<TraLoiSinhVien>();
}
