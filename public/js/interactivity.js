const headerNav = document.querySelector('.header-nav');
const headerHamburger = document.querySelector('.header-hamburger');

const images = document.querySelectorAll('.redpill-image img');

const makePillBtn = document.querySelector('.make-pill-btn');

/* Listen for hamburger click */
headerHamburger.addEventListener('click', () => {
    headerNav.classList.toggle('active');
});

/* Make every image have either landscape or portrait max width and height 
    (this is primarily for Redpill posts now) */
images.forEach(img => {
    img.onload = function() {
        if (this.naturalWidth > this.naturalHeight) {
            this.classList.add('landscape');
        } else {
            this.classList.add('portrait');
        }
    }
});

// Listen for make post button clicks
makePillBtn.addEventListener('click', () => {
    window.location.href = "http://localhost:3000/make-pill";
});