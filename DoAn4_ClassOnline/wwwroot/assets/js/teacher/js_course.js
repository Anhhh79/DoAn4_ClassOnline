document.addEventListener("DOMContentLoaded", () => {

    function loadNoiDung_Tc(url) {
        fetch(url)
            .then(res => res.text())
            .then(html => {
                const container = document.getElementById("noiDungContainer");
                if (container) container.innerHTML = html;
            })
            .catch(err => console.error("Lỗi tải nội dung:", err));
    }

    // Khi bấm Thông báo
    const btnThongBao = document.getElementById("btnThongBao");
    if (btnThongBao) {
        btnThongBao.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung_Tc('/Teacher/Course/ThongBao');
        });
    }

    // Khi bấm Tài liệu
    const btnTaiLieu = document.getElementById("btnTaiLieu");
    if (btnTaiLieu) {
        btnTaiLieu.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung_Tc('/Teacher/Course/TaiLieu');
        });
    }

    // Khi bấm bài tập
    const btnBaiTap = document.getElementById("btnBaiTap");
    if (btnBaiTap) {
        btnBaiTap.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung_Tc('/Teacher/Course/BaiTap');
        });
    }
    // Khi bấm trắc nghiệm
    const btnTracNghiem = document.getElementById("btnTracNghiem");
    if (btnBaiTap) {
        btnTracNghiem.addEventListener("click", function (e) {
            e.preventDefault();
            loadNoiDung_Tc('/Teacher/TracNghiem/Index');
        });
    }

});

// tạo phòng học — không cần bind nếu gọi từ onclick trên button trong modal
window.startMeeting = async function () {
    try {
        // Lấy phần tử input
        const linkEl = document.getElementById("meetLink");
        if (!linkEl) {
            console.error("Không tìm thấy phần tử #meetLink trên trang.");
            alert("Lỗi: Không tìm thấy ô nhập link Meet trên trang này.");
            return;
        }

        const link = linkEl.value.trim();
        if (!link) {
            alert("Vui lòng nhập link Google Meet.");
            return;
        }

        // Kiểm tra định dạng đơn giản (bắt đầu bằng http:// hoặc https://)
        if (!/^https?:\/\//i.test(link)) {
            alert("Vui lòng nhập link hợp lệ, bắt đầu bằng http:// hoặc https://");
            return;
        }

        // Thử kiểm tra thiết bị (camera/micro) — nếu không có sẽ cảnh báo nhưng vẫn cho phép tiếp tục
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideo = devices.some(d => d.kind === "videoinput");
                const hasAudio = devices.some(d => d.kind === "audioinput");

                if (!hasVideo && !hasAudio) {
                    const proceed = confirm("Không phát hiện camera/micro. Bạn vẫn có thể vào Meet nhưng sẽ không lên hình/âm thanh.\n\nBạn có muốn tiếp tục?");
                    if (!proceed) return;
                } else if (!hasVideo) {
                    const proceed = confirm("Không phát hiện camera. Bạn vẫn có thể tham gia Meet nhưng sẽ không lên hình.\n\nBạn có muốn tiếp tục?");
                    if (!proceed) return;
                } else if (!hasAudio) {
                    const proceed = confirm("Không phát hiện micro. Bạn vẫn có thể tham gia Meet nhưng sẽ không có âm thanh.\n\nBạn có muốn tiếp tục?");
                    if (!proceed) return;
                }
            }
        } catch (devErr) {
            // Nếu enumerateDevices lỗi (quyền bị chặn hoặc trình duyệt cũ) — chỉ log và cho phép tiếp tục
            console.warn("Không thể kiểm tra thiết bị (enumerateDevices):", devErr);
        }

        // Mở link trong tab mới (an toàn)
        const newWin = window.open(link, "_blank", "noopener,noreferrer");
       

        // Nếu dùng Bootstrap modal, đóng modal sau khi mở
        const modalEl = document.getElementById("joinMeetModal");
        if (modalEl && window.bootstrap) {
            // Lấy instance nếu đã tồn tại, nếu không thì tạo mới rồi close
            let instance = bootstrap.Modal.getInstance(modalEl);
            if (!instance) instance = new bootstrap.Modal(modalEl);
            try { instance.hide(); } catch (e) { /* ignore */ }
        }

    } catch (err) {
        console.error("Lỗi khi mở Google Meet:", err);
        alert("Đã xảy ra lỗi khi mở link. Kiểm tra console để biết chi tiết.");
    }
};




