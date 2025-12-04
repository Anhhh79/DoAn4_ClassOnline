using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class TraLoiSinhVien
{
    public int TraLoiId { get; set; }

    public int BaiLamId { get; set; }

    public int CauHoiId { get; set; }

    public int? DapAnId { get; set; }

    public DateTime? NgayTraLoi { get; set; }

    public virtual BaiLamTracNghiem BaiLam { get; set; } = null!;

    public virtual CauHoi CauHoi { get; set; } = null!;

    public virtual DapAn? DapAn { get; set; }

    public virtual ICollection<TraLoiNhieuDapAn> TraLoiNhieuDapAns { get; set; } = new List<TraLoiNhieuDapAn>();
}
