// ⭐ Js_LamTracNghiem.js - Quản lý làm bài trắc nghiệm cho sinh viên ⭐

let baiTracNghiemId = 0;
let thoiLuongPhut = 60;
let tronCauHoi = false;
let choXemKetQua = false; // ⭐ THÊM BIẾN MỚI ⭐
let cauHois = [];
let traLoi = {};
let timeLeft = 0;
let timerInterval = null;
let dangNopBai = false; // ⭐ THÊM DÒNG NÀY ⭐

// ⭐ KHỞI TẠO ⭐
function initLamBaiTracNghiem(baiTracNghiemIdParam, thoiLuongParam, tronCauHoiParam, choXemKetQuaParam) {
    baiTracNghiemId = baiTracNghiemIdParam;
    thoiLuongPhut = thoiLuongParam;
    tronCauHoi = tronCauHoiParam;
    choXemKetQua = choXemKetQuaParam; // ⭐ THÊM ⭐
    timeLeft = thoiLuongPhut * 60;
    
    console.log('🚀 Khởi tạo làm bài:', {
        baiTracNghiemId,
        thoiLuongPhut,
        tronCauHoi,
        choXemKetQua
    });
    
    loadCauHoi();
    startTimer();
    setupEventListeners();
}

// ⭐ SETUP EVENT LISTENERS ⭐
function setupEventListeners() {
    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', showModalXacNhan);
    }
    
    const btnXacNhanNop = document.getElementById('btnXacNhanNop');
    if (btnXacNhanNop) {
        btnXacNhanNop.addEventListener('click', function() {
            hideModalXacNhan();
            nopBai();
        });
    }
    
    // ⭐ CẢNH BÁO TRƯỚC KHI THOÁT (beforeunload) ⭐
    window.addEventListener('beforeunload', function (e) {
        if (timeLeft > 0 && !dangNopBai) {
            e.preventDefault();
            e.returnValue = 'Bạn đang làm bài thi. Nếu thoát, bài làm sẽ được tự động nộp!';
            return e.returnValue;
        }
    });
    
    // ⭐ TỰ ĐỘNG NỘP BÀI KHI THOÁT TRANG (pagehide - đáng tin cậy hơn) ⭐
    window.addEventListener('pagehide', function(e) {
        if (timeLeft > 0 && !dangNopBai) {
            console.log('🚪 Đang rời trang - Nộp bài tự động...');
            nopBaiTuDongSync();
        }
    });
    
    // ⭐ BACKUP: Sử dụng visibilitychange cho các trường hợp khác ⭐
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && timeLeft > 0 && !dangNopBai) {
            console.log('👁️ Tab bị ẩn - Chuẩn bị nộp bài...');
            // Không nộp ngay lập tức vì user có thể chỉ chuyển tab
            // Chỉ log để debug
        }
    });
}

