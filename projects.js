// Projects Section Functionality with Advanced Animations
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectSection = document.getElementById('projects');

  // Initialize projects - set initial hidden state
  projectBoxes.forEach(box => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(40px)';
    box.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  // One-by-one project entrance animation with fade-up effect
  function animateProjectsOneByOne() {
    const visibleProjects = Array.from(projectBoxes).filter(box =>
      box.style.display !== 'none' && getComputedStyle(box).display !== 'none'
    );

    // Reset all visible projects to hidden state
    visibleProjects.forEach(project => {
      project.style.opacity = '0';
      project.style.transform = 'translateY(40px)';
    });

    // Animate each card with staggered delay (100-150ms)
    visibleProjects.forEach((project, index) => {
      setTimeout(() => {
        project.style.opacity = '1';
        project.style.transform = 'translateY(0)';
      }, index * 100); // 100ms staggered delay
    });
  }

  // Trigger animation when project section comes into view
  const projectSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all projects to hidden state
        projectBoxes.forEach(box => {
          box.style.opacity = '0';
          box.style.transform = 'translateY(40px)';
        });

        // Start staggered animation
        setTimeout(() => {
          animateProjectsOneByOne();
        }, 100);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  if (projectSection) {
    projectSectionObserver.observe(projectSection);
  }

  // Smooth scroll to projects section when clicking nav link
  const projectsNavLink = document.querySelector('a[href="#projects"]');
  if (projectsNavLink) {
    projectsNavLink.addEventListener('click', function(e) {
      e.preventDefault();
      const targetSection = document.getElementById('projects');
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
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
        box.style.opacity = '0';
        box.style.transform = 'translateY(40px)';

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

  // Enhanced hover effects - lift and image zoom
  projectBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
      box.style.transform = 'translateY(-8px)';
      box.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
      box.style.borderColor = 'rgba(10, 102, 194, 0.5)';
      box.style.zIndex = '10';

      const img = box.querySelector('.project-image img');
      if (img) {
        img.style.transform = 'scale(1.05)';
      }
    });

    box.addEventListener('mouseleave', () => {
      box.style.transform = 'translateY(0)';
      box.style.boxShadow = '';
      box.style.borderColor = '';
      box.style.zIndex = '';

      const img = box.querySelector('.project-image img');
      if (img) {
        img.style.transform = 'scale(1)';
      }
    });
  });
});
