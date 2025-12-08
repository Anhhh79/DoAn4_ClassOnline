document.addEventListener("DOMContentLoaded", () => {

    function loadNoiDung(url) {
        console.log('Loading content from:', url);
        fetch(url)
            .then(res => res.text())
            .then(html => {
                const container = document.getElementById("noiDungContainer");
                if (container) container.innerHTML = html;
            })
            .catch(err => console.error("Lỗi tải nội dung:", err));
    };

    // ⭐ KIỂM TRA XEM CÓ PHẢI TRANG CHI TIẾT KHÓA HỌC KHÔNG ⭐
    // Nếu có window.khoaHocId (được set trong trang chi tiết) thì KHÔNG CHẠY CODE NÀY
    if (window.khoaHocId && window.khoaHocId > 0) {
        console.log('⚠️ Đang ở trang chi tiết khóa học, bỏ qua KhoaHoc.js');
        // ⭐ QUAN TRỌNG: RETURN ĐỂ DỪNG EXECUTION ⭐
        return;
    }

    // Danh sách button
    const tabButtons = ["btnThongBao", "btnTaiLieu", "btnNopBai", "btnTracNghiem"];

    // Hàm set active
    function setActiveButton(clickedBtn) {
        const tabButtons = ["btnThongBao", "btnTaiLieu", "btnNopBai", "btnTracNghiem"];
        tabButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                const card = btn.querySelector('.card');
                if (card) card.classList.remove("text-primary");
            }
        });
        if (clickedBtn) {
            const card = clickedBtn.querySelector('.card');
            if (card) card.classList.add("text-primary");
        }
    }
    
    const btnThongBao = document.getElementById("btnThongBao");
    if (btnThongBao) {
        btnThongBao.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung('/Student/Notification/Index');
            setActiveButton(this);
        });
    }

    const btnTaiLieu = document.getElementById("btnTaiLieu");
    if (btnTaiLieu) {
        btnTaiLieu.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung('/Student/Document/Index');
            setActiveButton(this);
        });
    }

    const btnNopBai = document.getElementById("btnNopBai");
    if (btnNopBai) {
        btnNopBai.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung('/Student/NopBai/Index');
            setActiveButton(this);
        });
    }

    const btnTracNghiem = document.getElementById("btnTracNghiem");
    if (btnTracNghiem) {
        btnTracNghiem.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung('/Student/TracNghiem/Index');
            setActiveButton(this);
        });
    }

    // ⭐ CHỈ AUTO-LOAD KHI KHÔNG PHẢI TRANG CHI TIẾT ⭐
    loadNoiDung('/Student/Notification/Index');
    setActiveButton(document.getElementById("btnThongBao"));
});

// ⭐ QUẢN LÝ KHÓA HỌC - STUDENT (ĐÃ SỬA LỖI HOÀN TOÀN) ⭐

