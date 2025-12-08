// ⭐ WORD IMPORT - Xử lý upload và parse file Word ⭐

document.addEventListener('DOMContentLoaded', function() {
    // ⭐ CHỈ CHẠY TRÊN TRANG ThemBaiTracNghiem ⭐
    if (!window.location.pathname.includes('ThemBaiTracNghiem')) {
        return;
    }

    console.log('✅ WordImport.js loaded');

    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const uploadArea = document.getElementById('uploadArea');

    if (!fileInput || !selectFileBtn || !uploadArea) {
        console.warn('⚠️ Word upload elements not found');
        return;
    }

    // ⭐ CLICK BUTTON ĐỂ CHỌN FILE ⭐
    selectFileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    // ⭐ XỬ LÝ CHỌN FILE ⭐
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadWordFile(file);
        }
        // Reset input để có thể chọn lại cùng file
        fileInput.value = '';
    });

    // ⭐ DRAG & DROP ⭐
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            await uploadWordFile(file);
        }
    });

    // ⭐ FUNCTION UPLOAD FILE ⭐
    async function uploadWordFile(file) {
        console.log('📤 Uploading file:', file.name);

        // Validate file type
        if (!file.name.match(/\.(doc|docx)$/i)) {
            Swal.fire({
                icon: 'warning',
                title: 'Định dạng không hợp lệ!',
                text: 'Chỉ hỗ trợ file Word (.doc, .docx)',
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        // Show loading
        Swal.fire({
            title: 'Đang đọc file Word...',
            html: `
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p>Đang phân tích file <strong>${file.name}</strong></p>
                <p class="small text-muted">Vui lòng đợi...</p>
            `,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Prepare form data
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/Teacher/WordImport/ParseWordFile', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📥 Response:', data);

            Swal.close();

            if (data.success) {
                // Show success message
                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    html: `
                        <p>${data.message}</p>
                        <p class="small text-muted mt-2">Bạn sẽ được chuyển đến trang soạn đề...</p>
                    `,
                    timer: 2500,
                    showConfirmButton: false,
                    timerProgressBar: true
                });

                // Save questions to sessionStorage
                sessionStorage.setItem('importedQuestions', JSON.stringify(data.questions));
                sessionStorage.setItem('importedFileName', file.name);

                // Redirect to edit page
                const khoaHocId = window.khoaHocIdGlobal || 0;
                window.location.href = `/Teacher/TracNghiem/ChinhSuaTracNghiem?khoaHocId=${khoaHocId}`;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Không thể đọc file!',
                    html: `<p>${data.message}</p>`,
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#dc3545',
                    footer: '<a href="#" data-bs-toggle="modal" data-bs-target="#exampleModal">Xem hướng dẫn định dạng file</a>'
                });
            }
        } catch (error) {
            console.error('❌ Upload error:', error);
            Swal.close();
            
            Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối!',
                html: `
                    <p>Có lỗi xảy ra khi xử lý file:</p>
                    <code class="d-block bg-light p-2 rounded mt-2">${error.message}</code>
                `,
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#dc3545'
            });
        }
    }
});