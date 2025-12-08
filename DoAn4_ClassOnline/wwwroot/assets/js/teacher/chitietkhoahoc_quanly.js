document.addEventListener('DOMContentLoaded', function () {
    // ===== TOGGLE HIỂN THỊ/ẨN MẬT KHẨU =====
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput_ChiTietQuanLy');
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
    const googleMeetLink = document.getElementById('googleMeetLink_ChiTietQuanLy');
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

// hiển thị thông tin sinh viên lên modal
// ✅ FUNCTION XEM HỒ SƠ SINH VIÊN (ĐÃ SỬA LỖI TYPO)
async function xemHoSoSinhVien(id) {
    try {
        const res = await fetch(`/Teacher/QuanLyKhoaHoc/ThongTinSinhVien?id=${id}`);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();

        if (result.success) {
            const d = result.sinhVien;
            document.getElementById('modal_avatar').src = d.avatar || '/assets/image/tải xuống.jpg';
            document.getElementById('modal_fullname').textContent = d.fullName || 'Chưa cập nhật';
            document.getElementById('modal_maso').textContent = d.maSo || 'Chưa có mã số';
            document.getElementById('modal_gioitinh').textContent = d.gioiTinh || 'Chưa cập nhật';
            document.getElementById('modal_ngaysinh').textContent = d.ngaySinh || 'Chưa cập nhật';
            document.getElementById('modal_email').textContent = d.email || 'Chưa cập nhật';
            document.getElementById('modal_phone').textContent = d.phoneNumber || 'Chưa cập nhật';
            document.getElementById('modal_khoa').textContent = d.tenKhoa || 'Chưa cập nhật';
            openModal('studentInfoModal_QuanLy');
        } else {
            showWarning_tc(result.message || 'Không thể tải thông tin sinh viên!');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showError_tc('Lỗi hệ thống!');
    }
}

async function capNhatKhoaHoc_QuanLy(id) {
    if (!validateKhoaHocForm()) return;
    try {
        let formData = new FormData();

        formData.append("KhoaHocId", id);
        formData.append("TenKhoaHoc", document.getElementById("tenKhoaHoc_ChiTietQuanLy").value);
        formData.append("KhoaId", document.getElementById("khoaId_ChiTietQuanLy").value);
        formData.append("HocKyId", document.getElementById("hocKyId_ChiTietQuanLy").value);
        formData.append("LinkHocOnline", document.getElementById("googleMeetLink_ChiTietQuanLy").value);
        formData.append("MatKhau", document.getElementById("passwordInput_ChiTietQuanLy").value);

        // ẢNH — nếu có chọn ảnh mới thì mới append
        let fileInput = document.getElementById("anhKhoaHoc_ChiTietQuanLy");
        if (fileInput.files.length > 0) {
            formData.append("AnhKhoaHoc", fileInput.files[0]);
        }

        const res = await fetch("/Teacher/QuanLyKhoaHoc/CapNhatKhoaHoc", {
            method: "POST",
            body: formData
        });

        const result = await res.json();

        if (result.success) {
            showSuccess_tc(result.message);
            setTimeout(() => location.reload(), 1000);
        } else {
            showWarning_tc(result.message);
        }

    } catch (err) {
        console.error(err);
        showError_tc("Lỗi hệ thống!");
    }
}

function showError_Update(id, message) {
    const element = document.getElementById(id);
    element.innerText = message;
    element.classList.remove("d-none");
}

function clearErrors_Update() {
    let errors = document.querySelectorAll("small.text-danger");
    errors.forEach(e => e.classList.add("d-none"));
}

function validateKhoaHocForm() {
    clearErrors_Update();

    let ten = document.getElementById("tenKhoaHoc_ChiTietQuanLy").value.trim();
    let link = document.getElementById("googleMeetLink_ChiTietQuanLy")?.value?.trim() || "";
    let password = document.getElementById("passwordInput_ChiTietQuanLy").value.trim();

    let check = true;

    if (ten === "") {
        showError_Update("err_tenKhoaHoc_ChiTietQuanLy", "Tên khóa học không được để trống!");
        check = false;
    }

    if (link !== "" && !/^https:\/\/meet\.google\.com\//.test(link)) {
        showError_Update("err_googleMeetLink_ChiTietQuanLy", "Vui lòng nhập đúng link Google Meet");
        check = false;
    }

    // Mật khẩu (tùy chọn nhưng nếu nhập phải đúng format)
    if (password !== "" && password.length < 6) {
        showError_Update("err_passwordInput_ChiTietQuanLy", "Mật khẩu phải có ít nhất 6 ký tự!");
        check = false;
    }

    return check;
}

//hàm xuất excel danh sách sinh viên
function xuatDanhSachSinhVien(khoaHocId) {
    const url = `/Teacher/QuanLyKhoaHoc/XuatDanhSachSinhVien?khoaHocId=${khoaHocId}`;

    // Tạo Loading
    const btn = event.target;
    const oldText = btn.innerHTML;
    btn.innerHTML = "Đang xuất...";
    btn.disabled = true;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(msg => {
                    showError_tc("Xuất danh sách thất bại!");
                    throw new Error(msg);
                });
            }
            return response.blob();
        })
        .then(blob => {
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `DanhSachSinhVien_${Date.now()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            showSuccess_tc("Xuất danh sách thành công!");
        })
        .catch(err => console.error(err))
        .finally(() => {
            // Reset nút
            btn.innerHTML = oldText;
            btn.disabled = false;
        });
}
