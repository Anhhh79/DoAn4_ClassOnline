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
            toastr.error('Không thể tải thông tin người dùng');
        }
    } catch (error) {
        console.error('Lỗi khi load profile:', error);
        toastr.error('Không thể kết nối đến server');
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
    
    // Thêm tên khoa vào input readonly
    setInputValue('khoaName_InforGiaoVien', user.tenKhoa || 'Chưa có khoa');

    // Giới tính
    if (user.gioiTinh) {
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => {
            radio.checked = (radio.value === user.gioiTinh);
        });
    }
}

// Helper function để set value an toàn VÀ KÍCH HOẠT EVENTS
function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.value = value;
        
        // ⭐ KÍCH HOẠT SỰ KIỆN ĐỂ FLATPICKR VÀ BOOTSTRAP NHẬN BIẾT ⭐
        // Trigger change event cho Flatpickr
        const changeEvent = new Event('change', { bubbles: true });
        element.dispatchEvent(changeEvent);
        
        // Trigger input event cho Bootstrap form-floating
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
        
        // ⭐ ĐẶC BIỆT CHO FLATPICKR: Set giá trị trực tiếp vào instance ⭐
        if (id === 'dob_GiaoVien' && element._flatpickr) {
            // Parse date từ format d/m/Y
            const dateParts = value.split('/');
            if (dateParts.length === 3) {
                const day = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                const year = parseInt(dateParts[2]);
                const dateObj = new Date(year, month, day);
                element._flatpickr.setDate(dateObj, true); // true = trigger change event
            }
        }
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
                toastr.error('Vui lòng chọn file ảnh!');
                return;
            }

            // Kiểm tra kích thước (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toastr.error('File ảnh không được vượt quá 5MB!');
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
        toastr.warning('Vui lòng nhập họ tên!');
        document.getElementById('firstName_InforGiaoVien')?.focus();
        return;
    }

    if (!formData.email) {
        toastr.warning('Vui lòng nhập email!');
        document.getElementById('email_InforGiaoVien')?.focus();
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        toastr.warning('Email không đúng định dạng!');
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
            // ⭐ THÔNG BÁO THÀNH CÔNG BẰNG TOASTR ⭐
            showSuccess_tc('Cập nhật thông tin thành công!', 'Thành công');

            // Cập nhật lại thông tin profile
            await loadUserProfile();

            // Trigger event để cập nhật danh sách khóa học
            const profileUpdatedEvent = new CustomEvent('profileUpdated', {
                detail: {
                    userInfo: result.user,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(profileUpdatedEvent);

            // Đóng modal sau 1.5 giây
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
                if (modal) modal.hide();
            }, 1500);
        } else {
            toastr.error(result.message || 'Không thể cập nhật thông tin', 'Lỗi');
        }
    } catch (error) {
        console.error('Error:', error);
        toastr.error('Có lỗi xảy ra khi cập nhật thông tin!', 'Lỗi');
    } finally {
        // Restore button
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText || 'Cập nhật';
        }
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
            toastr.success('Cập nhật ảnh đại diện thành công!');
            
            // Cập nhật avatar URL trong session
            await loadUserProfile();

            // Trigger event cũng cho upload avatar
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
            toastr.error('Upload avatar thất bại', 'Lỗi');
        }
    } catch (error) {
        console.error('Lỗi upload avatar:', error);
        toastr.error('Lỗi khi upload avatar', 'Lỗi');
    }
}