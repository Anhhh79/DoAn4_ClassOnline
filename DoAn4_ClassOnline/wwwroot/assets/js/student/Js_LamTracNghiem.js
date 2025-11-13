const questions = [
    {
        text: "Shell là gì trong Linux?",
        options: ["Một chương trình thuộc kernel", "Một loại trình duyệt", "Một bộ thông dịch lệnh", "Một phần mềm đồ họa"],
        answer: 2
    },
    {
        text: "Lệnh nào dùng để xem shell hiện tại đang dùng?",
        options: ["cat /etc/shells", "echo $SHELL", "whoami", "ls /bin"],
        answer: 1
    },
    {
        text: "Lệnh nào để thay đổi quyền cho file trong Linux?",
        options: ["chmod", "chfile", "mv", "ls -a"],
        answer: 0
    },
    {
        text: "Lệnh nào để xem nội dung file trong Linux?",
        options: ["cat", "ls", "pwd", "rm"],
        answer: 0
    }
];

const questionList = document.getElementById("questionList");
const questionNav = document.getElementById("questionNav");

// ===== Render danh sách câu hỏi =====
questions.forEach((q, i) => {
    const qBlock = document.createElement("div");
    qBlock.className = "border rounded-4 p-3 mb-3 bg-light-subtle";
    qBlock.id = `q${i + 1}`;

    qBlock.innerHTML = `
      <div class="fw-bold mb-2">Câu ${i + 1}</div>
      <div class="fw-semibold mb-3">${q.text}</div>
      ${q.options.map((opt, idx) => `
        <button class="option-btn btn btn-outline-secondary w-100 text-start mb-2" data-q="${i}" data-index="${idx}">
          ${String.fromCharCode(65 + idx)}. ${opt}
        </button>
      `).join('')}
      <div class="text-center text-muted small mt-2">Chọn một đáp án đúng</div>
    `;
    questionList.appendChild(qBlock);

    // Nút danh sách câu hỏi bên phải
    const navBtn = document.createElement("button");
    navBtn.className = "btn btn-outline-secondary btn-sm";
    navBtn.innerText = (i + 1).toString().padStart(2, "0");
    navBtn.onclick = () => document.getElementById(`q${i + 1}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
    questionNav.appendChild(navBtn);
});

// ===== Chọn đáp án =====
document.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const qIndex = btn.dataset.q;
        document.querySelectorAll(`.option-btn[data-q="${qIndex}"]`).forEach(b => b.classList.remove("btn-primary", "text-white"));
        btn.classList.add("btn-primary", "text-white");
        questionNav.children[qIndex].classList.add("btn-primary", "text-white");
    });
});

// ===== Đồng hồ đếm ngược =====
let seconds = 40 * 60;
const timerEl = document.getElementById("timer");
const timer = setInterval(() => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    timerEl.textContent = `${h}:${m}:${s}`;
    if (seconds-- <= 0) {
        clearInterval(timer);
        submitExam();
    }
}, 1000);

// ===== Nộp bài =====
document.getElementById("btnSubmit").onclick = submitExam;

function submitExam() {
    clearInterval(timer);
    let score = 0;
    questions.forEach((q, i) => {
        const selected = document.querySelector(`.option-btn[data-q="${i}"].btn-primary`);
        if (selected && parseInt(selected.dataset.index) === q.answer) score++;
    });
    const percent = Math.round((score / questions.length) * 100);

    // Hiển thị kết quả trực quan
    questions.forEach((q, i) => {
        const block = document.getElementById(`q${i + 1}`);
        const correctBtn = block.querySelector(`.option-btn[data-q="${i}"][data-index="${q.answer}"]`);
        correctBtn.classList.add("btn-success", "text-white");
    });

    alert(`✅ Bạn làm đúng ${score}/${questions.length} câu (${percent}%)`);
}