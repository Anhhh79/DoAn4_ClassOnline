function openModal(id) {
    let modal = new bootstrap.Modal(document.getElementById(id));
    modal.show();
}

function closeModal(id) {
    let modalEl = document.getElementById(id);
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
}
