// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');

console.log('Theme toggle found:', themeToggle);

// Clear all saved themes and force light mode
localStorage.removeItem('theme');
localStorage.removeItem('colorTheme');

// Force light mode on load
document.body.classList.remove('dark-mode');
console.log('Forced light mode on load');
console.log('Body classes:', document.body.className);

if (themeToggle) {
  themeToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const isDark = document.body.classList.contains('dark-mode');
    console.log('Current isDark:', isDark);
    
    if (isDark) {
      // Switch to light mode
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      updateThemeIcon('light');
      console.log('Switched to light mode');
      
      // Force light mode background
      document.body.style.background = '#f8f9fa';
      document.body.style.color = '#222222';
    } else {
      // Switch to dark mode
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      updateThemeIcon('dark');
      console.log('Switched to dark mode');
      
      // Remove inline styles to let CSS take over
      document.body.style.background = '';
      document.body.style.color = '';
    }
    
    console.log('Body classes after toggle:', document.body.className);
  });
} else {
  console.error('Theme toggle button not found!');
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

// ===== Mobile Menu Toggle =====
function toggleMenu() {
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.toggle('show');
}

// ===== Navbar Scroll Color Change & Active Section Highlight =====
(function() {
  function getAnyScrollY() {
    return Math.max(
      window.pageYOffset || 0,
      document.documentElement.scrollTop || 0,
      document.body.scrollTop || 0
    );
  }

  let ticking = false;
  function handleScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function() {
      const nav = document.querySelector("nav");
      const scrollY = getAnyScrollY();

      if (scrollY > 30) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }

      // Active Section Highlighting
      const sections = document.querySelectorAll('section');
      const navLinks = document.querySelectorAll('nav ul li a');

      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });

      ticking = false;
    });
  }

  const targets = [window, document.documentElement, document.body];
  targets.forEach(function(t) {
    if (t && t.addEventListener) {
      t.addEventListener("scroll", handleScroll, { passive: true });
    }
  });
  handleScroll();
})();

// ===== Typing Effect for Hero Role =====
const roles = ["Web Developer", "Machine Learning Engineer", "Python Developer", "AI/ML Enthusiast"];
let index = 0;
let charIndex = 0;
let typingForward = true;
const element = document.querySelector(".animated-role");

function typeEffect() {
  if (!element) return;
  
  const current = roles[index];
  if (typingForward) {
    charIndex++;
    if (charIndex > current.length) {
      typingForward = false;
      setTimeout(typeEffect, 1500);
      return;
    }
  } else {
    charIndex--;
    if (charIndex === 0) {
      typingForward = true;
      index = (index + 1) % roles.length;
    }
  }
  element.textContent = current.substring(0, charIndex);
  setTimeout(typeEffect, typingForward ? 120 : 80);
}

// Start typing effect when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (element) {
    typeEffect();
  }
});

// ===== Animated Counter for Achievements =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  let current = 0;
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 16); // 60fps

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.counter');
      counters.forEach(counter => {
        if (counter.textContent === '0') { // Only animate once
          animateCounter(counter);
        }
      });
    }
  });
}, { threshold: 0.5 });

const achievementsSection = document.getElementById('achievements');
if (achievementsSection) {
  counterObserver.observe(achievementsSection);
}

// ===== Scroll Animation (Fade & Slide) =====
const animatedElements = document.querySelectorAll("section, .skill-card, .project-box, .expertise-card, .gallery-item");

function checkScroll() {
  const triggerBottom = window.innerHeight * 0.8;
  animatedElements.forEach(el => {
    const boxTop = el.getBoundingClientRect().top;
    if (boxTop < triggerBottom) {
      el.classList.add("fade-in", "visible");
    }
  });
}

window.addEventListener("scroll", checkScroll);
checkScroll();

// ===== Skills Animation =====
const skillCards = document.querySelectorAll(".skill-card");
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add("fade-in", "visible");
      }, index * 100);
    }
  });
}, { threshold: 0.1 });

skillCards.forEach(card => skillObserver.observe(card));

