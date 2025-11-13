// Xử lý thanh tìm kiếm
function setupSearch(inputId, resultsId) {
	const input = document.getElementById(inputId);
	const results = document.getElementById(resultsId);

	input.addEventListener("focus", () => {
		results.classList.remove("d-none");
	});

	input.addEventListener("blur", () => {
		// Delay một chút để click vào item không bị mất ngay
		setTimeout(() => {
			results.classList.add("d-none");
		}, 200);
	});
}
setupSearch("searchInputDesktop", "searchResultsDesktop");
setupSearch("searchInputMobile", "searchResultsMobile");
