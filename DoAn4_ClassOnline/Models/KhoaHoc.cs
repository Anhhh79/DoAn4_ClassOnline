using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class KhoaHoc
{
    public int KhoaHocId { get; set; }

    public string TenKhoaHoc { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? HinhAnh { get; set; }

    public int KhoaId { get; set; }

    public int HocKyId { get; set; }

    public int GiaoVienId { get; set; }

    public string? MatKhau { get; set; }

    public string? LinkHocOnline { get; set; }

    public int? SoLuongSinhVien { get; set; }

    public string? TrangThaiKhoaHoc { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsPublic { get; set; }

    public virtual ICollection<BaiTap> BaiTaps { get; set; } = new List<BaiTap>();

    public virtual ICollection<BaiTracNghiem> BaiTracNghiems { get; set; } = new List<BaiTracNghiem>();

    public virtual ICollection<ChuDe> ChuDes { get; set; } = new List<ChuDe>();

    public virtual ICollection<GiaoBaiTracNghiem> GiaoBaiTracNghiems { get; set; } = new List<GiaoBaiTracNghiem>();

    public virtual User GiaoVien { get; set; } = null!;

    public virtual HocKy HocKy { get; set; } = null!;

    public virtual Khoa Khoa { get; set; } = null!;

    public virtual ICollection<LichSuTruyCap> LichSuTruyCaps { get; set; } = new List<LichSuTruyCap>();

    public virtual ICollection<TaiLieu> TaiLieus { get; set; } = new List<TaiLieu>();

    public virtual ICollection<ThamGiaKhoaHoc> ThamGiaKhoaHocs { get; set; } = new List<ThamGiaKhoaHoc>();

    public virtual ICollection<ThongBao> ThongBaos { get; set; } = new List<ThongBao>();
}
