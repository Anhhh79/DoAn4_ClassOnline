// ⭐ LOAD KHÓA HỌC KHI VÀO TRANG
$(document).ready(function () {
    const khoaId = $('#selectHocKy').data('khoa-id');
    const hocKyId = $('#selectHocKy').val();
    
    // Load khóa học mặc định (học kỳ mới nhất)
    loadKhoaHoc(khoaId, hocKyId);

    // ⭐ XỬ LÝ KHI THAY ĐỔI HỌC KỲ
    $('#selectHocKy').on('change', function () {
        const selectedHocKyId = $(this).val();
        loadKhoaHoc(khoaId, selectedHocKyId);
    });
});

// ⭐ HÀM LOAD KHÓA HỌC BẰNG AJAX
function loadKhoaHoc(khoaId, hocKyId) {
    // Hiển thị loading
    $('#loadingSpinner').show();
    $('#danhSachKhoaHoc').hide();
    $('#noDataMessage').hide();

    $.ajax({
        url: '/Student/Home/GetKhoaHocByKhoaAndHocKy',
        type: 'GET',
        data: {
            khoaId: khoaId,
            hocKyId: hocKyId
        },
        success: function (response) {
            $('#loadingSpinner').hide();

            if (response.success && response.data && response.data.length > 0) {
                renderKhoaHoc(response.data);
                $('#danhSachKhoaHoc').show();
            } else {
                $('#noDataMessage').show();
            }
        },
        error: function (xhr, status, error) {
            $('#loadingSpinner').hide();
            console.error('Lỗi khi tải khóa học:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải danh sách khóa học. Vui lòng thử lại!',
                confirmButtonColor: '#d33'
            });
        }
    });
}

