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

    // =====================================================
    // ⭐ XỬ LÝ PREVIEW ẢNH KHI CHỌN FILE
    // =====================================================
    $('#avatarInput').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra định dạng
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                toastr.error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)!', 'Lỗi');
                $(this).val('');
                return;
            }

            // Kiểm tra kích thước (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toastr.error('Kích thước ảnh không được vượt quá 5MB!', 'Lỗi');
                $(this).val('');
                return;
            }

            // Preview ảnh
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#avatarPreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // =====================================================
    // ⭐ HIỂN THỊ PREVIEW MÃ SỐ KHI CHỌN CHỨC VỤ
    // =====================================================
    $('#roleId').change(function() {
        const selectedOption = $(this).find('option:selected');
        const roleName = selectedOption.data('role-name');
        
        if (roleName) {
            let prefix = '';
            
            if (roleName === 'Student') {
                prefix = 'SV';
            } else if (roleName === 'Teacher') {
                prefix = 'GV';
            } else if (roleName === 'Admin') {
                prefix = 'AD';
            }
            
            if (prefix) {
               console.log("")
            } else {
                $('#maSoPreview').slideUp();
            }
        } else {
            $('#maSoPreview').slideUp();
        }
    });

    // =====================================================
    // ⭐ THÊM TÀI KHOẢN MỚI (CÓ UPLOAD ẢNH)
    // =====================================================
    $('#btnThem').click(function () {
        // Reset errors
        $('.text-danger').text('');
        
        // Lấy dữ liệu
        const fullName = $('#fullName').val().trim();
        const email = $('#email').val().trim();
        const phoneNumber = $('#phoneNumber').val().trim();
        const ngaySinhStr = $('#ngaySinh').val();
        const gioiTinh = $('#gioiTinh').val();
        const khoaId = parseInt($('#khoaId').val());
        const roleId = parseInt($('#roleId').val());
        const avatarFile = $('#avatarInput')[0].files[0];

        // Validate
        let isValid = true;

        // ⭐ KIỂM TRA HỌ VÀ TÊN - KHÔNG CHỨA KÝ TỰ ĐẶC BIỆT
        if (!fullName) {
            $('#errorFullName').text('Vui lòng nhập họ và tên!');
            isValid = false;
        } else if (!validateFullName(fullName)) {
            $('#errorFullName').text('Họ và tên không được chứa ký tự đặc biệt!');
            isValid = false;
        }

        if (!email) {
            $('#errorEmail').text('Vui lòng nhập email!');
            isValid = false;
        } else if (!validateEmail(email)) {
            $('#errorEmail').text('Email không hợp lệ!');
            isValid = false;
        }

        // ⭐ KIỂM TRA SỐ ĐIỆN THOẠI - PHẢI LÀ SỐ VÀ ĐỦ 10 CHỮ SỐ
        if (!phoneNumber) {
            $('#errorPhoneNumber').text('Vui lòng nhập số điện thoại!');
            isValid = false;
        } else if (!validatePhoneNumber(phoneNumber)) {
            $('#errorPhoneNumber').text('Số điện thoại phải là 10 chữ số!');
            isValid = false;
        }

        if (!gioiTinh || gioiTinh.trim() === '') {
            $('#errorGioiTinh').text('Vui lòng chọn giới tính!');
            isValid = false;
        }

        if (!khoaId || khoaId <= 0) {
            $('#errorKhoa').text('Vui lòng chọn khoa!');
            isValid = false;
        }

        if (!roleId || roleId <= 0) {
            $('#errorRole').text('Vui lòng chọn chức vụ!');
            isValid = false;
        }

        if (!isValid) return;

        // ⭐ TẠO FORMDATA ĐỂ UPLOAD FILE
        const formData = new FormData();
        formData.append('FullName', fullName);
        formData.append('Email', email);
        formData.append('PhoneNumber', phoneNumber || '');
        formData.append('GioiTinh', gioiTinh || '');
        formData.append('NgaySinh', ngaySinhStr || '');
        formData.append('KhoaId', khoaId);
        formData.append('RoleId', roleId);
        
        // Thêm file ảnh nếu có
        if (avatarFile) {
            formData.append('Avatar', avatarFile);
        }

        // Gọi API
        $.ajax({
            url: '/Admin/QuanLyTaiKhoan/CreateUser',
            type: 'POST',
            data: formData,
            processData: false,  // ⭐ QUAN TRỌNG: Không xử lý data
            contentType: false,   // ⭐ QUAN TRỌNG: Để browser tự set Content-Type
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thêm tài khoản thành công!',
                        html: `<p>${response.message}</p>`,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        $('#them').modal('hide');
                        resetForm();
                        location.reload();
                    });
                } else {
                    toastr.error(response.message, '');
                }
            },
            error: function () {
                toastr.error('Có lỗi xảy ra khi thêm tài khoản!', 'Lỗi');
            }
        });
    });

    // Reset form khi đóng modal
    $('#them').on('hidden.bs.modal', function () {
        resetForm();
    });

    function resetForm() {
        $('#fullName').val('');
        $('#email').val('');
        $('#phoneNumber').val('');
        $('#ngaySinh').val('');
        $('#gioiTinh').val('');
        $('#khoaId').val('');
        $('#roleId').val('');
        $('#avatarInput').val('');
        $('#avatarPreview').attr('src', '/assets/image/tải xuống.jpg');
        $('#maSoPreview').hide();
        $('.text-danger').text('');
    }

    // ⭐ HÀM VALIDATE EMAIL
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ⭐ HÀM VALIDATE HỌ VÀ TÊN - CHỈ CHO PHÉP CHỮ CÁI VÀ KHOẢNG TRẮNG
    function validateFullName(fullName) {
        // Cho phép chữ cái tiếng Việt có dấu, chữ cái tiếng Anh và khoảng trắng
        const re = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
        return re.test(fullName);
    }

    // ⭐ HÀM VALIDATE SỐ ĐIỆN THOẠI - PHẢI LÀ 10 CHỮ SỐ
    function validatePhoneNumber(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone);
    }
    // ... Phần code còn lại giữ nguyên (Live Search, Chi tiết, Khóa/Mở)
});