document.addEventListener('DOMContentLoaded', function () {
    // ===== TOGGLE HIỂN THỊ/ẨN MẬT KHẨU =====
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');

    if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
        togglePasswordBtn.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Chuyển đổi icon
            if (type === 'password') {
                togglePasswordIcon.classList.remove('bi-eye-slash');
                togglePasswordIcon.classList.add('bi-eye');
            } else {
                togglePasswordIcon.classList.remove('bi-eye');
                togglePasswordIcon.classList.add('bi-eye-slash');
            }
        });
    }

    // ===== COPY LINK GOOGLE MEET =====
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const googleMeetLink = document.getElementById('googleMeetLink');
    const copyLinkIcon = document.getElementById('copyLinkIcon');

    if (copyLinkBtn && googleMeetLink && copyLinkIcon) {
        copyLinkBtn.addEventListener('click', async function () {
            const linkValue = googleMeetLink.value.trim();

            if (!linkValue) {
                showWarning_tc('Không có link để copy!');
                return;
            }

            try {
                // Sử dụng Clipboard API (modern browsers)
                await navigator.clipboard.writeText(linkValue);

                // Đổi icon thành check
                copyLinkIcon.classList.remove('bi-clipboard');
                copyLinkIcon.classList.add('bi-check2');
                copyLinkBtn.classList.remove('btn-outline-primary');
                copyLinkBtn.classList.add('btn-success');

                // Reset lại icon sau 2 giây
                setTimeout(function () {
                    copyLinkIcon.classList.remove('bi-check2');
                    copyLinkIcon.classList.add('bi-clipboard');
                    copyLinkBtn.classList.remove('btn-success');
                    copyLinkBtn.classList.add('btn-outline-primary');
                }, 2000);

            } catch (err) {
                // Fallback cho trình duyệt cũ
                googleMeetLink.select();
                document.execCommand('copy');
                showSuccess_tc("Đã sao chép link!")
            }
        });
    }

    // Tìm kiếm sinh viên theo tên hoặc mã s
        const searchInput = document.querySelector('.input-group input[placeholder="Tìm theo tên hoặc mã..."]');
        const tableBody = document.querySelector('tbody');
        const rows = Array.from(tableBody.querySelectorAll('tr'));

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            let visibleCount = 0;

            rows.forEach(function (row) {
                // Lấy tên sinh viên từ cột thứ 2
                const tenSinhVien = row.querySelector('td:nth-child(2) .fw-semibold')?.textContent.toLowerCase() || '';
                // Lấy mã số sinh viên từ cột thứ 3
                const maSoSinhVien = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';

                // Kiểm tra nếu tên hoặc mã số chứa từ khóa tìm kiếm
                if (tenSinhVien.includes(searchTerm) || maSoSinhVien.includes(searchTerm)) {
                    row.style.display = '';
                    visibleCount++;
                    // Cập nhật lại STT
                    row.querySelector('td:first-child').textContent = visibleCount;
                } else {
                    row.style.display = 'none';
                }
            });

            // Hiển thị thông báo nếu không tìm thấy kết quả
            const existingMessage = tableBody.querySelector('.no-results-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            if (visibleCount === 0 && searchTerm !== '') {
                const noResultRow = document.createElement('tr');
                noResultRow.className = 'no-results-message';
                noResultRow.innerHTML = '<td colspan="6" class="text-center text-muted py-4"><i class="bi bi-search me-2"></i>Không tìm thấy sinh viên nào</td>';
                tableBody.appendChild(noResultRow);
            }
        });
});

