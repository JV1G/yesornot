const headerNav = document.querySelector('.header-nav');
const headerHamburger = document.querySelector('.header-hamburger');

/* Listen for hamburger click */
headerHamburger.addEventListener('click', () => {
    headerNav.classList.toggle('active');
});