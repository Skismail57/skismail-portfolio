// Projects Section Functionality - Fast and Simple
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectSection = document.getElementById('projects');

  // Initialize projects
  projectBoxes.forEach(box => {
    box.style.opacity = '0';
    box.style.transform = 'translateY(30px)';
    box.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  // Simple entrance animation
  function animateProjects() {
    const visibleProjects = Array.from(projectBoxes).filter(box =>
      box.style.display !== 'none' && getComputedStyle(box).display !== 'none'
    );

    visibleProjects.forEach((project, index) => {
      setTimeout(() => {
        project.style.opacity = '1';
        project.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // Trigger animation when section is visible
  if (projectSection) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateProjects();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(projectSection);
  }

  // Tab click handlers
  projectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      projectTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      projectBoxes.forEach(box => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(30px)';

        if (filterValue === 'all' || box.getAttribute('data-category') === filterValue) {
          box.style.display = 'flex';
        } else {
          box.style.display = 'none';
        }
      });

      setTimeout(animateProjects, 100);
    });
  });
});
