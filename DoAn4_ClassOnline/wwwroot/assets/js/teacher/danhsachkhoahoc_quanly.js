document.addEventListener("DOMContentLoaded", () => {
    const selectHocKy_QuanLy = document.getElementById("selectHocKy_QuanLy");
    if (selectHocKy_QuanLy) {
        selectHocKy_QuanLy.addEventListener("change", applyHocKyFilter);
    }

});

// Hàm lọc khóa học theo học kỳ
function applyHocKyFilter() {
    const select = document.getElementById("selectHocKy_QuanLy");
    const items = document.querySelectorAll(".khoaHocItem");

    if (!select) return;

    // "0" là tất cả
    if (select.value === "0" || select.value === 0) {
        items.forEach(i => i.style.display = "");
        const noResult = document.getElementById("noResult");
        if (noResult) noResult.style.display = "none";
        return;
    }

    const selectedHocKyId = String(select.value); // đảm bảo là string để so sánh
    items.forEach(item => {
        const itemHocKyId = item.getAttribute("data-hockyid");
        if (itemHocKyId === selectedHocKyId) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });

    const visibleCount = [...items].filter(i => i.style.display !== "none").length;
    const noResult = document.getElementById("noResult");
    if (noResult) noResult.style.display = (visibleCount === 0) ? "" : "none";
}

//load lại danh sách khóa học
function loadKhoaHoc() {
    $.ajax({
        type: "GET",
        url: "/Teacher/QuanLyKhoaHoc/DanhSachKhoaHoc",
        success: function (res) {
            if (res.success) {
                renderKhoaHoc(res.data);
                $("#selectHocKy_QuanLy").val("0");
            } else {
                showError_tc(res.message || "Lỗi tải danh sách!");
            }
        },
        error: function () {
            showError_tc("Lỗi hệ thống!");
        }
    });
}

//đưa dữ liệu lên  danh sách khóa học
function renderKhoaHoc(khoaHocs) {
    let container = $("#khoaHocContainer_QuanLy");
    container.empty();

    if (khoaHocs.length === 0) {
        $("#noResult").show();
        return;
    }

    $("#noResult").hide();

    khoaHocs.forEach(function (item) {
        let html = `
            <div class="col-12 col-md-3 khoaHocItem" 
                data-hockyid="${item.hocKyId}" 
                data-namhoc="${item.namHoc}">
                <div class="card shadow border-0 rounded-4 overflow-hidden h-100">
                    <a href="/Teacher/QuanLyKhoaHoc/QuanLyKhoaHoc/${item.khoaHocId}">
                        <div class="card-header p-0 border-0 bg-white image-cuser">
                            <img src="${item.hinhAnh}" class="w-100" alt="${item.tenKhoaHoc}" 
                                 style="height: 130px; object-fit: cover;">
                        </div>
                    </a>
                    <div class="card-body text-start">
                        <h6 class="fw-bold mb-2 text-truncate" title="${item.tenKhoaHoc}">
                            ${item.tenKhoaHoc}
                        </h6>
                        <span class="text-truncate">Giảng viên: ${item.giaoVienName}</span><br />
                        <span class="text-truncate">${item.tenKhoa}</span><br />
                        <span>${item.tenHocKy} / ${item.namHoc}</span>
                        <div class="d-flex justify-content-between text-secondary small mb-3 mt-2">
                            <span>${item.soLuongSinhVien} SV đã tham gia</span>
                            <span>Tất cả mọi người</span>
                        </div>
                        <div class="text-start">
                            <a class="btn btn-light w-100 border rounded-3" 
                               href="/Teacher/QuanLyKhoaHoc/QuanLyKhoaHoc/${item.khoaHocId}">
                                Quản lý khóa học
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.append(html);
    });
}

// thêm khóa học 
function themKhoaHoc() {
    if (!checkError_Insert()) {
        return; // ⬅ Dừng không gửi AJAX
    }
    // Lấy dữ liệu từ form
    let formData = new FormData();
    formData.append("TenKhoaHoc", $("#tenKhoaHoc_Insert").val());
    formData.append("KhoaId", $("#khoa_Insert").val());
    formData.append("HocKyId", $("#hocKy_Insert").val());
    formData.append("LinkHocOnline", $("#linkHocOnline_Insert").val());
    formData.append("MatKhau", $("#matKhau_Insert").val());

    let file = $("#anhKhoaHoc_Insert")[0].files[0];
    if (file) {
        formData.append("AnhKhoaHoc", file);
    }
    console.log(...formData); // Kiểm tra dữ liệu gửi đi
    $.ajax({
        type: "POST",
        url: "/Teacher/QuanLyKhoaHoc/ThemKhoaHoc",
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            if (res.success) {
                showSuccess_tc("Thêm khóa học thành công!");

                // Reset form
                $("#formThemKhoaHoc")[0].reset();

                // Đóng modal
                closeModal("themKhoaHocModal");

                // Load lại danh sách
                loadKhoaHoc();
            } else {
                showError_tc(res.message || "Lỗi thêm khóa học!");
            }
        },
        error: function () {
            showError_tc("Lỗi hệ thống!");
        }
    });
}

//kiểm tra lỗi khi thêm khóa học
function checkError_Insert() {
    clearFieldErrors(); // Xóa lỗi cũ trước khi validate

    const ten = $("#tenKhoaHoc_Insert").val().trim();
    const khoa = $("#khoa_Insert").val();
    const hocKy = $("#hocKy_Insert").val();
    const link = $("#linkHocOnline_Insert").val().trim();
    const mk = $("#matKhau_Insert").val().trim();
    const fileAnh = $("#anhKhoaHoc_Insert")[0].files[0];

    let hasError = true;

    // ===== VALIDATION =====
    if (!ten) {
        showFieldError("err_ten", "Vui lòng nhập tên khóa học");
        hasError = false;
    }

    if (!khoa) {
        showFieldError("err_khoa", "Vui lòng chọn khoa");
        hasError = false;
    }

    if (!hocKy) {
        showFieldError("err_hocKy", "Vui lòng chọn học kỳ");
        hasError = false;
    }

    if (link) {
        if (!/^https?:\/\/.+/.test(link)) {
            showFieldError("err_link", "Link không hợp lệ");
            hasError = false;
        }
    }

    if (mk) {
        if (mk.length < 6) {
            showFieldError("err_matKhau", "Mật khẩu phải có ít nhất 6 ký tự");
            hasError = false;
        }
    }

    return hasError;
}

//hiển thị lỗi cho trường
function showFieldError(id, message) {
    $("#" + id).text(message);
}
//xóa lỗi cho tất cả các trường
function clearFieldErrors() {
    $(".error-msg").text(""); // Xóa tất cả lỗi
}
//xóa lỗi khi focus
function clearError(id) {
    $("#" + id).text("");
}
document.addEventListener("DOMContentLoaded", () => {
    $("#tenKhoaHoc_Insert").on("focus", () => clearError("err_ten"));
    $("#khoa_Insert").on("focus", () => clearError("err_khoa"));
    $("#hocKy_Insert").on("focus", () => clearError("err_hocKy"));
    $("#linkHocOnline_Insert").on("focus", () => clearError("err_link"));
    $("#matKhau_Insert").on("focus", () => clearError("err_matKhau"));
    $("#anhKhoaHoc_Insert").on("change", () => clearError("err_anh"));
});

//reset form thêm khóa học
function resetForm_ThemKhoaHoc() {
    $("#formThemKhoaHoc")[0].reset();
    clearFieldErrors();
}
