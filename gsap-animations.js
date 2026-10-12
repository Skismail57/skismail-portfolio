// GSAP Animations - Professional Scroll-Linked Effects & Micro-Interactions
document.addEventListener('DOMContentLoaded', function() {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // ===== HERO SECTION ANIMATIONS =====
  const heroTimeline = gsap.timeline();

  // Fade in hero content
  heroTimeline
    .from('.hero-content h1', {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
    })
    .from('.hero-content p', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-content .about-btn, .hero-content .projects-btn', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    }, '-=0.4');

  // ===== PROJECT CARDS ANIMATIONS =====
  // Scroll-triggered reveal with stagger
  gsap.from('.project-box', {
    scrollTrigger: {
      trigger: '.project-container',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 60,
    scale: 0.95,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    clearProps: 'all' // Clear inline styles after animation
  });

  // ===== GALLERY ITEMS ANIMATIONS =====
  gsap.from('.gallery-item', {
    scrollTrigger: {
      trigger: '.gallery-container',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -50,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
  });

  // ===== SKILL ICONS ANIMATIONS =====
  gsap.from('.icon-box', {
    scrollTrigger: {
      trigger: '#expertise',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    scale: 0.8,
    rotation: -10,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)'
  });

  // ===== ABOUT SECTION ANIMATIONS =====
  gsap.from('.about-container', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: -50,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.about-text', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    x: 50,
    duration: 1,
    ease: 'power3.out'
  });

  // ===== CONTACT SECTION ANIMATIONS =====
  gsap.from('.contact-container', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: 'power3.out'
  });

  // ===== SECTION TITLES ANIMATIONS =====
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // ===== MICRO-INTERACTIONS =====
  
  // Button hover effects
  const buttons = document.querySelectorAll('.about-btn, .projects-btn, .project-btn, .contact-form button');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    button.addEventListener('click', () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    });
  });

  // Project card hover effects
  const projectCards = document.querySelectorAll('.project-box');
  
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -10,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      gsap.to(card.querySelector('.project-image img'), {
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      gsap.to(card.querySelector('.project-image img'), {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  });

  // Gallery item hover effects
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        scale: 1.03,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // Skill icon hover effects
  const skillIcons = document.querySelectorAll('.icon-box');
  
  skillIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      gsap.to(icon, {
        scale: 1.1,
        rotation: 5,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    icon.addEventListener('mouseleave', () => {
      gsap.to(icon, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // ===== PARALLAX EFFECT =====
  gsap.to('.hero-bg', {
    scrollTrigger: {
      trigger: '#home',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    },
    y: 100,
    ease: 'none'
  });

  // ===== SMOOTH SCROLL FOR NAV LINKS =====
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        gsap.to(window, {
          duration: 1,
          scrollTo: {
            y: target,
            offsetY: 80
          },
          ease: 'power3.inOut'
        });
      }
    });
  });

  // ===== PROGRESS INDICATOR ANIMATION =====
  gsap.to('.progress-bar', {
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3
    },
    strokeDashoffset: 0,
    ease: 'none'
  });

  // ===== NAVBAR TRANSITION =====
  const navbar = document.querySelector('nav');
  
  ScrollTrigger.create({
    start: 'top -50',
    end: 99999,
    toggleClass: { className: 'scrolled', targets: navbar }
  });

  // ===== FOOTER ANIMATION =====
  gsap.from('.footer', {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 95%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  });

  console.log('GSAP Animations loaded successfully!');
});
