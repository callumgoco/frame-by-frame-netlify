<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frame by Frame</title>
    <link rel="stylesheet" type="text/css" href="static/style.css">
    <link rel="stylesheet" type="text/css" href="static/animations.css">
    <link rel="stylesheet" type="text/css" href="static/explore_art.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet">
</head>
<body>

<!-- Header -->
<header class="header">
    <h1 class="site-title">Frame By Frame</h1>
    <a href="<?= ($BASE) ?>/ui/Dynamic Web Design - Report - Submission 2.pdf" class="pdf-link" target="_blank">PDF Report</a>
</header>

<!-- Main container -->
<div class="container">

    <!-- About Section -->
    <div class="about">
        <h1>Convert Photo to Mosaic Style</h1>
        <p>
            Simply upload a photo, choose an art style (Synthetic Cubism, Impressionism and Pop Art), and let
            our technology craft a mosaic masterpiece for you.
        </p>
    </div>

    <hr/>

    <!-- Upload Section -->
    <div class="upload-form">
        <div class="hero-section">
            <script src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
                    type="module"></script>
            <dotlottie-player src="https://lottie.host/db8c667a-6814-4348-b81a-a66cc784c31e/BCMmtypstn.lottie"
                              background="transparent" speed="1" style="width: 100px; height: 100px" loop
                              autoplay></dotlottie-player>
            <button id="openModal">Generate Your Mosaic</button>
        </div>
    </div>
    <hr/>

    <!-- Explore Art Styles Section -->
    <div class="art-styles">
        <h1>Explore Art Styles</h1>
        <div class="art-grid">
            <!-- Synthetic Cubism Card -->
            <div class="art-card" id="cubismCard">
                <img src="img/cubism.jpg" alt="Cubism">
                <h2>Synthetic Cubism</h2>
                <p>A revolutionary art movement that fragmented objects into abstract shapes.</p>
            </div>
            <div class="art-card" id="impressionismCard">
                <img src="img/fauvism.jpg" alt="Impressionism">
                <h2>Impressionism</h2>
                <p>Practice of painting outdoors and 'on the spot' rather than in a studio.</p>
            </div>
            <div class="art-card" id="popCard">
                <img src="img/pop_art.jpg" alt="Pop Art">
                <h2>Pop Art</h2>
                <p>Inspired by commercial and popular culture, using bold colors and imagery.</p>
            </div>
        </div>
    </div>

    <hr/>

    <!-- Examples Section -->
    <div id="examples" class="exampleSection">
        <h1>Artwork Gallery</h1>
        <div class="banner">
            <div class="slider" id="artSlider"></div>
        </div>
    </div>

    <!-- Art Slider Random Images -->
    <script>
        document.addEventListener("DOMContentLoaded", async function () {
            const artStyles = ["Impressionism", "Pop_Art", "Synthetic_Cubism"];
            const baseURL = "https://callumoc.edinburgh.domains/Frame/ArtStyle";
            const slider = document.getElementById("artSlider");
            const imageCount = 10; // Number of images displayed in the rotator

            async function fetchImages(folder) {
                try {
                    const response = await fetch(`${baseURL}/${folder}/`);
                    const text = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, "text/html");

                    // get .jpg, .jpeg, .png, .gif images
                    const images = Array.from(doc.querySelectorAll("a"))
                        .map(link => link.getAttribute("href"))
                        .filter(href => /\.(jpg|jpeg|png|gif)$/i.test(href));

                    // URL
                    return images.map(img => `${baseURL}/${folder}/${img}`);
                } catch (error) {
                    console.error(`Error fetching images from ${folder}:`, error);
                    return [];
                }
            }

            // Function to load random rotating images in the slider
            async function loadRandomImages() {
                let allImages = [];

                try {
                    const slider = document.querySelector(".slider");
                    if (!slider) {
                        console.error("Slider container not found.");
                        return;
                    }

                    for (let style of artStyles) {
                        const images = await fetchImages(style);
                        allImages = allImages.concat(images);
                    }

                    console.log("Fetched images:", allImages);

                    allImages = allImages.sort(() => 0.5 - Math.random()).slice(0, imageCount);

                    allImages.forEach((imgSrc, index) => {
                        const item = document.createElement("div");
                        item.classList.add("item");
                        item.style.setProperty("--position", index + 1);

                        const img = document.createElement("img");
                        img.src = imgSrc;
                        img.alt = "Art Style Image";

                        // 调用 imageInfo.js 中的 showOriginalImage 函数
                        img.addEventListener("click", function () {
                            showOriginalImage(this.src); // 调用 imageInfo.js 中的函数
                        });

                        item.appendChild(img);
                        slider.appendChild(item);
                    });

                    slider.style.setProperty("--quantity", imageCount);
                } catch (error) {
                    console.error("Error loading images:", error);
                }
            }

            loadRandomImages();
        });
    </script>

    <hr/>

    <!-- Footer -->
    <footer class="footer">
        <span class="footer-left">Frame by Frame</span>
        <span class="footer-center">Callum O'Connor - Yipeng Zhang - Yiran Dai</span>
        <span class="footer-right">Dynamic Web Design</span>
    </footer>

