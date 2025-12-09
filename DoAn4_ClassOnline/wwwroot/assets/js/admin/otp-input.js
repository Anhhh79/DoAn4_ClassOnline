// ==================== OTP INPUT HANDLER ====================
// File: otp-input.js
// Description: Xử lý tự động focus và paste cho OTP input

/**
 * Khởi tạo OTP input handler
 */
function initOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');

    if (otpInputs.length === 0) {
        console.warn('⚠️ No OTP inputs found');
        return;
    }

    otpInputs.forEach((input, index) => {
        // Chỉ cho phép nhập số
        input.addEventListener('input', function (e) {
            const value = e.target.value;

            // Xóa ký tự không phải số
            if (!/^\d*$/.test(value)) {
                e.target.value = '';
                return;
            }

            // Tự động chuyển sang ô tiếp theo
            if (value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // Xử lý phím Backspace
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }

            // Enter để submit
            if (e.key === 'Enter') {
                e.preventDefault();
                const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
                if (allFilled) {
                    document.querySelector('#modalCodeXacNhan button[data-bs-target="#modalNhapmatkhaumoi"]').click();
                }
            }
        });

        // Xử lý paste
        input.addEventListener('paste', function (e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

            for (let i = 0; i < pastedData.length && index + i < otpInputs.length; i++) {
                otpInputs[index + i].value = pastedData[i];
            }

            // Focus vào ô cuối cùng được điền
            const lastFilledIndex = Math.min(index + pastedData.length, otpInputs.length - 1);
            otpInputs[lastFilledIndex].focus();
        });

        // Tự động select khi focus
        input.addEventListener('focus', function () {
            this.select();
        });
    });

    console.log('✅ OTP inputs initialized');
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', initOTPInputs);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initOTPInputs };
}