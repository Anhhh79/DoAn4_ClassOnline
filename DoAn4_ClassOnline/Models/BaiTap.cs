using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class BaiTap
{
    public int BaiTapId { get; set; }

    public int KhoaHocId { get; set; }

    public string TieuDe { get; set; } = null!;

    public string? MoTa { get; set; }

    public DateTime? ThoiGianBatDau { get; set; }

    public DateTime? ThoiGianKetThuc { get; set; }

    public DateTime? NgayTao { get; set; }

    public bool? ChoPhepNopTre { get; set; }

    public decimal? DiemToiDa { get; set; }

    public virtual ICollection<BaiTapFile> BaiTapFiles { get; set; } = new List<BaiTapFile>();

    public virtual ICollection<BaiTapNop> BaiTapNops { get; set; } = new List<BaiTapNop>();

    public virtual KhoaHoc KhoaHoc { get; set; } = null!;
}
