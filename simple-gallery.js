// Gallery with Bi-directional Navigation and Image Modal
document.addEventListener('DOMContentLoaded', function() {
    // Add Modal HTML via JS
    const modalHTML = `
        <div id="imageModal" class="modal">
          <span class="modal-close">&times;</span>
          <img class="modal-content" id="modalImage">
          <div id="modalCaption" class="modal-caption"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add Modal CSS via JS
    const modalCSS = `
        .modal {
          display: none;
          position: fixed;
          z-index: 9999;
          padding-top: 50px;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.9);
        }

        .modal-content {
          margin: auto;
          display: block;
          width: auto;
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          animation-name: zoom;
          animation-duration: 0.6s;
        }

        @keyframes zoom {
          from {transform: scale(0)}
          to {transform: scale(1)}
        }

        .modal-close {
          position: absolute;
          top: 25px;
          right: 35px;
          color: #f1f1f1;
          font-size: 40px;
          font-weight: bold;
          transition: 0.3s;
          cursor: pointer;
        }

        .modal-close:hover,
        .modal-close:focus {
          color: #bbb;
          text-decoration: none;
          cursor: pointer;
        }

        .modal-caption {
          margin: auto;
          display: block;
          width: 80%;
          max-width: 700px;
          text-align: center;
          color: #ccc;
          padding: 15px 0;
          height: 100px;
          font-family: 'Poppins', sans-serif;
          font-size: 1.2rem;
        }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = modalCSS;
    document.head.appendChild(styleEl);

    // Gallery Logic
    const track = document.getElementById('galleryTrack');
    const items = document.querySelectorAll('.gallery-item');
    const dots = document.getElementById('galleryDots');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    
    // Only proceed if gallery elements exist
    if (!track || items.length === 0 || !dots || !prevBtn || !nextBtn) {
        return;
    }
    
    let current = 0;
    const total = items.length;
    let autoPlayInterval;
    
    // Create dots
    dots.innerHTML = '';
    for(let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'gallery-dot';
        if(i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dots.appendChild(dot);
    }
    
    // Update display
    function updateGallery() {
        const slideWidth = 375; // 350px item width + 25px gap
        track.style.transform = `translateX(-${current * slideWidth}px)`;
        
        // Update dots
        document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }
    
    // Go to specific slide
    function goToSlide(index) {
        if(index < 0) index = total - 1;
        if(index >= total) index = 0;
        current = index;
        updateGallery();
    }
    
    // Next slide
    function nextSlide() {
        goToSlide(current + 1);
    }
    
    // Previous slide
    function prevSlide() {
        goToSlide(current - 1);
    }
    
    // Auto-play (both directions - first forward, then backward)
    let direction = 1; // 1 = forward, -1 = backward
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if(direction === 1) {
                current++;
                if(current >= total - 1) {
                    direction = -1;
                }
            } else {
                current--;
                if(current <= 0) {
                    direction = 1;
                }
            }
            updateGallery();
        }, 3000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Button event listeners
    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
        });
    }
    
    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            prevSlide();
            startAutoPlay();
        });
    }
    
    // Modal Setup
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('modalCaption');
    const closeBtn = document.getElementsByClassName('modal-close')[0];

    // Click to show modal
    items.forEach((item, index) => {
        item.addEventListener('click', function() {
            stopAutoPlay();
            const img = this.querySelector('img');
            modal.style.display = "block";
            modalImg.src = img.src;
            const certName = this.querySelector('.certificate-name');
            captionText.innerHTML = certName ? certName.textContent : img.alt;
        });
    });

    // Close modal on X
    closeBtn.addEventListener('click', function() {
        modal.style.display = "none";
        startAutoPlay();
    });

    // Close modal when clicking outside image
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = "none";
        startAutoPlay();
      }
    });

    // Close modal on Esc key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.style.display === "block") {
        modal.style.display = "none";
        startAutoPlay();
      }
    });
    
    // Initialize
    updateGallery();
    startAutoPlay();
    
    // Pause auto-play on hover
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
});
