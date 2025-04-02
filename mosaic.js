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
    let isProcessing = false; // Add processing state flag

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

    // Modify Click Event Handling
    const handleClick = function(e) {
        if (isProcessing) return;
        const pos = getMousePos(canvas, e);
        const x = pos.x;
        const y = pos.y;

        for (const tile of mosaicTiles) {
            if (x >= tile.x && x < tile.x + tile.size &&
                y >= tile.y && y < tile.y + tile.size) {

                // Call showOriginalImage directly from imageInfo.js.
                showOriginalImage(tile.imagePath);

                break;
            }
        }
    };


    // 1.Show loading status
    function showLoadingMessage(msg) {
        document.getElementById("status").innerText = msg;
        document.getElementById("status").style.display = "block";
    }

    function hideLoadingMessage() {
        document.getElementById("status").style.display = "none";
    }

    // 2.Load Mosaic Image Data
    window.loadMosaicImages = async function() {
        showLoadingMessage("Loading mosaic images...");

        // Get the style chosen by the front-end user
        const selectedArtStyle = document.getElementById("selectedArtStyleInput")?.value || "Synthetic_Cubism";

        console.log(`Loading mosaic images for style: ${selectedArtStyle}`);

        try {
            let response = await fetch(`/Frame/get_mosaic_images.php?style=${selectedArtStyle}&t=${new Date().getTime()}`);
            let data = await response.json();

            if (!data.error) {
                mosaicImages = data;
                localStorage.setItem(`${mosaicImagesKey}_${selectedArtStyle}`, JSON.stringify(data));
            }
        } catch (error) {
            let cachedData = localStorage.getItem(`${mosaicImagesKey}_${selectedArtStyle}`);
            if (cachedData) {
                console.log(`Using cached mosaic images for style: ${selectedArtStyle}`);
                mosaicImages = JSON.parse(cachedData);
            }
        }
        hideLoadingMessage();
    }


    // Add a function to clear the cache
    function clearMosaicCache(artStyle = null) {
        if (artStyle) {
            localStorage.removeItem(`${mosaicImagesKey}_${artStyle}`);
            console.log(`Mosaic cache cleared for style: ${artStyle}`);
        } else {
            // Clear the cache of all styles
            localStorage.removeItem(`${mosaicImagesKey}_Synthetic_Cubism`);
            localStorage.removeItem(`${mosaicImagesKey}_Impressionism`);
            localStorage.removeItem(`${mosaicImagesKey}_Pop_Art`);
            console.log("All mosaic caches cleared");
        }
    }

    // Clear old cache on initialisation
    clearMosaicCache();

    // Process the uploading image
    function applyMosaicEffect(imageSrc) {
        const selectedArtStyle = document.getElementById("selectedArtStyleInput")?.value || "Synthetic_Cubism";

        loadMosaicImages().then(() => {
            const img = new Image();
            img.onload = function () {
                processImage(img);
            };
            img.src = imageSrc;
        });
    }



    function processImage(img) {
        // If it is being processed, it returns directly
        if (isProcessing) {
            console.log('Already processing an image, please wait...');
            return;
        }

        isProcessing = true;
        showLoadingMessage("Processing image...");

        resetCanvas();

        const containerWidth = canvas.parentElement.clientWidth - 60; // Account for padding
        const containerHeight = document.querySelector('.optionSection').clientHeight;

        // Calculate aspect ratio
        const imgAspectRatio = img.width / img.height;
        
        // Set initial canvas size to match container height
        let canvasHeight = containerHeight;
        let canvasWidth = containerHeight * imgAspectRatio;

        // If the calculated width is too wide, constrain by width instead
        if (canvasWidth > containerWidth) {
            canvasWidth = containerWidth;
            canvasHeight = containerWidth / imgAspectRatio;
        }

        // Make sure dimensions are multiples of tileSize
        const tileSize = 20;
        canvas.width = Math.ceil(canvasWidth / tileSize) * tileSize;
        canvas.height = Math.ceil(canvasHeight / tileSize) * tileSize;

        // Update canvas style
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';

        // Empty the canvas and set background
        ctx.fillStyle = '#242424';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center the image on the canvas
        const drawWidth = canvas.width;
        const drawHeight = canvas.height;
        
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

        // Make sure all mosaic images are preloaded
        const preloadImages = new Set();
        let loadedImages = 0;

        setTimeout(() => {
            showLoadingMessage("Preparing mosaic tiles...");
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const { width, height, data } = imgData;

            // Pre-calculate all required images
            for (let y = 0; y < height; y += tileSize) {
                for (let x = 0; x < width; x += tileSize) {
                    const actualTileWidth = Math.min(tileSize, width - x);
                    const actualTileHeight = Math.min(tileSize, height - y);

                    if (actualTileWidth > 0 && actualTileHeight > 0) {
                        const avgColor = getAverageColor(data, x, y, width, actualTileWidth, actualTileHeight);
                        const imagePath = getClosestImage(avgColor);
                        if (imagePath) {
                            preloadImages.add(imagePath);
                        }
                    }
                }
            }

            // Preload all required images
            const totalImages = preloadImages.size;
            if (totalImages === 0) {
                isProcessing = false;
                hideLoadingMessage();
                return;
            }

            preloadImages.forEach(imagePath => {
                const img = new Image();
                img.onload = () => {
                    loadedImages++;
                    showLoadingMessage(`Loading mosaic tiles... ${Math.round(loadedImages/totalImages*100)}%`);
                    if (loadedImages === totalImages) {
                        applyMosaic(tileSize).finally(() => {
                            isProcessing = false;
                        });
                    }
                };
                img.onerror = () => {
                    loadedImages++;
                    console.error('Failed to load image:', imagePath);
                    if (loadedImages === totalImages) {
                        applyMosaic(tileSize).finally(() => {
                            isProcessing = false;
                        });
                    }
                };
                img.src = imagePath;
            });
        }, 100);
    }

    // 3.Apply mosaic effects
    async function applyMosaic(tileSize) {
        console.time("Apply Mosaic Effect");
        // Remove old mosaic block information
        mosaicTiles = [];

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { width, height, data } = imgData;
        let tiles = [];

        // computational centre point
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);

        // collect all the tiles
        for (let y = 0; y < height; y += tileSize) {
            for (let x = 0; x < width; x += tileSize) {
                const actualTileWidth = Math.min(tileSize, width - x);
                const actualTileHeight = Math.min(tileSize, height - y);

                if (actualTileWidth > 0 && actualTileHeight > 0) {
                    const avgColor = getAverageColor(data, x, y, width, actualTileWidth, actualTileHeight);
                    const closestImage = getClosestImage(avgColor);

                    if (closestImage) {
                        tiles.push({
                            x,
                            y,
                            width: actualTileWidth,
                            height: actualTileHeight,
                            tileSize,
                            closestImage
                        });
                    }
                }
            }
        }

        // Sort tiles from center
        tiles.sort((a, b) => {
            const distA = Math.hypot(a.x - centerX, a.y - centerY);
            const distB = Math.hypot(b.x - centerX, b.y - centerY);
            return distA - distB;
        });

        // Draw tiles with better error handling
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            try {
                await replaceWithMosaicImage(
                    tile.x,
                    tile.y,
                    tile.width,
                    tile.height,
                    tile.tileSize,
                    tile.closestImage
                );
                showLoadingMessage(`Creating mosaic... ${Math.round((i + 1) / tiles.length * 100)}%`);
            } catch (error) {
                console.error('Error processing tile:', error);
                continue;
            }
            // Add small delay to prevent UI blocking
            await new Promise(resolve => setTimeout(resolve, 3));
        }

        console.timeEnd("Apply Mosaic Effect");
        hideLoadingMessage();
    }

    // 4.Calculate the average colour
    function getAverageColor(data, x, y, width, tileWidth, tileHeight) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < tileHeight; i++) {
            for (let j = 0; j < tileWidth; j++) {
                const pixelIndex = ((y + i) * width + (x + j)) * 4;
                // Only valid pixels are processed
                if (data[pixelIndex + 3] > 0) { // 检查alpha通道
                    r += data[pixelIndex];
                    g += data[pixelIndex + 1];
                    b += data[pixelIndex + 2];
                    count++;
                }
            }
        }
        // Avoid dividing by zero
        if (count === 0) return [0, 0, 0];
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    }

    // 5. Find the image with the most similar color
    function getClosestImage(targetColor) {
        if (!mosaicImages || mosaicImages.length === 0) {
            console.warn('No mosaic images available');
            return null;
        }

        const [tr, tg, tb] = targetColor;
        let minDiff = Infinity;
        let closestImage = null;
        let reusedCount = {};  // Record the number of times each image is used

        // Calculate the weight of color differences
        const weights = {
            r: 0.3,  // Human eyes are sensitive to red
            g: 0.59, // Human eyes are most sensitive to green
            b: 0.11  // Human eyes are least sensitive to blue
        };

        // Sort all available images in ascending order based on color difference
        const sortedImages = mosaicImages.map(img => {
            // Compute weighted color difference
            const rDiff = (img.file_r - tr) * weights.r;
            const gDiff = (img.file_g - tg) * weights.g;
            const bDiff = (img.file_b - tb) * weights.b;

            // Compute the overall difference value
            const diff = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

            return {
                image: img,
                diff: diff
            };
        }).sort((a, b) => a.diff - b.diff);

        // Randomly select one from the most similar images
        // This prevents always using the same image
        const topN = Math.min(3, sortedImages.length);
        const randomIndex = Math.floor(Math.random() * topN);
        closestImage = sortedImages[randomIndex].image.file_path;

        return closestImage;
    }

    // 6.Replace with a mosaic image
    function replaceWithMosaicImage(x, y, width, height, tileSize, imagePath) {
        return new Promise((resolve, reject) => {
            const mosaicImg = new Image();
            mosaicImg.onload = function () {
                try {
                    // 绘制并保持宽高比
                    ctx.drawImage(mosaicImg, x, y, width, height);
                    // 存储马赛克块信息
                    mosaicTiles.push({
                        x: x,
                        y: y,
                        size: tileSize,
                        imagePath: imagePath
                    });
                    resolve();
                } catch (error) {
                    console.error('Error drawing image:', error);
                    reject(error);
                }
            };
            mosaicImg.onerror = function() {
                console.error('Failed to load image:', imagePath);
                reject(new Error('Image load failed'));
            };
            // 修正图片路径
            const baseUrl = window.location.pathname.includes('Frame') ? '' : '/Frame/';
            mosaicImg.src = baseUrl + imagePath;
        });
    }

    // Initialisation
    loadMosaicImages();

    // Expose functions to window
    window.applyMosaicEffect = applyMosaicEffect;
    window.clearMosaicCache = clearMosaicCache;
});
