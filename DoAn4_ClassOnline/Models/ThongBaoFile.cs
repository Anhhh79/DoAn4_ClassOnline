using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class ThongBaoFile
{
    public int FileId { get; set; }

    public int ThongBaoId { get; set; }

    public string TenFile { get; set; } = null!;

    public string DuongDan { get; set; } = null!;

    public long? KichThuoc { get; set; }

    public string? LoaiFile { get; set; }

    public virtual ThongBao ThongBao { get; set; } = null!;
}
