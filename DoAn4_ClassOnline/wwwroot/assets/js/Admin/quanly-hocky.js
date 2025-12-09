document.addEventListener('DOMContentLoaded', function () {
    // Khởi tạo Flatpickr ngay khi trang load
    initializeFlatpickr();

    // Load danh sách học kỳ khi trang được tải
    LoadDanhSachHocKy();

    // Xử lý tìm kiếm
    $('#timKiemHocKy').on('keyup', function () {
        const searchTerm = $(this).val();
        LoadDanhSachHocKy(searchTerm);
    });

    // Real-time validation cho modal Thêm
    $('#hocKy_Them').on('input', function () {
        validateHocKy('hocKy_Them', 'errorHocKy_Them');
    });

    $('#namHoc_Them').on('input', function () {
        validateNamHoc('namHoc_Them', 'errorNamHoc_Them');
    });

    // Real-time validation cho modal Sửa
    $('#hocKy_Sua').on('input', function () {
        validateHocKy('hocKy_Sua', 'errorHocKy_Sua');
    });

    $('#namHoc_Sua').on('input', function () {
        validateNamHoc('namHoc_Sua', 'errorNamHoc_Sua');
    });
});

// =====================================================
// ⭐ VALIDATION FUNCTIONS
// =====================================================
function validateHocKy(inputId, errorId) {
    const value = $(`#${inputId}`).val().trim();
    const errorElement = $(`#${errorId}`);

    // Clear error
    errorElement.text('');

    if (!value) {
        errorElement.text('Vui lòng nhập học kỳ!');
        return false;
    }

    // Kiểm tra format: HK + số (VD: HK1, HK2, HK3)
    const hocKyPattern = /^HK\d+$/i;
    if (!hocKyPattern.test(value)) {
        errorElement.text('Định dạng học kỳ không hợp lệ! (VD: HK1, HK2, HK3)');
        return false;
    }

    return true;
}

function validateNamHoc(inputId, errorId) {
    const value = $(`#${inputId}`).val().trim();
    const errorElement = $(`#${errorId}`);

    // Clear error
    errorElement.text('');

    if (!value) {
        errorElement.text('Vui lòng nhập năm học!');
        return false;
    }

    // Kiểm tra format: 20xx - 20xx (VD: 2024 - 2025)
    const namHocPattern = /^(20\d{2})\s*-\s*(20\d{2})$/;
    const match = value.match(namHocPattern);

    if (!match) {
        errorElement.text('Định dạng năm học không hợp lệ! (VD: 2024 - 2025)');
        return false;
    }

    const namBatDau = parseInt(match[1]);
    const namKetThuc = parseInt(match[2]);

    // Kiểm tra năm kết thúc phải lớn hơn năm bắt đầu
    if (namKetThuc <= namBatDau) {
        errorElement.text('Năm kết thúc phải lớn hơn năm bắt đầu!');
        return false;
    }

    // Kiểm tra khoảng cách năm (thường là 1 năm)
    if (namKetThuc - namBatDau > 2) {
        errorElement.text('Khoảng cách năm học không hợp lệ!');
        return false;
    }

    return true;
}

// =====================================================
// ⭐ CLEAR ERROR MESSAGES
// =====================================================
function clearErrors(prefix) {
    $(`#errorHocKy_${prefix}`).text('');
    $(`#errorNamHoc_${prefix}`).text('');
}

// =====================================================
// ⭐ KHỞI TẠO FLATPICKR
// =====================================================
function initializeFlatpickr() {
    // Flatpickr cho modal Thêm
    flatpickr("#batDau_Them", {
        dateFormat: "Y-m-d",        // Format gửi đi: yyyy-MM-dd
        altInput: true,
        altFormat: "d/m/Y",         // Format hiển thị: dd/mm/yyyy
        allowInput: true
    });

    flatpickr("#ketThuc_Them", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true
    });

    // Flatpickr cho modal Sửa
    flatpickr("#batDau_Sua", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true
    });

    flatpickr("#ketThuc_Sua", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true
    });
}

