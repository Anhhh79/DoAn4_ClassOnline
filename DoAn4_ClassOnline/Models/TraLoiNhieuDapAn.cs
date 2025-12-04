using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class TraLoiNhieuDapAn
{
    public int TraLoiNhieuDapAnId { get; set; }

    public int TraLoiId { get; set; }

    public int DapAnId { get; set; }

    public virtual DapAn DapAn { get; set; } = null!;

    public virtual TraLoiSinhVien TraLoi { get; set; } = null!;
}
