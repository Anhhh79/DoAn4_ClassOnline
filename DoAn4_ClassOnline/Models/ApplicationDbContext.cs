using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DoAn4_ClassOnline.Models;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<BaiLamTracNghiem> BaiLamTracNghiems { get; set; }

    public virtual DbSet<BaiTap> BaiTaps { get; set; }

    public virtual DbSet<BaiTapFile> BaiTapFiles { get; set; }

    public virtual DbSet<BaiTapNop> BaiTapNops { get; set; }

    public virtual DbSet<BaiTapNopFile> BaiTapNopFiles { get; set; }

    public virtual DbSet<BaiTracNghiem> BaiTracNghiems { get; set; }

    public virtual DbSet<CauHoi> CauHois { get; set; }

    public virtual DbSet<ChuDe> ChuDes { get; set; }

    public virtual DbSet<DapAn> DapAns { get; set; }

    public virtual DbSet<GiaoBaiTracNghiem> GiaoBaiTracNghiems { get; set; }

    public virtual DbSet<HocKy> HocKies { get; set; }

    public virtual DbSet<Khoa> Khoas { get; set; }

    public virtual DbSet<KhoaHoc> KhoaHocs { get; set; }

    public virtual DbSet<LichSuTruyCap> LichSuTruyCaps { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<TaiLieu> TaiLieus { get; set; }

    public virtual DbSet<TaiLieuFile> TaiLieuFiles { get; set; }

    public virtual DbSet<ThamGiaKhoaHoc> ThamGiaKhoaHocs { get; set; }

    public virtual DbSet<ThongBao> ThongBaos { get; set; }

    public virtual DbSet<ThongBaoFile> ThongBaoFiles { get; set; }

    public virtual DbSet<TraLoiNhieuDapAn> TraLoiNhieuDapAns { get; set; }

    public virtual DbSet<TraLoiSinhVien> TraLoiSinhViens { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BaiLamTracNghiem>(entity =>
        {
            entity.HasKey(e => e.BaiLamId).HasName("PK__BaiLamTr__6942BAAE74B629E0");

            entity.Property(e => e.NgayBatDau).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.SoLanLam).HasDefaultValue(1);
            entity.Property(e => e.TrangThai).HasDefaultValue("DangLam");

            entity.HasOne(d => d.BaiTracNghiem).WithMany(p => p.BaiLamTracNghiems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BaiLamTra__BaiTr__2A164134");

            entity.HasOne(d => d.SinhVien).WithMany(p => p.BaiLamTracNghiems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BaiLamTra__SinhV__2B0A656D");
        });

        modelBuilder.Entity<BaiTap>(entity =>
        {
            entity.HasKey(e => e.BaiTapId).HasName("PK__BaiTap__48494B45DD4C1E45");

            entity.Property(e => e.ChoPhepNopTre).HasDefaultValue(false);
            entity.Property(e => e.DiemToiDa).HasDefaultValue(10m);
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.BaiTaps).HasConstraintName("FK__BaiTap__KhoaHocI__01142BA1");
        });

        modelBuilder.Entity<BaiTapFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__BaiTapFi__6F0F98BF88B758CE");

            entity.HasOne(d => d.BaiTap).WithMany(p => p.BaiTapFiles).HasConstraintName("FK__BaiTapFil__BaiTa__03F0984C");
        });

        modelBuilder.Entity<BaiTapNop>(entity =>
        {
            entity.HasKey(e => e.BaiNopId).HasName("PK__BaiTapNo__B71B8A98857D5D68");

            entity.Property(e => e.NgayNop).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue("DaNop");

            entity.HasOne(d => d.BaiTap).WithMany(p => p.BaiTapNops).HasConstraintName("FK__BaiTapNop__BaiTa__08B54D69");

            entity.HasOne(d => d.SinhVien).WithMany(p => p.BaiTapNops)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BaiTapNop__SinhV__09A971A2");
        });

        modelBuilder.Entity<BaiTapNopFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__BaiTapNo__6F0F98BFCBA622FD");

            entity.Property(e => e.NgayUpload).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.BaiNop).WithMany(p => p.BaiTapNopFiles).HasConstraintName("FK__BaiTapNop__BaiNo__0D7A0286");
        });

        modelBuilder.Entity<BaiTracNghiem>(entity =>
        {
            entity.HasKey(e => e.BaiTracNghiemId).HasName("PK__BaiTracN__0E7880D949519AD9");

            entity.Property(e => e.ChoXemKetQua).HasDefaultValue(true);
            entity.Property(e => e.DiemToiDa).HasDefaultValue(10m);
            entity.Property(e => e.LoaiBaiThi).HasDefaultValue("KiemTra");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.SoLanLamToiDa).HasDefaultValue(1);
            entity.Property(e => e.TronCauHoi).HasDefaultValue(false);

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.BaiTracNghiems).HasConstraintName("FK__BaiTracNg__KhoaH__160F4887");
        });

        modelBuilder.Entity<CauHoi>(entity =>
        {
            entity.HasKey(e => e.CauHoiId).HasName("PK__CauHoi__EDF63F1CE4900BF4");

            entity.Property(e => e.Diem).HasDefaultValue(1m);
            entity.Property(e => e.LoaiCauHoi).HasDefaultValue("SingleChoice");

            entity.HasOne(d => d.BaiTracNghiem).WithMany(p => p.CauHois).HasConstraintName("FK__CauHoi__BaiTracN__208CD6FA");
        });

        modelBuilder.Entity<ChuDe>(entity =>
        {
            entity.HasKey(e => e.ChuDeId).HasName("PK__ChuDe__381DCA6B13B6AAA4");

            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ThuTu).HasDefaultValue(0);

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.ChuDes).HasConstraintName("FK__ChuDe__KhoaHocId__71D1E811");
        });

        modelBuilder.Entity<DapAn>(entity =>
        {
            entity.HasKey(e => e.DapAnId).HasName("PK__DapAn__2B560CD4B4AF2820");

            entity.Property(e => e.LaDapAnDung).HasDefaultValue(false);

            entity.HasOne(d => d.CauHoi).WithMany(p => p.DapAns).HasConstraintName("FK__DapAn__CauHoiId__245D67DE");
        });

        modelBuilder.Entity<GiaoBaiTracNghiem>(entity =>
        {
            entity.HasKey(e => e.GiaoBaiId).HasName("PK__GiaoBaiT__3751D87D5ECD4777");

            entity.Property(e => e.NgayGiao).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.BaiTracNghiem).WithMany(p => p.GiaoBaiTracNghiems).HasConstraintName("FK__GiaoBaiTr__BaiTr__19DFD96B");

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.GiaoBaiTracNghiems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__GiaoBaiTr__KhoaH__1BC821DD");

            entity.HasOne(d => d.SinhVien).WithMany(p => p.GiaoBaiTracNghiems).HasConstraintName("FK__GiaoBaiTr__SinhV__1AD3FDA4");
        });

        modelBuilder.Entity<HocKy>(entity =>
        {
            entity.HasKey(e => e.HocKyId).HasName("PK__HocKy__D7A4A9533CA8FDE4");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<Khoa>(entity =>
        {
            entity.HasKey(e => e.KhoaId).HasName("PK__Khoa__42EDDFF44AA86F3A");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<KhoaHoc>(entity =>
        {
            entity.HasKey(e => e.KhoaHocId).HasName("PK__KhoaHoc__AADD6C92E0DA441E");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsPublic).HasDefaultValue(true);
            entity.Property(e => e.SoLuongSinhVien).HasDefaultValue(0);
            entity.Property(e => e.TrangThaiKhoaHoc).HasDefaultValue("DangMo");

            entity.HasOne(d => d.GiaoVien).WithMany(p => p.KhoaHocs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhoaHoc__GiaoVie__60A75C0F");

            entity.HasOne(d => d.HocKy).WithMany(p => p.KhoaHocs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhoaHoc__HocKyId__5FB337D6");

            entity.HasOne(d => d.Khoa).WithMany(p => p.KhoaHocs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhoaHoc__KhoaId__5EBF139D");
        });

        modelBuilder.Entity<LichSuTruyCap>(entity =>
        {
            entity.HasKey(e => e.TruyCapId).HasName("PK__LichSuTr__4B2474A50857CD30");

            entity.Property(e => e.ThoiGianTruyCap).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.LichSuTruyCaps).HasConstraintName("FK__LichSuTru__KhoaH__395884C4");

            entity.HasOne(d => d.User).WithMany(p => p.LichSuTruyCaps).HasConstraintName("FK__LichSuTru__UserI__3864608B");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A690AAE7E");
        });

        modelBuilder.Entity<TaiLieu>(entity =>
        {
            entity.HasKey(e => e.TaiLieuId).HasName("PK__TaiLieu__862FCAD05098E621");

            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ThuTu).HasDefaultValue(0);

            entity.HasOne(d => d.ChuDe).WithMany(p => p.TaiLieus).HasConstraintName("FK__TaiLieu__ChuDeId__76969D2E");

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.TaiLieus).HasConstraintName("FK__TaiLieu__KhoaHoc__778AC167");
        });

        modelBuilder.Entity<TaiLieuFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__TaiLieuF__6F0F98BF154E6777");

            entity.Property(e => e.NgayUpload).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.TaiLieu).WithMany(p => p.TaiLieuFiles).HasConstraintName("FK__TaiLieuFi__TaiLi__7B5B524B");
        });

        modelBuilder.Entity<ThamGiaKhoaHoc>(entity =>
        {
            entity.HasKey(e => e.ThamGiaId).HasName("PK__ThamGiaK__6589789C7C89CCED");

            entity.Property(e => e.NgayThamGia).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue("DangHoc");

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.ThamGiaKhoaHocs).HasConstraintName("FK__ThamGiaKh__KhoaH__656C112C");

            entity.HasOne(d => d.SinhVien).WithMany(p => p.ThamGiaKhoaHocs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThamGiaKh__SinhV__66603565");
        });

        modelBuilder.Entity<ThongBao>(entity =>
        {
            entity.HasKey(e => e.ThongBaoId).HasName("PK__ThongBao__6E51A51BB00479D6");

            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.KhoaHoc).WithMany(p => p.ThongBaos).HasConstraintName("FK__ThongBao__KhoaHo__6A30C649");
        });

        modelBuilder.Entity<ThongBaoFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__ThongBao__6F0F98BF5F77E427");

            entity.HasOne(d => d.ThongBao).WithMany(p => p.ThongBaoFiles).HasConstraintName("FK__ThongBaoF__Thong__6D0D32F4");
        });

        modelBuilder.Entity<TraLoiNhieuDapAn>(entity =>
        {
            entity.HasKey(e => e.TraLoiNhieuDapAnId).HasName("PK__TraLoiNh__16B0D3541FCAE09C");

            entity.HasOne(d => d.DapAn).WithMany(p => p.TraLoiNhieuDapAns)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TraLoiNhi__DapAn__3493CFA7");

            entity.HasOne(d => d.TraLoi).WithMany(p => p.TraLoiNhieuDapAns).HasConstraintName("FK__TraLoiNhi__TraLo__339FAB6E");
        });

        modelBuilder.Entity<TraLoiSinhVien>(entity =>
        {
            entity.HasKey(e => e.TraLoiId).HasName("PK__TraLoiSi__3B78F81175BF8016");

            entity.Property(e => e.NgayTraLoi).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.BaiLam).WithMany(p => p.TraLoiSinhViens).HasConstraintName("FK__TraLoiSin__BaiLa__2EDAF651");

            entity.HasOne(d => d.CauHoi).WithMany(p => p.TraLoiSinhViens)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TraLoiSin__CauHo__2FCF1A8A");

            entity.HasOne(d => d.DapAn).WithMany(p => p.TraLoiSinhViens).HasConstraintName("FK__TraLoiSin__DapAn__30C33EC3");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C568FAA6C");

            entity.HasIndex(e => e.MaSo, "UQ_Users_MaSo")
                .IsUnique()
                .HasFilter("([MaSo] IS NOT NULL)");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.UserRoleId).HasName("PK__UserRole__3D978A3579C4BD62");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles).HasConstraintName("FK__UserRoles__RoleI__52593CB8");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles).HasConstraintName("FK__UserRoles__UserI__5165187F");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
