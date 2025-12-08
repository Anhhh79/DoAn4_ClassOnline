
    function loadTaiLieu_ChiTiet(khoaHocId) {
        $.ajax({
            url: `/Teacher/TaiLieu/GetListTaiLieu?khoaHocId=${khoaHocId}`,
            method: "GET",
            success: function (res) {
                if (!res.success) {
                    $("#taiLieuContainer").html(
                        `<div class="alert alert-danger">${res.message}</div>`
                    );
                    return;
                }
                if (res.data.length === 0) {
                    $("#taiLieuContainer").html(
                        ` <div class="text-center text-muted py-3">
                  <i class="bi bi-file-earmark fs-1"></i>
                    <p class="mt-2 mb-0">Chưa có tài liệu nào.</p>
                </div>`
                    );
                    return;
                }

                renderTaiLieu(res.data);
            },
            error: function (xhr) {
                $("#taiLieuContainer").html(
                    `<div class="alert alert-danger">Lỗi tải dữ liệu!</div>`
                );
            }
        });
}

    function renderTaiLieu(list) {
        let html = "";

        list.forEach((tl, index) => {
            const collapseId = "collapseTaiLieu" + tl.taiLieuId;

    html += `
    <div class="col-12">

        <!-- ====== HEADER TÀI LIỆU ====== -->
        <div class="border rounded-3 p-3 mb-2 bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">

            <!-- Tiêu đề -->
            <a class="text-decoration-none text-dark d-flex align-items-center flex-grow-1"
                data-bs-toggle="collapse"
                href="#${collapseId}"
                role="button"
                aria-expanded="false"
                aria-controls="${collapseId}">
                <strong class="me-1">Tài liệu ${index + 1}:</strong>
                ${tl.tenTaiLieu}
            </a>

            <!-- Thời gian -->
            <div class="text-muted small d-flex align-items-center me-4">
                <i class="bi bi-clock me-1"></i> ${formatDate(tl.ngayTao)}
            </div>

            <!-- Action -->
            <div class="text-end">
                <button class="btn btn-outline-secondary btn-sm me-2" data-bs-toggle="modal"
                    data-bs-target="#editTaiLieuModal" onclick="openEdit(${tl.taiLieuId})">
                    <i class="bi bi-pencil"></i> Sửa
                </button>

                <button class="btn btn-outline-danger btn-sm" onclick="deleteTaiLieu(${tl.taiLieuId})">
                    <i class="bi bi-trash"></i> Xóa
                </button>
            </div>
        </div>

        <!-- ====== NỘI DUNG COLLAPSE ====== -->
        <div class="collapse" id="${collapseId}">
            <div class="p-3 border rounded-3 mb-3" style="background-color: rgba(243,246,248);">

                <p class="mb-2">
                    <strong>Mô tả:</strong> ${tl.moTa ?? "Không có mô tả"}
                </p>

                <hr class="my-2">

                    <!-- Danh sách file -->
                    <div class="row gy-2 mt-2">
                        ${renderFiles(tl.danhSachFile)}
                    </div>
            </div>
        </div>

    </div>`;
        });

    $("#taiLieuContainer").html(html);
}

    function renderFiles(files) {
        if (!files || files.length === 0) {
            return `
    <div class="col-12 text-muted">
        <em>Không có file đính kèm</em>
    </div>
    `;
        }

    let html = "";

        files.forEach(f => {
        let color = "black";
    let icon = "bi-file-earmark";

    if (f.loaiFile.includes("pdf")) {
        color = "red";
    icon = "bi-file-earmark-pdf";
    } else if (f.loaiFile.includes("word") || f.loaiFile.includes("docx") ) {
        color = "#2b579a";
    icon = "bi-file-earmark-word";
    } else if (f.loaiFile.includes("excel") || f.loaiFile.includes("spreadsheet") || f.loaiFile.includes("xlsx")) {
        color = "green";
    icon = "bi-file-earmark-excel";
            }

    html += `
    <div class="col-12">
        <a href="${f.duongDan}" target="_blank"
            class="d-flex justify-content-between align-items-center border rounded-3 p-3 bg-white text-decoration-none shadow-sm"
            style="color: ${color};">

            <div class="d-flex align-items-center">
                <i class="bi ${icon} fs-4 me-3"></i>
                <div><strong>${f.loaiFile.toUpperCase()}:</strong> ${f.tenFile}</div>
            </div>

            <button class="btn btn-sm btn-outline-${getButtonColor(color)}">
                <i class="bi bi-download me-1"></i> Tải xuống
            </button>
        </a>
    </div>`;
        });

    return html;
}

    function getButtonColor(color) {
        if (color === "red") return "danger";
    if (color === "#2b579a") return "primary";
    if (color === "green") return "success";
    return "secondary";
}

