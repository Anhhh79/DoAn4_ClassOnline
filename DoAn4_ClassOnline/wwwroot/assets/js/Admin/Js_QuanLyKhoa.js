// Khi bấm nút Khóa
document.querySelectorAll(".btn-lock").forEach(button => {
    button.addEventListener("click", function () {
        Swal.fire({
            title: "Bạn có chắc muốn khóa người này?",
            text: "Người dùng sẽ không thể đăng nhập sau khi bị khóa.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Có, khóa ngay",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                toastr.success("Tài khoản đã bị khóa thành công!", "Thành công");
            }
        });
    });
});

// Khi bấm nút Mở
document.querySelectorAll(".btn-unlock").forEach(button => {
    button.addEventListener("click", function () {
        Swal.fire({
            title: "Mở khóa tài khoản?",
            text: "Người dùng sẽ có thể đăng nhập lại sau khi mở khóa.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Có, mở ngay",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                toastr.success("Tài khoản đã được mở thành công!", "Thành công");
            }
        });
    });
});

// Cấu hình toastr
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-bottom-right",
    timeOut: "3000"
};