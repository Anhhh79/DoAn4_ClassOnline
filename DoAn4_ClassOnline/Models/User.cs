using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

[Index("MaSo", Name = "IX_Users_MaSo")]
[Index("Username", Name = "UQ__Users__536C85E4894110E0", IsUnique = true)]
[Index("Email", Name = "UQ__Users__A9D10534D3AA27C1", IsUnique = true)]
public partial class User
{
    [Key]
    public int UserId { get; set; }

    [StringLength(50)]
    public string Username { get; set; } = null!;

    [StringLength(100)]
    public string Email { get; set; } = null!;

    [StringLength(255)]
    public string PasswordHash { get; set; } = null!;

    [StringLength(100)]
    public string FullName { get; set; } = null!;

    [StringLength(255)]
    public string? Avatar { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    [StringLength(20)]
    public string? MaSo { get; set; }

    [StringLength(10)]
    public string? GioiTinh { get; set; }

    public DateOnly? NgaySinh { get; set; }

    [StringLength(255)]
    public string? DiaChi { get; set; }

    [InverseProperty("SinhVien")]
    public virtual ICollection<BaiLamTracNghiem> BaiLamTracNghiems { get; set; } = new List<BaiLamTracNghiem>();

    [InverseProperty("SinhVien")]
    public virtual ICollection<BaiTapNop> BaiTapNops { get; set; } = new List<BaiTapNop>();

    [InverseProperty("SinhVien")]
    public virtual ICollection<GiaoBaiTracNghiem> GiaoBaiTracNghiems { get; set; } = new List<GiaoBaiTracNghiem>();

    [InverseProperty("GiaoVien")]
    public virtual ICollection<KhoaHoc> KhoaHocs { get; set; } = new List<KhoaHoc>();

    [InverseProperty("User")]
    public virtual ICollection<LichSuTruyCap> LichSuTruyCaps { get; set; } = new List<LichSuTruyCap>();

    [InverseProperty("SinhVien")]
    public virtual ICollection<ThamGiaKhoaHoc> ThamGiaKhoaHocs { get; set; } = new List<ThamGiaKhoaHoc>();

    [InverseProperty("User")]
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
