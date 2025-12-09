// ⭐ XỬ LÝ CẬP NHẬT THÔNG TIN CÁ NHÂN ⭐
document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            console.log('🔵 Save button clicked');
            
            const fullName = document.getElementById('firstName_InforSinhVien')?.value?.trim();
            const phone = document.getElementById('phone_InforSinhVien')?.value?.trim();
            const gioiTinh = document.querySelector('input[name="gender"]:checked')?.value;
            
            console.log('📝 Form data:', { fullName, phone, gioiTinh });
            
            // Validation
            if (!fullName) {
                // ⭐ SỬ DỤNG SWEETALERT2 THAY VÌ ALERT ⭐
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin!',
                    text: 'Vui lòng nhập họ và tên!',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#0d6efd'
                });
                return;
            }
            
            // Show loading với SweetAlert2
            Swal.fire({
                title: 'Đang lưu...',
                html: '<div class="spinner-border text-primary mb-3" role="status"></div><p>Vui lòng đợi...</p>',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            try {
                console.log('📤 Sending update request...');
                
                const response = await fetch('/Student/Profile/UpdateProfile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullName: fullName,
                        phoneNumber: phone || '',
                        gioiTinh: gioiTinh || ''
                    })
                });
                
                console.log('📥 Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('📥 Response data:', data);
                
                Swal.close();
                
                if (data.success) {
                    // ⭐ HIỂN THỊ THÔNG BÁO THÀNH CÔNG ĐẸP ⭐
                    await Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: data.message || 'Đã cập nhật thông tin cá nhân thành công!',
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true
                    });
                    
                    // Update display name in modal
                    const displayName = document.getElementById('displayName');
                    if (displayName) {
                        displayName.textContent = fullName;
                    }
                    
                    // Update header name
                    const headerName = document.querySelector('.fw-semibold');
                    if (headerName && headerName.textContent !== 'Thông tin cá nhân') {
                        headerName.textContent = fullName;
                    }
                    
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
                    if (modal) {
                        modal.hide();
                    }
                    
                    // Reload page
                    location.reload();
                } else {
                    // ⭐ HIỂN THỊ LỖI ĐẸP ⭐
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: data.message || 'Không thể cập nhật thông tin',
                        confirmButtonText: 'Đóng',
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (error) {
                console.error('❌ Update error:', error);
                
                Swal.close();
                
                // ⭐ HIỂN THỊ LỖI MẠNG ĐẸP ⭐
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi kết nối!',
                    html: `
                        <p>Có lỗi xảy ra khi cập nhật thông tin:</p>
                        <code class="d-block bg-light p-2 rounded mt-2">${error.message}</code>
                    `,
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#dc3545'
                });
            }
        });
    } else {
        console.warn('⚠️ Save button not found!');
    }
});

// ⭐ XỬ LÝ UPLOAD AVATAR (OPTIONAL) ⭐
document.addEventListener('DOMContentLoaded', function() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Kiểm tra kích thước file (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'File quá lớn!',
                        text: 'Vui lòng chọn ảnh có kích thước nhỏ hơn 5MB',
                        confirmButtonText: 'Đóng',
                        confirmButtonColor: '#ffc107'
                    });
                    return;
                }
                
                // Kiểm tra định dạng file
                if (!file.type.startsWith('image/')) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Định dạng không hợp lệ!',
                        text: 'Vui lòng chọn file ảnh (jpg, png, gif...)',
                        confirmButtonText: 'Đóng',
                        confirmButtonColor: '#ffc107'
                    });
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                    
                    // Hiển thị thông báo nhỏ
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                    
                    Toast.fire({
                        icon: 'info',
                        title: 'Ảnh đã được chọn'
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