// ⭐ LOAD CÂU HỎI ⭐
async function loadCauHoi() {
    const questionList = document.getElementById('questionList');
    
    if (questionList) {
        questionList.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3 text-muted">Đang tải câu hỏi...</p>
            </div>
        `;
    }
    
    try {
        console.log('📡 Gọi API GetCauHoi...');
        
        const response = await fetch(`/Student/LamBaiTracNghiem/GetCauHoi?baiTracNghiemId=${baiTracNghiemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📥 Dữ liệu câu hỏi:', data);

        if (data.success) {
            cauHois = data.cauHois || [];
            
            if (cauHois.length === 0) {
                showError('Bài trắc nghiệm chưa có câu hỏi!');
                if (questionList) {
                    questionList.innerHTML = `
                        <div class="alert alert-warning text-center">
                            <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
                            <p class="mb-0">Chưa có câu hỏi!</p>
                        </div>
                    `;
                }
                return;
            }
            
            if (tronCauHoi) {
                cauHois = shuffleArray(cauHois);
                console.log('🔀 Đã trộn câu hỏi');
            }
            
            console.log(`✅ Loaded ${cauHois.length} câu hỏi`);
            renderCauHoi();
            renderDanhSachCauHoi();
        } else {
            showError(data.message || 'Không thể tải câu hỏi');
        }
    } catch (error) {
        console.error('❌ Lỗi load câu hỏi:', error);
        showError('Có lỗi xảy ra: ' + error.message);
    }
}

// ⭐ TRỘN MẢNG ⭐
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ⭐ RENDER CÂU HỎI ⭐
function renderCauHoi() {
    const questionList = document.getElementById('questionList');
    if (!questionList) return;
    
    let html = '';
    
    cauHois.forEach((ch, index) => {
        const dapAns = [
            { key: 'A', value: ch.dapAnA },
            { key: 'B', value: ch.dapAnB },
            { key: 'C', value: ch.dapAnC },
            { key: 'D', value: ch.dapAnD }
        ].filter(da => da.value && da.value.trim() !== '');

        html += `
            <div class="card shadow-sm mb-3" id="cauHoi${ch.cauHoiId}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="fw-bold text-primary mb-0">
                            Câu ${index + 1}
                        </h5>
                    </div>
                    
                    <p class="fs-6 mb-3">${escapeHtml(ch.noiDungCauHoi)}</p>
                    
                    ${ch.hinhAnh ? `
                        <div class="text-center mb-3">
                            <img src="${ch.hinhAnh}" 
                                 class="img-fluid rounded border shadow-sm" 
                                 style="max-height: 400px; object-fit: contain;"
                                 alt="Hình ảnh câu ${index + 1}">
                        </div>
                    ` : ''}
                    
                    <div class="dap-an-list">
                        ${dapAns.map(da => `
                            <div class="dap-an-item p-3 mb-2 border rounded" 
                                 data-cauhoi-id="${ch.cauHoiId}" 
                                 data-dapan="${da.key}"
                                 style="cursor: pointer; transition: all 0.3s;">
                                <div class="d-flex align-items-center">
                                    <span class="badge bg-secondary me-3">${da.key}</span>
                                    <span>${escapeHtml(da.value)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });

    questionList.innerHTML = html;

    const dapAnItems = document.querySelectorAll('.dap-an-item');
    dapAnItems.forEach(item => {
        item.addEventListener('click', function() {
            chonDapAn(this);
        });
    });
}

// ⭐ CHỌN ĐÁP ÁN ⭐
function chonDapAn(element) {
    const cauHoiId = parseInt(element.getAttribute('data-cauhoi-id'));
    const dapAn = element.getAttribute('data-dapan');
    
    const allAnswers = document.querySelectorAll(`.dap-an-item[data-cauhoi-id="${cauHoiId}"]`);
    allAnswers.forEach(item => {
        item.classList.remove('selected', 'bg-primary', 'text-white');
    });
    
    element.classList.add('selected', 'bg-primary', 'text-white');
    traLoi[cauHoiId] = dapAn;
    
    console.log(`✓ Chọn đáp án ${dapAn} cho câu ${cauHoiId}`);
    updateDanhSachCauHoi();
}

// ⭐ RENDER DANH SÁCH CÂU HỎI ⭐
function renderDanhSachCauHoi() {
    const questionNav = document.getElementById('questionNav');
    if (!questionNav) return;
    
    let html = '';
    
    cauHois.forEach((ch, index) => {
        const daTraLoi = traLoi[ch.cauHoiId] ? 'bg-success' : 'bg-secondary';
        html += `
            <button class="btn btn-sm ${daTraLoi} text-white cau-hoi-nav-btn" 
                    data-cauhoi-id="${ch.cauHoiId}"
                    style="width: 45px; height: 45px;">
                ${index + 1}
            </button>
        `;
    });
    
    questionNav.innerHTML = html;
    
    const navButtons = document.querySelectorAll('.cau-hoi-nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cauHoiId = parseInt(this.getAttribute('data-cauhoi-id'));
            scrollToCauHoi(cauHoiId);
        });
    });
}

// ⭐ CẬP NHẬT DANH SÁCH CÂU HỎI ⭐
function updateDanhSachCauHoi() {
    cauHois.forEach((ch) => {
        const btn = document.querySelector(`.cau-hoi-nav-btn[data-cauhoi-id="${ch.cauHoiId}"]`);
        if (btn) {
            if (traLoi[ch.cauHoiId]) {
                btn.classList.remove('bg-secondary');
                btn.classList.add('bg-success');
            } else {
                btn.classList.remove('bg-success');
                btn.classList.add('bg-secondary');
            }
        }
    });
}

