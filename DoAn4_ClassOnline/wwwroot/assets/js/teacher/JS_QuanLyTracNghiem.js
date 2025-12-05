// ⭐ TaoBaiTracNghiem.js - Quản lý trang chi tiết bài trắc nghiệm ⭐

// Global variables (sẽ được set từ view)
let baiTracNghiemId = 0;
let khoaHocId = 0;

// ⭐ KHỞI TẠO ⭐
function initTaoBaiTracNghiem(baiTracNghiemIdParam, khoaHocIdParam) {
    baiTracNghiemId = baiTracNghiemIdParam;
    khoaHocId = khoaHocIdParam;
    
    console.log('Initialized TaoBaiTracNghiem:', { baiTracNghiemId, khoaHocId });
}

// ⭐ COPY LINK ⭐
function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Đã copy!',
                text: 'Link bài thi đã được copy vào clipboard',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            alert('✓ Đã copy link bài thi!');
        }
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('Không thể copy link. Vui lòng thử lại!');
    });
}

// ⭐ HIỂN THỊ QR CODE ⭐
function showQR() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Chức năng đang phát triển',
            text: 'Chức năng tạo QR code đang được phát triển',
            confirmButtonText: 'Đóng'
        });
    } else {
        alert('Chức năng tạo QR code đang được phát triển');
    }
}

// ⭐ THÊM FUNCTION NÀY ⭐
// ⭐ CHẤM LẠI ĐIỂM ⭐
async function recheckAll() {
    const result = await showConfirm_tc(
        'Hệ thống sẽ tự động chấm lại điểm cho tất cả bài làm. Tiếp tục?',
        'Xác nhận chấm lại điểm'
    );

    if (!result.isConfirmed) {
        return;
    }

    Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // TODO: Gọi API chấm lại điểm
    setTimeout(() => {
        Swal.close();
        showInfo_tc('Chức năng chấm lại điểm đang được phát triển');
    }, 1500);
}

// ⭐ XÓA BÀI THI - SỬ DỤNG THÔNG BÁO ĐẸP ⭐
async function deleteBai(id) {
    if (!id || id === 0) {
        showError_tc('Không xác định được ID bài thi');
        return;
    }

    // ⭐ SỬ DỤNG showDeleteConfirm_tc
    const result = await showDeleteConfirm_tc(
        'Bài trắc nghiệm này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!',
        'Xác nhận xóa bài trắc nghiệm'
    );

    if (!result.isConfirmed) {
        return;
    }

    // Hiển thị loading
    Swal.fire({
        title: 'Đang xóa...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch('/Teacher/TracNghiem/XoaBaiTracNghiem', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                baiTracNghiemId: id, 
                khoaHocId: khoaHocId 
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        Swal.close();

        if (data.success) {
            // ⭐ SỬ DỤNG showSuccess_tc
            showSuccess_tc('Xóa bài trắc nghiệm thành công!');
            
            // Chờ 2s rồi chuyển hướng
            setTimeout(() => {
                window.location.href = `/Teacher/Course/Index/${khoaHocId}`;
            }, 2000);
        } else {
            showError_tc(data.message || 'Không thể xóa bài thi');
        }
    } catch (error) {
        console.error('Delete error:', error);
        Swal.close();
        showError_tc('Có lỗi xảy ra khi xóa bài thi: ' + error.message);
    }
}

// ⭐ SỬA NỘI DUNG ⭐
function editContent() {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Chức năng đang phát triển',
            text: 'Chức năng chỉnh sửa nội dung đang được phát triển',
            confirmButtonText: 'Đóng'
        });
    } else {
        alert('Chức năng chỉnh sửa nội dung đang được phát triển');
    }
}

