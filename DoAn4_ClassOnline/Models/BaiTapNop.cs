using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class BaiTapNop
{
    public int BaiNopId { get; set; }

    public int BaiTapId { get; set; }

    public int SinhVienId { get; set; }

    public DateTime? NgayNop { get; set; }

    public string? TrangThai { get; set; }

    public decimal? Diem { get; set; }

    public string? NhanXet { get; set; }

    public DateTime? NgayCham { get; set; }

    public virtual BaiTap BaiTap { get; set; } = null!;

    public virtual ICollection<BaiTapNopFile> BaiTapNopFiles { get; set; } = new List<BaiTapNopFile>();

    public virtual User SinhVien { get; set; } = null!;
}