</div>

<!-- Modals (moved outside container) -->
<!-- Upload Modal -->
<div id="uploadModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-content">
        <button class="close-modal" aria-label="Close modal">&times;</button>
        <h1 id="modalTitle">Upload an Image</h1>
        
        <div class="upload-container">
            <!-- Left Side - Upload Options -->
            <div class="optionSection">
                <div class="dropdown">
                    <button class="dropdown-button" id="dropdownBtn">Select Art Style</button>
                    <div class="dropdown-content" id="dropdownContent">
                        <a href="#" data-style="Cubism">Cubism</a>
                        <a href="#" data-style="Impressionism">Impressionism</a>
                        <a href="#" data-style="Pop Art">Pop Art</a>
                    </div>
                </div>

                <div id="selectedStyle" class="selected-style">
                    <span>Selected Style:</span>
                    <strong id="selectedStyleText">None</strong>
                </div>

                <div class="file-upload-area">
                    <label class="file-upload-label" for="fileInput">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Click to choose a file or drag it here (.PNG or .JPG)</span>
                    </label>
                    <div id="fileInfo" class="file-info">No file selected</div>
                    <form id="uploadForm" action="/Frame/upload" method="POST" enctype="multipart/form-data">
                        <input type="file" name="image" id="fileInput" required accept="image/*">
                        <input type="hidden" name="artStyle" id="selectedArtStyleInput" value="Pop_Art">
                    </form>
                </div>

                <button type="submit" form="uploadForm" class="upload-button">Generate Mosaic</button>
                <div id="status">Uploading...</div>
            </div>

            <!-- Right Side - Preview/Result -->
            <div id="canvasWrapper">
                <img id="preview" alt="Image Preview">
                <canvas id="mosaicCanvas"></canvas>
            </div>
        </div>
    </div>
</div>

<!-- Image Modal -->
<div id="imageModal" class="image-modal" role="dialog" aria-modal="true" aria-label="Enlarged image view">
    <button class="close-modal" aria-label="Close image">&times;</button>
    <img id="modalImage" src="" alt="Enlarged Image">
</div>

