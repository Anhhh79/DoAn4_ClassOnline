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

    loadNoiDung('/Student/Notification/Index');
    setActiveButton(document.getElementById("btnThongBao"));
});
