<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frame by Frame</title>
    <link rel="stylesheet" type="text/css" href="static/style.css">
    <link rel="stylesheet" type="text/css" href="static/animations.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet">
</head>
<body>
<!-- Floating glowing animations -->
<div class="floating-bg">
    <div class="glow" style="width: 120px; height: 120px; top: 10%; left: 20%;"></div>
    <div class="glow2" style="width: 200px; height: 200px; top: 30%; left: 75%;"></div>
    <div class="glow" style="width: 300px; height: 300px; top: 50%; left: 80%;"></div>
    <div class="glow2" style="width: 200px; height: 200px; top: 70%; left: 10%;"></div>
</div>

<!-- Header -->
<header class="header">
    <h1 class="site-title">Frame by Frame</h1>
    <a href="<?= ($BASE) ?>/ui/Dynamic Web Design - Report.pdf" class="pdf-link" target="_blank">PDF Report</a>
</header>

<!-- Main container -->
<div class="container">

    <!-- About Section -->
    <div class="about">
        <h1>About</h1>
        <p>
            Our platform transforms your photos into stunning mosaic artworks using iconic art styles
            like Cubism, Fauvism, and Pop Art.
        </p>
        <p>
            Simply upload a photo, choose an art style (feature still needs to be implemented), and let
            our technology craft a mosaic masterpiece for you.
        </p>
    </div>

    <hr/>

    <!-- Upload Section -->
    <div class="upload-form">
        <h1>Upload an Image</h1>
        <form id="uploadForm" action="/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="image" id="fileInput" required>
            <button type="submit">Upload</button>
        </form>
        <img id="preview" style="max-width: 300px; display: none; margin-top: 20px;" alt="Image Preview">
        <p id="status" style="display: none; color: white; font-weight: bold;">Uploading...</p>

        <div id="canvasWrapper">
            <canvas id="mosaicCanvas"></canvas>
        </div>
    </div>

    <hr/>

    <!-- Examples Section -->
    <div id="examples" class="exampleSection">
        <h1>Examples</h1>
        <p>Image by (Lun Dev, 2024)</p>
        <div class="banner">
            <div class="slider" style="--quantity: 10">
                <div class="item" style="--position: 1">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 2">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 3">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 4">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 5">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 6">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 7">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 8">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 9">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
                <div class="item" style="--position: 10">
                    <img src="img/mosaic_example_11.png" alt="" />
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Footer -->
<footer class="footer">
    <span class="footer-left">Frame by Frame</span>
    <span class="footer-center">Callum O'Connor - Yipeng Zhang - Yiran Dai</span>
    <span class="footer-right">Dynamic Web Design</span>
</footer>

<script src="/ArtMosaic/mosaic.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        const fileInput = document.getElementById("fileInput");
        const form = document.getElementById("uploadForm");
        const statusText = document.getElementById("status");

        if (form) {
            form.addEventListener("submit", async function(event) {
                event.preventDefault();
                let formData = new FormData(form);
                statusText.style.display = "block";
                statusText.innerText = "Uploading...";

                let response = await fetch("/ArtMosaic/upload", {
                    method: "POST",
                    body: formData
                });

                let data = await response.json();
                if (data.success) {
                    statusText.innerText = "Upload successful! Applying mosaic effect...";

                    document.getElementById("preview").style.display = "none";

                    applyMosaicEffect(data.file);
                } else {
                    statusText.innerText = "Error: " + data.error;
                }
            });
        }
    });
</script>
</body>
</html>



