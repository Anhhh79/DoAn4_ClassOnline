// ⭐ FILE JAVASCRIPT RIÊNG CHO TRANG CHI TIẾT KHÓA HỌC ⭐
// Không làm thay đổi giao diện, chỉ xử lý logic

document.addEventListener("DOMContentLoaded", function() {
    console.log('✅ ChiTietKhoaHoc.js loaded');

    // ⭐ LẤY KHOAHOCID TỪ WINDOW ⭐
    const khoaHocId = window.khoaHocId || 0;
    console.log('📚 KhoaHocId hiện tại:', khoaHocId);

    if (khoaHocId <= 0) {
        console.error('❌ KhoaHocId không hợp lệ!');
        return;
    }

    // ⭐ HÀM LOAD NỘI DUNG ĐỘNG ⭐
    function loadNoiDung(url) {
        console.log('🔄 Loading content from:', url);
        
        // Thêm khoaHocId vào URL
        const urlWithId = url.includes('?') 
            ? `${url}&khoaHocId=${khoaHocId}` 
            : `${url}?khoaHocId=${khoaHocId}`;
        
        console.log('📡 URL with KhoaHocId:', urlWithId);
        
        fetch(urlWithId)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.text();
            })
            .then(html => {
                const container = document.getElementById("noiDungContainer");
                if (container) {
                    container.innerHTML = html;
                    console.log('✅ Content loaded successfully');
                } else {
                    console.error('❌ Container #noiDungContainer not found');
                }
            })
            .catch(err => {
                console.error("❌ Lỗi tải nội dung:", err);
                showError("Không thể tải nội dung. Vui lòng thử lại!");
            });
    }

    // ⭐ HÀM SET ACTIVE BUTTON ⭐
    function setActiveButton(clickedBtn) {
        const tabButtons = ["btnThongBao", "btnTaiLieu", "btnNopBai", "btnTracNghiem"];
        
        // Xóa active tất cả
        tabButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                const card = btn.querySelector('.card');
                if (card) {
                    card.classList.remove("text-primary");
                    card.classList.remove("bg-primary");
                    card.classList.remove("text-white");
                }
            }
        });

        // Set active cho button được click
        if (clickedBtn) {
            const card = clickedBtn.querySelector('.card');
            if (card) {
                card.classList.add("text-primary");
            }
        }
    }

    // ⭐ GẮN SỰ KIỆN CHO BUTTON THÔNG BÁO ⭐
    const btnThongBao = document.getElementById("btnThongBao");
    if (btnThongBao) {
        btnThongBao.addEventListener("click", function(e) {
            e.preventDefault();
            console.log('📢 Loading Thông báo...');
            loadNoiDung('/Student/Notification/Index');
            setActiveButton(this);
        });
    }

    // ⭐ GẮN SỰ KIỆN CHO BUTTON TÀI LIỆU ⭐
    const btnTaiLieu = document.getElementById("btnTaiLieu");
    if (btnTaiLieu) {
        btnTaiLieu.addEventListener("click", function(e) {
            e.preventDefault();
            console.log('📄 Loading Tài liệu...');
            loadNoiDung('/Student/Document/Index');
            setActiveButton(this);
        });
    }

    // ⭐ GẮN SỰ KIỆN CHO BUTTON NỘP BÀI ⭐
    const btnNopBai = document.getElementById("btnNopBai");
    if (btnNopBai) {
        btnNopBai.addEventListener("click", function(e) {
            e.preventDefault();
            console.log('📝 Loading Nộp bài...');
            loadNoiDung('/Student/NopBai/Index');
            setActiveButton(this);
        });
    }

    // ⭐ GẮN SỰ KIỆN CHO BUTTON TRẮC NGHIỆM ⭐
    const btnTracNghiem = document.getElementById("btnTracNghiem");
    if (btnTracNghiem) {
        btnTracNghiem.addEventListener("click", function(e) {
            e.preventDefault();
            console.log('✅ Loading Trắc nghiệm...');
            loadNoiDung('/Student/TracNghiem/Index');
            setActiveButton(this);
        });
    }

    // ⭐ TỰ ĐỘNG LOAD THÔNG BÁO KHI VÀO TRANG ⭐
    console.log('🚀 Auto-loading Thông báo...');
    loadNoiDung('/Student/Notification/Index');
    setActiveButton(btnThongBao);

    // ⭐ HÀM HIỂN THỊ LỖI (NẾU CẦN) ⭐
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

    // ⭐ LOG THÔNG TIN DEBUG ⭐
    console.log('📊 Thông tin trang:');
    console.log('- KhoaHocId:', khoaHocId);
    console.log('- Buttons found:', {
        thongBao: !!btnThongBao,
        taiLieu: !!btnTaiLieu,
        nopBai: !!btnNopBai,
        tracNghiem: !!btnTracNghiem
    });
});