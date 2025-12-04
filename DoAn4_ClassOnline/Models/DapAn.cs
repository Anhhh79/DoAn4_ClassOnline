using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class DapAn
{
    public int DapAnId { get; set; }

    public int CauHoiId { get; set; }

    public string NoiDungDapAn { get; set; } = null!;

    public bool? LaDapAnDung { get; set; }

    public int? ThuTu { get; set; }

    public virtual CauHoi CauHoi { get; set; } = null!;

    public virtual ICollection<TraLoiNhieuDapAn> TraLoiNhieuDapAns { get; set; } = new List<TraLoiNhieuDapAn>();

    public virtual ICollection<TraLoiSinhVien> TraLoiSinhViens { get; set; } = new List<TraLoiSinhVien>();
}
