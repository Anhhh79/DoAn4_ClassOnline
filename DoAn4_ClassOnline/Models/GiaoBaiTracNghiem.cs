using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class GiaoBaiTracNghiem
{
    public int GiaoBaiId { get; set; }

    public int BaiTracNghiemId { get; set; }

    public int? SinhVienId { get; set; }

    public int KhoaHocId { get; set; }

    public DateTime? NgayGiao { get; set; }

    public virtual BaiTracNghiem BaiTracNghiem { get; set; } = null!;

    public virtual KhoaHoc KhoaHoc { get; set; } = null!;

    public virtual User? SinhVien { get; set; }
}
