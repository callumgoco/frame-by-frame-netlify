document.addEventListener("DOMContentLoaded", function () {
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownContent = document.getElementById("dropdownContent");
    const selectedStyleText = document.getElementById("selectedStyleText");
    const selectedStyleDiv = document.getElementById("selectedStyle");
    const selectedArtStyleInput = document.getElementById("selectedArtStyleInput");

    dropdownContent.querySelectorAll("a").forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const selectedStyle = this.getAttribute("data-style");
            dropdownBtn.textContent = selectedStyle;
            selectedStyleText.textContent = selectedStyle;
            selectedStyleDiv.style.display = "block";
            selectedArtStyleInput.value = selectedStyle.replace(" ", "_");
            dropdownContent.classList.remove("show");
        });
    });
});
