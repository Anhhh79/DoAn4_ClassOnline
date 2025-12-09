document.addEventListener('DOMContentLoaded', function () {
    // Load danh sách khoa khi trang được tải
    LoadDanhSachKhoa();

    // Xử lý tìm kiếm
    $('#timKiemKhoa').on('keyup', function () {
        const searchTerm = $(this).val();
        LoadDanhSachKhoa(searchTerm);
    });
});

// =====================================================
// ⭐ LOAD DANH SÁCH KHOA
// =====================================================
function LoadDanhSachKhoa(searchTerm = '') {
    $.ajax({
        url: '/Admin/QuanLyKhoa/GetDanhSachKhoa',
        type: 'GET',
        data: { searchTerm: searchTerm },
        success: function (response) {
            if (response.success) {
                RenderDanhSachKhoa(response.data);
            } else {
                toastr.error(response.message, 'Lỗi');
            }
        },
        error: function () {
            toastr.error('Không thể tải danh sách khoa!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ RENDER DANH SÁCH KHOA (Hiển thị KhoaId thay vì mã khoa)
// =====================================================
function RenderDanhSachKhoa(data) {
    const tbody = $('#tableKhoa');
    tbody.empty();

    if (data.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="6" class="text-center">Không có dữ liệu</td>
            </tr>
        `);
        return;
    }

    data.forEach((khoa, index) => {
        const row = `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${khoa.tenKhoa}</td>
                <td>${khoa.soGiangVien}</td>
                <td>${khoa.soSinhVien}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="MoModalSua(${khoa.khoaId})">
                        <i class="fa-solid fa-pen-to-square"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="XoaKhoa(${khoa.khoaId})">
                        <i class="fa-solid fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

// =====================================================
// ⭐ THÊM KHOA
// =====================================================
function ThemKhoa() {
    // Clear error
    $('#errorTenKhoa_Them').text('');

    const tenKhoa = $('#tenKhoa_Them').val().trim();

    // Validate
    if (!tenKhoa) {
        $('#errorTenKhoa_Them').text('Vui lòng nhập tên khoa!');
        return;
    }

    const data = {
        tenKhoa: tenKhoa
    };

    $.ajax({
        url: '/Admin/QuanLyKhoa/ThemKhoa',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                toastr.success(response.message, 'Thành công');
                $('#modalThemKhoa').modal('hide');
                $('#tenKhoa_Them').val('');
                LoadDanhSachKhoa();
            } else {
                toastr.error(response.message, 'Lỗi');
            }
        },
        error: function () {
            toastr.error('Có lỗi xảy ra khi thêm khoa!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ MỞ MODAL SỬA
// =====================================================
function MoModalSua(khoaId) {
    // Clear error
    $('#errorTenKhoa_Sua').text('');

    $.ajax({
        url: '/Admin/QuanLyKhoa/LayThongTinKhoa',
        type: 'GET',
        data: { khoaId: khoaId },
        success: function (response) {
            if (response.success) {
                $('#idKhoa_Sua').val(response.data.khoaId);
                $('#tenKhoa_Sua').val(response.data.tenKhoa);
                $('#modalSuaKhoa').modal('show');
            } else {
                toastr.error(response.message, 'Lỗi');
            }
        },
        error: function () {
            toastr.error('Không thể tải thông tin khoa!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ CẬP NHẬT KHOA
// =====================================================
function CapNhatKhoa() {
    // Clear error
    $('#errorTenKhoa_Sua').text('');

    const khoaId = $('#idKhoa_Sua').val();
    const tenKhoa = $('#tenKhoa_Sua').val().trim();

    // Validate
    if (!tenKhoa) {
        $('#errorTenKhoa_Sua').text('Vui lòng nhập tên khoa!');
        return;
    }

    const data = {
        khoaId: parseInt(khoaId),
        tenKhoa: tenKhoa
    };

    $.ajax({
        url: '/Admin/QuanLyKhoa/CapNhatKhoa',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                toastr.success(response.message, 'Thành công');
                $('#modalSuaKhoa').modal('hide');
                LoadDanhSachKhoa();
            } else {
                toastr.error(response.message, 'Lỗi');
            }
        },
        error: function () {
            toastr.error('Có lỗi xảy ra khi cập nhật khoa!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ XÓA KHOA
// =====================================================
function XoaKhoa(khoaId) {
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa khoa này? Hành động này không thể hoàn tác!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/Admin/QuanLyKhoa/XoaKhoa',
                type: 'POST',
                data: { khoaId: khoaId },
                success: function (response) {
                    if (response.success) {
                        toastr.success(response.message, 'Thành công');
                        LoadDanhSachKhoa();
                    } else {
                        toastr.error(response.message, 'Lỗi');
                    }
                },
                error: function () {
                    toastr.error('Có lỗi xảy ra khi xóa khoa!', 'Lỗi');
                }
            });
        }
    });
}