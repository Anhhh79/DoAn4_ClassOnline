// Load khi trang vừa tải xong
document.addEventListener('DOMContentLoaded', function() {
    loadHocKies();
    loadKhoaHocs(0); // Load tất cả khóa học
    
    // Xử lý khi thay đổi học kỳ
    document.getElementById('selectHocKy').addEventListener('change', function() {
        const hocKyId = this.value;
        loadKhoaHocs(hocKyId);
    });

    // LISTEN CUSTOM EVENT (MỚI)
    document.addEventListener('profileUpdated', function(e) {
        console.log('Profile đã được cập nhật, reload danh sách khóa học');
        const selectHocKy = document.getElementById('selectHocKy');
        const currentHocKyId = selectHocKy ? selectHocKy.value : 0;
        loadKhoaHocs(currentHocKyId);
    });
});

// Load danh sách học kỳ
async function loadHocKies() {
    try {
        const response = await fetch('/Teacher/Home/GetHocKies');
        const data = await response.json();
        
        if (data.success) {
            renderHocKies(data.hocKies);
        } else {
            console.error('Lỗi:', data.message);
        }
    } catch (error) {
        console.error('Lỗi khi load học kỳ:', error);
    }
}

// Render dropdown học kỳ
function renderHocKies(hocKies) {
    const select = document.getElementById('selectHocKy');
    let html = '<option value="0">-- Tất cả khóa học --</option>';
    
    hocKies.forEach(hk => {
        html += `<option value="${hk.hocKyId}">${hk.tenHocKy}</option>`;
    });
    
    select.innerHTML = html;
}

// Load danh sách khóa học
async function loadKhoaHocs(hocKyId = 0) {
    try {
        showLoading();
        
        const url = hocKyId > 0 
            ? `/Teacher/Home/GetKhoaHocs?hocKyId=${hocKyId}`
            : `/Teacher/Home/GetKhoaHocs`;
            
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            renderKhoaHocs(data.khoaHocs);
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Lỗi khi load khóa học:', error);
        showError('Không thể tải danh sách khóa học');
    }
}

// Render danh sách khóa học
function renderKhoaHocs(khoaHocs) {
    const container = document.getElementById('khoaHocContainer');
    
    if (!khoaHocs || khoaHocs.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                <p class="text-muted">Chưa có khóa học nào</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    khoaHocs.forEach(kh => {
        const hinhAnh = kh.hinhAnh || '/assets/image/tải xuống.jpg';
        const isPublicText = kh.isPublic ? 'Tất cả mọi người' : 'Riêng tư';
        
        html += `
            <div class="col-12 col-md-3">
                <div class="card shadow border-0 rounded-4 overflow-hidden h-100">
                    <!-- Ảnh banner -->
                    <a href="/Teacher/Course/Index/${kh.khoaHocId}">
                        <div class="card-header p-0 border-0 bg-white image-cuser">
                            <img src="${hinhAnh}"
                                 class="w-100"
                                 alt="${kh.tenKhoaHoc}"
                                 style="height: 130px; object-fit: cover;"
                                 onerror="this.src='/assets/image/tải xuống.jpg'">
                        </div>
                    </a>
                    
                    <!-- Nội dung khóa học -->
                    <div class="card-body text-start">
                        <h6 class="fw-bold mb-2" 
                            style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;" 
                            title="${kh.tenKhoaHoc}">
                            ${kh.tenKhoaHoc}
                        </h6>
                        
                        <span class="d-block" 
                              style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                            Giảng viên: ${kh.tenGiaoVien || 'Chưa cập nhật'}
                        </span>
                        
                        <span class="d-block" 
                              style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                            ${kh.tenKhoa || 'Chưa cập nhật'}
                        </span>
                        
                        <span class="d-block">${kh.tenHocKy || 'Chưa cập nhật'}</span>

                        <div class="d-flex justify-content-between text-secondary small mb-3 mt-2">
                            <span>${kh.soLuongSinhVien} SV đã tham gia</span>
                            <span>${isPublicText}</span>
                        </div>
                        
                        <div class="text-start">
                            <a class="btn btn-light w-100 border rounded-3" 
                               href="/Teacher/Home/DanhSach?khoaHocId=${kh.khoaHocId}">
                                Xem danh sách sinh viên
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Hiển thị loading
function showLoading() {
    const container = document.getElementById('khoaHocContainer');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
        </div>
    `;
}

// Hiển thị lỗi
function showError(message) {
    const container = document.getElementById('khoaHocContainer');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="text-danger">
                <i class="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
                <h5>Lỗi</h5>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="loadKhoaHocs(0)">
                    <i class="bi bi-arrow-clockwise me-2"></i>Thử lại
                </button>
            </div>
        </div>
    `;
}


