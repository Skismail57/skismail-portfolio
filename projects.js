// Projects Section Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectSection = document.getElementById('projects');

  // Initialize projects with hidden state and rotation
  projectBoxes.forEach(box => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(60px) rotateX(8deg) scale(0.96)';
    box.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
  });

  // One-by-one project entrance animation with rotation
  function animateProjectsOneByOne() {
    const visibleProjects = Array.from(projectBoxes).filter(box =>
      box.style.display !== 'none' && getComputedStyle(box).display !== 'none'
    );

    visibleProjects.forEach((project, index) => {
      // Reset to hidden state with rotation
      project.style.opacity = '0';
      project.style.transform = 'translateY(60px) rotateX(8deg) scale(0.96)';

      // Animate one by one with staggered delay
      setTimeout(() => {
        project.style.opacity = '1';
        project.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
      }, index * 150); // 150ms delay between each card
    });
  }

  // Trigger animation when project section comes into view
  const projectSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all projects to hidden state with rotation
        projectBoxes.forEach(box => {
          box.style.opacity = '0';
          box.style.transform = 'translateY(60px) rotateX(8deg) scale(0.96)';
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
        box.style.transform = 'translateY(60px) rotateX(8deg) scale(0.96)';

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
      box.style.transform = 'translateY(-8px) scale(1.02)';
      box.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)';
      box.style.transition = 'all 0.3s ease';
    });

    box.addEventListener('mouseleave', () => {
      box.style.transform = 'translateY(0) scale(1)';
      box.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)';
      box.style.transition = 'all 0.3s ease';
    });
  });
});
