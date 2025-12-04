using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class HocKy
{
    public int HocKyId { get; set; }

    public string TenHocKy { get; set; } = null!;

    public string NamHoc { get; set; } = null!;

    public int ThuTuHocKy { get; set; }

    public DateOnly? NgayBatDau { get; set; }

    public DateOnly? NgayKetThuc { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<KhoaHoc> KhoaHocs { get; set; } = new List<KhoaHoc>();
}