<!-- Synthetic Cubism Modal -->
<div id="cubismModal" class="explore-modal" role="dialog" aria-modal="true" aria-labelledby="cubismTitle">
    <div class="explore-modal-content">
        <button class="close-modal" aria-label="Close gallery">&times;</button>
        <h2 id="cubismTitle">Synthetic Cubism Gallery</h2>
        <div class="gallery">
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip one">
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/gino-severini_the-accordion-player-1919.jpg"
                                 alt="Gino Severini">
                        </div>
                        <div class="photo__name">Gino Severini</div>
                        <div class="photo__year">1919</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/pablo-picasso_head-of-a-man-with-hat-1912.jpg"
                                 alt="Pablo Picasso">
                        </div>
                        <div class="photo__name">Pablo Picasso</div>
                        <div class="photo__year">1912</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/pablo-picasso_bottle-of-vieux-marc-glass-and-newspaper-1913.jpg"
                                 alt="Pablo Picasso">
                        </div>
                        <div class="photo__name">Pablo Picasso</div>
                        <div class="photo__year">1913</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/pablo-picasso_pipe-and-card-1914.jpg"
                                 alt="Pablo Picasso">
                        </div>
                        <div class="photo__name">Pablo Picasso</div>
                        <div class="photo__year">1914</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/juan-gris_the-packet-of-tobacco-1916.jpg"
                                 alt="Juan Gris">
                        </div>
                        <div class="photo__name">Juan Gris</div>
                        <div class="photo__year">1916</div>
                    </div>
                </div>
            </div>

            <div class="gallery__strip__wrapper">
                <div class="gallery__strip two">
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/juan-gris_pipe-and-fruit-dish-with-grapes-1918.jpg"
                                 alt="Juan Gris">
                        </div>
                        <div class="photo__name">Juan Gris</div>
                        <div class="photo__year">1918</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/juan-gris_fantomas-1915.jpg" alt="Juan Gris">
                        </div>
                        <div class="photo__name">Juan Gris</div>
                        <div class="photo__year">1915</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/juan-gris_bowl-and-book-1927.jpg"
                                 alt="Juan Gris">
                        </div>
                        <div class="photo__name">Juan Gris</div>
                        <div class="photo__year">1927</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/gino-severini_still-life-1916.jpg"
                                 alt="Gino Severini">
                        </div>
                        <div class="photo__name">Gino Severini</div>
                        <div class="photo__year">1916</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/georges-braque_violin-melodie-1914.jpg"
                                 alt="Georges Braque">
                        </div>
                        <div class="photo__name">Georges Braque</div>
                        <div class="photo__year">1914</div>
                    </div>
                </div>
            </div>

            <div class="gallery__strip__wrapper">
                <div class="gallery__strip three">
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/georges-braque_still-life-with-grapes-ii-1918.jpg"
                                 alt="Georges Braque">
                        </div>
                        <div class="photo__name">Georges Braque</div>
                        <div class="photo__year">1918</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/georges-braque_newspaper-bottle-packet-of-tobacco-1914.jpg"
                                 alt="Georges Braque">
                        </div>
                        <div class="photo__name">Georges Braque</div>
                        <div class="photo__year">1914</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/georges-braque_guitar-and-sheet-music-1919.jpg"
                                 alt="Georges Braque">
                        </div>
                        <div class="photo__name">Georges Braque</div>
                        <div class="photo__year">1919</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/georges-braque_bottle-1914.jpg"
                                 alt="Georges Braque">
                        </div>
                        <div class="photo__name">Georges Braque</div>
                        <div class="photo__year">1914</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/ad-reinhardt_newsprint-collage-1940.jpg"
                                 alt="Ad Reinhardt">
                        </div>
                        <div class="photo__name">Ad Reinhardt</div>
                        <div class="photo__year">1940</div>
                    </div>
                </div>
            </div>

            <div class="gallery__strip__wrapper">
                <div class="gallery__strip four">
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/juan-gris_still-life-with-fruit-bowl-and-mandolin-1919.jpg"
                                 alt="Juan Gris">
                        </div>
                        <div class="photo__name">Juan Gris</div>
                        <div class="photo__year">1919</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/juan-gris_newspaper-with-coffee-mill-1915.jpg"
                                 alt="Juan Gris">
                        </div>
                        <div class="photo__name">Juan Gris</div>
                        <div class="photo__year">1915</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/jean-metzinger_femme-la-dentelle-1916.jpg"
                                 alt="Jean Metzinger">
                        </div>
                        <div class="photo__name">Jean Metzinger</div>
                        <div class="photo__year">1916</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/pablo-picasso_glass-and-bottle-of-suze-1912.jpg"
                                 alt="Pablo Picasso">
                        </div>
                        <div class="photo__name">Pablo Picasso</div>
                        <div class="photo__year">1912</div>
                    </div>
                    <div class="photo">
                        <div class="photo__image">
                            <img src="/Frame/ArtStyle/Synthetic_Cubism/juan-gris_breakfast-1915.jpg"
                                 alt="Juan Gris">
                        </div>
                        <div class="photo__name">Juan Gris</div>
                        <div class="photo__year">1915</div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>

