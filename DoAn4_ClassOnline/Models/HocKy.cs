using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("HocKy")]
public partial class HocKy
{
    [Key]
    public int HocKyId { get; set; }

    [StringLength(100)]
    public string TenHocKy { get; set; } = null!;

    [StringLength(50)]
    public string NamHoc { get; set; } = null!;

    public int ThuTuHocKy { get; set; }

    public DateOnly? NgayBatDau { get; set; }

    public DateOnly? NgayKetThuc { get; set; }

    public bool? IsActive { get; set; }

    [InverseProperty("HocKy")]
    public virtual ICollection<KhoaHoc> KhoaHocs { get; set; } = new List<KhoaHoc>();
}
