// Function to fetch and parse CSV data
async function fetchCSVData(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();

        // Parse CSV data using regular expression
        const rows = text.split('\n').map(row => {
            const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
            const matches = row.match(regex);
            if (matches) {
                return matches.map(field => field.replace(/^"|"$/g, '').trim());
            } else {
                console.warn(`Row does not match regex: ${row}`);
                return [];
            }
        });

        const data = {};
        rows.forEach(row => {
            if (row.length > 6) {
                const filename = row[0];
                const artist = row[1];
                const genreString = row[2];
                const genre = genreString.replace(/^\[|\]$/g, '').replace(/'/g, '').split(',').map(g => g.trim());
                const name = row[5];
                const year = row[6] || 'Unknown';
                const info = row[4];
                data[filename] = { artist, genre, name, year, info };
            } else {
                console.warn(`Row does not have enough columns: ${row}`);
            }
        });

        return data;
    } catch (error) {
        console.error("Error fetching CSV data:", error);
        return {};
    }
}

// Function to fetch timestamps
async function fetchComments() {
    try {
        const response = await fetch('/Frame/all-comments');
        const result = await response.json();

        if (result.success) {
            return result.comments; // Return all `timestamp` as comments
        } else {
            console.warn("Failed to fetch comments.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

// Function to show the original image in a modal with artist, genre, name, year, and info
async function showOriginalImage(imagePath) {
    // Store current image path for comments
    const currentImagePath = imagePath;

    const pathParts = imagePath.split('/');
    const filename = pathParts[pathParts.length - 2] + '/' + pathParts[pathParts.length - 1];

    const csvData = await fetchCSVData('info.csv'); // Adjust path as needed

    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9000;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        overflow: hidden;
    `;

    const contentWrapper = document.createElement("div");
    contentWrapper.style.cssText = `
        display: flex;
        gap: 24px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        padding: 40px;
        background: linear-gradient(to bottom, rgba(30, 30, 30, 0.85), rgba(20, 20, 20, 0.85));
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    const img = document.createElement("img");
    img.src = imagePath;
    img.style.cssText = `
        flex-shrink: 1;
        max-width: 70%;
        max-height: 80vh;
        border-radius: 16px;
        object-fit: contain;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    `;

    const infoAndCommentsDiv = document.createElement("div");
    infoAndCommentsDiv.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 400px;
        max-height: 80vh;
        min-height: 0;
        overflow: auto;
    `;

    const infoDiv = document.createElement("div");
    const { artist, genre, name, year, info } = csvData[filename] || { artist: 'Unknown', genre: 'Unknown', name: 'Unknown', year: 'Unknown', info: 'No information available.' };

    infoDiv.innerHTML = `
        <strong>Artist:</strong> ${artist}<br>
        <strong>Genre:</strong> ${genre}<br>
        <strong>Name:</strong> ${name}<br>
        <strong>Year:</strong> ${year}<br><br>
        <p>${info}</p>
    `;
    infoDiv.style.cssText = `
        flex-shrink: 0;
        max-height: 500px;
        overflow-y: auto;
        color: white;
        padding: 20px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        font-size: 16px;
        line-height: 1.6;
        text-align: justify;
    `;

    // Create comments section
    const commentsSection = document.createElement("div");
    commentsSection.style.cssText = `
        color: white;
        padding: 20px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
        overflow: hidden;
    `;

    const commentsTitle = document.createElement("h3");
    commentsTitle.innerText = "Recent Comments";
    commentsTitle.style.cssText = `
        margin: 0;
        font-size: 18px;
        color: white;
    `;

    const commentsContainer = document.createElement("div");
    commentsContainer.style.cssText = `
    flex: 1;
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 10px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    `;

    // Add comments to container
    const comments = await fetchComments();
    comments.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.innerText = comment;
        commentDiv.style.cssText = `
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.4;
        `;
        commentsContainer.appendChild(commentDiv);
    });

    commentsSection.appendChild(commentsTitle);
    commentsSection.appendChild(commentsContainer);

    // Comment input area
    const commentInput = document.createElement("div");
    commentInput.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: auto;
        margin-top: auto;
    `;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter comment...";
    input.style.cssText = `
        flex: 1;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: white;
        font-size: 14px;
    `;

    const sendButton = document.createElement("button");
    sendButton.innerText = "Send";
    sendButton.style.cssText = `
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border: none;
        padding: 12px 20px;
        color: white;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    // Event listeners for comment functionality
    commentInput.addEventListener("click", function(event) {
        event.stopPropagation();
    });

    input.addEventListener("click", function(event) {
        event.stopPropagation();
    });

    sendButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        const comment = input.value.trim();
        if (comment) {
            const success = await submitComment(comment, currentImagePath);
            if (success) {
                // Create new comment element
                const commentDiv = document.createElement("div");
                commentDiv.innerText = comment;
                commentDiv.style.cssText = `
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.4;
                `;

                // Add new comment at the top
                commentsContainer.insertBefore(commentDiv, commentsContainer.firstChild);

                // Clear input
                input.value = '';

                // Scroll to top to show new comment
                commentsContainer.scrollTop = 0;
            }
        }
    });

    // Add hover effects for send button
    sendButton.addEventListener("mouseover", () => {
        sendButton.style.transform = "translateY(-2px)";
        sendButton.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.4)";
        sendButton.style.background = "linear-gradient(135deg, #4f46e5, #4338ca)";
    });

    sendButton.addEventListener("mouseout", () => {
        sendButton.style.transform = "translateY(0)";
        sendButton.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)";
        sendButton.style.background = "linear-gradient(135deg, #6366f1, #4f46e5)";
    });

    commentInput.appendChild(input);
    commentInput.appendChild(sendButton);
    commentsSection.appendChild(commentInput);

    // Assemble the modal
    infoAndCommentsDiv.appendChild(infoDiv);
    infoAndCommentsDiv.appendChild(commentsSection);
    contentWrapper.appendChild(img);
    contentWrapper.appendChild(infoAndCommentsDiv);
    modal.appendChild(contentWrapper);

    // Add modal to document body
    document.body.appendChild(modal);

    // Event listeners for modal functionality
    img.addEventListener("click", function(event) {
        event.stopPropagation();
    });

    infoAndCommentsDiv.addEventListener("click", function(event) {
        event.stopPropagation();
    });

    modal.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.opacity = "0";
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });

    // Show modal with animation
    setTimeout(() => {
        modal.style.opacity = "1";
    }, 10);
}

// Export the function if using modules
if (typeof module !== 'undefined') {
    module.exports = { showOriginalImage };
}

// Function to submit comment
async function submitComment(comment, imagePath) {
    try {
        const formData = new FormData();
        formData.append('comment', comment);
        formData.append('imagePath', imagePath);

        const response = await fetch('/Frame/submit-comment', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            console.log('Comment submitted successfully');
            return true;
        } else {
            console.error('Failed to submit comment:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        return false;
    }
}
