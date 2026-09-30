// Scroll-triggered animations like Gagan's portfolio
document.addEventListener('DOMContentLoaded', function() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // About section animation - triggers every time it comes into view
    function triggerAboutAnimation() {
        const aboutSection = document.getElementById('about');
        const aboutImg = document.querySelector('#about .about-container img');
        const aboutText = document.querySelector('#about .about-text');
        
        if (aboutSection && aboutImg && aboutText) {
            // Reset to hidden state
            aboutImg.style.opacity = '0';
            aboutImg.style.transform = 'translateX(-100px)';
            aboutImg.style.transition = 'all 1s ease-out';
            
            aboutText.style.opacity = '0';
            aboutText.style.transform = 'translateX(100px)';
            aboutText.style.transition = 'all 1s ease-out';
            
            // Animate immediately
            setTimeout(() => {
                aboutImg.style.opacity = '1';
                aboutImg.style.transform = 'translateX(0)';
                
                setTimeout(() => {
                    aboutText.style.opacity = '1';
                    aboutText.style.transform = 'translateX(0)';
                }, 300);
            }, 100);
        }
    }
    
    // About section scroll observer
    const aboutObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                triggerAboutAnimation();
            }
        });
    }, observerOptions);
    
    // Observe about section for scroll-triggered animation
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutObserver.observe(aboutSection);
    }

    // Add slide animations to elements
    function addSlideAnimations() {
        // About section animations
        const aboutImg = document.querySelector('#about .about-container img');
        const aboutText = document.querySelector('#about .about-text');
        
        if (aboutImg) {
            aboutImg.classList.add('slide-in-left');
            observer.observe(aboutImg);
        }
        
        if (aboutText) {
            aboutText.classList.add('slide-in-right');
            observer.observe(aboutText);
        }

        // Skills section animations - enhanced
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) scale(0.9)';
            card.style.transition = 'all 0.6s ease-out';
            
            if (index % 2 === 0) {
                card.classList.add('slide-in-left');
            } else {
                card.classList.add('slide-in-right');
            }
            observer.observe(card);
        });

        // Expertise section animations
        const expertiseCards = document.querySelectorAll('.expertise-card');
        expertiseCards.forEach((card, index) => {
            if (index % 2 === 0) {
                card.classList.add('slide-in-left');
            } else {
                card.classList.add('slide-in-right');
            }
            observer.observe(card);
        });

        // Project section animations - handled in projects.js

        // Qualification section animations
        const qualificationData = document.querySelectorAll('.qualification-data');
        qualificationData.forEach((data, index) => {
            if (index % 2 === 0) {
                data.classList.add('slide-in-left');
            } else {
                data.classList.add('slide-in-right');
            }
            observer.observe(data);
        });

        // Gallery items animations
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            if (index % 2 === 0) {
                item.classList.add('slide-in-left');
            } else {
                item.classList.add('slide-in-right');
            }
            observer.observe(item);
        });
    }

    // Initialize animations
    addSlideAnimations();
    
    // Trigger about animation after home page loads
    triggerAboutAnimation();

    // Add staggered animation delays for better effect
    setTimeout(() => {
        const leftElements = document.querySelectorAll('.slide-in-left');
        const rightElements = document.querySelectorAll('.slide-in-right');
        
        leftElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
        
        rightElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);
});

// Enhanced scroll effects for navbar - DISABLED (handled in index.html)
// window.addEventListener('scroll', function() {
//     const nav = document.querySelector('nav');
//     if (window.scrollY > 50) {
//         nav.classList.add('scrolled');
//     } else {
//         nav.classList.remove('scrolled');
//     }
// });
