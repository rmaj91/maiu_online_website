console.log('SCRIPT IS WORKING')

function updateVisibility() {
    document.addEventListener("contextmenu", event => event.preventDefault());

    const isMobile = window.innerWidth <= 800 || window.innerHeight <= 540;

    const hiddenOnMobile = document.querySelectorAll('.mobile-hide');
    const shownOnMobile = document.querySelectorAll('.mobile-show');

    hiddenOnMobile.forEach(el => {
        el.classList.toggle('hidden', isMobile);
    });

    shownOnMobile.forEach(el => {
        el.classList.toggle('hidden', !isMobile);
    });

}

window.addEventListener('resize', updateVisibility);
window.addEventListener('DOMContentLoaded', updateVisibility);