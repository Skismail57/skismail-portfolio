// Modern UI Components - Ripple Effect & Skeleton Loading
document.addEventListener('DOMContentLoaded', function() {
  // Theme Selector Functionality
  const themeButtons = document.querySelectorAll('.theme-btn');
  const body = document.body;
  
  console.log('Theme buttons found:', themeButtons.length);
  console.log('Body element:', body);
  
  // Load saved color theme or default to blue
  const savedColorTheme = localStorage.getItem('colorTheme') || 'blue';
  
  // Apply saved color theme
  function applyColorTheme(theme) {
    console.log('Applying color theme:', theme);
    
    // Remove all theme classes
    body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    
    // Add selected theme
    body.classList.add(`theme-${theme}`);
    
    // Update active state
    themeButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // Save to localStorage
    localStorage.setItem('colorTheme', theme);
    
    console.log('Color theme applied:', theme);
    console.log('Body classes:', body.className);
  }
  
  // Apply saved or default blue theme
  applyColorTheme(savedColorTheme);
  
  // Add click handlers
  themeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const theme = this.dataset.theme;
      console.log('Button clicked, theme:', theme);
      applyColorTheme(theme);
    });
  });
  
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.about-btn, .projects-btn, .project-btn, .gallery-btn, .contact-form button, .home-arrow');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Skeleton loader for images
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  images.forEach(img => {
    img.setAttribute('data-loading', 'true');
    
    img.addEventListener('load', function() {
      this.setAttribute('data-loading', 'false');
      this.style.animation = 'fadeIn 0.5s ease-out';
    });
    
    img.addEventListener('error', function() {
      this.setAttribute('data-loading', 'false');
      this.style.opacity = '0.5';
    });
  });
  
  // Add fade-in animation keyframes if not present
  if (!document.querySelector('#modern-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'modern-ui-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* Smooth transitions for neumorphic elements */
      .neumorphic, .neumorphic-inset, .home-arrow, .progress-circle {
        transition: all 0.3s ease;
      }
      
      .neumorphic:hover, .neumorphic-inset:hover {
        transform: translateY(-2px);
      }
      
      .home-arrow:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize page loading animation
  const projectBoxes = document.querySelectorAll('.project-box');
  projectBoxes.forEach((box, index) => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      box.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      box.style.opacity = '1';
      box.style.transform = 'translateY(0)';
    }, 100 * index);
  });
  
  // Gallery items staggered animation
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 100 * index);
  });
});
