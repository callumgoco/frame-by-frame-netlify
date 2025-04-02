document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("mosaicCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Store information of mosaic tiles for click events
    let mosaicTiles = [];
    const mosaicImagesKey = 'mosaicImagesCache';
    let mosaicImages = [];

    // Store the current state
    let hoveredTile = null;
    let originalCanvas = null;
    let isProcessing = false; // Processing state flag
    let supabase; // Supabase client

    // Initialize
    function init() {
        resetCanvas();
        supabase = createSupabaseClient();
    }

    // Reset canvas and state
    function resetCanvas() {
        // Clear all states
        mosaicTiles = [];
        hoveredTile = null;
        originalCanvas = null;

        // Reset canvas size to default values
        canvas.width = 800;
        canvas.height = 500;
        canvas.style.width = '800px';
        canvas.style.height = '500px';

        // Clear the canvas and set the default background
        ctx.fillStyle = '#242424';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Remove all event listeners
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('click', handleClick);

        // Re-add event listeners
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('click', handleClick);
    }

    // Function to get actual coordinates
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        };
    }

    // Add mouse move event handler
    const handleMouseMove = debounce(function(e) {
        if (isProcessing) return;
        const pos = getMousePos(canvas, e);
        const x = pos.x;
        const y = pos.y;

        let found = false;
        for (const tile of mosaicTiles) {
            if (x >= tile.x && x < tile.x + tile.size &&
                y >= tile.y && y < tile.y + tile.size) {
                found = true;
                if (hoveredTile !== tile) {
                    // Save the current state of the canvas (if not already saved)
                    if (!originalCanvas) {
                        originalCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    }

                    // Restore the original state
                    ctx.putImageData(originalCanvas, 0, 0);

                    // Save the new tile information
                    hoveredTile = tile;

                    // Create zoom effect
                    const scale = 1.2; // Slightly reduce zoom scale
                    const newSize = tile.size * scale;
                    const offsetX = (newSize - tile.size) / 2;
                    const offsetY = (newSize - tile.size) / 2;

                    // Draw the enlarged image
                    const img = new Image();
                    img.onload = function() {
                        if (hoveredTile === tile) { // Ensure the mouse is still over this tile
                            ctx.save();

                            // Ensure the drawing does not go outside the canvas
                            const drawX = Math.max(0, Math.min(canvas.width - newSize, tile.x - offsetX));
                            const drawY = Math.max(0, Math.min(canvas.height - newSize, tile.y - offsetY));

                            // Add a slight highlight effect
                            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                            ctx.shadowBlur = 10;

                            // Draw the enlarged image
                            ctx.drawImage(img, drawX, drawY, newSize, newSize);
                            ctx.restore();
                        }
                    };
                    img.src = tile.imagePath;
                }
                break;
            }
        }

        if (!found && originalCanvas) {
            // Restore the original state
            ctx.putImageData(originalCanvas, 0, 0);
            hoveredTile = null;
            originalCanvas = null;
        }

        // Change mouse cursor style
        canvas.style.cursor = found ? 'pointer' : 'default';
    }, 16);

    // Add mouse leave event
    const handleMouseLeave = function() {
        if (isProcessing) return;
        if (originalCanvas) {
            ctx.putImageData(originalCanvas, 0, 0);
            hoveredTile = null;
            originalCanvas = null;
        }
    };

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Click Event Handling
    const handleClick = function(e) {
        if (isProcessing) return;
        const pos = getMousePos(canvas, e);
        const x = pos.x;
        const y = pos.y;

        for (const tile of mosaicTiles) {
            if (x >= tile.x && x < tile.x + tile.size &&
                y >= tile.y && y < tile.y + tile.size) {

                // Call showOriginalImage from imageInfo.js
                showOriginalImage(tile.imagePath);
                break;
            }
        }
    };

    // Show loading status
    function showLoadingMessage(msg) {
        const status = document.getElementById("status");
        if (status) {
            status.innerText = msg;
            status.style.display = "block";
        }
    }

    function hideLoadingMessage() {
        const status = document.getElementById("status");
        if (status) {
            status.style.display = "none";
        }
    }

    // Load Mosaic Image Data from Netlify function
    async function loadMosaicImages() {
        showLoadingMessage("Loading mosaic images...");

        // Get the style chosen by the front-end user
        const selectedArtStyle = document.getElementById("selectedArtStyleInput")?.value || "Synthetic_Cubism";

        console.log(`Loading mosaic images for style: ${selectedArtStyle}`);

        try {
            // Call Netlify function to get mosaic images
            const response = await fetch(`/.netlify/functions/getMosaicImages?style=${selectedArtStyle}&t=${new Date().getTime()}`);
            const data = await response.json();

            if (!data.error) {
                mosaicImages = data;
                localStorage.setItem(`${mosaicImagesKey}_${selectedArtStyle}`, JSON.stringify(data));
            } else {
                console.error('Error loading mosaic images:', data.error);
                // Try to use cached data if available
                const cachedData = localStorage.getItem(`${mosaicImagesKey}_${selectedArtStyle}`);
                if (cachedData) {
                    console.log(`Using cached mosaic images for style: ${selectedArtStyle}`);
                    mosaicImages = JSON.parse(cachedData);
                }
            }
        } catch (error) {
            console.error('Error fetching mosaic images:', error);
            // Try to use cached data if available
            const cachedData = localStorage.getItem(`${mosaicImagesKey}_${selectedArtStyle}`);
            if (cachedData) {
                console.log(`Using cached mosaic images for style: ${selectedArtStyle}`);
                mosaicImages = JSON.parse(cachedData);
            }
        }
        
        hideLoadingMessage();
    }

    // Clear the mosaic cache for a specific art style or all styles
    function clearMosaicCache(artStyle = null) {
        if (artStyle) {
            localStorage.removeItem(`${mosaicImagesKey}_${artStyle}`);
        } else {
            // Clear cache for all art styles
            const validStyles = ['Synthetic_Cubism', 'Impressionism', 'Pop_Art'];
            for (const style of validStyles) {
                localStorage.removeItem(`${mosaicImagesKey}_${style}`);
            }
        }
    }

    // Apply mosaic effect to an image
    function applyMosaicEffect(imageSrc) {
        showLoadingMessage("Starting mosaic processing...");
        isProcessing = true;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            processImage(img);
        };
        img.onerror = function() {
            console.error('Error loading image:', imageSrc);
            hideLoadingMessage();
            isProcessing = false;
        };
        img.src = imageSrc;
    }

    // Process the image 
    async function processImage(img) {
        showLoadingMessage("Processing image...");
        
        // Adjust canvas size to match the image's aspect ratio
        const maxWidth = 800;
        const maxHeight = 500;
        let width = img.width;
        let height = img.height;
        
        // Calculate the scaling factor
        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
        }
        if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = height * ratio;
            width = width * ratio;
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw the original image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the image data from the canvas
        const imageData = ctx.getImageData(0, 0, width, height);
        
        // If we don't have mosaic images loaded, load them now
        if (!mosaicImages || mosaicImages.length === 0) {
            await loadMosaicImages();
        }
        
        // Apply the mosaic effect
        showLoadingMessage("Creating mosaic...");
        
        // Get the selected art style
        const selectedArtStyle = document.getElementById("selectedArtStyleInput")?.value || "Synthetic_Cubism";
        
        try {
            // Call the processImage Netlify function
            const response = await fetch('/.netlify/functions/processImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl: img.src,
                    artStyle: selectedArtStyle
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Load the processed image
                const processedImg = new Image();
                processedImg.onload = function() {
                    // Clear canvas and draw the processed image
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(processedImg, 0, 0, canvas.width, canvas.height);
                    
                    // Store the tile data for interactivity
                    mosaicTiles = data.tiles || [];
                    
                    hideLoadingMessage();
                    isProcessing = false;
                };
                processedImg.src = data.image;
            } else {
                console.error('Error processing image:', data.error);
                showLoadingMessage("Error: Could not process image");
                setTimeout(hideLoadingMessage, 3000);
                isProcessing = false;
            }
        } catch (error) {
            console.error('Error calling processImage function:', error);
            showLoadingMessage("Error: Network issue");
            setTimeout(hideLoadingMessage, 3000);
            isProcessing = false;
        }
    }

    // Set up event listeners for file upload and processing
    function setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadButton = document.getElementById('uploadButton');
        const uploadPreview = document.getElementById('uploadPreview');
        
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    
                    // Preview the image
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        uploadPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
                        uploadButton.disabled = false;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (uploadButton) {
            uploadButton.addEventListener('click', async function() {
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    
                    // Create form data
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    showLoadingMessage("Uploading image...");
                    
                    try {
                        // Upload the image using Netlify function
                        const response = await fetch('/.netlify/functions/uploadImage', {
                            method: 'POST',
                            body: formData
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            console.log('File uploaded successfully:', data.file);
                            // Now apply the mosaic effect to the uploaded image
                            applyMosaicEffect(data.file);
                        } else {
                            console.error('Error uploading file:', data.error);
                            showLoadingMessage("Error: " + data.error);
                            setTimeout(hideLoadingMessage, 3000);
                        }
                    } catch (error) {
                        console.error('Error in upload process:', error);
                        showLoadingMessage("Error: Network issue");
                        setTimeout(hideLoadingMessage, 3000);
                    }
                }
            });
        }

        // Comment submission
        const commentInput = document.getElementById('commentInput');
        const submitComment = document.getElementById('submitComment');
        
        if (submitComment && commentInput) {
            submitComment.addEventListener('click', async function() {
                const comment = commentInput.value.trim();
                if (comment) {
                    try {
                        const response = await fetch('/.netlify/functions/submitComment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                comment: comment,
                                imagePath: canvas.toDataURL() // Base64 of current canvas state
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            // Clear input and refresh comments
                            commentInput.value = '';
                            loadComments();
                        } else {
                            console.error('Error submitting comment:', data.error);
                        }
                    } catch (error) {
                        console.error('Error in comment submission:', error);
                    }
                }
            });
        }

        // Load initial comments
        loadComments();
    }

    // Load comments from Netlify function
    async function loadComments() {
        const commentsList = document.getElementById('commentsList');
        
        if (commentsList) {
            try {
                const response = await fetch('/.netlify/functions/getAllComments');
                const data = await response.json();
                
                if (data.success) {
                    // Clear existing comments
                    commentsList.innerHTML = '';
                    
                    // Add comments to the list
                    data.comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.classList.add('comment');
                        commentElement.textContent = comment;
                        commentsList.appendChild(commentElement);
                    });
                } else {
                    console.error('Error loading comments:', data.error);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        }
    }

    // Initialize everything
    init();
    setupEventListeners();

    // Expose the necessary functions to the global scope
    window.applyMosaicEffect = applyMosaicEffect;
    window.loadMosaicImages = loadMosaicImages;
    window.clearMosaicCache = clearMosaicCache;
}); 