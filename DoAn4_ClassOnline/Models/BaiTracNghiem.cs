using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class BaiTracNghiem
{
    public int BaiTracNghiemId { get; set; }

    public int KhoaHocId { get; set; }

    public string TenBaiThi { get; set; } = null!;

    public string? MoTa { get; set; }

    public DateTime? ThoiGianBatDau { get; set; }

    public DateTime? ThoiGianKetThuc { get; set; }

    public int? ThoiLuongLamBai { get; set; }

    public string? LoaiBaiThi { get; set; }

    public bool? ChoXemKetQua { get; set; }

    public bool? TronCauHoi { get; set; }

    public decimal? DiemToiDa { get; set; }

    public int? SoLanLamToiDa { get; set; }

    public DateTime? NgayTao { get; set; }

    public virtual ICollection<BaiLamTracNghiem> BaiLamTracNghiems { get; set; } = new List<BaiLamTracNghiem>();

    public virtual ICollection<CauHoi> CauHois { get; set; } = new List<CauHoi>();

    public virtual ICollection<GiaoBaiTracNghiem> GiaoBaiTracNghiems { get; set; } = new List<GiaoBaiTracNghiem>();

    public virtual KhoaHoc KhoaHoc { get; set; } = null!;
}
