/**
 * art_style_selection.js - Handles art style selection and modal interactions
 */

document.addEventListener("DOMContentLoaded", function() {
    // Get elements
    const openModalBtn = document.getElementById("openModal");
    const modal = document.getElementById("uploadModal");
    const closeModalBtn = document.querySelector(".close-modal");
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownContent = document.getElementById("dropdownContent");
    const selectedStyleText = document.getElementById("selectedStyleText");
    const selectedArtStyleInput = document.getElementById("selectedArtStyleInput");
    
    // Art style cards
    const cubismCard = document.getElementById("cubismCard");
    const impressionismCard = document.getElementById("impressionismCard");
    const popCard = document.getElementById("popCard");
    
    // Open modal
    if (openModalBtn && modal) {
        openModalBtn.addEventListener("click", function() {
            modal.style.display = "flex";
        });
    }
    
    // Close modal
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener("click", function() {
            modal.style.display = "none";
        });
        
        // Close when clicking outside the modal content
        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }
    
    // Toggle dropdown
    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener("click", function() {
            dropdownContent.classList.toggle("show");
        });
        
        // Close dropdown when clicking outside
        window.addEventListener("click", function(event) {
            if (!event.target.matches(".dropdown-button")) {
                if (dropdownContent.classList.contains("show")) {
                    dropdownContent.classList.remove("show");
                }
            }
        });
    }
    
    // Handle style selection from dropdown
    if (dropdownContent) {
        const styleOptions = dropdownContent.querySelectorAll("a");
        styleOptions.forEach(option => {
            option.addEventListener("click", function(e) {
                e.preventDefault();
                const style = this.getAttribute("data-style");
                selectArtStyle(style);
                if (dropdownContent.classList.contains("show")) {
                    dropdownContent.classList.remove("show");
                }
            });
        });
    }
    
    // Select art style function
    function selectArtStyle(style) {
        if (selectedStyleText) {
            selectedStyleText.textContent = style;
        }
        
        if (selectedArtStyleInput) {
            // Map from display name to backend value
            const styleMap = {
                "Cubism": "Synthetic_Cubism",
                "Impressionism": "Impressionism",
                "Pop Art": "Pop_Art"
            };
            
            selectedArtStyleInput.value = styleMap[style] || "Synthetic_Cubism";
            
            // Clear any cached mosaic data when style changes
            if (window.clearMosaicCache) {
                window.clearMosaicCache();
            }
            
            // Load new style's mosaic images
            if (window.loadMosaicImages) {
                window.loadMosaicImages();
            }
        }
    }
    
    // Handle art style card clicks
    function setupArtStyleCard(card, style) {
        if (card) {
            card.addEventListener("click", function() {
                selectArtStyle(style);
                if (modal) {
                    modal.style.display = "flex";
                }
            });
        }
    }
    
    setupArtStyleCard(cubismCard, "Cubism");
    setupArtStyleCard(impressionismCard, "Impressionism");
    setupArtStyleCard(popCard, "Pop Art");
    
    // Set default art style
    selectArtStyle("Cubism");
}); 