// Hàm load danh sách bài tập
async function loadDanhSachBaiTap(khoaHocId) {
    try {
        const response = await $.ajax({
            url: '/Teacher/BaiTap/GetDanhSachBaiTaps',
            type: 'GET',
            data: { khoaHocId: khoaHocId },
            dataType: 'json'
        });

        if (response.success) {
            renderDanhSachBaiTap(response.data);
        } else {
            showError_tc(response.message || 'Không thể tải danh sách bài tập!');
        }
    } catch (error) {
        console.error('Lỗi load bài tập:', error);
        showError_tc('Có lỗi xảy ra khi tải dữ liệu!');
    }
}

// Hàm render danh sách bài tập lên giao diện
function renderDanhSachBaiTap(danhSach) {
    const container = $('#container_BaiTapList');

    // Xóa các bài tập cũ (giữ lại header và modal)
    container.find('.col-12').not(':has(.modal)').remove();

    if (!danhSach || danhSach.length === 0) {
        container.append(`
            <div class="col-12">
                <div class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-3">Chưa có bài tập nào</p>
                </div>
            </div>
        `);
        return;
    }

    // Render từng bài tập
    danhSach.forEach((baiTap, index) => {
        const collapseId = `collapseBaiTap${baiTap.baiTapId}`;
        const thoiGianBatDau = formatDateTime(baiTap.thoiGianBatDau);
        const thoiGianKetThuc = formatDateTime(baiTap.thoiGianKetThuc);

        // Render file đính kèm
        let filesHtml = '';
        if (baiTap.danhSachFile && baiTap.danhSachFile.length > 0) {
            filesHtml = '<p class="text-muted small"><i class="bi bi-paperclip"></i> File đính kèm:</p>';
            baiTap.danhSachFile.forEach(file => {
                const iconClass = getFileIcon(file.loaiFile);
                filesHtml += `
                    <a href="${file.duongDan}" class="d-flex justify-content-between align-items-center border rounded-3 p-3 bg-white text-decoration-none mb-2 shadow-sm" download>
                        <div class="d-flex align-items-center">
                            <i class="${iconClass} fs-4 me-3"></i>
                            <div>
                                <strong>${file.tenFile}</strong>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-success" type="button">
                            <i class="bi bi-download me-1"></i> Tải
                        </button>
                    </a>
                `;
            });
        }

        const baiTapHtml = `
            <div class="col-12">
                <div class="border rounded-3 p-3 mb-2 bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <a class="text-decoration-none text-dark d-flex align-items-center flex-grow-1"
                       data-bs-toggle="collapse"
                       href="#${collapseId}">
                        <strong class="me-1">Bài tập ${index + 1}:</strong>
                        ${baiTap.tieuDe}
                    </a>

                    <div class="text-muted small me-4">
                        <i class="bi bi-calendar2-week me-1"></i> Thời gian: ${thoiGianBatDau} đến ${thoiGianKetThuc}
                    </div>

                    <div class="text-end">
                        <button class="btn btn-outline-secondary btn-sm me-2" 
                                onclick="moModalSuaBaiTap(${baiTap.baiTapId})">
                            <i class="bi bi-pencil"></i> Sửa
                        </button>
                        <button class="btn btn-outline-danger btn-sm" 
                                onclick="deleteBaiTap(${baiTap.baiTapId})">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </div>
                </div>

                <!-- Chi tiết bài tập -->
                <div class="collapse" id="${collapseId}">
                    <div class="p-3 border rounded-3 mb-3" style="background-color: rgba(243,246,248);">
                        <p><strong>Mô tả:</strong> ${baiTap.moTa || 'Không có mô tả'}</p>
                        
                        ${filesHtml}

                        <hr>

                        <!-- Thống kê bài nộp -->
                        <div class="d-flex justify-content-between align-items-center">
                            <div><strong>Đã nộp:</strong> ${baiTap.soBaiNop} / ${baiTap.soHocVien} sinh viên</div>
                            <a class="btn btn-outline-primary btn-sm" 
                               href="/Teacher/Course/DanhSachNopBai?baiTapId=${baiTap.baiTapId}">
                                Xem danh sách nộp bài
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.append(baiTapHtml);
    });
}

// Hàm format ngày giờ
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} – ${hours}:${minutes}`;
}

// Hàm lấy icon theo loại file
function getFileIcon(loaiFile) {
    const ext = loaiFile?.toLowerCase() || '';
    if (ext === '.pdf') return 'bi bi-file-earmark-pdf text-danger';
    if (['.doc', '.docx'].includes(ext)) return 'bi bi-file-earmark-word text-primary';
    if (['.xls', '.xlsx'].includes(ext)) return 'bi bi-file-earmark-excel text-success';
    if (['.ppt', '.pptx'].includes(ext)) return 'bi bi-file-earmark-ppt text-warning';
    if (['.zip', '.rar'].includes(ext)) return 'bi bi-file-earmark-zip text-secondary';
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return 'bi bi-file-earmark-image text-info';
    return 'bi bi-file-earmark text-secondary';
}

// Hàm format kích thước file
function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


// ============================================
// KHỞI TẠO KHI MỞ MODAL TẠO BÀI TẬP
// ============================================
function initTaoBaiTapModal() {
    // Load danh sách sinh viên khi mở modal
    const khoaHocId = $('#khoaHocId_ChiTiet').val();
    if (khoaHocId) {
        loadDanhSachSinhVienTrongModal(khoaHocId);
    }
}


// ============================================
// LOAD DANH SÁCH SINH VIÊN
// ============================================
function loadDanhSachSinhVienTrongModal(khoaHocId) {

    const container = $('#danhSachSinhVien_Giao');

    if (!khoaHocId || khoaHocId <= 0) {
        showError_tc('Không tìm thấy khóa học!');
        container.html('<div class="alert alert-warning">Không tìm thấy khóa học!</div>');
        return;
    }

    $.ajax({
        url: '/Teacher/BaiTap/GetDanhSachSinhVien',
        type: 'GET',
        data: { khoaHocId },
        beforeSend: function () {
            container.html(`
                <div class="text-center py-3">
                    <i class="fas fa-spinner fa-spin"></i> Đang tải danh sách sinh viên...
                </div>
            `);
        },
        success: function (response) {

            if (!response || !response.success) {
                showError_tc(response?.message || 'Không thể tải danh sách sinh viên!');
                container.html('<div class="alert alert-warning">Không thể tải danh sách sinh viên!</div>');
                return;
            }

            // Nếu rỗng
            if (!response.data || response.data.length === 0) {
                container.html('<div class="alert alert-info">Không có sinh viên nào trong khóa học.</div>');
                return;
            }

            // Render danh sách
            renderDanhSachSinhVienTrongModal(response.data);
            checkAll();
        },
        error: function () {
            showError_tc('Lỗi kết nối! Vui lòng thử lại.');
            container.html('<div class="alert alert-danger">Lỗi kết nối! Không thể lấy dữ liệu.</div>');
        }
    });
}


//// ============================================
//// RENDER DANH SÁCH SINH VIÊN
//// ============================================
function renderDanhSachSinhVienTrongModal(data) {
    const container = $("#danhSachSinhVien_Giao");

    // Không có sinh viên
    if (!data || data.length === 0) {
        container.html(`
            <div class="alert alert-warning mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Không có sinh viên nào trong khóa học!
            </div>
        `);
        return;
    }

    let html = "";

    data.forEach(sv => {
        let hoTen = sv.hoTen || "";
        let maSV = sv.maSinhVien || "";
        let email = sv.email || "";

        html += `
            <div class="student-item d-flex align-items-center gap-3 py-2 px-2 mb-1"
                 data-search="${(hoTen + " " + maSV).toLowerCase()}">

                <div style="width:40px; height:40px; border-radius:8px; overflow:hidden;">
                    <img src="/assets/image/tải xuống.jpg" alt="Avatar"
                         style="width:100%; height:100%; object-fit:cover;">
                </div>

                <div class="flex-grow-1">
                    <div class="fw-semibold">${hoTen}</div>
                    <small class="text-muted">${maSV}${email ? " - " + email : ""}</small>
                </div>

                <div class="form-check">
                    <input class="form-check-input checkbox-sinhvien"
                           type="checkbox"
                           value="${sv.sinhVienId}">
                </div>
            </div>
        `;
    });

    container.html(html);
}

$(document).on('change', '#checkAllStudentsStatic', function () {
    const isChecked = $(this).is(":checked");
    $(".student-item:visible .checkbox-sinhvien").prop("checked", isChecked);
});

$(document).on("input", "#searchSinhVien_Giao", function () {
    let keyword = $(this).val().toLowerCase().trim();

    $(".student-item").each(function () {
        let searchable = ($(this).data("search") || "").toLowerCase();

        if (searchable.includes(keyword)) {
            // HIỆN → thêm lại d-flex và show
            $(this).addClass("d-flex").show();
        } else {
            // ẨN → gỡ d-flex rồi hide
            $(this).removeClass("d-flex").hide();
        }
    });

    syncCheckAllAfterSearch();
});

function checkAll() {
    const checkAll = document.getElementById("checkAllStudentsStatic");
    const listChecks = document.querySelectorAll(".checkbox-sinhvien");

    // Check nút chọn tất cả
    checkAll.checked = true;

    // Check toàn bộ sinh viên
    listChecks.forEach(c => c.checked = true);
}

function syncCheckAllAfterSearch() {
    const visibleCheckboxes = $(".student-item:visible .checkbox-sinhvien");
    const totalVisible = visibleCheckboxes.length;
    const checkedVisible = visibleCheckboxes.filter(":checked").length;

    // Nếu không có sinh viên nào hiển thị → tắt "chọn tất cả"
    if (totalVisible === 0) {
        $("#checkAllStudentsStatic").prop("checked", false);
        return;
    }

    $("#checkAllStudentsStatic").prop("checked", totalVisible === checkedVisible);
}

$(document).on('change', '.checkbox-sinhvien', function () {
    syncCheckAllAfterSearch();
});

function validateFormTaoBaiTap() {
    let valid = true;

    // Lấy giá trị
    const tieuDe = document.querySelector("input[name='TieuDe']");
    const moTa = document.querySelector("textarea[name='MoTa']");
    const start = document.querySelector("#startPicker_AddBaiTap");
    const end = document.querySelector("#ThoiGianKetThuc_AddBaiTap");

    // Reset lỗi
    document.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));

    // 1. Kiểm tra tiêu đề
    if (!tieuDe.value.trim()) {
        tieuDe.classList.add("is-invalid");
        valid = false;
    }

    // 2. Kiểm tra mô tả
    if (!moTa.value.trim()) {
        moTa.classList.add("is-invalid");
        valid = false;
    }

    // 3. Kiểm tra thời gian có nhập chưa
    if (!start.value) {
        start.classList.add("is-invalid");
        valid = false;
    }

    if (!end.value) {
        end.classList.add("is-invalid");
        valid = false;
    }

    // --- Thời gian hiện tại
    let now = new Date();

    // 3.1. Kiểm tra thời gian bắt đầu > hiện tại
    if (start.value) {
        let startTime = new Date(start.value);

        if (startTime <= now) {
            start.classList.add("is-invalid");
            showError_tc("Thời gian bắt đầu phải lớn hơn thời gian hiện tại!");
            valid = false;
        }
    }

    // 3.2. Kiểm tra thời gian kết thúc > thời gian bắt đầu
    if (start.value && end.value) {
        let startTime = new Date(start.value);
        let endTime = new Date(end.value);

        if (endTime <= startTime) {
            end.classList.add("is-invalid");
            showError_tc("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
            valid = false;
        }
    }

    // 4. Kiểm tra có chọn sinh viên hay chưa
    const checkedStudents = document.querySelectorAll(
        "#danhSachSinhVien_Giao input[type='checkbox']:checked"
    );

    if (checkedStudents.length === 0) {
        showWarning_tc("Vui lòng chọn ít nhất một sinh viên để giao bài tập!");
        valid = false;
    }

    return valid;
}



// ============================================
// TẠO BÀI TẬP MỚI
// ============================================
function taoBaiTap() {
    // 1. Lấy dữ liệu từ input
    const tieuDe = ($("#TieuDe_AddBaiTap").val() || "").trim();
    const moTa = ($("#MoTa_AddBaiTap").val() || "").trim();
    const start = ($("#startPicker_AddBaiTap").val() || "");
    const end = ($("#ThoiGianKetThuc_AddBaiTap").val() || "");
    const khoaHocId = ($("#khoaHocId_ChiTiet").val() || "");


    // Validate
    if (!validateFormTaoBaiTap()) {
        return;
    }

    // 2. Tạo FormData thủ công
    const formData = new FormData();
    formData.append("TieuDe", tieuDe);
    formData.append("MoTa", moTa);
    formData.append("ThoiGianBatDau", start);
    formData.append("ThoiGianKetThuc", end);
    formData.append("KhoaHocId", khoaHocId);

    // 3. Thêm file
    const files = $("#inputFile_Add")[0].files;
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    // 4. Gọi AJAX
    $("#btnLuuBaiTap").prop("disabled", true).html('<i class="fas fa-spinner fa-spin"></i> Đang tạo...');

    $.ajax({
        url: '/Teacher/BaiTap/TaoBaiTap',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,

        success: function (response) {
            $("#btnLuuBaiTap").prop("disabled", false).html('Lưu bài tập');

            if (response.success) {
                giaoBaiTapSauKhiTao(response.data.baiTapId);
            } else {
                showError_tc(response.message || "Tạo bài tập thất bại!");
            }
        },

        error: function () {
            $("#btnLuuBaiTap").prop("disabled", false).html('Lưu bài tập');
            showError_tc("Lỗi kết nối đến server!");
        }
    });
}

//// ============================================
//// GIAO BÀI TẬP SAU KHI TẠO
//// ============================================
function giaoBaiTapSauKhiTao(baiTapId) {
    const giaoTatCa = $("#checkbox_giao_tat_ca").is(":checked");
    const khoaHocId = ($("#khoaHocId_ChiTiet").val() || "");

    // Lấy danh sách sinh viên được chọn
    let danhSachSinhVienId = [];
    if (!giaoTatCa) {
        $("#danhSachSinhVien_Giao input[type='checkbox']:checked").each(function () {
            danhSachSinhVienId.push(parseInt($(this).val()));
        });
    }

    // Validate
    if (!giaoTatCa && danhSachSinhVienId.length === 0) {
        showError_tc("Vui lòng chọn ít nhất một sinh viên!");
        return;
    }

    const data = {
        BaiTapId: baiTapId,
        GiaoTatCa: giaoTatCa,
        DanhSachSinhVienId: danhSachSinhVienId
    };

    $.ajax({
        url: "/Teacher/BaiTap/GiaoBaiTap",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),

        beforeSend: function () {
            $("#btnGiaoBaiTap").prop("disabled", true)
                .html('<i class="fas fa-spinner fa-spin"></i> Đang giao...');
        },

        success: function (response) {
            $("#btnGiaoBaiTap").prop("disabled", false)
                .html('Giao bài tập');

            if (response.success) {
                showSuccess_tc("Tạo bài tập thành công");
                loadDanhSachBaiTap(khoaHocId);
                resetFormTaoBaiTap();
                closeModal("addBaiTapModal");
            } else {
                showError_tc("Loi");
            }
        },

        error: function (xhr) {
            $("#btnGiaoBaiTap").prop("disabled", false)
                .html('Giao bài tập');

            showError_tc("Lỗi kết nối server!");
        }
    });
}