function createTaiLieu() {

    // Validate form
    if (!validateAddTaiLieu()) {
        return;
    }
    let formData = new FormData();

    // Lấy dữ liệu từ form
    formData.append("KhoaHocId", $("#khoaHocId_ChiTiet").val());
    formData.append("TenTaiLieu", $("#tenTaiLieu_Add").val().trim());
    formData.append("MoTa", $("#moTa_Add").val().trim());
    formData.append("ThuTu", $("#thuTu_Add").val());
    
    // Lấy danh sách file
    let files = $("#files_Add")[0].files;
    if (files.length === 0) {
        showError_tc("Vui lòng chọn ít nhất 1 tệp!");
        return;
    }


    for (let i = 0; i < files.length; i++) {
        formData.append("Files", files[i]);
    }

    // Disable nút để tránh submit nhiều lần
    let btn = $("#addTaiLieuModal .btn-primary");
    btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Đang lưu...');
    console.log("=== FormData gửi lên ===");
    for (var pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
    }
    $.ajax({
        url: "/Teacher/TaiLieu/CreateTaiLieu",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            // Bật lại nút
            btn.prop("disabled", false).html('<i class="bi bi-save me-1"></i> Lưu tài liệu');

            if (res.success) {
                showSuccess_tc("Thêm tài liệu thành công!");
                closeModal('addTaiLieuModal');

                // Reset form
                $("#addTaiLieuModal form")[0].reset();

                // Load lại danh sách tài liệu
                loadTaiLieu_ChiTiet($("#khoaHocId_ChiTiet").val());
            } else {
                showError_tc(res.message || "Không thể thêm tài liệu!");
            }
        },
        error: function () {
            btn.prop("disabled", false).html('<i class="bi bi-save me-1"></i> Lưu tài liệu');
            showError_tc("Đã xảy ra lỗi khi thêm tài liệu!");
        }
    });
}

function validateAddTaiLieu() {
    let isValid = true;

    // Lấy các input
    const ten = $("#tenTaiLieu_Add");
    const moTa = $("#moTa_Add");
    const files = $("#files_Add");

    // Reset trạng thái lỗi
    $(".is-invalid").removeClass("is-invalid");

    // Kiểm tra Tên tài liệu
    if (ten.val().trim() === "") {
        ten.addClass("is-invalid");
        isValid = false;
    }

    // Kiểm tra Mô tả
    if (moTa.val().trim() === "") {
        moTa.addClass("is-invalid");
        isValid = false;
    }

    // Kiểm tra File đính kèm
    if (files[0].files.length === 0) {
        files.addClass("is-invalid");
        // Thêm feedback thủ công vì dưới input này bạn chưa có invalid-feedback
        if ($("#fileErrorMsg").length === 0) {
            files.after('<div id="fileErrorMsg" class="invalid-feedback d-block">Vui lòng chọn ít nhất một file!</div>');
        }
        isValid = false;
    } else {
        $("#fileErrorMsg").remove();
    }

    return isValid;
}
function resetAddTaiLieuForm() {
    // Reset giá trị các input
    $("#tenTaiLieu_Add").val("");
    $("#moTa_Add").val("");
    $("#files_Add").val("");
    $("#thuTu_Add").val("1");

    // Xóa trạng thái lỗi Bootstrap
    $(".is-invalid").removeClass("is-invalid");

    // Xóa lỗi riêng của file (nếu có)
    $("#fileErrorMsg").remove();
}




