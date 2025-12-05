// ===============================
// Base config cho Toast
// ===============================
const toastBase = {
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timerProgressBar: true,
    showClass: {
        popup: 'animate__animated animate__slideInDown'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
    }
};

// ===============================
// SUCCESS
// ===============================
window.showSuccess_tc = function (message) {
    Swal.fire({
        ...toastBase,
        icon: 'success',
        title: message,
        timer: 3000,
        customClass: {
            popup: 'toast-success white-text-icon'
        }
    });
};

// ===============================
// ERROR
// ===============================
window.showError_tc = function (message) {
    Swal.fire({
        ...toastBase,
        icon: 'error',
        title: message,
        timer: 4000,
        customClass: {
            popup: 'toast-error white-text-icon'
        }
    });
};

// ===============================
// WARNING
// ===============================
window.showWarning_tc = function (message) {
    Swal.fire({
        ...toastBase,
        icon: 'warning',
        title: message,
        timer: 3500,
        customClass: {
            popup: 'toast-warning white-text-icon'
        }
    });
};

// ===============================
// INFO
// ===============================
window.showInfo_tc = function (message) {
    Swal.fire({
        ...toastBase,
        icon: 'info',
        title: message,
        timer: 3000,
        customClass: {
            popup: 'toast-info white-text-icon'
        }
    });
};

// Xác nhận OK / Hủy
window.showConfirm_tc = function (message, title = "Xác nhận") {
    return Swal.fire({
        title: title,
        text: message,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        reverseButtons: true,
        customClass: {
            popup: "confirm-popup white-text-icon",
            confirmButton: "btn-confirm",
            cancelButton: "btn-cancel"
        }
    });
};

// Xác nhận xóa
window.showDeleteConfirm_tc = function (message = "Bạn có chắc muốn xóa?", title = "Xác nhận xóa") {
    return Swal.fire({
        title: title,
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        reverseButtons: true,
        customClass: {
            popup: "delete-popup white-text-icon",
            confirmButton: "btn-delete",
            cancelButton: "btn-cancel"
        }
    });
};