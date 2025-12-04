using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class BaiLamTracNghiem
{
    public int BaiLamId { get; set; }

    public int BaiTracNghiemId { get; set; }

    public int SinhVienId { get; set; }

    public DateTime? NgayBatDau { get; set; }

    public DateTime? NgayNop { get; set; }

    public int? ThoiGianConLai { get; set; }

    public string? TrangThai { get; set; }

    public decimal? Diem { get; set; }

    public int? SoLanLam { get; set; }

    public virtual BaiTracNghiem BaiTracNghiem { get; set; } = null!;

    public virtual User SinhVien { get; set; } = null!;

    public virtual ICollection<TraLoiSinhVien> TraLoiSinhViens { get; set; } = new List<TraLoiSinhVien>();
}
