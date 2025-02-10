const headerNav = document.querySelector('.header-nav');
const headerHamburger = document.querySelector('.header-hamburger');

const images = document.querySelectorAll('.redpill-image img');

const makePillBtn = document.querySelector('.make-pill-btn');

const pills = document.querySelectorAll('.redpill-content');

const searchInput = document.querySelector('.search-input');




document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to all buttons with class info-long-message-btn
    let buttons = document.querySelectorAll('.info-long-message-btn');
    buttons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            // Find the closest parent with class 'redpill-message'
            let messageDiv = event.target.closest('.redpill-message');
            if (messageDiv) {
                // Hide the shortened message and show the full message
                let shortMessage = messageDiv.querySelector('.short-message');
                let fullMessage = messageDiv.querySelector('.full-message');

                if (shortMessage && fullMessage) {
                    shortMessage.style.display = 'none';
                    fullMessage.style.display = 'block';
                }
            }
        });
    });
});

/* Refresh page */
function refreshPage() {
    location.reload();
}

/* Listen for hamburger click */
headerHamburger.addEventListener('click', () => {
    headerNav.classList.toggle('active');
});

/* Make every image have either landscape or portrait max width and height 
    (this is primarily for Redpill posts now) */
images.forEach(img => {
    const applyClass = function() {
        console.log(`Image Dimensions: ${this.naturalWidth}x${this.naturalHeight}`);

        if (!this.classList.contains('landscape') && !this.classList.contains('portrait')) {
            if (this.naturalWidth > this.naturalHeight) {
                this.classList.add('landscape');
            } else {
                this.classList.add('portrait');
            }
        }
    };

    if (img.complete) {
        applyClass.call(img);
    } else {
        img.onload = applyClass;
    }
    
    img.onclick = function() {
        if (this.classList.contains('landscape')) {
            this.classList.remove('landscape');
        } 
        else if (this.classList.contains('portrait')) {
            this.classList.remove('portrait');
        }
        else {
            if (this.naturalWidth > this.naturalHeight) {
                this.classList.add('landscape');
            } else {
                this.classList.add('portrait');
            }
        }
        // Toggle the no-float class for the image's container
        const container = this.closest('.redpill-image-container');
        if (container) {
            container.classList.toggle('no-float');
        }
    };
});
// Ensure img gets the right classes on load
document.body.addEventListener('load', function(event) {
    if (event.target.tagName.toLowerCase() === 'img' && event.target.closest('.redpill-image')) {
        const img = event.target;
        
        console.log(`Image Dimensions: ${img.naturalWidth}x${img.naturalHeight}`);

        if (!img.classList.contains('landscape') && !img.classList.contains('portrait')) {
            if (img.naturalWidth > img.naturalHeight) {
                img.classList.add('landscape');
            } else {
                img.classList.add('portrait');
            }
        }
    }
}, true); 
    
/* Give a loading of pill content effect while image is being loaded*/
pills.forEach(pill => {
    const images = pill.querySelectorAll('img');
    let loadedImagesCount = 0;

    // Function to handle the logic after an image has loaded
    const imageLoaded = () => {
        loadedImagesCount++;
        
        // If all images in this pill are loaded
        if (loadedImagesCount === images.length) {
            pill.classList.add('loaded');
        }
    };

    // If there are no images in the pill, consider it loaded immediately
    if (images.length === 0) {
        pill.classList.add('loaded');
    } else {
        images.forEach(img => {
            if (img.complete) {
                imageLoaded();
            } else {
                img.onload = imageLoaded;
            }
        });
    }
});

// Listen for make post button clicks
makePillBtn.addEventListener('click', () => {
    window.location.href = "http://localhost:3000/make-pill";
});


// Handle sreenshot
function captureAndDownload(pillId) {
    const pillContainer = document.querySelector(`.rate-pill-container[data-pill-id="${pillId}"]`);

    // Check if we successfully found a pill container and extracted its ID
    if (pillId) {
        html2canvas(pillContainer).then(canvas => {
            let imgURL = canvas.toDataURL("image/png");

            // Trigger download
            let downloadLink = document.createElement('a');
            downloadLink.href = imgURL;
            downloadLink.download = `RedpillOrNot_screenshot_${pillId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        });
    } else {
        console.error('Failed to capture screenshot: Unable to find the parent pill container or its ID.');
    }
}

// Copy pill URL
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('Text successfully copied!');
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
    });
}


document.addEventListener('click', async function(e) {
    console.log("Clicked Element:", e.target);

    if (e.target.closest('.copy-link-to-pill-btn')) {
        const pillContainer = e.target.closest('.rate-pill-container');
        const pillId = pillContainer.getAttribute('data-pill-id');
        const link = `localhost:3000/Pill/${pillId}`; // HARDCODED URL, CHANGE IT LATER.
        copyToClipboard(link);
    }
    else if (e.target.closest('.redpilled-btn')) {
        const pillContainer = e.target.closest('.rate-pill-container');
        const pillId = pillContainer.getAttribute('data-pill-id');

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pillId: pillId })
        };
    
        let response = await fetch('/redpill-pill', options);
        let data = await response.json();
    }
    else if (e.target.closest('.bluepilled-btn')) {
        const pillContainer = e.target.closest('.rate-pill-container');
        const pillId = pillContainer.getAttribute('data-pill-id');
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pillId: pillId })
        };
    
        let response = await fetch('/bluepill-pill', options);
        let data = await response.json();
    }
    else if (e.target.closest('.show-comments')) {
        const commentContainer = e.target.closest('.rate-pill-container').querySelector('.comments-pill-container');
        
        // Toggle display
        if (window.getComputedStyle(commentContainer).display === "none") {
            commentContainer.style.display = "block";
        } else {
            commentContainer.style.display = "none";
        }
    }
    else if (e.target.closest('.screenshot-btn')) {
        const pillContainer = e.target.closest('.rate-pill-container');
        const pillId = pillContainer.getAttribute('data-pill-id');
        captureAndDownload(pillId);
    }
});







// Modal stuff
const modal = document.getElementById("my-modal");
const chatModalBtn = document.querySelector(".show-chat-modal-btn");
const chatModalCloseBtn = document.getElementById("close-modal-btn");

chatModalBtn.onclick = function() {
  modal.style.display = "block";
}

chatModalCloseBtn.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}