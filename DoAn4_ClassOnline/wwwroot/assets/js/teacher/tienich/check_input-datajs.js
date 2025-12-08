function showError_TienIch(id, message) {
    const element = document.getElementById(id);
    element.innerText = message;
    element.classList.remove("d-none");
}

function clearErrors_TienIch() {
    let errors = document.querySelectorAll("small.text-danger");
    errors.forEach(e => e.classList.add("d-none"));
}

function resetForm_TienIch(formId) {
    const form = document.getElementById(formId);
    if (form) {
        clearErrors_TienIch();
        form.reset();
    }
}