// Projects Section Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectSection = document.getElementById('projects');

  // Initialize projects - remove inline styles to let CSS handle it
  projectBoxes.forEach(box => {
    box.classList.remove('project-in-view');
  });

  // One-by-one project entrance animation with rotation using CSS classes
  function animateProjectsOneByOne() {
    const visibleProjects = Array.from(projectBoxes).filter(box =>
      box.style.display !== 'none' && getComputedStyle(box).display !== 'none'
    );

    // Remove animation class from all visible projects first
    visibleProjects.forEach(project => {
      project.classList.remove('project-in-view');
    });

    // Add animation class one by one with staggered delay
    visibleProjects.forEach((project, index) => {
      setTimeout(() => {
        project.classList.add('project-in-view');
      }, index * 150); // 150ms delay between each card
    });
  }

  // Trigger animation when project section comes into view
  const projectSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all projects
        projectBoxes.forEach(box => {
          box.classList.remove('project-in-view');
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
        box.classList.remove('project-in-view');

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

  // Project hover effects - let CSS handle this
  // No inline styles needed since CSS has hover effects defined
});
