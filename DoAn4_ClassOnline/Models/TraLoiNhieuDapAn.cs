using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Table("TraLoiNhieuDapAn")]
public partial class TraLoiNhieuDapAn
{
    [Key]
    public int TraLoiNhieuDapAnId { get; set; }

    public int TraLoiId { get; set; }

    public int DapAnId { get; set; }

    [ForeignKey("DapAnId")]
    [InverseProperty("TraLoiNhieuDapAns")]
    public virtual DapAn DapAn { get; set; } = null!;

    [ForeignKey("TraLoiId")]
    [InverseProperty("TraLoiNhieuDapAns")]
    public virtual TraLoiSinhVien TraLoi { get; set; } = null!;
}
