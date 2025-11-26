using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("Khoa")]
public partial class Khoa
{
    [Key]
    public int KhoaId { get; set; }

    [StringLength(200)]
    public string TenKhoa { get; set; } = null!;

    public string? MoTa { get; set; }

    public bool? IsActive { get; set; }

    [InverseProperty("Khoa")]
    public virtual ICollection<KhoaHoc> KhoaHocs { get; set; } = new List<KhoaHoc>();
}
