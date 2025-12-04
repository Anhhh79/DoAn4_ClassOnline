// course_list.js (phiên bản đã sửa lỗi, không thay đổi chữ hiển thị)
document.addEventListener('DOMContentLoaded', function () {

    // Chỉ chạy code khi phần tử này tồn tại
    const container = document.getElementById('khoaHocContainer');
    if (!container) return;  // ⛔ Dừng toàn bộ script, không báo lỗi

    const selectHocKy = document.getElementById('selectHocKy');

    // Load ban đầu
    loadHocKies().then(() => {
        const currentHocKyId = selectHocKy ? Number(selectHocKy.value) || 0 : 0;
        loadKhoaHocs(currentHocKyId);
    }).catch(() => {
        const currentHocKyId = selectHocKy ? Number(selectHocKy.value) || 0 : 0;
        loadKhoaHocs(currentHocKyId);
    });

    if (selectHocKy) {
        selectHocKy.addEventListener('change', function () {
            loadKhoaHocs(Number(this.value) || 0);
        });
    }

    document.addEventListener('profileUpdated', function () {
        const select = document.getElementById('selectHocKy');
        const currentHocKyId = select ? Number(select.value) || 0 : 0;
        loadKhoaHocs(currentHocKyId);
    });
});

// Hàm load danh sách học kỳ (trả về Promise)
async function loadHocKies() {
    const select = document.getElementById('selectHocKy');
    if (!select) {
        // Nếu không có select thì vẫn return để chuỗi promise không lỗi
        return;
    }

    try {
        const response = await fetch('/Teacher/Home/GetHocKies');
        if (!response.ok) throw new Error('Fetch lỗi: ' + response.status);
        const data = await response.json();

        if (data && data.success && Array.isArray(data.hocKies)) {
            renderHocKies(data.hocKies);
        } else {
            console.warn('API GetHocKies trả về không như mong đợi:', data);
            renderHocKies([]);
        }
    } catch (error) {
        console.error('Lỗi khi load học kỳ:', error);
        // Hiển thị mặc định một option (giữ nguyên chữ)
        select.innerHTML = '<option value="0">-- Tất cả khóa học --</option>';
    }
}

// Render dropdown học kỳ
function renderHocKies(hocKies) {
    const select = document.getElementById('selectHocKy');
    if (!select) return;

    let html = '<option value="0">-- Tất cả khóa học --</option>';
    (hocKies || []).forEach(hk => {
        // đảm bảo property đúng tên (theo API của bạn)
        const id = hk.hocKyId ?? hk.HocKyId ?? hk.id ?? 0;
        const name = hk.tenHocKy ?? hk.TenHocKy ?? hk.name ?? 'Học kỳ';
        html += `<option value="${id}">${name}</option>`;
    });

    select.innerHTML = html;
}

// Load danh sách khóa học
async function loadKhoaHocs(hocKyId = 0) {
    const container = document.getElementById('khoaHocContainer');
    if (!container) {
        console.error('Không tìm thấy #khoaHocContainer');
        return;
    }

    showLoading(container);

    try {
        const url = hocKyId > 0 ? `/Teacher/Home/GetKhoaHocs?hocKyId=${hocKyId}` : `/Teacher/Home/GetKhoaHocs`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch lỗi: ' + response.status);
        const data = await response.json();

        if (data && data.success && Array.isArray(data.khoaHocs)) {
            renderKhoaHocs(data.khoaHocs);
        } else {
            const msg = (data && data.message) ? data.message : 'Không có dữ liệu';
            showError(container, msg);
        }
    } catch (error) {
        console.error('Lỗi khi load khóa học:', error);
        showError(container, 'Không thể tải danh sách khóa học');
    }
}

// Render danh sách khóa học
function renderKhoaHocs(khoaHocs) {
    const container = document.getElementById('khoaHocContainer');
    if (!container) return;

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
    (khoaHocs || []).forEach(kh => {
        // an toàn lấy các thuộc tính, không gây lỗi nếu undefined
        const khoaHocId = kh.khoaHocId ?? kh.KhoaHocId ?? kh.id ?? '';
        const hinhAnh = kh.hinhAnh ?? kh.HinhAnh ?? '/assets/image/tải xuống.jpg';
        const isPublicText = (kh.isPublic ?? kh.IsPublic) ? 'Tất cả mọi người' : 'Riêng tư';
        const tenGV = kh.tenGiaoVien ?? kh.tenGiaoVienHoc ?? kh.TenGiaoVien ?? 'Chưa cập nhật';
        const tenKhoaHoc = kh.tenKhoaHoc ?? kh.TenKhoaHoc ?? 'Chưa cập nhật';
        const tenKhoa = kh.tenKhoa ?? kh.TenKhoa ?? 'Chưa cập nhật';
        const tenHocKy = kh.tenHocKy ?? kh.TenHocKy ?? 'Chưa cập nhật';
        const namHoc = kh.namHoc ?? kh.NamHoc ?? 'Chưa cập nhật';
        const soLuong = kh.soLuongSinhVien ?? kh.SoLuongSinhVien ?? 0;

        html += `
            <div class="col-12 col-md-3">
                <div class="card shadow border-0 rounded-4 overflow-hidden h-100">
                    <a href="/Teacher/Course/Index/${khoaHocId}">
                        <div class="card-header p-0 border-0 bg-white image-cuser">
                            <img src="${hinhAnh}" class="w-100" alt="${tenKhoaHoc}" style="height: 130px; object-fit: cover;" onerror="this.src='/assets/image/tải xuống.jpg'">
                        </div>
                    </a>
                    <div class="card-body text-start">
                        <h6 class="fw-bold mb-2" title="${tenKhoaHoc}">
                            ${tenKhoaHoc}
                        </h6>
                        <span class="d-block">Giảng viên: ${tenGV}</span>
                        <span class="d-block">${tenKhoa}</span>
                        <span class="d-block">${tenHocKy} / ${namHoc}</span>
                        <div class="d-flex justify-content-between text-secondary small mb-3 mt-2">
                            <span>${soLuong} SV đã tham gia</span>
                            <span>${isPublicText}</span>
                        </div>
                        <div class="text-start">
                            <a class="btn btn-light w-100 border rounded-3" href="/Teacher/Home/DanhSach?khoaHocId=${khoaHocId}">
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

// Hiển thị loading (nhận container làm tham số)
function showLoading(container) {
    if (!container) return;
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
function showError(container, message) {
    if (!container) return;
    // dùng template string nhưng không thay đổi chữ
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="text-danger">
                <i class="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
                <h5>Lỗi</h5>
                <p>${message}</p>
                <button class="btn btn-primary" id="btnRetryLoadKhoaHocs">
                    <i class="bi bi-arrow-clockwise me-2"></i>Thử lại
                </button>
            </div>
        </div>
    `;

    // gắn sự kiện cho nút (tránh onclick inline nếu nút không tồn tại trước)
    const btn = document.getElementById('btnRetryLoadKhoaHocs');
    if (btn) {
        btn.addEventListener('click', function () {
            // nếu có selectHocKy thì lấy giá trị hiện tại, ngược lại load tất cả
            const select = document.getElementById('selectHocKy');
            const currentHocKyId = select ? Number(select.value) || 0 : 0;
            loadKhoaHocs(currentHocKyId);
        });
    }
}
