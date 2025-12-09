// ⭐ CẤU HÌNH TOASTR - HIỂN THỊ Ở GÓC TRÊN BÊN PHẢI ⭐
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

$(document).ready(function () {
    // =====================================================
    // ⭐ TÌM KIẾM THỜI GIAN THỰC (LIVE SEARCH)
    // =====================================================
    $('#timKiemSan').on('keyup', function () {
        const searchValue = $(this).val().toLowerCase().trim();
        let visibleCount = 0;

        $('#sanBongTable tr').each(function () {
            const row = $(this);
            // Bỏ qua dòng "Không có dữ liệu"
            if (row.find('td[colspan]').length > 0) {
                return;
            }

            // Lấy text từ các cột: Họ tên, Khoa, Chức vụ, Email
            const fullName = row.find('td:eq(0)').text().toLowerCase();
            const khoa = row.find('td:eq(1)').text().toLowerCase();
            const chucVu = row.find('td:eq(2)').text().toLowerCase();
            const email = row.find('td:eq(3)').text().toLowerCase();

            // Kiểm tra xem có khớp với từ khóa không
            if (fullName.includes(searchValue) || 
                khoa.includes(searchValue) || 
                chucVu.includes(searchValue) || 
                email.includes(searchValue)) {
                row.show();
                visibleCount++;
            } else {
                row.hide();
            }
        });

        // Hiển thị thông báo nếu không tìm thấy kết quả
        if (visibleCount === 0 && searchValue !== '') {
            if ($('#noResultRow').length === 0) {
                $('#sanBongTable').append(`
                    <tr id="noResultRow">
                        <td colspan="6" class="text-center text-muted">
                            <i class="bi bi-search"></i> Không tìm thấy kết quả cho "<strong>${searchValue}</strong>"
                        </td>
                    </tr>
                `);
            }
        } else {
            $('#noResultRow').remove();
        }
    });

    // =====================================================
    // ⭐ XỬ LÝ NÚT CHI TIẾT
    // =====================================================
    $(document).on('click', '.btn-detail', function () {
        const userId = $(this).data('user-id');

        // Hiển thị loading
        $('#modalBody').html(`
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);

        // Gọi API lấy chi tiết
        $.get('/Admin/QuanLyTaiKhoan/GetUserDetail', { userId: userId }, function (response) {
            if (response.success) {
                const data = response.data;
                
                // ⭐ MAPPING CHỨC VỤ
                let chucVuDisplay = data.chucVu;
                if (data.chucVu === 'Teacher') {
                    chucVuDisplay = 'Giảng viên';
                } else if (data.chucVu === 'Student') {
                    chucVuDisplay = 'Sinh viên';
                } else if (data.chucVu === 'Admin') {
                    chucVuDisplay = 'Quản trị viên';
                }
                
                $('#modalBody').html(`
                    <div class="row g-4 align-items-center">
                        <div class="col-md-3 text-center">
                            <img src="${data.avatar}" alt="Ảnh người dùng"
                                 class="img-fluid rounded-4 shadow-sm" style="max-height: 180px; object-fit: cover;">
                        </div>
                        <div class="col-md-9">
                            <div class="row mb-2">
                                <div class="col-md-6"><strong>Họ và tên:</strong> ${data.fullName}</div>
                                <div class="col-md-6"><strong>Ngày sinh:</strong> ${data.ngaySinh}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-md-6"><strong>Email:</strong> ${data.email}</div>
                                <div class="col-md-6"><strong>Số điện thoại:</strong> ${data.phoneNumber}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-md-6"><strong>Giới tính:</strong> ${data.gioiTinh}</div>
                                <div class="col-md-6"><strong>MSSV:</strong> ${data.maSo}</div>
                            </div>
                            <div class="row mb-2">
                                <div class="col-md-6"><strong>Khoa:</strong> ${data.khoa}</div>
                                <div class="col-md-6"><strong>Chức vụ:</strong> ${chucVuDisplay}</div>
                            </div>
                        </div>
                    </div>
                `);
            } else {
                toastr.error(response.message, 'Lỗi');
            }
        }).fail(function () {
            toastr.error('Không thể tải thông tin chi tiết!', 'Lỗi');
        });
    });

    // =====================================================
    // ⭐ XỬ LÝ NÚT KHÓA/MỞ TÀI KHOẢN
    // =====================================================
    $(document).on('click', '.btn-toggle-status', function () {
        const userId = $(this).data('user-id');
        const isLocking = $(this).hasClass('btn-danger');
        const button = $(this);

        Swal.fire({
            title: isLocking ? "Bạn có chắc muốn khóa tài khoản này?" : "Mở khóa tài khoản?",
            text: isLocking
                ? "Người dùng sẽ không thể đăng nhập sau khi bị khóa."
                : "Người dùng sẽ có thể đăng nhập lại sau khi mở khóa.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: isLocking ? "#d33" : "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: isLocking ? "Khóa ngay" : "Mở ngay",
            cancelButtonText: "Hủy",
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.post('/Admin/QuanLyTaiKhoan/ToggleAccountStatus', { userId: userId }, function (response) {
                    if (response.success) {
                        toastr.success(response.message, 'Thành công');

                        // Cập nhật giao diện nút
                        if (response.isActive) {
                            button.removeClass('btn-success').addClass('btn-danger');
                            button.text('Khóa tài khoản');
                            button.css({ 'padding-left': '', 'padding-right': '' });
                        } else {
                            button.removeClass('btn-danger').addClass('btn-success');
                            button.text('Mở tài khoản');
                            button.css({ 'padding-left': '15px', 'padding-right': '14px' });
                        }
                    } else {
                        toastr.error(response.message, 'Lỗi');
                    }
                }).fail(function () {
                    toastr.error('Có lỗi xảy ra khi xử lý yêu cầu!', 'Lỗi');
                });
            }
        });
    });
});