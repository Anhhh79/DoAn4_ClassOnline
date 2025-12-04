document.addEventListener("DOMContentLoaded", () => {
    //Lọc khóa học theo học kỳ
    const selectHocKy_QuanLy = document.getElementById("selectHocKy_QuanLy");
    if (selectHocKy_QuanLy) {
        selectHocKy_QuanLy.addEventListener("change", function () {

            const items = document.querySelectorAll(".khoaHocItem");

            if (this.value == "0") {
                items.forEach(i => i.style.display = "");
                document.getElementById("noResult").style.display = "none";
                return;
            }

            // Tách học kỳ và năm học: "HK1 / 2024 - 2025"
            const selectedText = this.options[this.selectedIndex].text;
            const [hkText, namText] = selectedText.split("/").map(t => t.trim());

            const hk = hkText.replace("HK", "");
            const namHoc = namText;

            items.forEach(item => {
                const itemHK = item.getAttribute("data-hocky");
                const itemNam = item.getAttribute("data-namhoc");

                if (itemHK == hk && itemNam == namHoc) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            });

            const visibleCount = [...items].filter(i => i.style.display !== "none").length;
            document.getElementById("noResult").style.display = visibleCount === 0 ? "" : "none";
        });
    }
   
});
