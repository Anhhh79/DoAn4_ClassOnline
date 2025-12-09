// ==================== FORGOT PASSWORD FUNCTIONALITY ====================
// File: forgot-password.js
// Description: Xử lý chức năng quên mật khẩu với OTP

let userEmail = ''; // Lưu email để dùng cho các bước sau

// ==================== HELPER FUNCTIONS ====================

/**
 * Kiểm tra email hợp lệ
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} - True nếu email hợp lệ
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Hiển thị loading với SweetAlert2
 * @param {string} title - Tiêu đề loading
 */
function showLoading(title = 'Đang xử lý...') {
    Swal.fire({
        title: title,
        html: 'Vui lòng đợi',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Nội dung thông báo
 * @param {number} timer - Thời gian tự động đóng (ms)
 */
function showSuccess(message, timer = 2000) {
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        timer: timer,
        showConfirmButton: timer ? false : true
    });
}

/**
 * Hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo lỗi
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: message
    });
}

/**
 * Reset form và error messages
 */
function resetForms() {
    document.getElementById('emailFogetPassword').value = '';
    document.getElementById('matKhauMoi_QMK').value = '';
    document.getElementById('xacNhanMatKhauMoi_QMK').value = '';

    document.getElementById('emailFogetPasswordError').textContent = '';
    document.getElementById('matKhauMoi_QMKError').textContent = '';
    document.getElementById('xacNhanMatKhauMoi_QMKError').textContent = '';
    document.getElementById('otpError').textContent = '';

    document.querySelectorAll('.otp-input').forEach(input => input.value = '');
}

// ==================== STEP 1: SEND OTP ====================

/**
 * Gửi mã OTP đến email
 */
async function sendOTP() {
    const email = document.getElementById('emailFogetPassword').value.trim();
    const errorSpan = document.getElementById('emailFogetPasswordError');

    // Validation
    if (!email) {
        errorSpan.textContent = 'Vui lòng nhập email!';
        errorSpan.classList.add('d-block');
        return false;
    }

    if (!isValidEmail(email)) {
        errorSpan.textContent = 'Email không hợp lệ!';
        errorSpan.classList.add('d-block');
        return false;
    }

    errorSpan.textContent = '';
    errorSpan.classList.remove('d-block');
    showLoading('Đang kiểm tra email và gửi mã OTP...');

    try {
        const response = await fetch('/Admin/DangNhap/SendOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
            userEmail = email; // Lưu email

            // ✅ CHỈ ĐÓNG MODAL KHI GỬI OTP THÀNH CÔNG
            const forgotModal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
            if (forgotModal) {
                forgotModal.hide();
            }

            // ✅ CHỈ MỞ MODAL OTP KHI ĐÃ GỬI THÀNH CÔNG
            setTimeout(() => {
                const otpModal = new bootstrap.Modal(document.getElementById('modalCodeXacNhan'));
                otpModal.show();
                
                // Focus vào ô OTP đầu tiên
                setTimeout(() => {
                    const firstOtpInput = document.querySelector('.otp-input');
                    if (firstOtpInput) firstOtpInput.focus();
                }, 300);
            }, 300);

            showSuccess(data.message);
            return true;
        } else {
            // ❌ KHÔNG CHUYỂN MODAL KHI CÓ LỖI
            showError(data.message);
            return false;
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
        return false;
    }
}

// ==================== STEP 2: VERIFY OTP ====================

/**
 * Xác thực mã OTP
 */
async function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    const errorDiv = document.getElementById('otpError');

    // Validation
    if (otp.length !== 6) {
        errorDiv.textContent = 'Vui lòng nhập đủ 6 số!';
        errorDiv.classList.add('d-block');
        
        // Highlight các ô chưa nhập
        otpInputs.forEach(input => {
            if (!input.value) {
                input.classList.add('border-danger');
            }
        });
        
        return false;
    }

    // Reset border color
    otpInputs.forEach(input => {
        input.classList.remove('border-danger');
    });

    errorDiv.textContent = '';
    errorDiv.classList.remove('d-block');
    showLoading('Đang xác thực mã OTP...');

    try {
        const response = await fetch('/Admin/DangNhap/VerifyOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userEmail,
                otp: otp
            })
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
            // ✅ CHỈ ĐÓNG MODAL KHI XÁC THỰC THÀNH CÔNG
            const otpModal = bootstrap.Modal.getInstance(document.getElementById('modalCodeXacNhan'));
            if (otpModal) {
                otpModal.hide();
            }

            // ✅ CHỈ MỞ MODAL PASSWORD KHI ĐÃ XÁC THỰC THÀNH CÔNG
            setTimeout(() => {
                const passwordModal = new bootstrap.Modal(document.getElementById('modalNhapmatkhaumoi'));
                passwordModal.show();
                
                // Focus vào ô mật khẩu mới
                setTimeout(() => {
                    const passwordInput = document.getElementById('matKhauMoi_QMK');
                    if (passwordInput) passwordInput.focus();
                }, 300);
            }, 300);

            // Xóa OTP đã nhập
            otpInputs.forEach(input => input.value = '');
            
            return true;
        } else {
            // ❌ KHÔNG CHUYỂN MODAL KHI OTP SAI
            showError(data.message);
            
            // Xóa OTP đã nhập để nhập lại
            otpInputs.forEach(input => {
                input.value = '';
                input.classList.add('border-danger');
            });
            
            // Focus vào ô đầu tiên
            if (otpInputs[0]) otpInputs[0].focus();
            
            return false;
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
        return false;
    }
}