<!-- Impressionism Modal -->
<div id="impressionismModal" class="explore-modal" role="dialog" aria-modal="true" aria-labelledby="impressionismTitle">
    <div class="explore-modal-content">
        <button class="close-modal" aria-label="Close gallery">&times;</button>
        <h2 id="impressionismTitle">Impressionism Gallery</h2>
        <div class="gallery">

            <!-- Strip 1 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip one">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/eugene-boudin_quittebeuf-1893.jpg" alt="Eugene Boudin"></div><div class="photo__name">Eugene Boudin</div><div class="photo__year">1893</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/eugene-boudin_quittebeuf-1893.jpg" alt="Eugene Boudin"></div><div class="photo__name">Eugene Boudin</div><div class="photo__year">1893</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/ilya-repin_on-the-shore-of-the-gulf-of-finland-1903.jpg" alt="Ilya Repin"></div><div class="photo__name">Ilya Repin</div><div class="photo__year">1903</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/odilon-redon_peyrlebade-1888.jpg" alt="Odilon Redon"></div><div class="photo__name">Odilon Redon</div><div class="photo__year">1888</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/eugene-boudin_quittebeuf-1893.jpg" alt="Eugene Boudin"></div><div class="photo__name">Eugene Boudin</div><div class="photo__year">1893</div></div>
                </div>
            </div>

            <!-- Strip 2 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip two">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/ilya-repin_on-the-shore-of-the-gulf-of-finland-1903.jpg" alt="Ilya Repin"></div><div class="photo__name">Ilya Repin</div><div class="photo__year">1903</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/marie-bracquemond_pierre-bracquemond-as-child-1878.jpg" alt="Marie Bracquemond"></div><div class="photo__name">Marie Bracquemond</div><div class="photo__year">1878</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/odilon-redon_peyrlebade-1888.jpg" alt="Odilon Redon"></div><div class="photo__name">Odilon Redon</div><div class="photo__year">1888</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/paul-cezanne_orchard-in-pontoise-1877.jpg" alt="Paul Cezanne"></div><div class="photo__name">Paul Cezanne</div><div class="photo__year">1877</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/marie-bracquemond_pierre-bracquemond-as-child-1878.jpg" alt="Marie Bracquemond"></div><div class="photo__name">Marie Bracquemond</div><div class="photo__year">1878</div></div>
                </div>
            </div>

            <!-- Strip 3 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip three">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/marie-bracquemond_pierre-bracquemond-as-child-1878.jpg" alt="Marie Bracquemond"></div><div class="photo__name">Marie Bracquemond</div><div class="photo__year">1878</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/odilon-redon_peyrlebade-1888.jpg" alt="Odilon Redon"></div><div class="photo__name">Odilon Redon</div><div class="photo__year">1888</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/ilya-repin_on-the-shore-of-the-gulf-of-finland-1903.jpg" alt="Ilya Repin"></div><div class="photo__name">Ilya Repin</div><div class="photo__year">1903</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/paul-cezanne_orchard-in-pontoise-1877.jpg" alt="Paul Cezanne"></div><div class="photo__name">Paul Cezanne</div><div class="photo__year">1877</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/ilya-repin_on-the-shore-of-the-gulf-of-finland-1903.jpg" alt="Ilya Repin"></div><div class="photo__name">Ilya Repin</div><div class="photo__year">1903</div></div>
                </div>
            </div>

            <!-- Strip 4 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip four">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/eugene-boudin_quittebeuf-1893.jpg" alt="Eugene Boudin"></div><div class="photo__name">Eugene Boudin</div><div class="photo__year">1893</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/eugene-boudin_quittebeuf-1893.jpg" alt="Eugene Boudin"></div><div class="photo__name">Eugene Boudin</div><div class="photo__year">1893</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/paul-cezanne_orchard-in-pontoise-1877.jpg" alt="Paul Cezanne"></div><div class="photo__name">Paul Cezanne</div><div class="photo__year">1877</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/eugene-boudin_quittebeuf-1893.jpg" alt="Eugene Boudin"></div><div class="photo__name">Eugene Boudin</div><div class="photo__year">1893</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Impressionism/marie-bracquemond_pierre-bracquemond-as-child-1878.jpg" alt="Marie Bracquemond"></div><div class="photo__name">Marie Bracquemond</div><div class="photo__year">1878</div></div>
                </div>
            </div>

        </div>
    </div>
