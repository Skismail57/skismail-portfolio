// Projects Section Functionality with Advanced Animations
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectSection = document.getElementById('projects');

  // Initialize projects - remove all animation classes
  projectBoxes.forEach(box => {
    box.classList.remove('project-in-view', 'slide-left', 'slide-right', 'fade-up');
  });

  // One-by-one project entrance animation with enhanced effects
  function animateProjectsOneByOne() {
    const visibleProjects = Array.from(projectBoxes).filter(box =>
      box.style.display !== 'none' && getComputedStyle(box).display !== 'none'
    );

    // Remove animation classes from all visible projects first
    visibleProjects.forEach(project => {
      project.classList.remove('project-in-view', 'slide-left', 'slide-right', 'fade-up');
    });

    // Add animation class one by one with staggered delay
    visibleProjects.forEach((project, index) => {
      setTimeout(() => {
        // Add fade-up entrance effect
        project.classList.add('fade-up');

        // Alternate between left and right slide for wave effect
        if (index % 2 === 0) {
          project.classList.add('slide-left');
        } else {
          project.classList.add('slide-right');
        }

        // Force a reflow to ensure the class change is recognized
        void project.offsetWidth;

        // Then add the in-view class to trigger the final animation
        requestAnimationFrame(() => {
          project.classList.add('project-in-view');
        });
      }, index * 120); // 120ms delay between each card for smoother stagger
    });
  }

  // Trigger animation when project section comes into view with threshold
  const projectSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all projects
        projectBoxes.forEach(box => {
          box.classList.remove('project-in-view', 'slide-left', 'slide-right', 'fade-up');
        });

        // Start one-by-one animation with slight delay
        setTimeout(() => {
          animateProjectsOneByOne();
        }, 150);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

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
        box.classList.remove('project-in-view', 'slide-left', 'slide-right', 'fade-up');

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

  // Enhanced hover effects via CSS classes
  projectBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
      box.classList.add('project-hover');
    });

    box.addEventListener('mouseleave', () => {
      box.classList.remove('project-hover');
    });
  });
});