// ⭐ XUẤT FILE EXCEL KẾT QUẢ ⭐
async function exportResults() {
    if (!baiTracNghiemId || baiTracNghiemId === 0) {
        showError_tc('Không xác định được ID bài trắc nghiệm');
        return;
    }

    // Hiển thị loading
    Swal.fire({
        title: 'Đang xuất file...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/Teacher/TracNghiem/XuatExcelKetQua?baiTracNghiemId=${baiTracNghiemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Lấy file blob
        const blob = await response.blob();
        
        // Lấy tên file từ header hoặc tạo mặc định
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = `KetQua_${Date.now()}.xlsx`;
        
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = fileNameMatch[1].replace(/['"]/g, '');
            }
        }

        // Tạo link download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.close();
        showSuccess_tc('Đã xuất file Excel thành công!');
        
    } catch (error) {
        console.error('Export error:', error);
        Swal.close();
        showError_tc('Có lỗi xảy ra khi xuất file: ' + error.message);
    }
}

// ⭐ LÀM MỚI KẾT QUẢ ⭐
function refreshResults() {
    if (confirm('Bạn có muốn tải lại trang để cập nhật kết quả mới nhất?')) {
        location.reload();
    }
}

// ⭐ LƯU CÀI ĐẶT - HOÀN CHỈNH VỚI API ⭐
async function saveSettings() {
    // Validation
    const tenBaiThi = document.getElementById('tenBaiThi')?.value?.trim();
    if (!tenBaiThi) {
        alert('Vui lòng nhập tên bài thi!');
        document.getElementById('tenBaiThi')?.focus();
        return;
    }

    const thoiGianLamBai = parseInt(document.getElementById('thoiGianLamBai')?.value);
    if (thoiGianLamBai && thoiGianLamBai < 1) {
        alert('Thời gian làm bài phải lớn hơn 0!');
        document.getElementById('thoiGianLamBai')?.focus();
        return;
    }

    const thoiGianBatDau = document.getElementById('thoiGianBatDau')?.value;
    const thoiGianKetThuc = document.getElementById('thoiGianKetThuc')?.value;
    
    if (thoiGianBatDau && thoiGianKetThuc && new Date(thoiGianKetThuc) <= new Date(thoiGianBatDau)) {
        alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
        return;
    }

    // Chuẩn bị dữ liệu
    const settings = {
        baiTracNghiemId: baiTracNghiemId,
        tenBaiThi: tenBaiThi,
        loaiBaiThi: document.getElementById('loaiBai')?.value,
        thoiLuongLamBai: thoiGianLamBai || null,
        soLanLamToiDa: parseInt(document.getElementById('soLanLam')?.value) || null,
        thoiGianBatDau: thoiGianBatDau ? new Date(thoiGianBatDau).toISOString() : null,
        thoiGianKetThuc: thoiGianKetThuc ? new Date(thoiGianKetThuc).toISOString() : null,
        tronCauHoi: document.getElementById('tronCauHoi')?.checked || false,
        choXemKetQua: document.getElementById('choXemKetQua')?.checked || false
    };

    console.log('Saving settings:', settings);

    // Hiển thị loading
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Đang lưu...',
            text: 'Vui lòng đợi',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    try {
        const response = await fetch('/Teacher/TracNghiem/CapNhatCaiDat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Save response:', data);

        if (typeof Swal !== 'undefined') {
            Swal.close();
        }

        if (data.success) {
            // Đóng modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('settingModal'));
            if (modal) {
                modal.hide();
            }

            // Hiển thị thông báo thành công
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: data.message || 'Đã lưu cài đặt',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    location.reload();
                });
            } else {
                alert('✓ ' + (data.message || 'Đã lưu cài đặt'));
                location.reload();
            }
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: data.message || 'Không thể lưu cài đặt'
                });
            } else {
                alert('Lỗi: ' + (data.message || 'Không thể lưu cài đặt'));
            }
        }
    } catch (error) {
        console.error('Save error:', error);
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi lưu cài đặt: ' + error.message
            });
        } else {
            alert('Có lỗi xảy ra khi lưu cài đặt!');
        }
    }
}



