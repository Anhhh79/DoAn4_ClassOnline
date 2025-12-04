using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class ThamGiaKhoaHoc
{
    public int ThamGiaId { get; set; }

    public int KhoaHocId { get; set; }

    public int SinhVienId { get; set; }

    public DateTime? NgayThamGia { get; set; }

    public string? TrangThai { get; set; }

    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    public virtual User SinhVien { get; set; } = null!;
}
