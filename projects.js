// Projects Section Functionality with Advanced Animations
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectSection = document.getElementById('projects');

  // Initialize projects - remove animation classes
  projectBoxes.forEach(box => {
    box.classList.remove('project-animate-in');
  });

  // One-by-one project entrance animation with fade-up effect
  function animateProjectsOneByOne() {
    const visibleProjects = Array.from(projectBoxes).filter(box =>
      box.style.display !== 'none' && getComputedStyle(box).display !== 'none'
    );

    // Remove animation class from all visible projects
    visibleProjects.forEach(project => {
      project.classList.remove('project-animate-in');
    });

    // Animate each card with staggered delay (100-150ms)
    visibleProjects.forEach((project, index) => {
      setTimeout(() => {
        project.classList.add('project-animate-in');
      }, index * 100); // 100ms staggered delay
    });
  }

  // Trigger animation when project section comes into view
  const projectSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all projects
        projectBoxes.forEach(box => {
          box.classList.remove('project-animate-in');
        });

        // Start staggered animation
        setTimeout(() => {
          animateProjectsOneByOne();
        }, 100);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

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
        box.classList.remove('project-animate-in');

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
});