// ⭐ LOAD DANH SÁCH SINH VIÊN KHI MỞ MODAL ⭐
async function loadDanhSachSinhVien() {
    const studentListContainer = document.getElementById('studentList');
    
    if (!studentListContainer) {
        console.error('Student list container not found');
        return;
    }

    // Hiển thị loading
    studentListContainer.innerHTML = `
        <div class="text-center text-muted py-3">
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            Đang tải danh sách sinh viên...
        </div>
    `;

    try {
        const response = await fetch(`/Teacher/TracNghiem/LayDanhSachSinhVien?khoaHocId=${khoaHocId}&baiTracNghiemId=${baiTracNghiemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Student list response:', data);

        if (data.success) {
            if (data.danhSachSinhVien && data.danhSachSinhVien.length > 0) {
                // Render danh sách sinh viên
                let html = '';
                
                data.danhSachSinhVien.forEach(sinhVien => {
                    const isChecked = data.sinhVienDaGiao.includes(sinhVien.sinhVienId) ? 'checked' : '';
                    
                    html += `
                        <div class="student-item d-flex align-items-center gap-3 py-2 px-2 mb-1 hover-bg-light rounded">
                            <div style="width:40px; height:40px; border-radius:8px; overflow:hidden;">
                                <img src="${sinhVien.avatar}" alt="Avatar"
                                     style="width:100%; height:100%; object-fit:cover;"
                                     onerror="this.src='/assets/image/tải xuống.jpg'">
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-semibold">${sinhVien.fullName}</div>
                                <small class="text-muted">${sinhVien.maSo || 'N/A'}</small>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input student-checkbox" 
                                       type="checkbox" 
                                       value="${sinhVien.sinhVienId}"
                                       ${isChecked}>
                            </div>
                        </div>
                    `;
                });
                
                studentListContainer.innerHTML = html;

                // Cập nhật trạng thái "Chọn tất cả"
                updateCheckAllStatus();
            } else {
                studentListContainer.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        <p>Chưa có sinh viên nào trong khóa học</p>
                    </div>
                `;
            }
        } else {
            studentListContainer.innerHTML = `
                <div class="text-center text-danger py-3">
                    <i class="bi bi-exclamation-circle me-2"></i>
                    ${data.message || 'Không thể tải danh sách sinh viên'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Load student list error:', error);
        studentListContainer.innerHTML = `
            <div class="text-center text-danger py-3">
                <i class="bi bi-exclamation-circle me-2"></i>
                Có lỗi xảy ra khi tải danh sách sinh viên
            </div>
        `;
    }
}

// ⭐ CẬP NHẬT TRẠNG THÁI "CHỌN TẤT CẢ" ⭐
function updateCheckAllStatus() {
    const checkAllBox = document.getElementById('checkAllStudents');
    const checkboxes = document.querySelectorAll('.student-checkbox');
    
    if (!checkAllBox || checkboxes.length === 0) return;
    
    const checkedCount = document.querySelectorAll('.student-checkbox:checked').length;
    
    if (checkedCount === 0) {
        checkAllBox.checked = false;
        checkAllBox.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        checkAllBox.checked = true;
        checkAllBox.indeterminate = false;
    } else {
        checkAllBox.checked = false;
        checkAllBox.indeterminate = true;
    }
}

// ⭐ LỌC DANH SÁCH SINH VIÊN - CẢI TIẾN ⭐
function filterStudents() {
    const searchValue = document.getElementById('searchStudent')?.value.toLowerCase().trim();
    const studentItems = document.querySelectorAll('.student-item');
    
    let visibleCount = 0;
    
    studentItems.forEach(item => {
        const studentName = item.querySelector('.fw-semibold')?.textContent.toLowerCase();
        const studentCode = item.querySelector('.text-muted')?.textContent.toLowerCase();
        
        if (studentName?.includes(searchValue) || studentCode?.includes(searchValue)) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Hiển thị thông báo nếu không tìm thấy
    const container = document.getElementById('studentList');
    let noResultMsg = container.querySelector('.no-result-message');
    
    if (visibleCount === 0 && searchValue) {
        if (!noResultMsg) {
            noResultMsg = document.createElement('div');
            noResultMsg.className = 'no-result-message text-center text-muted py-3';
            noResultMsg.innerHTML = '<i class="bi bi-search me-2"></i>Không tìm thấy sinh viên';
            container.appendChild(noResultMsg);
        }
    } else if (noResultMsg) {
        noResultMsg.remove();
    }
}

// ⭐ CHỌN TẤT CẢ SINH VIÊN - CẢI TIẾN ⭐
function toggleAllStudents() {
    const checkAllBox = document.getElementById('checkAllStudents');
    const checkboxes = document.querySelectorAll('.student-checkbox');
    
    checkboxes.forEach(checkbox => {
        // Chỉ chọn/bỏ chọn các checkbox đang hiển thị
        const studentItem = checkbox.closest('.student-item');
        if (studentItem && studentItem.style.display !== 'none') {
            checkbox.checked = checkAllBox?.checked || false;
        }
    });
}

// ⭐ LƯU GIAO BÀI - SỬ DỤNG THÔNG BÁO ĐẸP ⭐
async function saveGiaoBai() {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const selectedStudents = Array.from(checkboxes).map(cb => parseInt(cb.value));

    console.log('Selected students:', selectedStudents);

    // Validation
    if (selectedStudents.length === 0) {
        showWarning_tc('Vui lòng chọn ít nhất một sinh viên để giao bài!');
        return;
    }

    // ⭐ SỬ DỤNG showConfirm_tc
    const result = await showConfirm_tc(
        `Bạn có chắc muốn giao bài cho ${selectedStudents.length} sinh viên?`,
        'Xác nhận giao bài'
    );

    if (!result.isConfirmed) {
        return;
    }

    // Hiển thị loading
    Swal.fire({
        title: 'Đang lưu...',
        text: 'Vui lòng đợi',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const requestData = {
            baiTracNghiemId: baiTracNghiemId,
            danhSachSinhVienId: selectedStudents
        };

        console.log('Sending giao bai request:', requestData);

        const response = await fetch('/Teacher/TracNghiem/LuuGiaoBai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Save response:', data);

        Swal.close();

        if (data.success) {
            // Đóng modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            if (modal) {
                modal.hide();
            }

            // ⭐ SỬ DỤNG showSuccess_tc
            showSuccess_tc(`Đã giao bài thành công cho ${selectedStudents.length} sinh viên!`);
            
            // Chờ 2s rồi reload
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            showError_tc(data.message || 'Không thể lưu giao bài');
        }
    } catch (error) {
        console.error('Save giao bai error:', error);
        Swal.close();
        showError_tc('Có lỗi xảy ra khi lưu giao bài: ' + error.message);
    }
}

// ⭐ EXPORT - GÁN VÀO WINDOW ĐỂ SỬ DỤNG TRONG VIEW ⭐
window.copyLink = copyLink;
window.showQR = showQR;
window.recheckAll = recheckAll;
window.deleteBai = deleteBai;
window.editContent = editContent;
window.exportResults = exportResults;
window.refreshResults = refreshResults;
window.saveSettings = saveSettings;
window.filterStudents = filterStudents;
window.toggleAllStudents = toggleAllStudents;
window.saveGiaoBai = saveGiaoBai;
window.loadDanhSachSinhVien = loadDanhSachSinhVien;

// ⭐ KHỞI TẠO KHI LOAD TRANG ⭐
console.log('✅ JS_QuanLyTracNghiem.js loaded successfully');