// ==================== STEP 3: RESET PASSWORD ====================

/**
 * Đặt lại mật khẩu mới
 */
async function resetPassword() {
    const newPassword = document.getElementById('matKhauMoi_QMK').value;
    const confirmPassword = document.getElementById('xacNhanMatKhauMoi_QMK').value;
    const errorPassword = document.getElementById('matKhauMoi_QMKError');
    const errorConfirm = document.getElementById('xacNhanMatKhauMoi_QMKError');

    // Reset errors
    errorPassword.textContent = '';
    errorConfirm.textContent = '';
    document.getElementById('matKhauMoi_QMK').classList.remove('border-danger');
    document.getElementById('xacNhanMatKhauMoi_QMK').classList.remove('border-danger');

    // Validation
    let hasError = false;
    
    if (!newPassword) {
        errorPassword.textContent = 'Vui lòng nhập mật khẩu mới!';
        errorPassword.classList.add('d-block');
        document.getElementById('matKhauMoi_QMK').classList.add('border-danger');
        hasError = true;
    } else if (newPassword.length < 6) {
        errorPassword.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
        errorPassword.classList.add('d-block');
        document.getElementById('matKhauMoi_QMK').classList.add('border-danger');
        hasError = true;
    }

    if (!confirmPassword) {
        errorConfirm.textContent = 'Vui lòng xác nhận mật khẩu!';
        errorConfirm.classList.add('d-block');
        document.getElementById('xacNhanMatKhauMoi_QMK').classList.add('border-danger');
        hasError = true;
    } else if (newPassword !== confirmPassword) {
        errorConfirm.textContent = 'Mật khẩu xác nhận không khớp!';
        errorConfirm.classList.add('d-block');
        document.getElementById('xacNhanMatKhauMoi_QMK').classList.add('border-danger');
        hasError = true;
    }

    if (hasError) {
        return false;
    }

    showLoading('Đang đặt lại mật khẩu...');

    try {
        const response = await fetch('/Admin/DangNhap/ResetPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userEmail,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            })
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
            // Đóng modal
            const passwordModal = bootstrap.Modal.getInstance(document.getElementById('modalNhapmatkhaumoi'));
            if (passwordModal) {
                passwordModal.hide();
            }

            // Reset forms
            resetForms();

            // Hiển thị thông báo thành công
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: data.message,
                confirmButtonText: 'Đăng nhập ngay',
                confirmButtonColor: '#0d6efd'
            }).then(() => {
                // Tự động điền email vào form đăng nhập
                const emailInput = document.querySelector('input[name="email"]');
                if (emailInput) {
                    emailInput.value = userEmail;
                    const passwordInput = document.querySelector('input[name="password"]');
                    if (passwordInput) passwordInput.focus();
                }
            });
            
            return true;
        } else {
            showError(data.message);
            return false;
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
        return false;
    }
}

// ==================== RESEND OTP ====================

/**
 * Gửi lại mã OTP
 */
