using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class CauHoi
{
    public int CauHoiId { get; set; }

    public int BaiTracNghiemId { get; set; }

    public string NoiDungCauHoi { get; set; } = null!;

    public string? LoaiCauHoi { get; set; }

    public decimal? Diem { get; set; }

    public int? ThuTu { get; set; }

    public string? HinhAnh { get; set; }

    public virtual BaiTracNghiem BaiTracNghiem { get; set; } = null!;

    public virtual ICollection<DapAn> DapAns { get; set; } = new List<DapAn>();

    public virtual ICollection<TraLoiSinhVien> TraLoiSinhViens { get; set; } = new List<TraLoiSinhVien>();
}
