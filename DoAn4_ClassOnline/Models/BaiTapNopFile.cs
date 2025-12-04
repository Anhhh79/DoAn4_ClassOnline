using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class BaiTapNopFile
{
    public int FileId { get; set; }

    public int BaiNopId { get; set; }

    public string TenFile { get; set; } = null!;

    public string DuongDan { get; set; } = null!;

    public long? KichThuoc { get; set; }

    public string? LoaiFile { get; set; }

    public DateTime? NgayUpload { get; set; }

    public virtual BaiTapNop BaiNop { get; set; } = null!;
}
