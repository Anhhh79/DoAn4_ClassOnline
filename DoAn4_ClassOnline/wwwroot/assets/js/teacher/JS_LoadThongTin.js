// Load thông tin user khi trang load
document.addEventListener('DOMContentLoaded', function () {
    loadUserProfile();

    // Load lại khi mở modal
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.addEventListener('show.bs.modal', function () {
            loadUserProfile();
        });
    }

    // Xử lý upload avatar
    initAvatarUpload();

    // Xử lý nút cập nhật
    initSaveButton();
});

// Hàm load thông tin user từ Session qua API
async function loadUserProfile() {
    try {
        const response = await fetch('/Teacher/Profile/GetUserInfo', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải thông tin người dùng');
        }

        const data = await response.json();

        if (data.success && data.user) {
            populateProfileData(data.user);
        } else {
            console.error('Lỗi:', data.message);
            showNotification('Không thể tải thông tin người dùng', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi load profile:', error);
        showNotification('Không thể kết nối đến server', 'error');
    }
}

// Điền thông tin vào giao diện
function populateProfileData(user) {
    // Avatar header
    const headerAvatar = document.querySelector('#userDropdown img');
    if (headerAvatar && user.avatar) {
        headerAvatar.src = user.avatar;
        headerAvatar.onerror = function () {
            this.src = '/assets/image/tải xuống.jpg';
        };
    }

    // Tên và role trong header
    const headerName = document.querySelector('#userDropdown .fw-semibold');
    if (headerName && user.fullName) {
        headerName.textContent = user.fullName;
    }

    const headerRole = document.querySelector('#userDropdown .text-muted');
    if (headerRole && user.roleName) {
        headerRole.textContent = user.roleName;
    }

    // Modal - Avatar
    const avatarPreview = document.getElementById('avatarPreview_GiaoVien');
    if (avatarPreview && user.avatar) {
        avatarPreview.src = user.avatar;
        avatarPreview.onerror = function () {
            this.src = '/assets/image/tải xuống.jpg';
        };
    }

    // Modal - Display name và role
    const displayName = document.getElementById('displayName_GiaoVien');
    if (displayName && user.fullName) {
        displayName.textContent = user.fullName;
    }

    const displayRole = document.getElementById('displayRole_GiaoVien');
    if (displayRole && user.roleName) {
        displayRole.textContent = user.roleName;
    }

    // Form fields
    setInputValue('firstName_InforGiaoVien', user.fullName);
    setInputValue('dob_GiaoVien', user.ngaySinh);
    setInputValue('email_InforGiaoVien', user.email);
    setInputValue('phone_InforGiaoVien', user.phoneNumber);
    setInputValue('MSSV_InforGiaoVien', user.maSo);
    setInputValue('diaChi_InforGiaoVien', user.diaChi);
    
    // ⭐ THÊM TÊN KHOA VÀO INPUT READONLY ⭐
    setInputValue('khoaName_InforGiaoVien', user.tenKhoa || 'Chưa có khoa');

    // Giới tính
    if (user.gioiTinh) {
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => {
            radio.checked = (radio.value === user.gioiTinh);
        });
    }
}

// Helper function để set value an toàn
function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.value = value;
    }
}

// Khởi tạo xử lý upload avatar
function initAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput_GiaoVien');
    const avatarPreview = document.getElementById('avatarPreview_GiaoVien');

    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file
            if (!file.type.match('image.*')) {
                showNotification('Vui lòng chọn file ảnh!', 'error');
                return;
            }

            // Kiểm tra kích thước (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File ảnh không được vượt quá 5MB!', 'error');
                return;
            }

            // Preview ảnh
            const reader = new FileReader();
            reader.onload = function (e) {
                avatarPreview.src = e.target.result;

                // Cập nhật avatar trong header
                const headerAvatar = document.querySelector('#userDropdown img');
                if (headerAvatar) {
                    headerAvatar.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);

            // TODO: Upload ảnh lên server
            // uploadAvatar(file);
        });
    }
}

// Khởi tạo nút Save
function initSaveButton() {
    const saveBtn = document.getElementById('saveBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', async function () {
            await updateUserProfile();
        });
    }
}

// Cập nhật thông tin user
async function updateUserProfile() {
    // Lấy dữ liệu từ form
    const formData = {
        fullName: document.getElementById('firstName_InforGiaoVien')?.value?.trim() || '',
        ngaySinh: document.getElementById('dob_GiaoVien')?.value || '',
        email: document.getElementById('email_InforGiaoVien')?.value?.trim() || '',
        phoneNumber: document.getElementById('phone_InforGiaoVien')?.value?.trim() || '',
        gioiTinh: document.querySelector('input[name="gender"]:checked')?.value || '',
        diaChi: document.getElementById('diaChi_InforGiaoVien')?.value?.trim() || ''
    };

    // Validate
    if (!formData.fullName) {
        showNotification('Vui lòng nhập họ tên!', 'error');
        document.getElementById('firstName_InforGiaoVien')?.focus();
        return;
    }

    if (!formData.email) {
        showNotification('Vui lòng nhập email!', 'error');
        document.getElementById('email_InforGiaoVien')?.focus();
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showNotification('Email không đúng định dạng!', 'error');
        document.getElementById('email_InforGiaoVien')?.focus();
        return;
    }

    // Hiển thị loading
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn?.textContent;
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang lưu...';
    }

    try {
        const response = await fetch('/Teacher/Profile/UpdateUserInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('✓ Cập nhật thành công!', 'success');

            // Cập nhật lại thông tin profile
            await loadUserProfile();

            // ⭐ TRIGGER EVENT ĐỂ CẬP NHẬT DANH SÁCH KHÓA HỌC ⭐
            const profileUpdatedEvent = new CustomEvent('profileUpdated', {
                detail: {
                    userInfo: result.user,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(profileUpdatedEvent);

            // Đóng modal sau 1 giây
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
                if (modal) modal.hide();
            }, 1000);
        } else {
            showNotification('Lỗi: ' + (result.message || 'Không thể cập nhật'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Có lỗi xảy ra khi cập nhật thông tin!', 'error');
    } finally {
        // Restore button
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText || 'Cập nhật';
        }
    }
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const saveStatus = document.getElementById('saveStatus');
    if (saveStatus) {
        saveStatus.textContent = message;
        saveStatus.style.display = 'block';
        saveStatus.classList.remove('text-success', 'text-danger');
        saveStatus.classList.add(type === 'success' ? 'text-success' : 'text-danger');

        // Ẩn sau 3 giây
        setTimeout(() => {
            saveStatus.style.display = 'none';
        }, 3000);
    } else {
        // Fallback to alert
        alert(message);
    }
}

// Helper function để upload avatar (optional)
async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('/Teacher/Profile/UploadAvatar', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            console.log('Upload avatar thành công:', result.avatarUrl);
            // Cập nhật avatar URL trong session
            await loadUserProfile();

            // ⭐ TRIGGER EVENT CŨNG CHO UPLOAD AVATAR ⭐
            const profileUpdatedEvent = new CustomEvent('profileUpdated', {
                detail: {
                    userInfo: result.user,
                    timestamp: Date.now(),
                    type: 'avatar'
                }
            });
            document.dispatchEvent(profileUpdatedEvent);
        } else {
            console.error('Upload avatar thất bại:', result.message);
            showNotification('Upload avatar thất bại', 'error');
        }
    } catch (error) {
        console.error('Lỗi upload avatar:', error);
        showNotification('Lỗi khi upload avatar', 'error');
    }
}