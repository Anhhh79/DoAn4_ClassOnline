(function () {
    let qIndex = 0;
    const questionContainer = document.getElementById('questionContainer');
    const btnAdd = document.getElementById('btnAdd');
    const btnPreview = document.getElementById('btnPreview');
    const btnSave = document.getElementById('btnSave');
    const btnExport = document.getElementById('btnExport');
    const fileImport = document.getElementById('fileImport');
    const btnImport = document.getElementById('btnImport');
    const STORAGE_KEY = 'local_test_data_v3';

    btnAdd.onclick = () => addQuestion();
    btnPreview.onclick = preview;
    btnSave.onclick = (e) => { e.preventDefault(); saveLocal() };
    btnExport.onclick = exportJSON;
    btnImport.onclick = () => fileImport.click();
    fileImport.onchange = handleImport;

    init();

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (Array.isArray(data.questions)) {
                    // load dữ liệu cũ: đảo ngược để giữ thứ tự đúng
                    data.questions.reverse().forEach(q => addQuestion(q, false, true));
                    updateOrder();
                    return;
                }
            } catch { /* ignore */ }
        }
        addQuestion(); // mặc định tạo 1 câu đầu tiên
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

        block.querySelector('.img-input').onchange = (e) => loadImage(e, block);
        block.querySelector('.btn-delete').onclick = () => {
            block.remove();
            updateOrder();
        };

        // 🟢 Chèn câu mới lên đầu
        questionContainer.prepend(block);

        updateOrder();

        if (scroll) block.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function updateOrder() {
        // Đảo ngược danh sách để đánh số theo thứ tự tạo
        const blocks = [...document.querySelectorAll('.question-block')].reverse();
        blocks.forEach((b, i) => {
            b.querySelector('.question-label').innerText = `Câu ${i + 1}`;
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
            questions: blocks.reverse().map((b, i) => { // đảo ngược khi lưu để giữ thứ tự đúng
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

        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        document.getElementById('previewBody').innerHTML = html;
        modal.show();
    }

    function saveLocal() {
        try {
            const data = collect();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            alert("✅ Đã lưu!");
        } catch (e) {
            alert(e.message);
        }
    }

    function exportJSON() {
        let data;
        try { data = collect(); }
        catch (e) { return alert(e.message); }

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