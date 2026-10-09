document.addEventListener('DOMContentLoaded', function() {
    const galleryTrack = document.getElementById('galleryTrack');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const dotsContainer = document.getElementById('galleryDots');
    
    let currentIndex = 0;
    const itemsPerView = 1;
    const totalItems = galleryItems.length;
    const maxIndex = Math.ceil(totalItems / itemsPerView) - 1;
    
    // Create dots for navigation
    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('div');
            dot.className = 'gallery-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    // Update dots active state
    function updateDots() {
        const dots = document.querySelectorAll('.gallery-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        const translateX = -(currentIndex * 100);
        galleryTrack.style.transform = `translateX(${translateX}%)`;
        updateDots();
        animateVisibleItems();
    }
    
    // Animate visible items
    function animateVisibleItems() {
        galleryItems.forEach((item, index) => {
            const isVisible = index >= currentIndex * itemsPerView && index < (currentIndex + 1) * itemsPerView;
            item.classList.toggle('visible', isVisible);
            
            if (isVisible) {
                item.classList.remove('slide-in-left', 'slide-in-right');
                if (index % 2 === 0) {
                    item.classList.add('slide-in-left');
                } else {
                    item.classList.add('slide-in-right');
                }
            }
        });
    }
    
    // Event listeners for buttons
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    
    // Click handler for gallery items (entire card)
    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Toggle active state
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                const certificateName = this.querySelector('.certificate-name');
                if (certificateName) {
                    certificateName.classList.remove('clicked');
                }
            } else {
                // Remove active class from all other items
                document.querySelectorAll('.gallery-item').forEach(galleryItem => {
                    galleryItem.classList.remove('active');
                    const name = galleryItem.querySelector('.certificate-name');
                    if (name) {
                        name.classList.remove('clicked');
                    }
                });
                this.classList.add('active');
                const certificateName = this.querySelector('.certificate-name');
                if (certificateName) {
                    certificateName.classList.add('clicked');
                }
            }
        });
    });
    
    // Auto-play functionality
    let autoPlayInterval = setInterval(() => {
        goToSlide((currentIndex + 1) % (maxIndex + 1));
    }, 8000);

    // Pause auto-play on hover
    const galleryContainer = document.querySelector('.gallery-container');
    galleryContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    galleryContainer.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
            goToSlide((currentIndex + 1) % (maxIndex + 1));
        }, 8000);
    });
    
    // Initialize
    createDots();
    goToSlide(0);
});