// ⭐ SCROLL ĐẾN CÂU HỎI ⭐
function scrollToCauHoi(cauHoiId) {
    const element = document.getElementById(`cauHoi${cauHoiId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ⭐ ĐẾM NGƯỢC THỜI GIAN ⭐
function startTimer() {
    const timerElement = document.getElementById('timer');
    
    timerInterval = setInterval(function() {
        timeLeft--;
        
        const phut = Math.floor(timeLeft / 60);
        const giay = timeLeft % 60;
        
        if (timerElement) {
            timerElement.textContent = `${phut.toString().padStart(2, '0')}:${giay.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 300) {
                timerElement.classList.remove('text-primary');
                timerElement.classList.add('text-danger');
            }
        }
        
        if (timeLeft === 300) {
            showWarning('⚠️ Còn 5 phút!');
        }
        
        if (timeLeft === 60) {
            showWarning('⚠️ Còn 1 phút!');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showInfo('⏰ Hết giờ! Tự động nộp bài...');
            setTimeout(() => nopBai(), 2000);
        }
    }, 1000);
}

// ⭐ MODAL XÁC NHẬN ⭐
function showModalXacNhan() {
    const soCauChuaLam = cauHois.length - Object.keys(traLoi).length;
    const soCauChuaLamElement = document.getElementById('soCauChuaLam');
    
    if (soCauChuaLamElement) {
        soCauChuaLamElement.textContent = soCauChuaLam;
    }
    
    const modalElement = document.getElementById('modalXacNhan');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function hideModalXacNhan() {
    const modalElement = document.getElementById('modalXacNhan');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}

// ⭐ NỘP BÀI - LOGIC MỚI VỚI choXemKetQua ⭐
async function nopBai() {
    dangNopBai = true; // ⭐ SET FLAG ⭐
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    showLoading('Đang nộp bài...');
    
    try {
        const danhSachTraLoi = cauHois.map(ch => ({
            cauHoiId: ch.cauHoiId,
            dapAnChon: traLoi[ch.cauHoiId] || ''
        }));
        
        console.log('📤 Nộp bài:', {
            baiTracNghiemId,
            soCauHoi: cauHois.length,
            soCauDaLam: Object.keys(traLoi).length,
            danhSachTraLoi
        });

        const response = await fetch('/Student/LamBaiTracNghiem/NopBai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                baiTracNghiemId: baiTracNghiemId,
                danhSachTraLoi: danhSachTraLoi
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📥 Kết quả:', data);
        
        hideLoading();
        
        if (data.success) {
            if (data.choXemKetQua) {
                console.log('✅ Cho xem kết quả -> Hiển thị modal');
                showKetQua(data.diem, data.diemToiDa);
            } else {
                console.log('✅ Không cho xem kết quả -> Chỉ thông báo');
                showSuccess('Đã nộp bài thành công! Giảng viên sẽ chấm điểm sau.');
                setTimeout(() => window.history.back(), 2000);
            }
        } else {
            dangNopBai = false; // ⭐ RESET FLAG NẾU LỖI ⭐
            showError(data.message || 'Không thể nộp bài!');
        }
    } catch (error) {
        console.error('❌ Lỗi nộp bài:', error);
        dangNopBai = false; // ⭐ RESET FLAG NẾU LỖI ⭐
        hideLoading();
        showError('Có lỗi xảy ra: ' + error.message);
    }
}

// ⭐ NỘP BÀI TỰ ĐỘNG KHI THOÁT TRANG ⭐
async function nopBaiTuDong() {
    dangNopBai = true;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    try {
        const danhSachTraLoi = cauHois.map(ch => ({
            cauHoiId: ch.cauHoiId,
            dapAnChon: traLoi[ch.cauHoiId] || ''
        }));

        console.log('📤 Nộp bài tự động khi thoát:', {
            baiTracNghiemId,
            soCauHoi: cauHois.length,
            soCauDaLam: Object.keys(traLoi).length
        });

        // ⭐ SỬ DỤNG sendBeacon ĐỂ ĐẢM BẢO REQUEST ĐƯỢC GỬI KHI THOÁT ⭐
        const formData = new FormData();
        formData.append('baiTracNghiemId', baiTracNghiemId);
        formData.append('danhSachTraLoi', JSON.stringify(danhSachTraLoi));

        // Fallback: dùng fetch với keepalive
        const response = await fetch('/Student/LamBaiTracNghiem/NopBai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                baiTracNghiemId: baiTracNghiemId,
                danhSachTraLoi: danhSachTraLoi
            }),
            keepalive: true // ⭐ QUAN TRỌNG: GIỮ REQUEST SỐNG KHI ĐÓNG TAB ⭐
        });

        console.log('✅ Đã nộp bài tự động');
        return true;
    } catch (error) {
        console.error('❌ Lỗi nộp bài tự động:', error);
        return false;
    }
}