async function resendOTP() {
    if (!userEmail) {
        showError('Không tìm thấy email. Vui lòng thử lại từ đầu!');
        
        // Đóng modal OTP và quay về modal nhập email
        const otpModal = bootstrap.Modal.getInstance(document.getElementById('modalCodeXacNhan'));
        if (otpModal) {
            otpModal.hide();
        }
        
        setTimeout(() => {
            const forgotModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
            forgotModal.show();
        }, 300);
        
        return false;
    }

    showLoading('Đang gửi lại mã OTP...');

    try {
        const response = await fetch('/Admin/DangNhap/ResendOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
            showSuccess('Mã OTP mới đã được gửi đến email của bạn!');

            // Xóa OTP cũ
            const otpInputs = document.querySelectorAll('.otp-input');
            otpInputs.forEach(input => {
                input.value = '';
                input.classList.remove('border-danger');
            });
            
            // Focus vào ô đầu tiên
            if (otpInputs[0]) otpInputs[0].focus();
            
            return true;
        } else {
            showError(data.message);
            return false;
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
        return false;
    }
}

// ==================== EVENT LISTENERS ====================

/**
 * Khởi tạo các event listener khi DOM đã load
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ Forgot Password module loaded');

    // ⭐ Button: Gửi OTP - NGĂN CHẶN CHUYỂN MODAL TỰ ĐỘNG
    const btnSendOTP = document.querySelector('#forgotPasswordModal button[data-bs-toggle="modal"]');
    if (btnSendOTP) {
        // Xóa attribute data-bs-toggle để không tự động chuyển modal
        btnSendOTP.removeAttribute('data-bs-toggle');
        btnSendOTP.removeAttribute('data-bs-target');
        
        btnSendOTP.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            await sendOTP();
        });
    }

    // ⭐ Button: Xác thực OTP - NGĂN CHẶN CHUYỂN MODAL TỰ ĐỘNG
    const btnVerifyOTP = document.querySelector('#modalCodeXacNhan button[data-bs-toggle="modal"]');
    if (btnVerifyOTP) {
        // Xóa attribute data-bs-toggle để không tự động chuyển modal
        btnVerifyOTP.removeAttribute('data-bs-toggle');
        btnVerifyOTP.removeAttribute('data-bs-target');
        
        btnVerifyOTP.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            await verifyOTP();
        });
    }

    // Button: Đặt lại mật khẩu
    const btnResetPassword = document.querySelector('#modalNhapmatkhaumoi button.btn');
    if (btnResetPassword) {
        btnResetPassword.addEventListener('click', async function (e) {
            e.preventDefault();
            await resetPassword();
        });
    }

    // Link: Gửi lại OTP
    const linkResendOTP = document.querySelector('#modalCodeXacNhan a .text-primary');
    if (linkResendOTP && linkResendOTP.parentElement) {
        linkResendOTP.parentElement.addEventListener('click', async function (e) {
            e.preventDefault();
            await resendOTP();
        });
    }

    // Enter key support
    document.getElementById('emailFogetPassword')?.addEventListener('keypress', async function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            await sendOTP();
        }
    });

    document.getElementById('matKhauMoi_QMK')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('xacNhanMatKhauMoi_QMK').focus();
        }
    });

    document.getElementById('xacNhanMatKhauMoi_QMK')?.addEventListener('keypress', async function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            await resetPassword();
        }
    });
    
    // ⭐ XÓA BORDER-DANGER KHI NHẬP LẠI
    document.getElementById('emailFogetPassword')?.addEventListener('input', function() {
        this.classList.remove('border-danger');
        document.getElementById('emailFogetPasswordError').textContent = '';
    });
    
    document.getElementById('matKhauMoi_QMK')?.addEventListener('input', function() {
        this.classList.remove('border-danger');
        document.getElementById('matKhauMoi_QMKError').textContent = '';
    });
    
    document.getElementById('xacNhanMatKhauMoi_QMK')?.addEventListener('input', function() {
        this.classList.remove('border-danger');
        document.getElementById('xacNhanMatKhauMoi_QMKError').textContent = '';
    });
    
    // ⭐ XÓA BORDER-DANGER CHO OTP INPUTS
    document.querySelectorAll('.otp-input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('border-danger');
            document.getElementById('otpError').textContent = '';
        });
    });
});

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendOTP,
        verifyOTP,
        resetPassword,
        resendOTP,
        isValidEmail
    };
}