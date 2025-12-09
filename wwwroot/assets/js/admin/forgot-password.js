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
        return;
    }
    
    if (!isValidEmail(email)) {
        errorSpan.textContent = 'Email không hợp lệ!';
        return;
    }
    
    errorSpan.textContent = '';
    showLoading('Đang gửi mã OTP...');
    
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
            
            // Đóng modal hiện tại
            const forgotModal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
            forgotModal.hide();
            
            // Mở modal nhập OTP
            const otpModal = new bootstrap.Modal(document.getElementById('modalCodeXacNhan'));
            otpModal.show();
            
            showSuccess(data.message);
        } else {
            showError(data.message);
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
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
        return;
    }
    
    errorDiv.textContent = '';
    showLoading('Đang xác thực...');
    
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
            // Đóng modal OTP
            const otpModal = bootstrap.Modal.getInstance(document.getElementById('modalCodeXacNhan'));
            otpModal.hide();
            
            // Mở modal nhập mật khẩu mới
            const passwordModal = new bootstrap.Modal(document.getElementById('modalNhapmatkhaumoi'));
            passwordModal.show();
            
            // Xóa OTP đã nhập
            otpInputs.forEach(input => input.value = '');
        } else {
            showError(data.message);
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
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
    
    // Validation
    if (!newPassword) {
        errorPassword.textContent = 'Vui lòng nhập mật khẩu mới!';
        return;
    }
    
    if (newPassword.length < 6) {
        errorPassword.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
        return;
    }
    
    if (!confirmPassword) {
        errorConfirm.textContent = 'Vui lòng xác nhận mật khẩu!';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorConfirm.textContent = 'Mật khẩu xác nhận không khớp!';
        return;
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
            passwordModal.hide();
            
            // Reset forms
            resetForms();
            
            // Hiển thị thông báo thành công
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: data.message,
                confirmButtonText: 'Đăng nhập ngay'
            }).then(() => {
                // Tự động điền email vào form đăng nhập
                const emailInput = document.querySelector('input[name="email"]');
                if (emailInput) {
                    emailInput.value = userEmail;
                    document.querySelector('input[name="password"]').focus();
                }
            });
        } else {
            showError(data.message);
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
    }
}

// ==================== RESEND OTP ====================

/**
 * Gửi lại mã OTP
 */
async function resendOTP() {
    if (!userEmail) {
        showError('Không tìm thấy email. Vui lòng thử lại!');
        return;
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
            document.querySelectorAll('.otp-input').forEach(input => input.value = '');
            document.querySelectorAll('.otp-input')[0].focus();
        } else {
            showError(data.message);
        }
    } catch (error) {
        Swal.close();
        showError('Có lỗi xảy ra: ' + error.message);
    }
}

// ==================== EVENT LISTENERS ====================

/**
 * Khởi tạo các event listener khi DOM đã load
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Forgot Password module loaded');
    
    // Button: Gửi OTP
    const btnSendOTP = document.querySelector('#forgotPasswordModal button[data-bs-target="#modalCodeXacNhan"]');
    if (btnSendOTP) {
        btnSendOTP.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sendOTP();
        });
    }
    
    // Button: Xác thực OTP
    const btnVerifyOTP = document.querySelector('#modalCodeXacNhan button[data-bs-target="#modalNhapmatkhaumoi"]');
    if (btnVerifyOTP) {
        btnVerifyOTP.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            verifyOTP();
        });
    }
    
    // Button: Đặt lại mật khẩu
    const btnResetPassword = document.querySelector('#modalNhapmatkhaumoi button.btn');
    if (btnResetPassword) {
        btnResetPassword.addEventListener('click', function(e) {
            e.preventDefault();
            resetPassword();
        });
    }
    
    // Link: Gửi lại OTP
    const linkResendOTP = document.querySelector('#modalCodeXacNhan a .text-primary');
    if (linkResendOTP && linkResendOTP.parentElement) {
        linkResendOTP.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            resendOTP();
        });
    }
    
    // Enter key support
    document.getElementById('emailFogetPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendOTP();
        }
    });
    
    document.getElementById('xacNhanMatKhauMoi_QMK')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            resetPassword();
        }
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