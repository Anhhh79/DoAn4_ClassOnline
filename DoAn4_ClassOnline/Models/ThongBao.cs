using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class ThongBao
{
    public int ThongBaoId { get; set; }

    public int KhoaHocId { get; set; }

    public string TieuDe { get; set; } = null!;

    public string NoiDung { get; set; } = null!;

    public DateTime? NgayTao { get; set; }

    public DateTime? NgayCapNhat { get; set; }

    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    public virtual ICollection<ThongBaoFile> ThongBaoFiles { get; set; } = new List<ThongBaoFile>();
}
