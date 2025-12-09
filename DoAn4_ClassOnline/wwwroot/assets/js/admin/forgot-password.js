// ==================== FORGOT PASSWORD FUNCTIONALITY ====================
// File: forgot-password.js
// Description: Xử lý chức năng quên mật khẩu với OTP và countdown timer

let userEmail = ''; // Lưu email để dùng cho các bước sau
let countdownInterval = null; // Biến lưu interval của countdown
let otpExpiryTime = null; // Thời gian hết hạn OTP

// ==================== COUNTDOWN TIMER ====================

/**
 * Bắt đầu đếm ngược 5 phút
 */
function startCountdown() {
    // Xóa countdown cũ nếu có
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Đặt thời gian hết hạn (5 phút = 300 giây)
    const duration = 5 * 60; // 300 seconds
    otpExpiryTime = Date.now() + (duration * 1000);

    const timerElement = document.getElementById('countdownTimer');
    const countdownBadge = document.getElementById('otpCountdown');
    const verifyButton = document.getElementById('btnVerifyOTP');
    const resendLink = document.getElementById('resendOTPLink');

    // Cập nhật mỗi giây
    countdownInterval = setInterval(() => {
        const remainingTime = Math.floor((otpExpiryTime - Date.now()) / 1000);

        if (remainingTime <= 0) {
            // Hết thời gian
            clearInterval(countdownInterval);
            timerElement.textContent = '00:00';
            countdownBadge.classList.remove('bg-primary');
            countdownBadge.classList.add('bg-danger');
            
            // Disable nút xác nhận
            verifyButton.disabled = true;
            verifyButton.classList.add('opacity-50');
            
            // Hiển thị thông báo
            document.getElementById('otpError').textContent = 'Mã OTP đã hết hạn. Vui lòng gửi lại!';
            
            // Disable tất cả input OTP
            document.querySelectorAll('.otp-input').forEach(input => {
                input.disabled = true;
                input.classList.add('bg-light');
            });
            
            return;
        }

        // Tính phút và giây
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        // Format: MM:SS
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerElement.textContent = formattedTime;

        // Đổi màu khi còn dưới 1 phút
        if (remainingTime <= 60) {
            countdownBadge.classList.remove('bg-primary');
            countdownBadge.classList.add('bg-warning', 'text-dark');
        }

        // Đổi màu khi còn dưới 30 giây
        if (remainingTime <= 30) {
            countdownBadge.classList.remove('bg-warning');
            countdownBadge.classList.add('bg-danger', 'text-white');
        }
    }, 1000);
}

/**
 * Dừng và reset countdown
 */
function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    const timerElement = document.getElementById('countdownTimer');
    const countdownBadge = document.getElementById('otpCountdown');
    
    if (timerElement) {
        timerElement.textContent = '05:00';
    }
    
    if (countdownBadge) {
        countdownBadge.classList.remove('bg-warning', 'bg-danger', 'text-dark');
        countdownBadge.classList.add('bg-primary');
    }
}

/**
 * Reset OTP inputs và button
 */
