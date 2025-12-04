using System;
using System.Collections.Generic;

namespace DoAn4_ClassOnline.Models;

public partial class Khoa
{
    public int KhoaId { get; set; }

    public string TenKhoa { get; set; } = null!;

    public string? MoTa { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<KhoaHoc> KhoaHocs { get; set; } = new List<KhoaHoc>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
