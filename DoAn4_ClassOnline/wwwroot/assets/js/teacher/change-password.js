// ==================== ĐỔI MẬT KHẨU ====================

/**
 * Toggle hiển thị/ẩn mật khẩu
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(`${inputId}-icon`);

    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

/**
 * Xóa error messages
 */
function clearPasswordErrors() {
    ['oldPassword', 'newPassword', 'confirmPassword'].forEach(id => {
        const input = document.getElementById(id);
        const error = document.getElementById(`${id}Error`);
        
        if (input) {
            input.classList.remove('is-invalid', 'border-danger');
        }
        if (error) {
            error.textContent = '';
            error.style.display = 'none';
        }
    });
}

/**
 * Hiển thị lỗi validation
 */
function showPasswordError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}Error`);
    
    if (input) {
        input.classList.add('is-invalid', 'border-danger');
    }
    if (error) {
        error.textContent = message;
        error.style.display = 'block';
    }
}

/**
 * Submit form đổi mật khẩu
 */
async function submitChangePassword() {
    clearPasswordErrors();

    const oldPassword = document.getElementById('oldPassword')?.value.trim() || '';
    const newPassword = document.getElementById('newPassword')?.value.trim() || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value.trim() || '';

    // Validation
    let hasError = false;

    if (!oldPassword) {
        showPasswordError('oldPassword', 'Vui lòng nhập mật khẩu cũ!');
        hasError = true;
    }

    if (!newPassword) {
        showPasswordError('newPassword', 'Vui lòng nhập mật khẩu mới!');
        hasError = true;
    } else if (newPassword.length < 6) {
        showPasswordError('newPassword', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
        hasError = true;
    }

    if (!confirmPassword) {
        showPasswordError('confirmPassword', 'Vui lòng xác nhận mật khẩu mới!');
        hasError = true;
    } else if (newPassword !== confirmPassword) {
        showPasswordError('confirmPassword', 'Mật khẩu xác nhận không khớp!');
        hasError = true;
    }

    if (hasError) return;

    // Hiển thị loading
    Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch('/Admin/DoiMatKhau/ChangePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            })
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
            // ⭐ ĐÓNG MODAL BẰNG BOOTSTRAP API
            const modalElement = document.getElementById('changePasswordModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

            // Reset form
            document.getElementById('changePasswordForm')?.reset();
            clearPasswordErrors();

            // ⭐ XÓA BACKDROP THỦ CÔNG NẾU CÒN TỒN TẠI
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
            document.body.style.removeProperty('overflow');

            // Hiển thị thông báo thành công và redirect về login
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: data.message,
                allowOutsideClick: false,
                customClass: {
                    title: 'swal2-title-large'  // Chỉ title to
                }
            }).then(() => {
                cosole.log('Redirecting to login page...');
            });
        } else {
            Swal.fire({
                icon: 'error',
                text: data.message
            });
        }
    } catch (error) {
        Swal.close();
        
        // ⭐ XÓA BACKDROP TRONG TRƯỜNG HỢP LỖI
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
        
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Có lỗi xảy ra: ' + error.message
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Reset form khi đóng modal
    const changePasswordModal = document.getElementById('changePasswordModal');
    if (changePasswordModal) {
        changePasswordModal.addEventListener('hidden.bs.modal', function () {
            // Reset form
            const form = document.getElementById('changePasswordForm');
            if (form) form.reset();
            
            clearPasswordErrors();
            
            // Reset tất cả input về type password
            ['oldPassword', 'newPassword', 'confirmPassword'].forEach(id => {
                const input = document.getElementById(id);
                const icon = document.getElementById(`${id}-icon`);
                if (input) input.type = 'password';
                if (icon) {
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
            });

            // ⭐ ĐẢM BẢO XÓA BACKDROP
            setTimeout(() => {
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('padding-right');
                document.body.style.removeProperty('overflow');
            }, 100);
        });
    }

    // Xóa error khi người dùng bắt đầu nhập
    ['oldPassword', 'newPassword', 'confirmPassword'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function () {
                this.classList.remove('is-invalid', 'border-danger');
                const error = document.getElementById(`${id}Error`);
                if (error) {
                    error.textContent = '';
                    error.style.display = 'none';
                }
            });
        }
    });

    // Enter key support
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitChangePassword();
            }
        });
    }
});