</div>

<!-- Pop Art Modal -->
<div id="popModal" class="explore-modal" role="dialog" aria-modal="true" aria-labelledby="popArtTitle">
    <div class="explore-modal-content">
        <button class="close-modal" aria-label="Close gallery">&times;</button>
        <h2 id="popArtTitle">Pop Art Gallery</h2>
        <div class="gallery">

            <!-- Strip 1 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip one">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/aki-kuroda_cosmogarden-2011.jpg" alt="Aki Kuroda"></div><div class="photo__name">Aki Kuroda</div><div class="photo__year">2011</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/andy-warhol_sylvester-stallone-1980.jpg" alt="Andy Warhol"></div><div class="photo__name">Andy Warhol</div><div class="photo__year">1980</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/billy-apple_i-dreamed-i-went-to-blazes-in-my-maidenform-bra-red-1965.jpg" alt="Billy Apple"></div><div class="photo__name">Billy Apple</div><div class="photo__year">1965</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/burhan-dogancay_face-with-chain-in-nyc-2009.jpg" alt="Burhan Dogancay"></div><div class="photo__name">Burhan Dogancay</div><div class="photo__year">2009</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/burhan-dogancay_give-peace-a-chance-2009.jpg" alt="Burhan Dogancay"></div><div class="photo__name">Burhan Dogancay</div><div class="photo__year">2009</div></div>
                </div>
            </div>

            <!-- Strip 2 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip two">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/burhan-dogancay_new-york-face-2000.jpg" alt="Burhan Dogancay"></div><div class="photo__name">Burhan Dogancay</div><div class="photo__year">2000</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/burhan-dogancay_walls-v-6-1969.jpg" alt="Burhan Dogancay"></div><div class="photo__name">Burhan Dogancay</div><div class="photo__year">1969</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/derek-boshier_pataphysics-weekly-from-the-magazine-series-2006.jpg" alt="Derek Boshier"></div><div class="photo__name">Derek Boshier</div><div class="photo__year">2006</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/evelyne-axell_axell-ration-1965.jpg" alt="Evelyne Axell"></div><div class="photo__name">Evelyne Axell</div><div class="photo__year">1965</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/evelyne-axell_cercle-vicieux-rouge-1968.jpg" alt="Evelyne Axell"></div><div class="photo__name">Evelyne Axell</div><div class="photo__year">1968</div></div>
                </div>
            </div>

            <!-- Strip 3 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip three">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/gerard-fromanger_existe-1976.jpg" alt="Gerard Fromanger"></div><div class="photo__name">Gerard Fromanger</div><div class="photo__year">1976</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/hiro-yamagata_centieme-anniversaire-1980.jpg" alt="Hiro Yamagata"></div><div class="photo__name">Hiro Yamagata</div><div class="photo__year">1980</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/lourdes-castro_sombra-projectada-de-christa-maar-1968.jpg" alt="Lourdes Castro"></div><div class="photo__name">Lourdes Castro</div><div class="photo__year">1968</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/mario-schifano_coca-cola-tutto-1972.jpg" alt="Mario Schifano"></div><div class="photo__name">Mario Schifano</div><div class="photo__year">1972</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/eduardo-paolozzi_real-gold-1950.jpg" alt="Eduardo Paolozzi"></div><div class="photo__name">Eduardo Paolozzi</div><div class="photo__year">1950</div></div>
                </div>
            </div>

            <!-- Strip 4 -->
            <div class="gallery__strip__wrapper">
                <div class="gallery__strip four">
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/aki-kuroda_cosmogarden-2011.jpg" alt="Aki Kuroda"></div><div class="photo__name">Aki Kuroda</div><div class="photo__year">2011</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/andy-warhol_sylvester-stallone-1980.jpg" alt="Andy Warhol"></div><div class="photo__name">Andy Warhol</div><div class="photo__year">1980</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/billy-apple_i-dreamed-i-went-to-blazes-in-my-maidenform-bra-red-1965.jpg" alt="Billy Apple"></div><div class="photo__name">Billy Apple</div><div class="photo__year">1965</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/burhan-dogancay_face-with-chain-in-nyc-2009.jpg" alt="Burhan Dogancay"></div><div class="photo__name">Burhan Dogancay</div><div class="photo__year">2009</div></div>
                    <div class="photo"><div class="photo__image"><img src="/Frame/ArtStyle/Pop_Art/burhan-dogancay_give-peace-a-chance-2009.jpg" alt="Burhan Dogancay"></div><div class="photo__name">Burhan Dogancay</div><div class="photo__year">2009</div></div>
                </div>
            </div>
        </div>
    </div>
