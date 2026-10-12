// Mobile Enhancements - Touch Gestures, Haptic Feedback, Pull-to-Refresh
document.addEventListener('DOMContentLoaded', function() {
  
  // ===== HAPTIC FEEDBACK =====
  function vibrate(pattern) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Add haptic feedback to buttons
  const buttons = document.querySelectorAll('.about-btn, .projects-btn, .project-btn, .contact-form button, .nav-link');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      vibrate(50); // 50ms vibration
    });
  });

  // Add haptic feedback to project cards
  const projectCards = document.querySelectorAll('.project-box');
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      vibrate(30);
    });
  });

  // ===== TOUCH GESTURES FOR GALLERY =====
  const galleryTrack = document.querySelector('.gallery-track');
  if (galleryTrack) {
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    galleryTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - go to next
          const nextBtn = document.querySelector('.gallery-next');
          if (nextBtn) nextBtn.click();
        } else {
          // Swipe right - go to previous
          const prevBtn = document.querySelector('.gallery-prev');
          if (prevBtn) prevBtn.click();
        }
        vibrate(20);
      }
    }
  }

  // ===== PULL-TO-REFRESH =====
  let startY = 0;
  let isPulling = false;
  const pullThreshold = 100;
  const body = document.body;

  body.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].pageY;
      isPulling = true;
    }
  }, { passive: true });

  body.addEventListener('touchmove', (e) => {
    if (!isPulling || window.scrollY > 0) return;
    
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;
    
    if (diff > 0) {
      e.preventDefault();
      const pullProgress = Math.min(diff / pullThreshold, 1);
      
      // Visual feedback
      body.style.transform = `translateY(${diff * 0.5}px)`;
      
      if (pullProgress >= 1) {
        body.style.transform = `translateY(${pullThreshold * 0.5}px)`;
      }
    }
  }, { passive: false });

  body.addEventListener('touchend', (e) => {
    if (!isPulling) return;
    
    const currentY = e.changedTouches[0].pageY;
    const diff = currentY - startY;
    
    body.style.transform = '';
    isPulling = false;
    
    if (diff > pullThreshold) {
      // Refresh page
      vibrate(50);
      location.reload();
    }
  }, { passive: true });

  console.log('Mobile enhancements loaded');
});
