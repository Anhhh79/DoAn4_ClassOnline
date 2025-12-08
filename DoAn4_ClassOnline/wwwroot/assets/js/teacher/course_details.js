
document.addEventListener("DOMContentLoaded", () => {
    // ⭐ LẤY KHOAHOCID TỪ DATA ATTRIBUTE ⭐
    function getKhoaHocId() {
        const container = document.querySelector('.container[data-khoa-hoc-id]');
        if (container) {
            const khoaHocId = container.getAttribute('data-khoa-hoc-id');
            console.log('KhoaHocId from data attribute:', khoaHocId);
            return khoaHocId;
        }
        
        // Fallback: lấy từ URL
        const pathSegments = window.location.pathname.split('/');
        const indexPath = pathSegments.indexOf('Index');
        if (indexPath !== -1 && pathSegments[indexPath + 1]) {
            const id = pathSegments[indexPath + 1];
            console.log('KhoaHocId from URL:', id);
            return id;
        }
        
        return null;
    }

    function loadNoiDung_Tc(url) {
        console.log('Loading content from:', url);
        fetch(url)
            .then(res => res.text())
            .then(html => {
                const container = document.getElementById("noiDungContainer");
                if (container) container.innerHTML = html;
            })
            .catch(err => console.error("Lỗi tải nội dung:", err));
    }

    // Danh sách button
    const tabButtons = ["btnThongBao", "btnTaiLieu", "btnBaiTap", "btnTracNghiem"];

    // Hàm set active
    function setActiveButton(clickedBtn) {
        const tabButtons = ["btnThongBao", "btnTaiLieu", "btnBaiTap", "btnTracNghiem"];
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

    // ✅ TỰ ĐỘNG LOAD THÔNG BÁO KHI VÀO TRANG
    const khoaHocId = getKhoaHocId();
    if (khoaHocId) {
        console.log('Auto-loading Thông báo for khoaHocId:', khoaHocId);
        loadThongBaos(khoaHocId);

        // Set active cho button Thông báo
        const btnThongBao = document.getElementById("btnThongBao");
        if (btnThongBao) {
            setActiveButton(btnThongBao);
        }
    } 

    // Khi bấm Thông báo
    const btnThongBao = document.getElementById("btnThongBao");
    if (btnThongBao) {
        btnThongBao.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung_Tc('/Teacher/Course/ThongBao');

            const khoaHocId = getKhoaHocId();
            if (khoaHocId) {
                loadThongBaos(khoaHocId);
            } else {
                console.error('khoaHocId is null');
                showError_tc('Lỗi: Không xác định được ID khóa học!');
            }
            setActiveButton(this);
        });
    }

    // Khi bấm Tài liệu
    const btnTaiLieu = document.getElementById("btnTaiLieu");
    if (btnTaiLieu) {
        btnTaiLieu.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung_Tc('/Teacher/Course/TaiLieu');
            if (khoaHocId) {
                loadTaiLieu_ChiTiet(khoaHocId);
            } else {
                console.error('khoaHocId is null');
                showError_tc('Lỗi: Không xác định được ID khóa học!');
            }
            setActiveButton(this);
        });
    }

    // Khi bấm Bài tập
    const btnBaiTap = document.getElementById("btnBaiTap");
    if (btnBaiTap) {
        btnBaiTap.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung_Tc('/Teacher/Course/BaiTap');
            setActiveButton(this);
        });
    }

    // ⭐ KHI BẤM TRẮC NGHIỆM - SỬ DỤNG KHOAHOCID TỪ DATA ATTRIBUTE ⭐
    const btnTracNghiem = document.getElementById("btnTracNghiem");
    if (btnTracNghiem) {
        btnTracNghiem.addEventListener("click", function (e) {
            e.preventDefault();
            console.log('Trắc nghiệm button clicked');
            
            const khoaHocId = getKhoaHocId();
            console.log('Using khoaHocId:', khoaHocId);
            
            if (khoaHocId) {
                const url = `/Teacher/TracNghiem/Index?khoaHocId=${khoaHocId}`;
                console.log('Loading TracNghiem with URL:', url);
                loadNoiDung_Tc(url);
            } else {
                console.error('khoaHocId is null');
                alert('Lỗi: Không xác định được ID khóa học!');
            }
            setActiveButton(this);
        });
    }

});


// tạo phòng học — không cần bind nếu gọi từ onclick trên button trong modal
window.startMeeting = async function () {
    try {
        const linkEl = document.getElementById("meetLink");
        if (!linkEl) {
            showError_tc("Lỗi: Không tìm thấy ô nhập link Meet.");
            return;
        }

        const link = linkEl.value.trim();
        if (!link) {
            showWarning_tc("Vui lòng nhập link Google Meet.");
            return;
        }

        // Kiểm tra link chính xác
        if (!isValidGoogleMeet(link)) {
            showWarning_tc("Vui lòng nhập link Google Meet hợp lệ (ví dụ: https://meet.google.com/abc-defg-hij).");
            return;
        }

        // Kiểm tra camera/micro (như cũ)
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideo = devices.some(d => d.kind === "videoinput");
                const hasAudio = devices.some(d => d.kind === "audioinput");

                if (!hasVideo && !hasAudio) {
                    const result = await window.showConfirm_tc(
                        "Không phát hiện camera/micro. Bạn vẫn có thể vào Meet nhưng sẽ không lên hình/âm thanh.\n\nBạn có muốn tiếp tục?"
                    );
                    if (!result.isConfirmed) return;
                } else if (!hasVideo) {
                    const result = await window.showConfirm_tc(
                        "Không phát hiện camera. Bạn vẫn có thể tham gia Meet nhưng sẽ không lên hình.\n\nBạn có muốn tiếp tục?"
                    );
                    if (!result.isConfirmed) return;
                } else if (!hasAudio) {
                    const result = await window.showConfirm_tc(
                        "Không phát hiện micro. Bạn vẫn có thể tham gia Meet nhưng sẽ không có âm thanh.\n\nBạn có muốn tiếp tục?"
                    );
                    if (!result.isConfirmed) return;
                }
            }
        } catch (devErr) { console.warn(devErr); }

        window.open(link, "_blank", "noopener,noreferrer");

        const modalEl = document.getElementById("joinMeetModal");
        if (modalEl && window.bootstrap) {
            let instance = bootstrap.Modal.getInstance(modalEl);
            if (!instance) instance = new bootstrap.Modal(modalEl);
            try { instance.hide(); } catch (e) { }
        }

    } catch (err) {
        console.error(err);
        showError_tc("Đã xảy ra lỗi khi mở link Meet.");
    }
};

function isValidGoogleMeet(link) {
    // Regex chuẩn Google Meet: https://meet.google.com/xxx-xxxx-xxx
    const meetRegex = /^https:\/\/meet\.google\.com\/[a-zA-Z0-9-]{3,}(-[a-zA-Z0-9-]{3,}){1,2}$/;
    return meetRegex.test(link);
}