// ===== Progress Bar Animation =====
const progressBars = document.querySelectorAll('.progress-fill');
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const progressBar = entry.target;
      const width = progressBar.getAttribute('data-width');
      setTimeout(() => {
        progressBar.style.width = width;
      }, 500);
    }
  });
}, { threshold: 0.5 });

progressBars.forEach(bar => progressObserver.observe(bar));

// ===== Counter Animation for Percentages =====
const percentageElements = document.querySelectorAll('.percentage:not(.scroll-percentage)');
const percentageCounterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const percentage = entry.target;
      const targetValue = parseInt(percentage.textContent);
      let currentValue = 0;
      const increment = targetValue / 50;
      
      const counter = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(counter);
        }
        percentage.textContent = Math.floor(currentValue) + '%';
      }, 30);
    }
  });
}, { threshold: 0.5 });

percentageElements.forEach(element => {
  percentageCounterObserver.observe(element);
});

/* Qualification Tabs Toggle */
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".qualification-button");
  const contents = document.querySelectorAll(".qualification-content");

  // Set default active tab
  if (tabs.length > 0 && !document.querySelector('.qualification-button.qualification-active')) {
    tabs[0].classList.add("qualification-active");
    const firstTarget = tabs[0].dataset.target;
    if (firstTarget) {
      document.querySelector(firstTarget).classList.add("qualification-active");
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("qualification-active"));
      contents.forEach(c => c.classList.remove("qualification-active"));

      tab.classList.add("qualification-active");
      document.querySelector(tab.dataset.target).classList.add("qualification-active");
    });
  });
});

// ===== Gallery Scroll & Pagination =====
const scrollGallery = document.getElementById("scrollGallery");
const galleryTrack = document.getElementById("galleryTrack");
const paginationDots = document.getElementById("paginationDots");
const galleryItems = document.querySelectorAll(".gallery-item");

if (scrollGallery && galleryTrack && paginationDots && galleryItems.length > 0) {
  const itemWidth = 300;
  const itemsPerView = window.innerWidth > 768 ? 3 : window.innerWidth > 480 ? 2 : 1;
  const totalPages = Math.ceil(galleryItems.length / itemsPerView);
  let currentIndex = 0;

  function createDots() {
    paginationDots.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => {
        currentIndex = i;
        scrollToIndex(currentIndex);
        updateDots();
        restartAutoplay();
      });
      paginationDots.appendChild(dot);
    }
  }

  function scrollToIndex(index) {
    const scrollX = index * itemWidth * itemsPerView;
    scrollGallery.scrollTo({ left: scrollX, behavior: "smooth" });
  }

  function updateDots() {
    document.querySelectorAll(".dot").forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });
  }

  function scrollGalleryByArrow(dir) {
    currentIndex += dir;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= totalPages) currentIndex = totalPages - 1;
    scrollToIndex(currentIndex);
    updateDots();
    restartAutoplay();
  }

  let autoplay = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalPages;
    scrollToIndex(currentIndex);
    updateDots();
  }, 4000);

  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalPages;
      scrollToIndex(currentIndex);
      updateDots();
    }, 4000);
  }

  // Pause autoplay on hover
  scrollGallery.addEventListener('mouseenter', () => clearInterval(autoplay));
  scrollGallery.addEventListener('mouseleave', restartAutoplay);

  createDots();
}

// ===== Smooth Scrolling for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===== Contact Form Handling =====
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const phone = this.querySelector('input[type="tel"]').value;
    const message = this.querySelector('textarea').value;
    
    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const submitBtn = this.querySelector('button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      alert('Thank you for your message! I will get back to you soon.');
      this.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });
}

// ===== Hide Loading Screen =====
window.addEventListener('load', function() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    // Wait a little longer for smoother transition
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 1000);
  }
  document.body.classList.add('loaded');
});

