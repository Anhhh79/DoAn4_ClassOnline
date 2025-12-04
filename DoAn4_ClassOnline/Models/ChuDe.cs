using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class ChuDe
{
    public int ChuDeId { get; set; }

    public int KhoaHocId { get; set; }

    public string TenChuDe { get; set; } = null!;

    public string? MoTa { get; set; }

    public int? ThuTu { get; set; }

    public DateTime? NgayTao { get; set; }

    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    public virtual ICollection<TaiLieu> TaiLieus { get; set; } = new List<TaiLieu>();
}