// =====================================================
// ⭐ LOAD DANH SÁCH HỌC KỲ
// =====================================================
function LoadDanhSachHocKy(searchTerm = '') {
    $.ajax({
        url: '/Admin/QuanLyHocKy/GetDanhSachHocKy',
        type: 'GET',
        data: { searchTerm: searchTerm },
        success: function (response) {
            if (response && response.success) {
                RenderDanhSachHocKy(response.data || []);
            } else {
                toastr.error(response?.message || 'Có lỗi xảy ra!', 'Lỗi');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            toastr.error('Không thể tải danh sách học kỳ!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ RENDER DANH SÁCH HỌC KỲ
// =====================================================
function RenderDanhSachHocKy(data) {
    const tbody = $('#tableHocKy');
    tbody.empty();

    if (!data || data.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="6" class="text-center">Không có dữ liệu</td>
            </tr>
        `);
        return;
    }

    data.forEach((hocKy, index) => {
        const ngayBatDau = hocKy.ngayBatDau || 'Chưa xác định';
        const ngayKetThuc = hocKy.ngayKetThuc || 'Chưa xác định';
        const tenHocKy = hocKy.tenHocKy || '';
        const namHoc = hocKy.namHoc || '';

        const row = `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${tenHocKy}</td>
                <td>${namHoc}</td>
                <td>${ngayBatDau}</td>
                <td>${ngayKetThuc}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="MoModalSua(${hocKy.hocKyId})">
                        <i class="fa-solid fa-pen-to-square"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="XoaHocKy(${hocKy.hocKyId})">
                        <i class="fa-solid fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

// =====================================================
// ⭐ THÊM HỌC KỲ
// =====================================================
function ThemHocKy() {
    // Clear errors trước
    clearErrors('Them');

    const tenHocKy = $('#hocKy_Them').val().trim();
    const namHoc = $('#namHoc_Them').val().trim();
    const ngayBatDau = $('#batDau_Them').val();
    const ngayKetThuc = $('#ketThuc_Them').val();

    // Validate
    const isHocKyValid = validateHocKy('hocKy_Them', 'errorHocKy_Them');
    const isNamHocValid = validateNamHoc('namHoc_Them', 'errorNamHoc_Them');

    if (!isHocKyValid || !isNamHocValid) {
        return;
    }

    // Tự động tính thuTuHocKy từ tên học kỳ (VD: HK1 -> 1, HK2 -> 2)
    let thuTuHocKy = 1;
    const match = tenHocKy.match(/\d+/);
    if (match) {
        thuTuHocKy = parseInt(match[0]);
    }

    // Gửi string yyyy-MM-dd cho controller
    const data = {
        tenHocKy: tenHocKy.toUpperCase(), // Chuẩn hóa thành chữ hoa
        namHoc: namHoc,
        thuTuHocKy: thuTuHocKy,
        ngayBatDauStr: ngayBatDau ? ngayBatDau : null,
        ngayKetThucStr: ngayKetThuc ? ngayKetThuc : null
    };

    $.ajax({
        url: '/Admin/QuanLyHocKy/ThemHocKy',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response && response.success) {
                toastr.success(response.message, 'Thành công');
                $('#modalThemHocKy').modal('hide');
                // Clear form
                $('#hocKy_Them').val('');
                $('#namHoc_Them').val('');
                $('#batDau_Them').val('');
                $('#ketThuc_Them').val('');
                clearErrors('Them');

                // Clear Flatpickr
                const flatpickrBatDau = document.getElementById('batDau_Them')._flatpickr;
                const flatpickrKetThuc = document.getElementById('ketThuc_Them')._flatpickr;
                if (flatpickrBatDau) flatpickrBatDau.clear();
                if (flatpickrKetThuc) flatpickrKetThuc.clear();

                LoadDanhSachHocKy();
            } else {
                toastr.error(response?.message || 'Có lỗi xảy ra!', 'Lỗi');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            console.error('Response:', xhr.responseText);
            toastr.error('Có lỗi xảy ra khi thêm học kỳ!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ MỞ MODAL SỬA
// =====================================================
function MoModalSua(hocKyId) {
    // Clear errors
    clearErrors('Sua');

    $.ajax({
        url: '/Admin/QuanLyHocKy/LayThongTinHocKy',
        type: 'GET',
        data: { hocKyId: hocKyId },
        success: function (response) {
            if (response && response.success && response.data) {
                $('#idHocKy_Sua').val(response.data.hocKyId);
                $('#hocKy_Sua').val(response.data.tenHocKy || '');
                $('#namHoc_Sua').val(response.data.namHoc || '');

                // Set giá trị cho Flatpickr
                const flatpickrBatDau = document.getElementById('batDau_Sua')._flatpickr;
                const flatpickrKetThuc = document.getElementById('ketThuc_Sua')._flatpickr;

                if (response.data.ngayBatDau && flatpickrBatDau) {
                    flatpickrBatDau.setDate(response.data.ngayBatDau);
                } else if (flatpickrBatDau) {
                    flatpickrBatDau.clear();
                }

                if (response.data.ngayKetThuc && flatpickrKetThuc) {
                    flatpickrKetThuc.setDate(response.data.ngayKetThuc);
                } else if (flatpickrKetThuc) {
                    flatpickrKetThuc.clear();
                }

                $('#modalSuaHocKy').modal('show');
            } else {
                toastr.error(response?.message || 'Không tìm thấy thông tin học kỳ!', 'Lỗi');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            toastr.error('Không thể tải thông tin học kỳ!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ CẬP NHẬT HỌC KỲ
// =====================================================
function CapNhatHocKy() {
    // Clear errors trước
    clearErrors('Sua');

    const hocKyId = $('#idHocKy_Sua').val();
    const tenHocKy = $('#hocKy_Sua').val().trim();
    const namHoc = $('#namHoc_Sua').val().trim();
    const ngayBatDau = $('#batDau_Sua').val();
    const ngayKetThuc = $('#ketThuc_Sua').val();

    // Validate
    const isHocKyValid = validateHocKy('hocKy_Sua', 'errorHocKy_Sua');
    const isNamHocValid = validateNamHoc('namHoc_Sua', 'errorNamHoc_Sua');

    if (!isHocKyValid || !isNamHocValid) {
        return;
    }

    // Tự động tính thuTuHocKy từ tên học kỳ
    let thuTuHocKy = 1;
    const match = tenHocKy.match(/\d+/);
    if (match) {
        thuTuHocKy = parseInt(match[0]);
    }

    // Gửi string yyyy-MM-dd cho controller
    const data = {
        hocKyId: parseInt(hocKyId),
        tenHocKy: tenHocKy.toUpperCase(), // Chuẩn hóa thành chữ hoa
        namHoc: namHoc,
        thuTuHocKy: thuTuHocKy,
        ngayBatDauStr: ngayBatDau ? ngayBatDau : null,
        ngayKetThucStr: ngayKetThuc ? ngayKetThuc : null
    };

    $.ajax({
        url: '/Admin/QuanLyHocKy/CapNhatHocKy',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response && response.success) {
                toastr.success(response.message, 'Thành công');
                $('#modalSuaHocKy').modal('hide');
                LoadDanhSachHocKy();
            } else {
                toastr.error(response?.message || 'Có lỗi xảy ra!', 'Lỗi');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            console.error('Response:', xhr.responseText);
            toastr.error('Có lỗi xảy ra khi cập nhật học kỳ!', 'Lỗi');
        }
    });
}

// =====================================================
// ⭐ XÓA HỌC KỲ
// =====================================================
function XoaHocKy(hocKyId) {
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa học kỳ này? Hành động này không thể hoàn tác!',
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
                url: '/Admin/QuanLyHocKy/XoaHocKy',
                type: 'POST',
                data: { hocKyId: hocKyId },
                success: function (response) {
                    if (response && response.success) {
                        toastr.success(response.message, 'Thành công');
                        LoadDanhSachHocKy();
                    } else {
                        toastr.error(response?.message || 'Có lỗi xảy ra!', 'Lỗi');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                    toastr.error('Có lỗi xảy ra khi xóa học kỳ!', 'Lỗi');
                }
            });
        }
    });
}