document.addEventListener('DOMContentLoaded', async function() {
    const selectHocKy = document.getElementById('selectHocKy');
    const khoaHocContainer = document.getElementById('khoaHocContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // ⭐ KIỂM TRA XEM CÓ PHẢI TRANG DANH SÁCH KHÓA HỌC KHÔNG ⭐
    if (!selectHocKy || !khoaHocContainer) {
        console.log('⚠️ Không phải trang danh sách khóa học');
        return;
    }

    console.log('✅ KhoaHoc.js loaded - Trang danh sách khóa học');

    const hocKyHienTaiId = window.hocKyHienTaiId || 0;
    console.log('📚 Học kỳ hiện tại ID:', hocKyHienTaiId);

    // ⭐ KHỞI TẠO ⭐
    await init();

    async function init() {
        // Load danh sách học kỳ vào dropdown
        await loadHocKies();
        
        // ⭐ TỰ ĐỘNG LOAD KHÓA HỌC CỦA HỌC KỲ HIỆN TẠI ⭐
        await loadKhoaHocs(hocKyHienTaiId);
        
        // Gắn sự kiện thay đổi học kỳ
        selectHocKy.addEventListener('change', async function() {
            console.log('🔄 Thay đổi học kỳ:', this.value);
            await loadKhoaHocs(this.value);
        });

        console.log('✅ Initialized - Đã load khóa học của học kỳ hiện tại');
    }

    // ⭐ LOAD DANH SÁCH HỌC KỲ VÀO DROPDOWN ⭐
    async function loadHocKies() {
        try {
            console.log('📡 Fetching học kỳ...');
            const response = await fetch('/Student/KhoaHoc/GetHocKies');
            const data = await response.json();
            
            console.log('📥 Response học kỳ:', data);
            
            if (data.success && data.hocKies && data.hocKies.length > 0) {
                // Xóa các option cũ (trừ "Tất cả")
                while (selectHocKy.options.length > 1) {
                    selectHocKy.remove(1);
                }

                // Thêm học kỳ vào dropdown
                data.hocKies.forEach(hk => {
                    const option = document.createElement('option');
                    option.value = hk.hocKyId;
                    option.textContent = `${hk.tenHocKy} / ${hk.namHoc}`;
                    
                    // ⭐ SET SELECTED CHO HỌC KỲ HIỆN TẠI ⭐
                    if (hk.hocKyId === hocKyHienTaiId) {
                        option.selected = true;
                        console.log(`✅ Selected học kỳ hiện tại: ${hk.tenHocKy}`);
                    }
                    
                    selectHocKy.appendChild(option);
                });
                
                console.log(`✅ Loaded ${data.hocKies.length} học kỳ`);
            } else {
                console.warn('⚠️ Không có học kỳ nào hoặc API failed');
            }
        } catch (error) {
            console.error('❌ Error loading học kỳ:', error);
        }
    }

    // ⭐ LOAD KHÓA HỌC THEO HỌC KỲ - ĐÃ SỬA LỖI DUPLICATE ⭐
    async function loadKhoaHocs(hocKyId) {
        if (!khoaHocContainer) return;

        console.log(`📡 Fetching khóa học với hocKyId: ${hocKyId}`);

        // Show loading
        if (loadingSpinner) {
            loadingSpinner.classList.remove('d-none');
        }
        khoaHocContainer.innerHTML = '';

        try {
            const response = await fetch(`/Student/KhoaHoc/GetKhoaHocByHocKy?hocKyId=${hocKyId || 0}`);
            const data = await response.json();

            console.log('📥 Response khóa học:', data);

            // Hide loading
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }

            if (data.success && data.khoaHocs) {
                if (data.khoaHocs.length === 0) {
                    khoaHocContainer.innerHTML = `
                        <div class="col-12">
                            <div class="alert alert-info text-center">
                                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                                <p class="mb-0">Không có khóa học nào${hocKyId > 0 ? ' trong học kỳ này' : ''}.</p>
                            </div>
                        </div>
                    `;
                    return;
                }

                // ⭐ SỬA LỖI: DÙNG MAP().JOIN() THAY VÌ FOREACH VÀ += ⭐
                const cardsHtml = data.khoaHocs.map(kh => createKhoaHocCard(kh)).join('');
                khoaHocContainer.innerHTML = cardsHtml;

                console.log(`✅ Loaded ${data.khoaHocs.length} khóa học`);
            } else {
                showError(data.message || 'Không thể tải danh sách khóa học');
            }
        } catch (error) {
            console.error('❌ Error loading khóa học:', error);
            
            if (loadingSpinner) {
                loadingSpinner.classList.add('d-none');
            }
            
            showError('Có lỗi xảy ra khi tải danh sách khóa học');
        }
    }

    // ⭐ TẠO HTML CARD KHÓA HỌC ⭐
    function createKhoaHocCard(kh) {
        return `
            <div class="col-12 col-md-3">
                <div class="card shadow border-0 rounded-4 overflow-hidden h-100">
                    <a href="/Student/KhoaHoc_1/Index?id=${kh.khoaHocId}">
                        <div class="card-header p-0 border-0 bg-white image-cuser">
                            <img src="${kh.hinhAnh}"
                                 class="w-100"
                                 alt="Banner"
                                 style="height: 130px; object-fit: cover;"
                                 onerror="this.src='/assets/image/tải xuống.jpg'">
                        </div>
                    </a>
                    <div class="card-body text-start">
                        <h6 class="fw-bold mb-2" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(kh.tenKhoaHoc)}">
                            ${escapeHtml(kh.tenKhoaHoc)}
                        </h6>
                        <span class="" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                            Giảng viên: ${escapeHtml(kh.tenGiaoVien)}
                        </span>
                        <span class="" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                            ${escapeHtml(kh.tenKhoa)}
                        </span>
                        <span class="">${escapeHtml(kh.tenHocKy)} / ${escapeHtml(kh.namHoc)}</span>
                        <div class="d-flex justify-content-between text-secondary small mb-3 mt-2">
                            <span>${kh.soLuongSinhVien} SV đã tham gia</span>
                            <span>${kh.isPublic ? 'Tất cả mọi người' : 'Riêng tư'}</span>
                        </div>
                        <div class="text-start">
                            <a class="btn btn-light w-100 border rounded-3" href="/Student/KhoaHoc_1/Index?id=${kh.khoaHocId}">
                                Xem chi tiết khóa học
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ⭐ ESCAPE HTML ĐỂ TRÁNH XSS ⭐
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ⭐ HIỂN THỊ LỖI ⭐
    function showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: message,
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#dc3545'
            });
        } else {
            alert(message);
        }
    }
});
