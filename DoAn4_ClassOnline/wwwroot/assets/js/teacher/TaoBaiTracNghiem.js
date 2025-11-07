
// hiển thị thông báo xuất bản trắc nghiệm
document.getElementById("btnRecheck").addEventListener("click", function () {

    Swal.fire({
        title: "Chấm lại điểm?",
        text: "Hệ thống sẽ tự động chấm lại điểm!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        reverseButtons: true, // 🔥 Đổi vị trí 2 nút
        customClass: {
            cancelButton: 'btn btn-danger ',
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

// hiển thị thông báo xóa bài trắc nghiệm
document.getElementById("btnDeleteFile").addEventListener("click", function () {

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