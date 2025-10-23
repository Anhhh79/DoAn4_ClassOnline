function loadNoiDung(url) {
    fetch(url)
        .then(res => res.text())
        .then(html => {
            document.getElementById("noiDungContainer").innerHTML = html;
        })
        .catch(err => console.error("Lỗi tải nội dung:", err));
}

// Khi bấm Thông báo
document.getElementById("btnThongBao").addEventListener("click", function (e) {
    e.preventDefault();
    loadNoiDung('/Student/Notification/Index');
});

// Khi bấm Tài liệu
document.getElementById("btnTaiLieu").addEventListener("click", function (e) {
    e.preventDefault();
    loadNoiDung('/Student/Document/Index');
});