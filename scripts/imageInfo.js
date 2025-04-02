/**
 * imageInfo.js - Handles image information display and original image viewing
 */

// Function to show the original image in a modal
function showOriginalImage(imagePath) {
    const modal = document.getElementById("originalImageModal");
    const container = document.getElementById("originalImageContainer");
    
    if (modal && container) {
        // Clear previous content
        container.innerHTML = "";
        
        // Create image element
        const img = document.createElement("img");
        img.src = imagePath;
        img.alt = "Original Image";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "80vh";
        
        // Add image to container
        container.appendChild(img);
        
        // Show modal
        modal.style.display = "flex";
        
        // Add event listener to close button if not already added
        const closeButton = document.getElementById("closeOriginalModal");
        if (closeButton) {
            // Remove any existing listeners to prevent duplicates
            const newCloseButton = closeButton.cloneNode(true);
            closeButton.parentNode.replaceChild(newCloseButton, closeButton);
            
            // Add the event listener
            newCloseButton.addEventListener("click", function() {
                modal.style.display = "none";
            });
        }
        
        // Close modal when clicking outside the content
        modal.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }
}

// Set up event listeners when the document is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Initialize modal
    const modal = document.getElementById("originalImageModal");
    const closeButton = document.getElementById("closeOriginalModal");
    
    if (modal && closeButton) {
        closeButton.addEventListener("click", function() {
            modal.style.display = "none";
        });
        
        // Close modal when clicking outside the content
        modal.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }
    
    // Close modal on escape key
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && modal && modal.style.display === "flex") {
            modal.style.display = "none";
        }
    });
});

// Expose the showOriginalImage function globally
window.showOriginalImage = showOriginalImage; 