$(document).ready(function () {
    console.log('NopBai.js loaded'); // Debug log

    // Xử lý nộp bài
    $(document).on('submit', '.upload-form', function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submitted'); // Debug log

        var form = $(this);
        var baiTapId = form.data('baitap-id');
        var fileInput = form.find('input[type="file"]')[0];
        var submitBtn = form.find('button[type="submit"]');

        // Validation
        if (!fileInput.files || fileInput.files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa chọn file!',
                text: 'Vui lòng chọn file để nộp bài',
                confirmButtonText: 'Đã hiểu',
                confirmButtonColor: '#3085d6'
            });
            return false;
        }

        // Kiểm tra kích thước file (max 50MB)
        var maxSize = 50 * 1024 * 1024; // 50MB
        if (fileInput.files[0].size > maxSize) {
            Swal.fire({
                icon: 'error',
                title: 'File quá lớn!',
                text: 'Vui lòng chọn file nhỏ hơn 50MB',
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#d33'
            });
            return false;
        }

        // Hiển thị xác nhận trước khi nộp
        Swal.fire({
            title: 'Xác nhận nộp bài',
            html: `
                <div class="text-start">
                    <p class="mb-2"><strong>File:</strong> ${fileInput.files[0].name}</p>
                    <p class="mb-2"><strong>Kích thước:</strong> ${(fileInput.files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Nộp bài',
            cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Hủy',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-success px-4 ms-2',
                cancelButton: 'btn btn-secondary px-4'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Disable button để tránh submit nhiều lần
                submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Đang tải...');

                var formData = new FormData();
                formData.append('baiTapId', baiTapId);
                formData.append('file', fileInput.files[0]);

                $.ajax({
                    url: '/Student/NopBai/NopBai',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        console.log('Response:', response); // Debug log

                        if (response.success) {
                            // ⭐ THÔNG BÁO THÀNH CÔNG ĐẸP ⭐
                            Swal.fire({
                                icon: 'success',
                                title: 'Nộp bài thành công!',
                                html: `
                                    <div class="text-center">
                                        <div class="mb-3">
                                            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                                        </div>
                                        <p class="text-muted small mb-0">Giao diện sẽ tự động cập nhật...</p>
                                    </div>
                                `,
                                showConfirmButton: false,
                                timer: 2000,
                                timerProgressBar: true,
                                didOpen: () => {
                                    // Animation cho icon
                                    Swal.getHtmlContainer().querySelector('.bi-check-circle-fill').classList.add('animate__animated', 'animate__bounceIn');
                                }
                            }).then(() => {
                                // ⭐ CẬP NHẬT GIAO DIỆN ĐỘNG THAY VÌ RELOAD ⭐
                                updateUIAfterSubmit(baiTapId, response.data);
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Không thể nộp bài!',
                                text: response.message || 'Có lỗi xảy ra, vui lòng thử lại',
                                confirmButtonText: 'Đóng',
                                confirmButtonColor: '#d33'
                            });
                            submitBtn.prop('disabled', false).html('<i class="bi bi-upload me-1"></i> Nộp bài');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error:', error); // Debug log
                        console.error('Status:', status);
                        console.error('Response:', xhr.responseText);

                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi kết nối!',
                            html: `
                                <p>Có lỗi xảy ra khi nộp bài:</p>
                                <code class="d-block bg-light p-2 rounded mt-2 small">${error}</code>
                                <p class="text-muted small mt-2">Vui lòng kiểm tra kết nối và thử lại</p>
                            `,
                            confirmButtonText: 'Đóng',
                            confirmButtonColor: '#d33'
                        });
                        submitBtn.prop('disabled', false).html('<i class="bi bi-upload me-1"></i> Nộp bài');
                    }
                });
            }
        });

        return false;
    });

    // Xử lý hủy bài
    $(document).on('click', '.btn-huy-bai', function (e) {
        e.preventDefault();

        var btn = $(this);
        var baiNopId = btn.data('bainop-id');
        var baiTapId = btn.closest('.collapse').find('.upload-form').data('baitap-id');

        // ⭐ XÁC NHẬN HỦY BÀI ĐẸP ⭐
        Swal.fire({
            title: 'Xác nhận hủy bài nộp',
            html: `
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="bi bi-trash me-1"></i> Xác nhận hủy',
            cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Không hủy',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-danger px-4 ms-2',
                cancelButton: 'btn btn-secondary px-4'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...');

                $.ajax({
                    url: '/Student/NopBai/HuyBai',
                    type: 'POST',
                    data: { baiNopId: baiNopId },
                    success: function (response) {
                        if (response.success) {
                            // ⭐ THÔNG BÁO HỦY THÀNH CÔNG ĐẸP ⭐
                            Swal.fire({
                                icon: 'success',
                                title: 'Đã hủy bài nộp!',
                                html: `
                                    <div class="text-center">
                                        <div class="mb-3">
                                            <i class="bi bi-trash-fill text-success" style="font-size: 4rem;"></i>
                                        </div>
                                        <p class="text-muted small mb-0">Giao diện sẽ tự động cập nhật...</p>
                                    </div>
                                `,
                                showConfirmButton: false,
                                timer: 2000,
                                timerProgressBar: true,
                                didOpen: () => {
                                    // Animation cho icon
                                    Swal.getHtmlContainer().querySelector('.bi-trash-fill').classList.add('animate__animated', 'animate__fadeIn');
                                }
                            }).then(() => {
                                // ⭐ CẬP NHẬT GIAO DIỆN ĐỘNG THAY VÌ RELOAD ⭐
                                updateUIAfterCancel(baiTapId);
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Không thể hủy!',
                                text: response.message || 'Có lỗi xảy ra, vui lòng thử lại',
                                confirmButtonText: 'Đóng',
                                confirmButtonColor: '#d33'
                            });
                            btn.prop('disabled', false).html('<i class="bi bi-x-circle me-1"></i> Hủy bài nộp');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi kết nối!',
                            html: `
                                <p>Có lỗi xảy ra khi hủy bài:</p>
                                <code class="d-block bg-light p-2 rounded mt-2 small">${error}</code>
                            `,
                            confirmButtonText: 'Đóng',
                            confirmButtonColor: '#d33'
                        });
                        btn.prop('disabled', false).html('<i class="bi bi-x-circle me-1"></i> Hủy bài nộp');
                    }
                });
            }
        });

        return false;
    });

    // ⭐ HÀM CẬP NHẬT GIAO DIỆN SAU KHI NỘP BÀI ⭐
    function updateUIAfterSubmit(baiTapId, data) {
        // Tìm collapse container của bài tập
        var collapseId = `#collapseBaiTap${baiTapId}`;
        var $collapse = $(collapseId);

        if ($collapse.length === 0) {
            console.error('Không tìm thấy collapse element');
            location.reload(); // Fallback
            return;
        }

        // Lấy thông tin từ response
        var fileName = data.fileName || 'File đã nộp';
        var fileIcon = getFileIcon(data.fileExtension || '.pdf');
        var filePath = data.filePath || '#';
        var ngayNop = data.ngayNop || new Date().toLocaleString('vi-VN');

        // Tạo HTML mới cho trạng thái "Đã nộp - Chờ chấm"
        var newHTML = `
            <div class="p-3 border rounded-3 mb-3" style="background-color:rgba(243,246,248);">
                <p>
                    <strong>Trạng thái:</strong>
                    <span class="badge bg-secondary">
                        <i class="bi bi-check-circle me-1"></i> Đã nộp - Chờ chấm
                    </span>
                </p>

                <p class="mb-2"><strong>Điểm:</strong> -- / 10</p>

                <p class="mb-1">
                    <strong>Tệp đã nộp:</strong>
                    <a href="${filePath}" download="${fileName}"
                       class="text-decoration-underline text-dark ms-1">
                        <i class="bi ${fileIcon} me-1 text-primary"></i>
                        ${fileName}
                    </a>
                </p>

                <p class="mb-3 text-muted small">
                    <i class="bi bi-clock me-1"></i> Nộp lúc: ${ngayNop}
                </p>

                <div class="d-flex flex-wrap gap-2 mt-2">
                    <form class="upload-form" data-baitap-id="${baiTapId}">
                        <div class="input-group input-group-sm" style="width:300px;">
                            <input type="file" name="file" class="form-control" accept=".zip,.rar,.pdf,.docx" required>
                            <button class="btn btn-success" style="color:white;" type="submit">
                                <i class="bi bi-upload me-1"></i> Nộp lại
                            </button>
                        </div>
                    </form>
                    <button class="btn btn-sm btn-outline-danger btn-huy-bai" data-bainop-id="${data.baiNopId}">
                        <i class="bi bi-x-circle me-1"></i> Hủy bài nộp
                    </button>
                </div>
            </div>
        `;

        // Cập nhật HTML với hiệu ứng fade
        $collapse.fadeOut(300, function () {
            $(this).html(newHTML).fadeIn(300);
        });

        console.log('✅ Đã cập nhật giao diện sau khi nộp bài');
    }

    // ⭐ HÀM CẬP NHẬT GIAO DIỆN SAU KHI HỦY BÀI ⭐
    function updateUIAfterCancel(baiTapId) {
        // Tìm collapse container của bài tập
        var collapseId = `#collapseBaiTap${baiTapId}`;
        var $collapse = $(collapseId);

        if ($collapse.length === 0) {
            console.error('Không tìm thấy collapse element');
            location.reload(); // Fallback
            return;
        }

        // Tạo HTML mới cho trạng thái "Chưa nộp"
        var newHTML = `
            <div class="p-3 border rounded-3 mb-3" style="background-color:rgba(243,246,248);">
                <p>
                    <strong>Trạng thái:</strong> 
                    <span class="badge bg-warning text-dark">
                        <i class="bi bi-hourglass-split me-1"></i> Chưa nộp
                    </span>
                </p>

                <form class="mt-2 upload-form" data-baitap-id="${baiTapId}">
                    <div class="input-group input-group-sm" style="width:300px;">
                        <input type="file" name="file" class="form-control" accept=".zip,.rar,.pdf,.docx" required>
                        <button class="btn btn-success" style="color:white;" type="submit">
                            <i class="bi bi-upload me-1"></i> Nộp bài
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Cập nhật HTML với hiệu ứng fade
        $collapse.fadeOut(300, function () {
            $(this).html(newHTML).fadeIn(300);
        });

        console.log('✅ Đã cập nhật giao diện sau khi hủy bài');
    }

    // ⭐ HÀM NHẬN ICON DỰA VÀO LOẠI FILE ⭐
    function getFileIcon(extension) {
        extension = extension.toLowerCase();

        if (extension.includes('doc')) return 'bi-file-earmark-word';
        if (extension.includes('xls')) return 'bi-file-earmark-excel';
        if (extension.includes('pdf')) return 'bi-file-earmark-pdf';
        if (extension.includes('ppt')) return 'bi-file-earmark-ppt';
        if (extension.includes('zip') || extension.includes('rar')) return 'bi-file-earmark-zip';

        return 'bi-file-earmark';
    }
});