</div>


<!-- Upload Modal Script -->
<script>
    document.addEventListener("DOMContentLoaded", function () {
        const modal = document.getElementById("uploadModal");
        const closeButtons = document.querySelectorAll(".close-modal");
        const modalContent = document.querySelector(".modal-content");
        const openModalButton = document.getElementById("openModal");

        // Function to handle modal open
        function openModal() {
            modal.classList.add("show");
            document.body.classList.add("modal-open");
        }

        // Function to handle modal close
        function closeModal() {
            modal.classList.remove("show");
            document.body.classList.remove("modal-open");
        }

        // Open Modal when Upload Button is clicked
        openModalButton.addEventListener("click", openModal);

        // Close modal when clicking close button
        closeButtons.forEach(button => {
            button.addEventListener("click", closeModal);
        });

        // Close modal when clicking outside of modal-content
        modal.addEventListener("click", function (event) {
            if (!modalContent.contains(event.target)) {
                closeModal();
            }
        });

        // Handle escape key
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modal.classList.contains("show")) {
                closeModal();
            }
        });
    });
</script>
<!-- Mosaic ArtStyle Dropdown Functionality -->
<script>
document.addEventListener("DOMContentLoaded", function () {
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownContent = document.getElementById("dropdownContent");
    const selectedStyleText = document.getElementById("selectedStyleText");
    const selectedStyleDiv = document.getElementById("selectedStyle");
    const selectedArtStyleInput = document.getElementById("selectedArtStyleInput");
    const uploadButton = document.querySelector(".upload-button"); // Get the upload button

    // Initially disable the upload button
    uploadButton.disabled = true;
    uploadButton.style.opacity = "0.5";
    uploadButton.style.cursor = "not-allowed";

    // Toggle dropdown on button click
    dropdownBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        dropdownContent.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function(e) {
        if (!dropdownBtn.contains(e.target)) {
            dropdownContent.classList.remove("show");
        }
    });

    dropdownContent.querySelectorAll("a").forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            let selectedStyle = this.getAttribute("data-style");
            let displayStyle = selectedStyle;
            
            if (selectedStyle === "Cubism") {
                selectedStyle = "Synthetic_Cubism";
                displayStyle = "Cubism";
            }

            dropdownBtn.textContent = displayStyle;
            selectedStyleText.textContent = displayStyle;
            selectedStyleDiv.style.display = "inline-block";
            selectedArtStyleInput.value = selectedStyle.replace(" ", "_");
            
            // Enable the upload button
            uploadButton.disabled = false;
            uploadButton.style.opacity = "1";
            uploadButton.style.cursor = "pointer";
            
            // Close the dropdown
            dropdownContent.classList.remove("show");
            
            // Load mosaic images
            loadMosaicImages();
        });
    });
});
</script>
<!-- Mosaic Script -->
<script src="/Frame/mosaic.js"></script>
<!-- Mosaic Upload Script -->
<script>
    document.addEventListener("DOMContentLoaded", function () {
        const fileInput = document.getElementById("fileInput");
        const form = document.getElementById("uploadForm");
        const statusText = document.getElementById("status");

        if (form) {
            form.addEventListener("submit", async function (event) {
                event.preventDefault();
                let formData = new FormData(form);
                statusText.style.display = "block";
                statusText.innerText = "Uploading...";

                let response = await fetch("/Frame/upload", {
                    method: "POST",
                    body: formData
                });

                let text = await response.text();  // Fetch the response as text first
                try {
                    let data = JSON.parse(text);  // Attempt to parse the response as JSON
                    if (data.success) {
                        statusText.innerText = "Upload successful! Applying mosaic effect...";
                        document.getElementById("preview").style.display = "none";
                        applyMosaicEffect(data.file);
                    } else {
                        statusText.innerText = "Error: " + data.error;
                    }
                } catch (error) {
                    console.error("Unexpected response:", text);
                    statusText.innerText = "Unexpected server response. Check console for details.";
                }
            });
        }
    });
