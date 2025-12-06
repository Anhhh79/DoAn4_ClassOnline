// ⭐ KIỂM TRA XEM CÓ ĐANG Ở TRANG CHỈNH SỬA TRẮC NGHIỆM KHÔNG ⭐
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra xem có phần tử đặc trưng của trang này không
    const questionContainer = document.getElementById('questionContainer');
    
    // ⭐ NẾU KHÔNG PHẢI TRANG CHỈNH SỬA TRẮC NGHIỆM THÌ THOÁT ⭐
    if (!questionContainer) {
        // Không log error, chỉ thoát im lặng
        return;
    }

    // ⭐ HOẶC KIỂM TRA URL ⭐
    if (!window.location.pathname.includes('ChinhSuaTracNghiem') && 
        !window.location.pathname.includes('TracNghiem')) {
        return;
    }

    // Bảo đảm mọi thứ chỉ chạy khi DOM đã sẵn sàng
    (function () {
        "use strict";

        let qIndex = 0;
        const btnAdd = document.getElementById('btnAdd');
        const btnPreview = document.getElementById('btnPreview');
        const btnSave = document.getElementById('btnSave');
        const btnExport = document.getElementById('btnExport');
        const fileImport = document.getElementById('fileImport');
        const btnImport = document.getElementById('btnImport');
        const STORAGE_KEY = 'local_test_data_v3';

        // ⭐ KIỂM TRA CÁC PHẦN TỬ KHÁC MỘT CÁCH IM LẶNG ⭐
        const required = { btnAdd, btnPreview, btnSave, btnExport, fileImport, btnImport };
        for (const [k, v] of Object.entries(required)) {
            if (!v) {
                // ⭐ KHÔNG LOG ERROR, CHỈ THOÁT IM LẶNG ⭐
                return;
            }
        }

        // Gán sự kiện
        btnAdd.onclick = () => addQuestion();
        btnPreview.onclick = preview;
        btnSave.onclick = (e) => { e.preventDefault(); saveLocal(); };
        btnExport.onclick = exportJSON;
        btnImport.onclick = () => fileImport.click();
        fileImport.onchange = handleImport;

        init();

        function init() {
            // ⭐ XÓA LOCALSTORAGE ĐỂ BẮT ĐẦU SẠCH ⭐
            localStorage.removeItem(STORAGE_KEY);
            
            // ⭐ CHỈ TẠO 1 CÂU MẶC ĐỊNH ⭐
            addQuestion();
            
            console.log('✅ INIT: Đã xóa localStorage, tạo 1 câu mới');
        }

        function addQuestion(data = null, scroll = true, isInit = false) {
            qIndex++;
            const id = qIndex;
            const block = document.createElement('div');
            block.className = "border rounded-4 p-3 mb-3 question-block";
            block.dataset.qid = id;

            block.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="question-label"></strong>
          <button class="btn btn-danger btn-sm btn-delete">Xóa</button>
        </div>

        <label class="small">Nội dung:</label>
        <input class="form-control mb-2 question-text"
               value="${escapeHtml(data?.text || '')}"
               placeholder="Nhập nội dung..." required>

        <label class="small">Hình ảnh (tùy chọn):</label>
        <input type="file" accept="image/*" class="form-control form-control-sm mb-2 img-input">

        ${data?.image ? `<img src="${data.image}" class="question-img mb-2"
          style="max-width:150px;border:1px solid #ddd;border-radius:6px">` : ''}

        ${["A", "B", "C", "D"].map((opt, i) => `
          <div class="input-group mb-2">
            <span class="input-group-text">${opt}</span>
            <input class="form-control option-text" data-opt="${opt}" placeholder="Đáp án ${opt}"
            value="${escapeHtml(data?.options?.[i] || '')}" required>
            <span class="input-group-text">
              <input type="radio" name="correct_${id}" value="${opt}"
              ${data?.answer === opt ? 'checked' : ''}>
            </span>
          </div>
        `).join('')}
      `;

            const imgInput = block.querySelector('.img-input');
            const btnDelete = block.querySelector('.btn-delete');

            if (imgInput) imgInput.onchange = (e) => loadImage(e, block);
            if (btnDelete) btnDelete.onclick = () => {
                block.remove();
                updateOrder();
            };

            questionContainer.prepend(block);
            updateOrder();

            if (scroll) block.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        function updateOrder() {
            const blocks = [...document.querySelectorAll('.question-block')].reverse();
            blocks.forEach((b, i) => {
                const lbl = b.querySelector('.question-label');
                if (lbl) lbl.innerText = `Câu ${i + 1}`;
            });
        }

        function loadImage(e, block) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                let img = block.querySelector('.question-img');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'question-img mb-2';
                    img.style.maxWidth = '150px';
                    img.style.border = '1px solid #ddd';
                    img.style.borderRadius = '6px';
                    const firstInputGroup = block.querySelector('.input-group');
                    if (firstInputGroup) block.insertBefore(img, firstInputGroup);
                    else block.appendChild(img);
                }
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }

        function collect() {
            const blocks = [...document.querySelectorAll('.question-block')];
            if (!blocks.length) throw new Error("Phải có ít nhất 1 câu!");

            const total = blocks.length;
            const pointEach = +(10 / total).toFixed(2);

            return {
                title: "Bài thi",
                questions: blocks.reverse().map((b, i) => {
                    const text = b.querySelector('.question-text').value.trim();
                    const opts = [...b.querySelectorAll('.option-text')].map(o => o.value.trim());
                    const ans = b.querySelector('input[type="radio"]:checked');
                    const img = b.querySelector('.question-img')?.src || null;

                    if (!text) throw new Error(`Câu ${i + 1} chưa có nội dung!`);
                    if (opts.some(o => !o)) throw new Error(`Câu ${i + 1} có đáp án bị trống!`);
                    if (!ans) throw new Error(`Câu ${i + 1} chưa chọn đáp án đúng!`);

                    return { text, image: img, options: opts, answer: ans.value, point: pointEach };
                })
            };
        }

        function preview() {
            let data;
            try { data = collect(); }
            catch (e) { return alert(e.message); }

            let html = `<h5>${escapeHtml(data.title)}</h5>`;
            data.questions.forEach((q, i) => {
                html += `
          <div class="border p-2 mb-2 rounded">
            <strong>Câu ${i + 1}</strong>
            <span class="text-muted">(${q.point} điểm)</span><br>
            ${q.image ? `<img src="${q.image}" style="max-width:150px;margin:8px 0;border:1px solid #ddd;border-radius:6px"><br>` : ''}
            ${escapeHtml(q.text)}<br>
            ${q.options.map((o, j) => `
              <label><input disabled type="radio"> ${String.fromCharCode(65 + j)}. ${escapeHtml(o)}</label><br>
            `).join('')}
          </div>`;
            });

            const previewModalEl = document.getElementById('previewModal');
            const previewBodyEl = document.getElementById('previewBody');
            if (!previewModalEl || !previewBodyEl) {
                alert('Không tìm thấy modal preview.');
                return;
            }

            const modal = new bootstrap.Modal(previewModalEl);
            previewBodyEl.innerHTML = html;
            modal.show();
        }

        function saveLocal() {
            try {
                const data = collect();
                if (data.questions.length === 0) {
                    showWarning_tc('Vui lòng thêm ít nhất một câu hỏi!');
                    return;
                }
            } catch (e) {
                showWarning_tc(e.message);
                return;
            }

            const settingModalEl = document.getElementById('settingModal');
            if (settingModalEl) {
                const modal = new bootstrap.Modal(settingModalEl);
                modal.show();
            } else {
                alert('Không tìm thấy modal cài đặt!');
            }
        }

        async function confirmSaveBaiTracNghiem() {
            const settingModalEl = document.getElementById('settingModal');
            if (settingModalEl) {
                const modal = bootstrap.Modal.getInstance(settingModalEl);
                if (modal) {
                    modal.hide();
                }
            }
            await saveToDatabase();
        }

        async function saveToDatabase() {
            const tenBaiThi = document.getElementById('tenBaiThi')?.value?.trim();
            if (!tenBaiThi) {
                showWarning_tc('Vui lòng nhập tên bài thi!');
                document.getElementById('tenBaiThi')?.focus();
                return;
            }

            const thoiGianBatDau = document.getElementById('thoiGianBatDau')?.value;
            if (!thoiGianBatDau) {
                showWarning_tc('Vui lòng chọn thời gian bắt đầu!');
                document.getElementById('thoiGianBatDau')?.focus();
                return;
            }

            const thoiGianKetThuc = document.getElementById('thoiGianKetThuc')?.value;
            if (!thoiGianKetThuc) {
                showWarning_tc('Vui lòng chọn thời gian kết thúc!');
                document.getElementById('thoiGianKetThuc')?.focus();
                return;
            }

            if (new Date(thoiGianKetThuc) <= new Date(thoiGianBatDau)) {
                showWarning_tc('Thời gian kết thúc phải sau thời gian bắt đầu!');
                document.getElementById('thoiGianKetThuc')?.focus();
                return;
            }

            const thoiGianLamBai = parseInt(document.getElementById('thoiGianLamBai')?.value);
            if (!thoiGianLamBai || thoiGianLamBai < 1) {
                showWarning_tc('Thời gian làm bài phải lớn hơn 0!');
                document.getElementById('thoiGianLamBai')?.focus();
                return;
            }

            const loaiBai = document.getElementById('loaiBai')?.value || 'Bài tập';
            const soLanLam = parseInt(document.getElementById('soLanLam')?.value) || 1;
            const tronCauHoi = document.getElementById('tronCauHoi')?.checked || false;
            const choXemKetQua = document.getElementById('choXemKetQua')?.checked || false;

            let data;
            try {
                data = collect();
            } catch (e) {
                showWarning_tc(e.message);
                return;
            }

            Swal.fire({
                title: 'Đang lưu...',
                text: 'Vui lòng đợi',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const khoaHocId = window.khoaHocIdGlobal || parseInt(document.getElementById('khoaHocId')?.value) || 0;

                const requestData = {
                    khoaHocId: khoaHocId,
                    tenBaiThi: tenBaiThi,
                    loaiBaiThi: loaiBai,
                    thoiLuongLamBai: thoiGianLamBai,
                    soLanLamToiDa: soLanLam,
                    thoiGianBatDau: new Date(thoiGianBatDau).toISOString(),
                    thoiGianKetThuc: new Date(thoiGianKetThuc).toISOString(),
                    tronCauHoi: tronCauHoi,
                    choXemKetQua: choXemKetQua,
                    cauHois: data.questions.map((q, index) => ({
                        text: q.text,
                        image: q.image,
                        options: q.options,
                        answer: q.answer,
                        point: q.point,
                        thuTu: index + 1
                    }))
                };

                console.log('Sending request:', requestData);

                const response = await fetch('/Teacher/TracNghiem/LuuBaiTracNghiem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                Swal.close();

                if (responseData.success) {
                    showSuccess_tc('Lưu bài trắc nghiệm thành công!');

                    setTimeout(() => {
                        window.location.href = `/Teacher/TracNghiem/ChiTiet/${responseData.baiTracNghiemId}`;
                    }, 2000);
                } else {
                    showError_tc(responseData.message || 'Không thể lưu bài trắc nghiệm');
                }
            } catch (error) {
                console.error('Save error:', error);
                Swal.close();
                showError_tc('Có lỗi xảy ra khi lưu: ' + error.message);
            }
        }

        window.confirmSaveBaiTracNghiem = confirmSaveBaiTracNghiem;

        function exportJSON() {
            let data;
            try { 
                data = collect(); 
            } catch (e) { 
                return alert(e.message); 
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "bai_thi.json";
            a.click();
            URL.revokeObjectURL(url);
        }

        function handleImport(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    questionContainer.innerHTML = "";
                    qIndex = 0;
                    data.questions.forEach(q => addQuestion(q, false, true));
                    updateOrder();
                    alert("✅ Import thành công!");
                } catch {
                    alert("❌ File JSON không hợp lệ!");
                } finally {
                    fileImport.value = '';
                }
            };
            reader.readAsText(file);
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    })();
});
