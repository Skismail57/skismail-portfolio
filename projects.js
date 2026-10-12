// Projects Section Functionality - Ultra Fast with Infinite Scroll
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');
  const projectContainer = document.querySelector('.project-container');

  // Tab click handlers - no animations, just filtering
  projectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      projectTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      projectBoxes.forEach(box => {
        if (filterValue === 'all' || box.getAttribute('data-category') === filterValue) {
          box.style.display = 'flex';
        } else {
          box.style.display = 'none';
        }
      });
    });
  });

  // ===== INFINITE SCROLL =====
  // Add sentinel element for infinite scroll
  if (projectContainer) {
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '50px';
    projectContainer.appendChild(sentinel);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Load more projects (simulated - in production, fetch from API)
          console.log('Load more projects...');
          // In production: fetch('/api/projects?page=' + currentPage)
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });

    observer.observe(sentinel);
  }
});
