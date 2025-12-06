
// tick tất cả
document.addEventListener('DOMContentLoaded', function () {
    const checkAll = document.getElementById('checkAllStudentsStatic');
    const checkboxes = document.querySelectorAll('.student-checkbox');

    if (checkAll) {
        // Tick tất cả / bỏ chọn tất cả
        checkAll.addEventListener('change', function () {
            checkboxes.forEach(cb => cb.checked = checkAll.checked);
        });

        // Nếu bỏ chọn 1 ô => bỏ tick "chọn tất cả"
        checkboxes.forEach(cb => {
            cb.addEventListener('change', function () {
                if (!cb.checked) {
                    checkAll.checked = false;
                } else if (Array.from(checkboxes).every(x => x.checked)) {
                    checkAll.checked = true;
                }
            });
        });
    } else {
       
    }
});