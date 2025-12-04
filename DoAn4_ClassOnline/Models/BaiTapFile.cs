using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class BaiTapFile
{
    public int FileId { get; set; }

    public int BaiTapId { get; set; }

    public string TenFile { get; set; } = null!;

    public string DuongDan { get; set; } = null!;

    public long? KichThuoc { get; set; }

    public string? LoaiFile { get; set; }

    public string? LoaiFileBaiTap { get; set; }

    public virtual BaiTap BaiTap { get; set; } = null!;
}