function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

function resetFormTaoBaiTap() {

    // Reset input text
    $("#TieuDe_AddBaiTap").val("");
    $("#MoTa_AddBaiTap").val("");
    $("#startPicker_AddBaiTap").val("");
    $("#ThoiGianKetThuc_AddBaiTap").val("");

    // Reset file input
    $("#inputFile_Add").val("");

    // Xóa border lỗi (nếu có)
    $(".is-invalid").removeClass("is-invalid");
    $(".error-message").remove(); // Xóa lỗi đi kèm

    // Xóa thông báo lỗi tổng hợp (nếu bạn dùng alert)
    $("#alert-error-tao-baitap").remove();

    // Enable lại button nếu bị disabled
    $("#btnLuuBaiTap").prop("disabled", false).html("Lưu bài tập");
}

// Hàm xóa bài tập
async function deleteBaiTap(baiTapId) {
    const result = await showDeleteConfirm_tc("Bạn có chắc chắn muốn xóa tất cả dữ liệu của bài tập này?");

    if (!result.isConfirmed) return;

    try {
        const response = await fetch('/Teacher/BaiTap/XoaBaiTap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(baiTapId)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess_tc(data.message);
            loadDanhSachBaiTap($('#khoaHocId_ChiTiet').val());
        } else {
            showError_tc(data.message);
        }

    } catch (error) {
        showError_tc("Lỗi kết nối server!");
        console.error(error);
    }
}