// ⭐ NỘP BÀI TỰ ĐỘNG ĐỒNG BỘ (CHO pagehide) ⭐
function nopBaiTuDongSync() {
    dangNopBai = true;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    try {
        const danhSachTraLoi = cauHois.map(ch => ({
            cauHoiId: ch.cauHoiId,
            dapAnChon: traLoi[ch.cauHoiId] || ''
        }));

        console.log('📤 Nộp bài tự động (SYNC):', {
            baiTracNghiemId,
            soCauHoi: cauHois.length,
            soCauDaLam: Object.keys(traLoi).length
        });

        const payload = JSON.stringify({
            baiTracNghiemId: baiTracNghiemId,
            danhSachTraLoi: danhSachTraLoi
        });

        // ⭐ PHƯƠNG PHÁP 1: sendBeacon (ƯU TIÊN) ⭐
        // Đảm bảo request được gửi ngay cả khi đóng tab
        const blob = new Blob([payload], { type: 'application/json' });
        const sent = navigator.sendBeacon('/Student/LamBaiTracNghiem/NopBai', blob);
        
        if (sent) {
            console.log('✅ Đã gửi beacon nộp bài tự động');
        } else {
            console.warn('⚠️ sendBeacon thất bại, thử fetch với keepalive');
            
            // ⭐ PHƯƠNG PHÁP 2: Fetch với keepalive (FALLBACK) ⭐
            fetch('/Student/LamBaiTracNghiem/NopBai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true // Quan trọng!
            }).then(() => {
                console.log('✅ Fetch keepalive thành công');
            }).catch(err => {
                console.error('❌ Lỗi fetch keepalive:', err);
            });
        }

        return true;
    } catch (error) {
        console.error('❌ Lỗi nộp bài tự động:', error);
        return false;
    }
}

// ⭐ HIỂN THỊ KẾT QUẢ (CHỈ KHI choXemKetQua = true) ⭐
function showKetQua(diem, diemToiDa) {
    const diemDatElement = document.getElementById('diemDat');
    const diemToiDaElement = document.getElementById('diemToiDa');
    const ketQuaMessageElement = document.getElementById('ketQuaMessage');
    
    if (diemDatElement) diemDatElement.textContent = diem.toFixed(1);
    if (diemToiDaElement) diemToiDaElement.textContent = diemToiDa;
        
    const modalElement = document.getElementById('modalKetQua');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// ⭐ HELPERS ⭐
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(message = 'Đang xử lý...') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading()
        });
    }
}

function hideLoading() {
    if (typeof Swal !== 'undefined') Swal.close();
}

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
        alert('❌ ' + message);
    }
}

function showSuccess(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        alert('✅ ' + message);
    }
}

function showWarning(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo!',
            text: message,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        alert('⚠️ ' + message);
    }
}

function showInfo(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Thông báo',
            text: message,
            timer: 3000,
            showConfirmButton: false
        });
    } else {
        alert('ℹ️ ' + message);
    }
}


// ⭐ EXPORT ⭐
window.initLamBaiTracNghiem = initLamBaiTracNghiem;
window.scrollToCauHoi = scrollToCauHoi;
window.nopBai = nopBai;
window.nopBaiTuDong = nopBaiTuDong;
console.log('✅ Js_LamTracNghiem.js loaded');