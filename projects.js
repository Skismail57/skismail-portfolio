// Projects Section Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectSection = document.getElementById('projects');
  
  // Initialize projects with hidden state
  projectBoxes.forEach(box => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(50px) scale(0.95)';
    box.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  });
  
  // One-by-one project entrance animation with alternating slide effects
  function animateProjectsOneByOne() {
    const visibleProjects = Array.from(projectBoxes).filter(box => 
      box.style.display !== 'none' && getComputedStyle(box).display !== 'none'
    );
    
    visibleProjects.forEach((project, index) => {
      // Reset to hidden state
      project.style.opacity = '0';
      project.style.transform = 'translateY(50px) scale(0.95)';
      
      // Animate one by one with staggered delay
      setTimeout(() => {
        project.style.opacity = '1';
        project.style.transform = 'translateY(0) scale(1)';
        
        // Add alternating slide effects for visual interest
        if (index % 2 === 0) {
          project.style.transform = 'translateX(-15px) translateY(0) scale(1)';
          setTimeout(() => {
            project.style.transform = 'translateY(0) scale(1)';
          }, 100);
        } else {
          project.style.transform = 'translateX(15px) translateY(0) scale(1)';
          setTimeout(() => {
            project.style.transform = 'translateY(0) scale(1)';
          }, 100);
        }
      }, index * 150); // 150ms delay between each card
    });
  }
  
  // Trigger animation when project section comes into view
  const projectSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all projects to hidden state
        projectBoxes.forEach(box => {
          box.style.opacity = '0';
          box.style.transform = 'translateY(50px) scale(0.95)';
        });
        
        // Start one-by-one animation
        setTimeout(() => {
          animateProjectsOneByOne();
        }, 200);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
  
  if (projectSection) {
    projectSectionObserver.observe(projectSection);
  }
  

  
  // Add click event to each tab
  projectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      projectTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Get filter value
      const filterValue = tab.getAttribute('data-filter');
      
      // Filter projects with animation
      projectBoxes.forEach(box => {
        // Reset animations
        box.style.opacity = '0';
        box.style.transform = 'translateY(50px) scale(0.95)';
        
        if (filterValue === 'all' || box.getAttribute('data-category') === filterValue) {
          box.style.display = 'flex';
        } else {
          box.style.display = 'none';
        }
      });
      
      // Re-animate visible projects after filtering
      setTimeout(() => {
        animateProjectsOneByOne();
      }, 100);
    });
  });
  
  // Project hover effects
  projectBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
      box.style.transform = 'translateY(-10px) scale(1.02)';
      box.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
      box.style.transition = 'all 0.3s ease';
    });
    
    box.addEventListener('mouseleave', () => {
      box.style.transform = 'translateY(0) scale(1)';
      box.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      box.style.transition = 'all 0.3s ease';
    });
  });
});