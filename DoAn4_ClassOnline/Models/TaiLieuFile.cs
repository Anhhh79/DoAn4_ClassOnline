using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class TaiLieuFile
{
    public int FileId { get; set; }

    public int TaiLieuId { get; set; }

    public string TenFile { get; set; } = null!;

    public string DuongDan { get; set; } = null!;

    public long? KichThuoc { get; set; }

    public string? LoaiFile { get; set; }

    public DateTime? NgayUpload { get; set; }

    public virtual TaiLieu TaiLieu { get; set; } = null!;
}
