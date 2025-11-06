document.addEventListener("DOMContentLoaded", () => {

    function loadNoiDung(url) {
        fetch(url)
            .then(res => res.text())
            .then(html => {
                const container = document.getElementById("noiDungContainer");
                if (container) container.innerHTML = html;
            })
            .catch(err => console.error("Lỗi tải nội dung:", err));
    }

    const btnThongBao = document.getElementById("btnThongBao");
    const btnTaiLieu = document.getElementById("btnTaiLieu");
    const btnNopBai = document.getElementById("btnNopBai");
    const btnTracNghiem = document.getElementById("btnTracNghiem");

    if (btnThongBao) {
        btnThongBao.addEventListener("click", (e) => {
            e.preventDefault();
            loadNoiDung('/Student/Notification/Index');
        });
    }

    if (btnTaiLieu) {
        btnTaiLieu.addEventListener("click", (e) => {
            e.preventDefault();
            loadNoiDung('/Student/Document/Index');
        });
    }

    if (btnNopBai) {
        btnNopBai.addEventListener("click", (e) => {
            e.preventDefault();
            loadNoiDung('/Student/NopBai/Index');
        });
    }

    if (btnTracNghiem) {
        btnTracNghiem.addEventListener("click", (e) => {
            e.preventDefault();
            loadNoiDung('/Student/TracNghiem/Index');
        });
    }

});
