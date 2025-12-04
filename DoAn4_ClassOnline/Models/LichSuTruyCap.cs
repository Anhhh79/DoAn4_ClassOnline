using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class LichSuTruyCap
{
    public int TruyCapId { get; set; }

    public int UserId { get; set; }

    public int? KhoaHocId { get; set; }

    public DateTime? ThoiGianTruyCap { get; set; }

    public string? HanhDong { get; set; }

    public virtual KhoaHoc? KhoaHoc { get; set; }

    public virtual User User { get; set; } = null!;
}