async function moModalSuaBaiTap(baiTapId) {
    try {
        const response = await fetch(`/Teacher/BaiTap/GetBaiTapById?baiTapId=${baiTapId}`);
        const result = await response.json();
        if (result.success) {
            const data = result.data;

            // Điền dữ liệu vào form
            document.getElementById('editBaiTapId').value = data.baiTapId;
            document.getElementById('editKhoaHocId').value = data.khoaHocId;
            document.getElementById('editTieuDe').value = data.tieuDe;
            document.getElementById('editMoTa').value = data.moTa || '';
            document.getElementById('editThoiGianBatDau').value = data.thoiGianBatDau?.slice(0, 16) || '';
            document.getElementById('editThoiGianKetThuc').value = data.thoiGianKetThuc?.slice(0, 16) || '';

            // Render danh sách file
            hienThiDanhSachFile(data.danhSachFile);
            resetLoiEditBaiTap();
            // Mở modal
            openModal('editBaiTapModal');
        } else {
            showError_tc(result.message);
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showError_tc('Có lỗi xảy ra khi tải dữ liệu bài tập!');
    }
}

function hienThiDanhSachFile(files) {
    const container = document.getElementById("currentFilesBaiTap");
    container.innerHTML = ""; // Xóa file cũ trước khi render

    if (!files || files.length === 0) {
        container.innerHTML = "<p class='text-muted small'>Không có file đính kèm.</p>";
        return;
    }

    files.forEach(file => {
        const item = document.createElement("div");
        item.className = "file-item d-flex justify-content-between align-items-center border rounded-2 p-2 mb-1 bg-white";

        item.id = `file-item-${file.fileId}`;

        item.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-file-earmark text-primary fs-5 me-2"></i>
                <a href="${file.duongDan}" target="_blank" class="text-decoration-none text-dark">
                    ${file.tenFile}
                </a>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="xoaFileBaiTap(${file.fileId})">
                <i class="bi bi-trash"></i>
            </button>
        `;

        container.appendChild(item);
    });
}

// Hàm xóa file bài tập
async function xoaFileBaiTap(fileId) {
    const result = await showDeleteConfirm_tc("Bạn có chắc chắn muốn xóa file này?");

    if (!result.isConfirmed) return;

    try {
        const response = await fetch('/Teacher/BaiTap/XoaFileBaiTap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fileId)
        });

        const result = await response.json();

        if (result.success) {
            // Thông báo thành công
            showSuccess_tc(result.message);

            // Xóa file khỏi danh sách hiển thị
            $(`#file-item-${fileId}`).fadeOut(300, function () {
                $(this).remove();
            });
            loadDanhSachBaiTap($('#khoaHocId_ChiTiet').val());
        } else {
            showError_tc(result.message);
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showError_tc('Có lỗi xảy ra khi xóa file!');
    }
}