// ===== Shared Scroll Helpers =====
(function() {
  function getAnyScrollY() {
    return Math.max(
      window.pageYOffset || 0,
      document.documentElement.scrollTop || 0,
      document.body.scrollTop || 0
    );
  }

  function getBestScrollTarget() {
    if (document.body.scrollTop > 0 || getComputedStyle(document.body).overflowY === 'auto' || getComputedStyle(document.body).overflowY === 'scroll') {
      return document.body;
    }
    if (document.documentElement.scrollTop > 0 || getComputedStyle(document.documentElement).overflowY === 'auto' || getComputedStyle(document.documentElement).overflowY === 'scroll') {
      return document.documentElement;
    }
    return window;
  }

  function addMultiScrollListener(fn) {
    const targets = [window, document.documentElement, document.body];
    targets.forEach(function(t) {
      if (t && t.addEventListener) {
        t.addEventListener('scroll', fn, { passive: true });
      }
    });
  }

  // ===== Back To Top Button =====
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    let bttTicking = false;
    function updateBackToTop() {
      if (bttTicking) return;
      bttTicking = true;
      window.requestAnimationFrame(function() {
        const scrollY = getAnyScrollY();
        if (scrollY > 300) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
        bttTicking = false;
      });
    }

    addMultiScrollListener(updateBackToTop);
    updateBackToTop();

    backToTopBtn.addEventListener('click', function() {
      const target = getBestScrollTarget();
      if (target === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        target.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ===== Scroll Progress Bar =====
  const scrollProgressBar = document.getElementById('scroll-progress-bar');

  if (scrollProgressBar) {
    let pbTicking = false;
    function updateScrollProgress() {
      if (pbTicking) return;
      pbTicking = true;
      window.requestAnimationFrame(function() {
        const scrollTop = getAnyScrollY();
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - (window.innerHeight || document.documentElement.clientHeight || 0);
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgressBar.style.width = scrollPercent + '%';
        pbTicking = false;
      });
    }

    addMultiScrollListener(updateScrollProgress);
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();
  }
})();

// ===== PROJECT SEARCH =====
const projectSearch = document.getElementById('projectSearch');
const projectBoxes = document.querySelectorAll('.project-box');

if (projectSearch) {
  projectSearch.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    let visibleIndex = 0;
    
    projectBoxes.forEach(box => {
      const projectTitle = box.querySelector('h3').textContent.toLowerCase();
      const projectDescription = box.querySelector('p') ? box.querySelector('p').textContent.toLowerCase() : '';
      
      if (projectTitle.includes(searchTerm) || projectDescription.includes(searchTerm)) {
        box.style.display = 'flex';
        // Add staggered animation for visible results
        box.style.opacity = '0';
        box.style.transform = 'translateY(50px) scale(0.95)';
        box.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
          box.style.opacity = '1';
          box.style.transform = 'translateY(0) scale(1)';
        }, visibleIndex * 150);
        
        visibleIndex++;
      } else {
        box.style.display = 'none';
      }
    });
    
    // Trigger one-by-one animation when search is cleared
    if (e.target.value === '') {
      projectBoxes.forEach((box, index) => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(50px) scale(0.95)';
        box.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
          box.style.opacity = '1';
          box.style.transform = 'translateY(0) scale(1)';
        }, index * 150);
      });
    }
  });
}

// ===== Parallax disabled to ensure background image visibility =====
// window.addEventListener('scroll', function() {
//   const scrolled = window.pageYOffset;
//   const hero = document.querySelector('.hero');
//   if (hero) {
//     const rate = scrolled * -0.5;
//     hero.style.transform = `translateY(${rate}px)`;
//   }
// });

// ===== Add Hover Effects to Cards =====
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.skill-card, .expertise-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});

// ===== Add Ripple Effect to Buttons =====
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');

  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

// Add ripple effect to all buttons
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('button, .about-btn, .projects-btn, .project-link');
  
  buttons.forEach(button => {
    button.addEventListener('click', createRipple);
  });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 600ms linear;
    pointer-events: none;
  }

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  button, .about-btn, .projects-btn, .project-link {
    position: relative;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

// ===== Add Staggered Animation for Cards =====
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.skill-card, .expertise-card, .project-box');
  
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    cardObserver.observe(card);
  });
});