function resetOTPInputs() {
    const verifyButton = document.getElementById('btnVerifyOTP');
    const otpInputs = document.querySelectorAll('.otp-input');
    
    // Enable button
    if (verifyButton) {
        verifyButton.disabled = false;
        verifyButton.classList.remove('opacity-50');
    }
    
    // Enable và clear inputs
    otpInputs.forEach(input => {
        input.disabled = false;
        input.value = '';
        input.classList.remove('bg-light', 'border-danger');
    });
    
    // Clear error
    const errorDiv = document.getElementById('otpError');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Kiểm tra email hợp lệ
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Hiển thị loading với SweetAlert2
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
 */
function showSuccess(message, timer = 2000) {
    Swal.fire({
        icon: 'success',
        text: message,
        timer: timer,
        showConfirmButton: timer ? false : true
    });
}

/**
 * Hiển thị thông báo lỗi
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
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

    resetOTPInputs();
    stopCountdown();
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
            userEmail = email;

            // Đóng modal forgot password
            const forgotModal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
            if (forgotModal) {
                forgotModal.hide();
            }

            // Mở modal OTP
            setTimeout(() => {
                const otpModal = new bootstrap.Modal(document.getElementById('modalCodeXacNhan'));
                otpModal.show();
                
                // ⭐ BẮT ĐẦU ĐẾM NGƯỢC
                resetOTPInputs();
                startCountdown();
                
                // Focus vào ô OTP đầu tiên
                setTimeout(() => {
                    const firstOtpInput = document.querySelector('.otp-input');
                    if (firstOtpInput) firstOtpInput.focus();
                }, 300);
            }, 300);

            showSuccess(data.message);
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

// ==================== STEP 2: VERIFY OTP ====================

/**
 * Xác thực mã OTP
 */
async function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    const errorDiv = document.getElementById('otpError');

    // Kiểm tra thời gian còn lại
    if (otpExpiryTime && Date.now() >= otpExpiryTime) {
        errorDiv.textContent = 'Mã OTP đã hết hạn. Vui lòng gửi lại!';
        errorDiv.classList.add('d-block');
        return false;
    }

    // Validation
    if (otp.length !== 6) {
        errorDiv.textContent = 'Vui lòng nhập đủ 6 số!';
        errorDiv.classList.add('d-block');
        
        otpInputs.forEach(input => {
            if (!input.value) {
                input.classList.add('border-danger');
            }
        });
        
        return false;
    }

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
            // ⭐ DỪNG ĐẾM NGƯỢC KHI XÁC THỰC THÀNH CÔNG
            stopCountdown();
            
            const otpModal = bootstrap.Modal.getInstance(document.getElementById('modalCodeXacNhan'));
            if (otpModal) {
                otpModal.hide();
            }

            setTimeout(() => {
                const passwordModal = new bootstrap.Modal(document.getElementById('modalNhapmatkhaumoi'));
                passwordModal.show();
                
                setTimeout(() => {
                    const passwordInput = document.getElementById('matKhauMoi_QMK');
                    if (passwordInput) passwordInput.focus();
                }, 300);
            }, 300);

            resetOTPInputs();
            return true;
        } else {
            showError(data.message);
            
            otpInputs.forEach(input => {
                input.value = '';
                input.classList.add('border-danger');
            });
            
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
            const passwordModal = bootstrap.Modal.getInstance(document.getElementById('modalNhapmatkhaumoi'));
            if (passwordModal) {
                passwordModal.hide();
            }

            resetForms();

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: data.message,
                confirmButtonText: 'Đăng nhập ngay',
                confirmButtonColor: '#0d6efd'
            }).then(() => {
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

            // ⭐ RESET VÀ BẮT ĐẦU ĐẾM NGƯỢC LẠI
            resetOTPInputs();
            startCountdown();
            
            // Focus vào ô đầu tiên
            const otpInputs = document.querySelectorAll('.otp-input');
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

document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ Forgot Password module with countdown loaded');

    // Button: Gửi OTP
    const btnSendOTP = document.querySelector('#forgotPasswordModal button[data-bs-toggle="modal"]');
    if (btnSendOTP) {
        btnSendOTP.removeAttribute('data-bs-toggle');
        btnSendOTP.removeAttribute('data-bs-target');
        
        btnSendOTP.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            await sendOTP();
        });
    }

    // Button: Xác thực OTP
    const btnVerifyOTP = document.querySelector('#modalCodeXacNhan button[data-bs-toggle="modal"]');
    if (btnVerifyOTP) {
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
    const linkResendOTP = document.getElementById('resendOTPLink');
    if (linkResendOTP) {
        linkResendOTP.addEventListener('click', async function (e) {
            e.preventDefault();
            await resendOTP();
        });
    }

    // ⭐ DỪNG COUNTDOWN KHI ĐÓNG MODAL OTP
    const otpModal = document.getElementById('modalCodeXacNhan');
    if (otpModal) {
        otpModal.addEventListener('hidden.bs.modal', function () {
            stopCountdown();
            resetOTPInputs();
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
    
    // Xóa border-danger khi nhập lại
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
    
    document.querySelectorAll('.otp-input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('border-danger');
            document.getElementById('otpError').textContent = '';
        });
    });
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendOTP,
        verifyOTP,
        resetPassword,
        resendOTP,
        isValidEmail,
        startCountdown,
        stopCountdown
    };
}