using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

public partial class TaiLieuFile
{
    [Key]
    public int FileId { get; set; }

    public int TaiLieuId { get; set; }

    [StringLength(255)]
    public string TenFile { get; set; } = null!;

    [StringLength(500)]
    public string DuongDan { get; set; } = null!;

    public long? KichThuoc { get; set; }

    [StringLength(50)]
    public string? LoaiFile { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayUpload { get; set; }

    [ForeignKey("TaiLieuId")]
    [InverseProperty("TaiLieuFiles")]
    public virtual TaiLieu TaiLieu { get; set; } = null!;
}
