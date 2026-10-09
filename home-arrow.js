// Scroll navigation buttons (up and down arrows)
document.addEventListener('DOMContentLoaded', function() {
    const scrollToBottomBtn = document.getElementById('scrollToBottom');
    const backToTopBtn = document.getElementById('backToTop');

    // Show/hide buttons based on scroll position
    function updateScrollButtons() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (scrollY / (documentHeight - windowHeight)) * 100;

        // Show down arrow when at top (scrollY < 100)
        if (scrollY < 100) {
            scrollToBottomBtn.classList.add('visible');
        } else {
            scrollToBottomBtn.classList.remove('visible');
        }

        // Show up arrow when scrolled down (scrollY > 300)
        if (scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // Click handler - scroll to bottom
    scrollToBottomBtn.addEventListener('click', function() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    });

    // Click handler - scroll to top
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Update on scroll
    window.addEventListener('scroll', updateScrollButtons);

    // Initial check
    updateScrollButtons();
});