// Hàm submit form cập nhật bài tập
async function capNhatBaiTap() {
    if (!validateEditBaiTap()) {
        return;
    }

    const formData = new FormData();
    formData.append('BaiTapId', document.getElementById('editBaiTapId').value);
    formData.append('TieuDe', document.getElementById('editTieuDe').value);
    formData.append('MoTa', document.getElementById('editMoTa').value);
    formData.append('ThoiGianBatDau', document.getElementById('editThoiGianBatDau').value);
    formData.append('ThoiGianKetThuc', document.getElementById('editThoiGianKetThuc').value);

    // Thêm files mới
    const fileInput = document.getElementById('editFiles');
    if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append("Files", fileInput.files[i]);
        }
    }

    try {
        const response = await fetch('/Teacher/BaiTap/CapNhatBaiTap', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showSuccess_tc(result.message || 'Cập nhật bài tập thành công!');
            closeModal('editBaiTapModal');
            loadDanhSachBaiTap($('#khoaHocId_ChiTiet').val());
        } else {
            showError_tc(result.message || 'Cập nhật bài tập thất bại!');
        }

    } catch (error) {
        console.error('Lỗi:', error);
        showError_tc('Có lỗi xảy ra khi cập nhật bài tập!');
    }
}

function validateEditBaiTap() {
    let isValid = true;
    let errors = [];

    // Lấy dữ liệu
    const tieuDe = document.getElementById('editTieuDe');
    const moTa = document.getElementById('editMoTa');
    const batDau = document.getElementById('editThoiGianBatDau');
    const ketThuc = document.getElementById('editThoiGianKetThuc');
    const files = document.getElementById('editFiles');

    // Reset toàn bộ lỗi trước khi validate
    resetLoiEditBaiTap();

    // ==============================
    // 1. Kiểm tra tiêu đề
    // ==============================
    if (!tieuDe.value.trim()) {
        isValid = false;
        hienThiLoi(tieuDe, "Tiêu đề không được để trống.");
    }

    // ==============================
    // 2. Kiểm tra mô tả
    // ==============================
    if (!moTa.value.trim()) {
        isValid = false;
        hienThiLoi(moTa, "Mô tả không được để trống.");
    }

    // ==============================
    // 3. Kiểm tra thời gian hợp lệ
    // ==============================
    const now = new Date();

    if (!batDau.value) {
        isValid = false;
        hienThiLoi(batDau, "Vui lòng chọn thời gian bắt đầu.");
    } else {
        const start = new Date(batDau.value);
    }

    if (!ketThuc.value) {
        isValid = false;
        hienThiLoi(ketThuc, "Vui lòng chọn thời gian kết thúc.");
    } else {
        const start = new Date(batDau.value);
        const end = new Date(ketThuc.value);

        // 3.2 Kết thúc phải sau bắt đầu
        if (batDau.value && end <= start) {
            isValid = false;
            hienThiLoi(ketThuc, "Thời gian kết thúc phải sau thời gian bắt đầu.");
        }
    }

    // ==============================
    // 4. Kiểm tra file mới (nếu có)
    // ==============================
    const allowed = ["pdf", "doc", "docx", "png", "jpg", "jpeg", "ppt", "pptx", "xlsx"];

    if (files.files.length > 0) {
        for (let f of files.files) {
            let ext = f.name.split('.').pop().toLowerCase();
            if (!allowed.includes(ext)) {
                isValid = false;
                hienThiLoi(files, `File "${f.name}" không đúng định dạng cho phép.`);
            }
        }
    }

    // ==============================
    // 5. Nếu đã xóa hết file cũ → phải chọn ít nhất 1 file mới
    // ==============================
    const currentFileItems = document.querySelectorAll("#currentFilesBaiTap .file-item");

    if (currentFileItems.length === 0 && files.files.length === 0) {
        isValid = false;
        hienThiLoi(files, "Bạn cần có ít nhất 1 file.");
    }

    // ==============================
    // 6. Nếu có lỗi → hiện Swal
    // ==============================

    return isValid;
}


function resetLoiEditBaiTap() {
    document.querySelectorAll(".invalid-feedback-edit").forEach(el => el.remove());
    document.querySelectorAll("#editBaiTapModal .is-invalid").forEach(el => {
        el.classList.remove("is-invalid");
    });
}

function hienThiLoi(input, message) {
    input.classList.add("is-invalid");

    const errorDiv = document.createElement("div");
    errorDiv.className = "invalid-feedback-edit text-danger small mt-1";
    errorDiv.innerText = message;

    input.parentElement.appendChild(errorDiv);
}

