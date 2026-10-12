// GSAP Animations - Professional Scroll-Linked Effects & Micro-Interactions
window.addEventListener('load', function() {
  console.log('GSAP Animations: Window loaded, initializing...');
  
  // Check if GSAP is loaded
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded!');
    return;
  }
  
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  console.log('GSAP Animations: Plugins registered');

  // ===== HERO SECTION ANIMATIONS =====
  // Check if hero content exists
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
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
  }

  // ===== PROJECT CARDS ANIMATIONS =====
  // Scroll-triggered reveal with stagger
  const projectContainer = document.querySelector('.project-container');
  if (projectContainer) {
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
  }

  // ===== GALLERY ITEMS ANIMATIONS =====
  const galleryContainer = document.querySelector('.gallery-container');
  if (galleryContainer) {
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
  }

  // ===== SKILL ICONS ANIMATIONS =====
  const expertiseSection = document.querySelector('#expertise');
  if (expertiseSection) {
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
  }

  // ===== ABOUT SECTION ANIMATIONS =====
  const aboutSection = document.querySelector('#about');
  if (aboutSection) {
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
  }

  // ===== CONTACT SECTION ANIMATIONS =====
  const contactSection = document.querySelector('#contact');
  if (contactSection) {
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
  }

  // ===== SECTION TITLES ANIMATIONS =====
  const sectionTitles = document.querySelectorAll('.section-title');
  if (sectionTitles.length > 0) {
    sectionTitles.forEach(title => {
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
  }

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
    const cardImage = card.querySelector('.project-image img');
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -10,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      if (cardImage) {
        gsap.to(cardImage, {
          scale: 1.05,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      if (cardImage) {
        gsap.to(cardImage, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
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
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
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
  }

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

  // ===== NAVBAR TRANSITION =====
  const navbar = document.querySelector('nav');
  if (navbar) {
    ScrollTrigger.create({
      start: 'top -50',
      end: 99999,
      toggleClass: { className: 'scrolled', targets: navbar }
    });
  }

  // ===== FOOTER ANIMATION =====
  const footer = document.querySelector('.footer');
  if (footer) {
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
  }

  console.log('GSAP Animations loaded successfully!');
});
