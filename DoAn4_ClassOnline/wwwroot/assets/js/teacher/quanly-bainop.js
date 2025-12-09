    // Biến global để lưu hạn nộp
    window.hanNopBaiTap = null;

    // ============================================
    // HELPER FUNCTIONS - ĐỊNH NGHĨA TRƯỚC
    // ============================================

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

    // Hàm tính trạng thái nộp bài
    function getTrangThaiNopBai(ngayNop, hanNop) {
        if (!ngayNop || !hanNop) {
            return {
                html: '<span class="text-muted">--</span>',
                text: '--'
            };
        }

        const dateNop = new Date(ngayNop);
        const dateHan = new Date(hanNop);
        const diffMs = dateNop - dateHan;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let statusText = '';
        let statusClass = '';
        let icon = '';

        if (diffMs < 0) {
            // Nộp sớm
            const absDays = Math.abs(diffDays);
            const absHours = Math.abs(diffHours) % 24;
            const absMinutes = Math.abs(diffMinutes) % 60;

            if (absDays > 0) {
                statusText = `Nộp sớm ${absDays} ngày`;
            } else if (absHours > 0) {
                statusText = `Nộp sớm ${absHours} giờ`;
            } else {
                statusText = `Nộp sớm ${absMinutes} phút`;
            }
            statusClass = 'early';
            icon = 'bi-arrow-down-circle-fill';
        } else if (diffMs === 0 || Math.abs(diffMinutes) < 1) {
            // Đúng hạn
            statusText = 'Đúng hạn';
            statusClass = 'ontime';
            icon = 'bi-check-circle-fill';
        } else {
            // Nộp trễ
            if (diffDays > 0) {
                statusText = `Nộp trễ ${diffDays} ngày`;
            } else if (diffHours > 0) {
                statusText = `Nộp trễ ${diffHours} giờ`;
            } else {
                statusText = `Nộp trễ ${diffMinutes} phút`;
            }
            statusClass = 'late';
            icon = 'bi-exclamation-circle-fill';
        }

        return {
            html: `<span class="status-badge ${statusClass}"><i class="bi ${icon}"></i>${statusText}</span>`,
            text: statusText
        };
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

    // Cắt ngắn text
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Escape HTML để tránh XSS
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

    // Format kích thước file
    function formatFileSize(bytes) {
        if (!bytes) return '0 KB';
        const kb = bytes / 1024;
        if (kb < 1024) return kb.toFixed(2) + ' KB';
        return (kb / 1024).toFixed(2) + ' MB';
    }

    // ============================================
    // LOAD DANH SÁCH NỘP BÀI
    // ============================================
    async function loadDanhSachNopBai(baiTapId) {
        try {
            const response = await $.ajax({
                url: '/Teacher/BaiTap/GetDanhSachNopBai',
                type: 'GET',
                data: { baiTapId: baiTapId },
                dataType: 'json'
            });

            if (response.success) {
                renderDanhSachNopBai(response.data);
            } else {
                showError_tc(response.message || 'Không thể tải danh sách nộp bài!');
            }
        } catch (error) {
            console.error('Lỗi load danh sách nộp bài:', error);
            showError_tc('Có lỗi xảy ra khi tải dữ liệu!');
        }
    }

    // ============================================
    // RENDER DANH SÁCH NỘP BÀI
    // ============================================
    function renderDanhSachNopBai(data) {
        // Cập nhật thông tin bài tập
        $('#tenBaiTap_NopBai').text(`Bài tập: ${data.baiTap.tieuDe}`);

        if (data.baiTap.thoiGianKetThuc) {
            $('#hanNop_NopBai').text(formatDateTime(data.baiTap.thoiGianKetThuc));
            window.hanNopBaiTap = data.baiTap.thoiGianKetThuc;
        } else {
            $('#hanNop_NopBai').text('Không có hạn');
            window.hanNopBaiTap = null;
        }

        // Cập nhật thống kê
        $('#soDaNop_NopBai').text(data.thongKe.daNop);
        $('#soChuaNop_NopBai').text(data.thongKe.chuaNop);

        // Lưu điểm tối đa vào biến global
        window.diemToiDa_BaiTap = data.baiTap.diemToiDa;

        // Render bảng danh sách
        const tbody = $('#tbody_DanhSachNopBai');
        tbody.empty();

        if (!data.danhSachNopBai || data.danhSachNopBai.length === 0) {
            tbody.html(`
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="bi bi-inbox fs-3 text-muted"></i>
                        <p class="mt-2 text-muted">Chưa có sinh viên nào được giao bài tập này.</p>
                    </td>
                </tr>
            `);
            return;
        }

        // Render từng sinh viên
        data.danhSachNopBai.forEach((item, index) => {
            const row = createRowNopBai(item, index + 1, data.baiTap.diemToiDa);
            tbody.append(row);
        });
    }

    // ============================================
    // TẠO DÒNG BẢNG CHO MỖI SINH VIÊN
    // ============================================
    function createRowNopBai(item, stt, diemToiDa) {
        const isDaNop = item.trangThai === 'DaNop';
        const avatar = item.avatar || '/assets/image/tải xuống.jpg';

        // Xử lý trạng thái
        let trangThaiHtml = '';
        if (isDaNop) {
            trangThaiHtml = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Đã nộp</span>';
        } else {
            trangThaiHtml = '<span class="text-danger"><i class="bi bi-x-circle me-1"></i>Chưa nộp</span>';
        }

        // Xử lý thời gian nộp
        let thoiGianNopHtml = '<span class="text-muted">--</span>';
        if (item.ngayNop) {
            thoiGianNopHtml = formatDateTime(item.ngayNop);
        }

        // Xử lý file đính kèm
        let fileHtml = '<span class="text-muted">--</span>';
        if (item.danhSachFile && item.danhSachFile.length > 0) {
            const file = item.danhSachFile[0];
            const iconClass = getFileIcon(file.loaiFile);
            fileHtml = `
                <a href="${file.duongDan}" class="text-decoration-none" download="${file.tenFile}" title="${file.tenFile}">
                    <i class="${iconClass} me-1"></i>${truncateText(file.tenFile, 20)}
                </a>
            `;

            if (item.danhSachFile.length > 1) {
                fileHtml += ` <span class="badge bg-secondary">+${item.danhSachFile.length - 1}</span>`;
            }
        }

        // Xử lý điểm
        let diemHtml = '<span class="text-muted">--</span>';
        if (item.diem !== null && item.diem !== undefined) {
            diemHtml = `<span class="text-secondary fw-bold">${item.diem} / ${diemToiDa}</span>`;
        }

        // Xử lý nút hành động
        let actionHtml = '';
        if (isDaNop) {
            actionHtml = `
                <button class="btn btn-outline-success btn-sm"
                        onclick="chamDiemBaiNop(${item.baiNopId})"
                        title="Chấm / sửa điểm">
                    <i class="bi bi-pencil-square"></i>
                </button>
            `;
        } else {
            actionHtml = `
                <button class="btn btn-outline-secondary btn-sm" disabled title="Chưa nộp bài">
                    <i class="bi bi-slash-circle"></i>
                </button>
            `;
        }

        return `
            <tr data-sinhvien="${(item.tenSinhVien || '').toLowerCase()}"
                data-mssv="${(item.maSinhVien || '').toLowerCase()}"
                data-trangthai="${item.trangThai || ''}"
                data-bainop='${JSON.stringify(item)}'>
                <td class="align-middle">${stt}</td>
                <td class="align-middle">
                    <div class="d-flex align-items-center">
                        <img src="${avatar}"
                             class="rounded-circle me-3"
                             alt="avatar"
                             style="width: 40px; height: 40px; object-fit: cover;">
                        <div>
                            <div class="fw-semibold">${escapeHtml(item.tenSinhVien)}</div>
                        </div>
                    </div>
                </td>
                <td class="align-middle">${escapeHtml(item.maSinhVien)}</td>
                <td class="align-middle">${trangThaiHtml}</td>
                <td class="align-middle">${thoiGianNopHtml}</td>
                <td class="align-middle">${fileHtml}</td>
                <td class="align-middle">${diemHtml}</td>
                <td class="align-middle text-center action-btns">
                    ${actionHtml}
                </td>
            </tr>
        `;
    }

    // ============================================
    // THIẾT LẬP CÁC EVENT LISTENER
    // ============================================
    function setupEventListeners() {
        // Tìm kiếm sinh viên
        $('#searchSinhVien_NopBai').on('input', function() {
            filterDanhSachNopBai();
        });

        // Lọc theo trạng thái
        $('#filterTrangThai_NopBai').on('change', function() {
            filterDanhSachNopBai();
        });
    }

    // ============================================
    // LỌC DANH SÁCH NỘP BÀI
    // ============================================
    function filterDanhSachNopBai() {
        const searchText = $('#searchSinhVien_NopBai').val().toLowerCase().trim();
        const trangThai = $('#filterTrangThai_NopBai').val();

        $('#tbody_DanhSachNopBai tr').each(function() {
            const $row = $(this);

            // Bỏ qua row thông báo (loading, empty)
            if ($row.find('td[colspan]').length > 0) {
                return;
            }

            // Lấy dữ liệu và đảm bảo là string
            const tenSinhVien = String($row.data('sinhvien') || '').toLowerCase();
            const mssv = String($row.data('mssv') || '').toLowerCase();
            const rowTrangThai = String($row.data('trangthai') || '');

            // Kiểm tra điều kiện tìm kiếm
            const matchSearch = searchText === '' ||
                              tenSinhVien.includes(searchText) ||
                              mssv.includes(searchText);

            // Kiểm tra điều kiện lọc trạng thái
            const matchTrangThai = trangThai === 'all' || rowTrangThai === trangThai;

            // Hiển thị hoặc ẩn
            if (matchSearch && matchTrangThai) {
                $row.show();
            } else {
                $row.hide();
            }
        });
    }
    // ============================================
    // CHẤM ĐIỂM BÀI NỘP
    // ============================================
    function chamDiemBaiNop(baiNopId) {
        try {
            // Tìm dữ liệu bài nộp từ table
            const $row = $(`tr[data-bainop]`).filter(function() {
                const data = $(this).data('bainop');
                return data && data.baiNopId === baiNopId;
            });

            if ($row.length === 0) {
                showError_tc('Không tìm thấy thông tin bài nộp!');
                return;
            }

            const baiNop = $row.data('bainop');

            // Điền thông tin vào modal
            $('#chamDiem_BaiNopId').val(baiNop.baiNopId);
            $('#chamDiem_TenSinhVien').text(baiNop.tenSinhVien || '--');
            $('#chamDiem_MaSinhVien').text(baiNop.maSinhVien || '--');
            $('#chamDiem_Email').text(baiNop.email || '--');
            $('#chamDiem_Avatar').attr('src', baiNop.avatar || '/assets/image/tải xuống.jpg');
            $('#chamDiem_NgayNop').text(formatDateTime(baiNop.ngayNop) || '--');

            // Tính và hiển thị trạng thái nộp bài
            const trangThaiNop = getTrangThaiNopBai(baiNop.ngayNop, window.hanNopBaiTap);
            $('#chamDiem_TrangThaiNop').html(trangThaiNop.html);

            // Hiển thị số file
            const soFile = baiNop.danhSachFile ? baiNop.danhSachFile.length : 0;
            $('#chamDiem_SoFile').text(`${soFile} file`);

            // Hiển thị điểm tối đa
            $('#chamDiem_DiemToiDa').text(window.diemToiDa_BaiTap || 10);
            $('#chamDiem_Diem').attr('max', window.diemToiDa_BaiTap || 10);

            // Điền điểm nếu đã chấm
            if (baiNop.diem !== null && baiNop.diem !== undefined) {
                $('#chamDiem_Diem').val(baiNop.diem);
            } else {
                $('#chamDiem_Diem').val('');
            }

            // Render danh sách file
            renderDanhSachFileChamDiem(baiNop.danhSachFile);

            // Hiển thị modal
            const modal = new bootstrap.Modal(document.getElementById('modalChamDiem'));
            modal.show();

        } catch (error) {
            console.error('Lỗi mở modal chấm điểm:', error);
            showError_tc('Có lỗi xảy ra khi mở modal chấm điểm!');
        }
    }

    // ============================================
    // RENDER DANH SÁCH FILE TRONG MODAL CHẤM ĐIỂM
    // ============================================
    function renderDanhSachFileChamDiem(danhSachFile) {
        const container = $('#chamDiem_DanhSachFile');
        container.empty();

        if (!danhSachFile || danhSachFile.length === 0) {
            container.html(`
                <div class="text-center text-muted py-2">
                    <i class="bi bi-inbox"></i>
                    <p class="mb-0 small">Không có file đính kèm</p>
                </div>
            `);
            return;
        }

        danhSachFile.forEach(file => {
            const iconClass = getFileIcon(file.loaiFile);
            const fileSize = formatFileSize(file.kichThuoc);

            const fileHtml = `
                <div class="d-flex align-items-center justify-content-between p-2 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="${iconClass} fs-4"></i>
                        <div>
                            <div class="fw-semibold small">${escapeHtml(file.tenFile)}</div>
                            <div class="text-muted" style="font-size: 0.75rem;">${fileSize}</div>
                        </div>
                    </div>
                    <a href="${file.duongDan}" class="btn btn-sm btn-outline-primary" download="${file.tenFile}">
                        <i class="bi bi-download"></i>
                    </a>
                </div>
            `;
            container.append(fileHtml);
        });
    }

    // ============================================
    // LƯU CHẤM ĐIỂM
    // ============================================
    async function luuChamDiem() {
        try {
            const baiNopId = $('#chamDiem_BaiNopId').val();
            const diem = parseFloat($('#chamDiem_Diem').val());
            const diemToiDa = window.diemToiDa_BaiTap || 10;

            // Validate
            if (!baiNopId) {
                showError_tc('Không tìm thấy ID bài nộp!');
                return;
            }

            if (isNaN(diem) || diem < 0) {
                showError_tc('Vui lòng nhập điểm hợp lệ!');
                $('#chamDiem_Diem').addClass('is-invalid');
                return;
            }

            if (diem > diemToiDa) {
                showError_tc(`Điểm không được vượt quá ${diemToiDa}!`);
                $('#chamDiem_Diem').addClass('is-invalid');
                return;
            }

            // Xóa class invalid nếu có
            $('#chamDiem_Diem').removeClass('is-invalid');

            // Hiển thị loading
            Swal.fire({
                title: 'Đang lưu điểm...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Gọi API
            const response = await $.ajax({
                url: '/Teacher/BaiTap/ChamDiem',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    baiNopId: parseInt(baiNopId),
                    diem: diem
                }),
                dataType: 'json'
            });

            Swal.close();

            if (response.success) {
                // Đóng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalChamDiem'));
                if (modal) {
                    modal.hide();
                }

                // Hiển thị thông báo thành công
                showSuccess_tc('Chấm điểm thành công!');

                // Reload lại danh sách
                const urlParams = new URLSearchParams(window.location.search);
                const baiTapId = urlParams.get('baiTapId');
                if (baiTapId) {
                    setTimeout(() => {
                        loadDanhSachNopBai(baiTapId);
                    }, 1000);
                }
            } else {
                showError_tc(response.message || 'Không thể lưu điểm!');
            }

        } catch (error) {
            Swal.close();
            console.error('Lỗi lưu chấm điểm:', error);
            showError_tc('Có lỗi xảy ra khi lưu điểm!');
        }
    }

    // ============================================
    // KHỞI ĐỘNG KHI TRANG ĐƯỢC TẢI
    // ============================================
    document.addEventListener("DOMContentLoaded", function() {
        // Lấy tham số URL
        const urlParams = new URLSearchParams(window.location.search);
        const baiTapId = urlParams.get('baiTapId');

        if (baiTapId) {
            loadDanhSachNopBai(baiTapId);
        } else {
            showError_tc('Không tìm thấy ID bài tập!');
        }

        // Thiết lập các event listener
        setupEventListeners();
    });

// ============================================
// XUẤT CSV DANH SÁCH NỘP BÀI
// ============================================
async function xuatCSVDanhSachNopBai() {
    try {
        // Lấy baiTapId từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const baiTapId = urlParams.get('baiTapId');

        if (!baiTapId) {
            showError_tc('Không tìm thấy ID bài tập!');
            return;
        }

        // Hiển thị loading trên nút
        const btn = $('#btnXuatCSV');
        const oldText = btn.html();
        btn.html('<i class="bi bi-hourglass-split me-1"></i>Đang xuất...').prop('disabled', true);

        // Gọi API xuất CSV
        const url = `/Teacher/BaiTap/XuatCSVDanhSachNopBai?baiTapId=${baiTapId}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // Kiểm tra content type
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            // Trường hợp trả về JSON (lỗi)
            const data = await response.json();
            throw new Error(data.message || 'Không thể xuất file CSV');
        }

        // Lấy blob từ response
        const blob = await response.blob();

        // Lấy tên file từ header hoặc tạo mặc định
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = `DanhSachNopBai_${Date.now()}.csv`;

        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = fileNameMatch[1].replace(/['"]/g, '');
            }
        }

        // Tạo link download
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        // Hiển thị thông báo thành công
        showSuccess_tc('Đã xuất file CSV thành công!');

        // Reset nút
        btn.html(oldText).prop('disabled', false);

    } catch (error) {
        console.error('Lỗi xuất CSV:', error);
        showError_tc('Có lỗi xảy ra khi xuất file CSV: ' + error.message);

        // Reset nút
        $('#btnXuatCSV').html('<i class="bi bi-file-earmark-spreadsheet me-1"></i>Xuất CSV').prop('disabled', false);
    }
}
