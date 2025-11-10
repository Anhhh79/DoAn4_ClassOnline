// hiển thị thông báo xuất bản trắc nghiệm
const btnRecheck = document.getElementById("btnRecheck");
if (btnRecheck) {
    btnRecheck.addEventListener("click", function () {

        Swal.fire({
            title: "Chấm lại điểm?",
            text: "Hệ thống sẽ tự động chấm lại điểm!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Hủy",
            reverseButtons: true,
            customClass: {
                cancelButton: 'btn btn-danger',
                confirmButton: 'btn btn-success ms-2'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                toastr.success("Đang xử lý chấm điểm lại...");
                // TODO: Gọi API hoặc AJAX xử lý chấm điểm lại tại đây
            }
        });

    });
}

// hiển thị thông báo xóa bài trắc nghiệm
const btnDeleteFile = document.getElementById("btnDeleteFile");
if (btnDeleteFile) {
    btnDeleteFile.addEventListener("click", function () {

        Swal.fire({
            title: "Xóa file?",
            text: "Thao tác này không thể hoàn tác!",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-danger mx-2',
                cancelButton: 'btn btn-secondary mx-2'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                toastr.success("Đang xóa file...");
                // TODO: Gọi API hoặc AJAX xóa file tại đây
            }
        });

    });
}

// tick tất cả
document.addEventListener('DOMContentLoaded', function () {
    const checkAll = document.getElementById('checkAllStudentsStatic');
    const checkboxes = document.querySelectorAll('.student-checkbox');

    if (checkAll) {
        // Tick tất cả / bỏ chọn tất cả
        checkAll.addEventListener('change', function () {
            checkboxes.forEach(cb => cb.checked = checkAll.checked);
        });

        // Nếu bỏ chọn 1 ô => bỏ tick "chọn tất cả"
        checkboxes.forEach(cb => {
            cb.addEventListener('change', function () {
                if (!cb.checked) {
                    checkAll.checked = false;
                } else if (Array.from(checkboxes).every(x => x.checked)) {
                    checkAll.checked = true;
                }
            });
        });
    } else {
       
    }
});