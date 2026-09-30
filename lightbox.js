// Lightbox with Navigation - Full-screen image viewer
document.addEventListener('DOMContentLoaded', function() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDescription = document.getElementById('lightboxDescription');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const slideshowToggle = document.getElementById('slideshowToggle');
  const slideshowSpeed = document.getElementById('slideshowSpeed');
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  
  // Get all gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentIndex = 0;
  let galleryImages = [];
  let slideshowInterval = null;
  let isPlaying = false;
  
  // Collect gallery images
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const name = item.querySelector('.certificate-name');
    const category = item.dataset.category || 'course';
    
    if (img && name) {
      galleryImages.push({
        src: img.src,
        alt: img.alt,
        title: name.textContent,
        description: img.alt,
        category: category
      });
      
      // Add click event to open lightbox
      item.addEventListener('click', function() {
        currentIndex = index;
        openLightbox(currentIndex);
      });
      
      // Add cursor pointer
      item.style.cursor = 'pointer';
    }
  });
  
  // Open lightbox
  function openLightbox(index) {
    const imageData = galleryImages[index];
    
    lightboxImage.src = imageData.src;
    lightboxImage.alt = imageData.alt;
    lightboxTitle.textContent = imageData.title;
    lightboxDescription.textContent = imageData.description;
    lightboxCounter.textContent = `${index + 1} / ${galleryImages.length}`;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Enable scrolling
    stopSlideshow();
  }
  
  // Navigate to previous image
  function prevImage() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    openLightbox(currentIndex);
  }
  
  // Navigate to next image
  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    openLightbox(currentIndex);
  }
  
  // Slideshow controls
  function startSlideshow() {
    if (isPlaying) return;
    
    const speed = 11 - parseInt(slideshowSpeed.value); // Convert to seconds (1-10)
    slideshowInterval = setInterval(nextImage, speed * 1000);
    
    slideshowToggle.innerHTML = '<i class="fas fa-pause"></i>';
    slideshowToggle.classList.add('playing');
    isPlaying = true;
  }
  
  function stopSlideshow() {
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
    }
    
    slideshowToggle.innerHTML = '<i class="fas fa-play"></i>';
    slideshowToggle.classList.remove('playing');
    isPlaying = false;
  }
  
  function toggleSlideshow() {
    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }
  
  // Fullscreen toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      lightbox.requestFullscreen().catch(err => {
        console.log('Fullscreen error:', err);
      });
      fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      document.exitFullscreen();
      fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
    }
  }
  
  // Share functions
  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
  
  function emailShare() {
    const subject = encodeURIComponent(`Certificate: ${galleryImages[currentIndex].title}`);
    const body = encodeURIComponent(`Check out this certificate: ${galleryImages[currentIndex].title}\n\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
  
  function whatsappShare() {
    const text = encodeURIComponent(`Check out this certificate: ${galleryImages[currentIndex].title}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
  
  // Event listeners
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevImage);
  lightboxNext.addEventListener('click', nextImage);
  slideshowToggle.addEventListener('click', toggleSlideshow);
  fullscreenToggle.addEventListener('click', toggleFullscreen);
  
  // Share button listeners
  document.getElementById('copyLink').addEventListener('click', copyLink);
  document.getElementById('emailShare').addEventListener('click', emailShare);
  document.getElementById('whatsappShare').addEventListener('click', whatsappShare);
  
  // Close on background click
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
      closeLightbox();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case ' ':
        e.preventDefault();
        toggleSlideshow();
        break;
      case 'f':
        toggleFullscreen();
        break;
    }
  });
  
  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  lightbox.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  lightbox.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextImage(); // Swipe left - next image
      } else {
        prevImage(); // Swipe right - previous image
      }
    }
  }
  
  // Track lightbox analytics
  function trackLightboxView(imageIndex) {
    let lightboxData = JSON.parse(localStorage.getItem('lightboxData') || '{}');
    
    const imageKey = galleryImages[imageIndex].title;
    
    if (lightboxData[imageKey]) {
      lightboxData[imageKey].count++;
      lightboxData[imageKey].lastViewed = new Date().toISOString();
    } else {
      lightboxData[imageKey] = {
        count: 1,
        firstViewed: new Date().toISOString(),
        lastViewed: new Date().toISOString()
      };
    }
    
    localStorage.setItem('lightboxData', JSON.stringify(lightboxData));
  }
  
  // Get most viewed images
  function getMostViewedImages() {
    const lightboxData = JSON.parse(localStorage.getItem('lightboxData') || '{}');
    const sorted = Object.entries(lightboxData)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    return sorted.map(([title, data]) => ({ title, ...data }));
  }
  
  // Track view when lightbox opens
  const originalOpenLightbox = openLightbox;
  openLightbox = function(index) {
    originalOpenLightbox(index);
    trackLightboxView(index);
  };
  
  // Handle fullscreen change
  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
      fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
    }
  });
});

