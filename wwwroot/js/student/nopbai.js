$(document).ready(function() {
    console.log('NopBai.js loaded'); // Debug log
    
    // Xử lý nộp bài
    $(document).on('submit', '.upload-form', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Form submitted'); // Debug log
        
        var form = $(this);
        var baiTapId = form.data('baitap-id');
        var fileInput = form.find('input[type="file"]')[0];
        var submitBtn = form.find('button[type="submit"]');
        
        // Validation
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Vui lòng chọn file!');
            return false;
        }
        
        // Kiểm tra kích thước file (max 50MB)
        var maxSize = 50 * 1024 * 1024; // 50MB
        if (fileInput.files[0].size > maxSize) {
            alert('File quá lớn! Vui lòng chọn file nhỏ hơn 50MB');
            return false;
        }
        
        // Disable button để tránh submit nhiều lần
        submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-1"></i> Đang tải...');
        
        var formData = new FormData();
        formData.append('baiTapId', baiTapId);
        formData.append('file', fileInput.files[0]);
        
        $.ajax({
            url: '/Student/NopBai/NopBai',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log('Response:', response); // Debug log
                
                if (response.success) {
                    alert(response.message);
                    location.reload();
                } else {
                    alert(response.message || 'Có lỗi xảy ra!');
                    submitBtn.prop('disabled', false).html('<i class="bi bi-upload me-1"></i> Nộp bài');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error:', error); // Debug log
                console.error('Status:', status);
                console.error('Response:', xhr.responseText);
                
                alert('Có lỗi xảy ra khi nộp bài! Vui lòng thử lại.');
                submitBtn.prop('disabled', false).html('<i class="bi bi-upload me-1"></i> Nộp bài');
            }
        });
        
        return false;
    });
    
    // Xử lý hủy bài
    $(document).on('click', '.btn-huy-bai', function(e) {
        e.preventDefault();
        
        if (!confirm('Bạn có chắc muốn hủy bài nộp này?')) {
            return false;
        }
        
        var btn = $(this);
        var baiNopId = btn.data('bainop-id');
        
        btn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-1"></i> Đang xử lý...');
        
        $.ajax({
            url: '/Student/NopBai/HuyBai',
            type: 'POST',
            data: { baiNopId: baiNopId },
            success: function(response) {
                if (response.success) {
                    alert(response.message);
                    location.reload();
                } else {
                    alert(response.message || 'Có lỗi xảy ra!');
                    btn.prop('disabled', false).html('<i class="bi bi-x-circle me-1"></i> Hủy bài nộp');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                alert('Có lỗi xảy ra! Vui lòng thử lại.');
                btn.prop('disabled', false).html('<i class="bi bi-x-circle me-1"></i> Hủy bài nộp');
            }
        });
        
        return false;
    });
});