// ⭐ HÀM RENDER DANH SÁCH KHÓA HỌC
function renderKhoaHoc(khoaHocs) {
    const container = $('#danhSachKhoaHoc');
    container.empty();

    // Lấy tên khoa từ tiêu đề trang
    const tenKhoa = $('h3.fw-bold').text().trim();

    khoaHocs.forEach(kh => {
        const hinhAnh = kh.hinhAnh || '/assets/image/tải xuống.jpg';
        
        // ⭐ DEBUG - XEM GIÁ TRỊ coMatKhau
        console.log(`Khóa học: ${kh.tenKhoaHoc}, coMatKhau:`, kh.coMatKhau, typeof kh.coMatKhau);
        
        // ⭐ XÁC ĐỊNH TEXT VÀ CLASS CỦA BUTTON
        let buttonText, buttonClass, buttonIcon, buttonDisabled;
        
        if (kh.daThamGia) {
            buttonText = 'Đã tham gia';
            buttonClass = 'btn-success';
            buttonIcon = 'bi-check-circle';
            buttonDisabled = 'disabled';
        } else {
            buttonText = kh.coMatKhau ? 'Ghi danh (Có mật khẩu)' : 'Ghi danh vào khóa học';
            buttonClass = 'btn-light';
            buttonIcon = 'bi-box-arrow-in-right';
            buttonDisabled = '';
        }
        
        // ⭐ GIỮ NGUYÊN CẤU TRÚC HTML CŨ
        const html = `
            <div class="col-12 col-md-3 khoaHocItem" data-hocky="${kh.hocKy.hocKyId}">
                <div class="card shadow border-0 rounded-4 overflow-hidden h-100">

                    <!-- Ảnh banner -->
                    <a href="#">
                        <div class="card-header p-0 border-0 bg-white image-cuser">
                            <img src="${hinhAnh}"
                                 class="w-100"
                                 alt="Banner"
                                 style="height: 130px; object-fit: cover;"
                                 onerror="this.src='/assets/image/tải xuống.jpg'">
                        </div>
                    </a>
                    <!-- Nội dung khóa học -->
                    <div class="card-body text-start">
                        <h6 class="fw-bold mb-2" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;" title="${kh.tenKhoaHoc}">${kh.tenKhoaHoc}</h6>
                        <span class="" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">Giảng viên: ${kh.tenGiaoVien}</span>
                        <span class="" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${tenKhoa}</span>
                        <span class="">${kh.hocKy.tenHocKy} / ${kh.hocKy.namHoc}</span>

                        <div class="d-flex justify-content-between text-secondary small mb-3 mt-2">
                            <span>${kh.soSinhVien} SV đã tham gia</span>
                            <span>Tất cả mọi người</span>
                        </div>
                        <div class="text-start">
                            <button class="btn ${buttonClass} w-100 border rounded-3 btn-ghi-danh" 
                                    data-khoahoc-id="${kh.khoaHocId}"
                                    data-co-matkhau="${kh.coMatKhau ? '1' : '0'}"
                                    ${buttonDisabled}>
                                <i class="bi ${buttonIcon} me-1"></i>
                                ${buttonText}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;

        container.append(html);
    });

    // ⭐ XỬ LÝ Sự KIỆN CLICK NÚT GHI DANH
    $('.btn-ghi-danh').on('click', function () {
        const btn = $(this);
        if (btn.prop('disabled')) return;

        const khoaHocId = btn.data('khoahoc-id');
        // ✅ SỬA: Dùng .attr() để lấy giá trị thực từ HTML
        const coMatKhauStr = btn.attr('data-co-matkhau');
        
        console.log('=== CLICK GHI DANH ===');
        console.log('KhoaHocId:', khoaHocId);
        console.log('coMatKhauStr từ attr():', coMatKhauStr, typeof coMatKhauStr);

        ghiDanhKhoaHoc(khoaHocId, coMatKhauStr, btn);
    });
}

// ⭐ HÀM GHI DANH KHÓA HỌC
function ghiDanhKhoaHoc(khoaHocId, coMatKhauStr, btn) {
    // ✅ SỬA: So sánh với '1' (string)
    const hasPassword = coMatKhauStr === '1';
    
    console.log('=== GHI DANH KHÓA HỌC ===');
    console.log('coMatKhauStr:', coMatKhauStr);
    console.log('hasPassword:', hasPassword);

    if (hasPassword) {
        console.log('→ Hiển thị modal NHẬP MẬT KHẨU');
        // ⭐ KHÓA HỌC CÓ MẬT KHẨU - HIỂN THỊ POPUP NHẬP MẬT KHẨU
        Swal.fire({
            title: 'Nhập mật khẩu khóa học',
            input: 'password',
            inputLabel: 'Mật khẩu',
            inputPlaceholder: 'Nhập mật khẩu để ghi danh',
            showCancelButton: true,
            confirmButtonText: 'Ghi danh',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            inputValidator: (value) => {
                if (!value) {
                    return 'Vui lòng nhập mật khẩu!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                xuLyGhiDanh(khoaHocId, result.value, btn);
            }
        });
    } else {
        console.log('→ Hiển thị modal XÁC NHẬN (không mật khẩu)');
        // ⭐ KHÓA HỌC KHÔNG CÓ MẬT KHẨU - XÁC NHẬN TRỰC TIẾP
        Swal.fire({
            title: 'Xác nhận ghi danh',
            text: 'Bạn có chắc muốn ghi danh vào khóa học này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                xuLyGhiDanh(khoaHocId, null, btn);
            }
        });
    }
}

// ⭐ HÀM XỬ LÝ GHI DANH (GỌI API)
function xuLyGhiDanh(khoaHocId, matKhau, btn) {
    // Disable button và hiển thị loading
    btn.prop('disabled', true);
    const originalHtml = btn.html();
    btn.html('<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...');

    $.ajax({
        url: '/Student/Home/GhiDanhKhoaHoc',
        type: 'POST',
        data: {
            khoaHocId: khoaHocId,
            matKhau: matKhau
        },
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    text: response.message,
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    // ⭐ CẬP NHẬT BUTTON THÀNH "ĐÃ THAM GIA"
                    btn.removeClass('btn-light').addClass('btn-success');
                    btn.html('<i class="bi bi-check-circle me-1"></i> Đã tham gia');
                    btn.prop('disabled', true);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    text: response.message,
                    confirmButtonColor: '#d33'
                });
                
                // Khôi phục button
                btn.prop('disabled', false);
                btn.html(originalHtml);
            }
        },
        error: function (xhr, status, error) {
            console.error('Lỗi khi ghi danh:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể ghi danh. Vui lòng thử lại!',
                confirmButtonColor: '#d33'
            });
            
            // Khôi phục button
            btn.prop('disabled', false);
            btn.html(originalHtml);
        }
    });
}