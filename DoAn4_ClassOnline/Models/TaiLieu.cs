using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class TaiLieu
{
    public int TaiLieuId { get; set; }

    public int? ChuDeId { get; set; }

    public int KhoaHocId { get; set; }

    public string TenTaiLieu { get; set; } = null!;

    public string? MoTa { get; set; }

    public DateTime? NgayTao { get; set; }

    public int? ThuTu { get; set; }

    public virtual ChuDe? ChuDe { get; set; }

    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    public virtual ICollection<TaiLieuFile> TaiLieuFiles { get; set; } = new List<TaiLieuFile>();
}
