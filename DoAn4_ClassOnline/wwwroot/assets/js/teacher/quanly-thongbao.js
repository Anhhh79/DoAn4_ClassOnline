function loadThongBaos(id) {
    $.ajax({
        url: '/Teacher/ThongBao/DanhSachThongBaos', // Đổi TenController → controller thật
        type: 'GET',
        data: { khoaHocId: id },
        success: function (response) {
            if (response.success) {
                renderThongBaos(response.data);
            } else {
                showWarning_tc(response.message);
            }
        },
        error: function () {
            showError_tc("Có lỗi xảy ra khi tải thông báo!");
        }
    });
}  

function renderThongBaos(list) {

    let container = $('#dsThongBao');
    container.empty();

    // Khi không có dữ liệu
    if (list.length === 0) {
        container.html(`
                <div class="text-center text-muted py-3">
                    <i class="bi bi-bell-slash fs-1"></i>
                    <p class="mt-2 mb-0">Chưa có thông báo nào.</p>
                </div>
            `);
        return;
    }

    // Khi có dữ liệu
    list.forEach((tb, index) => {

        let collapseId = "collapseThongBao_" + tb.thongBaoId;

        let html = `
            <div class="col-12">
                <div class="border rounded-3 p-3 mb-2 bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">

                    <a class="text-decoration-none text-dark d-flex align-items-center flex-grow-1"
                        data-bs-toggle="collapse"
                        href="#${collapseId}"
                        role="button">
                        <strong class="me-1">Thông báo:</strong>
                        ${tb.tieuDe}
                    </a>

                    <div class="text-muted small d-flex align-items-center me-4">
                        <i class="bi bi-clock me-1"></i> ${formatDate(tb.ngayTao)}
                    </div>

                    <div class="text-end">
                        <button class="btn btn-outline-secondary btn-sm me-2" onclick="loadEditThongBao(${tb.thongBaoId})">
                            <i class="bi bi-pencil"></i> Sửa
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteThongBao(${tb.thongBaoId})">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </div>
                </div>

                <div class="collapse" id="${collapseId}">
                    <div class="p-3 border rounded-3 mb-3" style="background-color:rgba(243,246,248);">
                        <p class="mb-0">
                            <strong>Chi tiết:</strong> ${tb.noiDung}
                        </p>
                    </div>
                </div>
            </div>
            `;

        container.append(html);
    });
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Hàm thêm thông báo
function addThongBao() {
    var khoaHocId = $("#khoaHocId_ChiTiet").val();
    var tieuDe = $("#tieuDe").val();
    var noiDung = $("#noiDung").val();

    clearErrors_TienIch();
    var isValid = true;

    // Reset lỗi trước khi kiểm tra
    $("#err_tieuDe").addClass("d-none");
    $("#err_noiDung").addClass("d-none");

    // Kiểm tra tiêu đề
    if (!tieuDe) {
        $("#err_tieuDe_Tb").removeClass("d-none");
        showError_TienIch("err_tieuDe_Tb", "Vui lòng nhập tiêu đề thông báo.");
        isValid = false;
    }

    // Kiểm tra nội dung
    if (!noiDung) {
        showError_TienIch("err_noiDung_Tb", "Vui lòng nhập nội dung thông báo.");
        isValid = false;
    }

    // Có lỗi thì không gửi AJAX
    if (!isValid) return;

    $.ajax({
        url: "/Teacher/ThongBao/TaoThongBao",
        type: "POST",
        data: {
            khoaHocId: khoaHocId,
            tieuDe: tieuDe,
            noiDung: noiDung
        },
        success: function (res) {
            if (res.success) {
                // Thông báo thành công
                showSuccess_tc(res.message);

                // Đóng modal
                closeModal("addAnnouncementModal");
                resetForm_TienIch("formAddThongBao");
                loadThongBaos(khoaHocId);
            } else {
                showError_tc(res.message);
            }
        },
        error: function () {
            showError_tc("Lỗi không xác định từ server!");
        }
    });
}

// hàm load thông tin thông báo lên modal sửa
function loadEditThongBao(thongBaoId) {
    $.ajax({
        url: "/Teacher/ThongBao/GetThongBao",
        type: "GET",
        data: { id: thongBaoId },
        success: function (res) {
            if (res.success) {
                $("#editAnnouncementId").val(res.data.id);
                $("#editTieuDe").val(res.data.tieuDe);
                $("#editNoiDung").val(res.data.noiDung);

                clearError("err_editTieuDe");
                clearError("err_editNoiDung");

                $("#editAnnouncementModal").modal("show");
            } else {
                showError_tc(res.message);
            }
        },
        error: function () {
            showError_tc("Lỗi tải dữ liệu!");
        }
    });
}

function updateThongBao() {

    var id = $("#editAnnouncementId").val();
    var tieuDe = $("#editTieuDe").val();
    var noiDung = $("#editNoiDung").val();

    var isValid =
        checkInputData_UpdateTb("editTieuDe", "err_editTieuDe", "Vui lòng nhập tiêu đề!") &
        checkInputData_UpdateTb("editNoiDung", "err_editNoiDung", "Vui lòng nhập nội dung!");

    if (!isValid) return;

    $.ajax({
        url: "/Teacher/ThongBao/SuaThongBao",
        type: "POST",
        data: {
            thongBaoId: id,
            tieuDe: tieuDe,
            noiDung: noiDung
        },
        success: function (res) {
            if (res.success) {
                showSuccess_tc(res.message);
                resetForm_TienIch("formEditThongBao");
                closeModal("editAnnouncementModal");
                loadThongBaos($("#khoaHocId_ChiTiet").val());
            } else {
                showError_tc(res.message);
            }
        },
        error: function () {
            showError_tc("Lỗi khi cập nhật thông báo!");
        }
    });
}

function checkInputData_UpdateTb(inputId, errorId, message) {
    var value = $("#" + inputId).val().trim();

    if (!value) {
        $("#" + errorId).text(message).removeClass("d-none");
        return false;
    }

    $("#" + errorId).addClass("d-none");
    return true;
}

function deleteThongBao(id) {
    showDeleteConfirm_tc("Bạn có chắc chắn muốn xóa thông báo này không?")
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/Teacher/ThongBao/XoaThongBao?id=" + id,
                    type: "DELETE",
                    success: function (res) {
                        if (res.success) {
                            showSuccess_tc(res.message);
                            loadThongBaos($("#khoaHocId_ChiTiet").val());
                        } else {
                            showError_tc(res.message);
                        }
                    },
                    error: function () {
                        showError_tc("Không thể kết nối server!");
                    }
                });
            }
        });
}