</script>
<!-- Image Info Script -->
<script src="/Frame/imageInfo.js"></script>
<!-- Example Section Slider Script -->
<script>
    document.addEventListener("DOMContentLoaded", function () {
        const images = document.querySelectorAll(".exampleSection .slider .item img");
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImage");
        const closeModal = document.querySelector(".close-modal");

        images.forEach(img => {
            img.addEventListener("click", function () {
                modal.style.display = "flex";
                modalImg.src = this.src;
            });
        });

        closeModal.addEventListener("click", function () {
            modal.style.display = "none";
        });

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
</script>
<!-- Cubism Modal Script -->
<script>
    document.addEventListener("DOMContentLoaded", function () {
        const cubismModal = document.getElementById("cubismModal");
        const cubismCard = document.getElementById("cubismCard");
        const closeCubismModal = document.querySelector(".close-modal");

        cubismCard.addEventListener("click", function () {
            cubismModal.style.display = "block"; // Ensure it's visible before fading in
            setTimeout(() => {
                cubismModal.classList.add("show");
            }, 10); // Short delay to trigger transition
        });

        function closeModal() {
            cubismModal.classList.remove("show");
            setTimeout(() => {
                cubismModal.style.display = "none"; // Hide after fade out
            }, 300); // Match transition duration
        }

        closeCubismModal.addEventListener("click", closeModal);

        cubismModal.addEventListener("click", function (event) {
            if (!event.target.closest(".modal-content")) {
                closeModal();
            }
        });
    });
</script>
<!-- Impressionism Modal Script -->
<script>
    document.addEventListener("DOMContentLoaded", function () {
        const impressionismModal = document.getElementById("impressionismModal");
        const impressionismCard = document.getElementById("impressionismCard");
        const closeImpressionismModal = document.querySelector(".close-modal");

        impressionismCard.addEventListener("click", function () {
            impressionismModal.style.display = "block"; // Ensure it's visible before fading
            setTimeout(() => {
                impressionismModal.classList.add("show");
            }, 10); // Short delay to trigger transition
        });

        function closeModal() {
            impressionismModal.classList.remove("show");
            setTimeout(() => {
                impressionismModal.style.display = "none"; // Hide after fade out
            }, 300); // Match transition duration
        }

        closeImpressionismModal.addEventListener("click", closeModal);

        impressionismModal.addEventListener("click", function (event) {
            if (!event.target.closest(".modal-content")) {
                closeModal();
            }
        });
    });
</script>
<!-- Pop Art Modal Script -->
<script>
    document.addEventListener("DOMContentLoaded", function () {
        const popModal = document.getElementById("popModal");
        const popCard = document.getElementById("popCard");
        const closePopModal = document.querySelector(".close-modal");

        popCard.addEventListener("click", function () {
            popModal.style.display = "block"; // Ensure it's visible before fading
            setTimeout(() => {
                popModal.classList.add("show");
            }, 10); // Short delay to trigger transition
        });

        function closeModal() {
            popModal.classList.remove("show");
            setTimeout(() => {
                popModal.style.display = "none"; // Hide after fade out
            }, 300); // Match transition duration
        }

        closePopModal.addEventListener("click", closeModal);

        popModal.addEventListener("click", function (event) {
            if (!event.target.closest(".modal-content")) {
                closeModal();
            }
        });
    });
</script>
<!-- Add this script right after the file upload area -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');

        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileInfo.textContent = `Selected: ${this.files[0].name}`;
                fileInfo.classList.add('file-selected');
            } else {
                fileInfo.textContent = 'No file selected';
                fileInfo.classList.remove('file-selected');
            }
        });
    });
</script>

</body>
</html>



