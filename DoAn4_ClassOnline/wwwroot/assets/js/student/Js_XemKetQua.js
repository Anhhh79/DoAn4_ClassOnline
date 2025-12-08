
let baiLamId = 0;
let cauHois = [];

// ⭐ KHỞI TẠO ⭐
function initXemKetQua(baiLamIdParam) {
    baiLamId = baiLamIdParam;
    
    console.log('🎯 Init XemKetQua:', { baiLamId });
    
    loadCauHoi();
}

// ⭐ LOAD CÂU HỎI VÀ ĐÁP ÁN ⭐
async function loadCauHoi() {
    try {
        console.log('📡 Fetching chi tiet bai lam...');
        
        const response = await fetch(`/Student/TracNghiem/GetChiTietBaiLam?baiLamId=${baiLamId}`);
        const data = await response.json();
        
        console.log('📥 Response:', data);
        
        if (data.success && data.cauHois) {
            cauHois = data.cauHois;
            renderCauHois();
            updateThongKe();
        } else {
            showError('Không thể tải câu hỏi: ' + (data.message || 'Lỗi không xác định'));
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showError('Có lỗi xảy ra khi tải câu hỏi!');
    }
}

// ⭐ RENDER CÂU HỎI VỚI MÀU SẮC ĐÚ/SAI ⭐
function renderCauHois() {
    const questionList = document.getElementById('questionList');
    const questionNav = document.getElementById('questionNav');
    
    if (!questionList || !questionNav) return;
    
    questionList.innerHTML = '';
    questionNav.innerHTML = '';
    
    cauHois.forEach((cauHoi, index) => {
        const cauSo = index + 1;
        
        // ⭐ XÁC ĐỊNH MÀU SẮC DỰA TRÊN KẾT QUẢ ⭐
        let statusClass = 'secondary'; // Bỏ qua
        let statusIcon = '-';
        let statusText = 'Bỏ qua';
        
        if (cauHoi.laDung === true) {
            statusClass = 'success';
            statusIcon = '✓';
            statusText = 'Đúng';
        } else if (cauHoi.laDung === false) {
            statusClass = 'danger';
            statusIcon = '✗';
            statusText = 'Sai';
        }
        
        // ⭐ RENDER CÂU HỎI CHI TIẾT ⭐
        const questionHtml = `
            <div class="card mb-3 border-${statusClass}" id="cau-${cauSo}">
                <div class="card-header bg-${statusClass} bg-opacity-10">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="fw-bold mb-0">
                            <span class="badge bg-${statusClass} me-2">${statusIcon}</span>
                            Câu ${cauSo}: ${statusText}
                        </h6>
                        <span class="text-muted small">Điểm: ${cauHoi.diem || 1}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="fw-semibold mb-3">${escapeHtml(cauHoi.noiDung)}</div>
                    
                    ${cauHoi.hinhAnh ? `
                        <div class="text-center my-3">
                            <img src="${cauHoi.hinhAnh}" 
                                 alt="Hình ảnh câu ${cauSo}" 
                                 class="img-fluid rounded border shadow-sm"
                                 style="max-width: 100%; max-height: 400px; object-fit: contain;">
                        </div>
                    ` : ''}
                    
                    <div class="list-group">
                        ${cauHoi.dapAns.map(da => {
                            let itemClass = '';
                            let icon = '';
                            let badge = '';
                            
                            if (da.laDapAnDung) {
                                itemClass = 'list-group-item-success';
                                icon = '<i class="bi bi-check-circle-fill text-success me-2"></i>';
                                badge = '<span class="badge bg-success ms-2">Đáp án đúng</span>';
                            }
                            
                            if (da.duocChon && !da.laDapAnDung) {
                                itemClass = 'list-group-item-danger';
                                icon = '<i class="bi bi-x-circle-fill text-danger me-2"></i>';
                                badge = '<span class="badge bg-danger ms-2">Bạn đã chọn</span>';
                            }
                            
                            if (da.duocChon && da.laDapAnDung) {
                                badge = '<span class="badge bg-success ms-2">Bạn đã chọn đúng</span>';
                            }
                            
                            return `
                                <div class="list-group-item ${itemClass} d-flex align-items-center">
                                    ${icon}
                                    <span class="fw-bold me-2">${da.key}.</span>
                                    <span class="flex-grow-1">${escapeHtml(da.noiDung)}</span>
                                    ${badge}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- GIẢI THÍCH KẾT QUẢ -->
                    <div class="mt-3 p-3 rounded ${
                        cauHoi.laDung === true ? 'bg-success' : 
                        cauHoi.laDung === false ? 'bg-danger' : 
                        'bg-warning'
                    } bg-opacity-10">
                        <div class="d-flex align-items-start">
                            <i class="bi ${
                                cauHoi.laDung === true ? 'bi-check-circle-fill text-success' : 
                                cauHoi.laDung === false ? 'bi-x-circle-fill text-danger' : 
                                'bi-exclamation-triangle-fill text-warning'
                            } fs-5 me-2"></i>
                            <div>
                                ${cauHoi.laDung === true ? 
                                    '<strong class="text-success">Chính xác!</strong> Bạn đã chọn đúng đáp án.' :
                                cauHoi.laDung === false ?
                                    `<strong class="text-danger">Sai rồi!</strong> Bạn đã chọn <strong>${cauHoi.dapAnChon}</strong>, đáp án đúng là <strong>${cauHoi.dapAnDung}</strong>.` :
                                    `<strong class="text-warning">Bỏ qua!</strong> Bạn chưa chọn đáp án. Đáp án đúng là <strong>${cauHoi.dapAnDung}</strong>.`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        questionList.innerHTML += questionHtml;
        
        // ⭐ RENDER NÚT NAVIGATION ⭐
        const navBtn = document.createElement('button');
        navBtn.className = `btn btn-${statusClass} btn-sm`;
        navBtn.textContent = cauSo;
        navBtn.onclick = () => scrollToCauHoi(cauSo);
        questionNav.appendChild(navBtn);
    });
    
    console.log('✅ Rendered', cauHois.length, 'câu hỏi');
}

// ⭐ CẬP NHẬT THỐNG KÊ ⭐
function updateThongKe() {
    const soCauDung = cauHois.filter(ch => ch.laDung === true).length;
    const soCauSai = cauHois.filter(ch => ch.laDung === false).length;
    const soCauBoQua = cauHois.filter(ch => ch.laDung === null).length;
    
    document.getElementById('soCauDung').textContent = soCauDung;
    document.getElementById('soCauSai').textContent = soCauSai;
    document.getElementById('soCauBoQua').textContent = soCauBoQua;
    
    console.log('📊 Thống kê:', { soCauDung, soCauSai, soCauBoQua });
}

// ⭐ SCROLL ĐẾN CÂU HỎI ⭐
function scrollToCauHoi(cauSo) {
    const element = document.getElementById(`cau-${cauSo}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight hiệu ứng
        element.classList.add('border-primary', 'border-3');
        setTimeout(() => {
            element.classList.remove('border-primary', 'border-3');
        }, 1500);
    }
}

// ⭐ ESCAPE HTML ⭐
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ⭐ HIỂN THỊ LỖI ⭐
function showError(message) {
    document.getElementById('questionList').innerHTML = `
        <div class="alert alert-danger">
            <i class="bi bi-exclamation-circle me-2"></i>${message}
        </div>
    `;
}

// ⭐ EXPORT ⭐
window.initXemKetQua = initXemKetQua;
window.scrollToCauHoi = scrollToCauHoi;

console.log('✅ Js_XemKetQua.js loaded');