using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? Avatar { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public string? MaSo { get; set; }

    public string? GioiTinh { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? DiaChi { get; set; }

    public int? KhoaId { get; set; }

    public virtual ICollection<BaiLamTracNghiem> BaiLamTracNghiems { get; set; } = new List<BaiLamTracNghiem>();

    public virtual ICollection<BaiTapNop> BaiTapNops { get; set; } = new List<BaiTapNop>();

    public virtual ICollection<GiaoBaiTracNghiem> GiaoBaiTracNghiems { get; set; } = new List<GiaoBaiTracNghiem>();

    public virtual Khoa? Khoa { get; set; }

    public virtual ICollection<KhoaHoc> KhoaHocs { get; set; } = new List<KhoaHoc>();

    public virtual ICollection<LichSuTruyCap> LichSuTruyCaps { get; set; } = new List<LichSuTruyCap>();

    public virtual ICollection<ThamGiaKhoaHoc> ThamGiaKhoaHocs { get; set; } = new List<ThamGiaKhoaHoc>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
