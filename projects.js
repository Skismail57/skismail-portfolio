// Projects Section Functionality with Advanced Animations
// GSAP animations are now handled by gsap-animations.js
// This file now only handles project filtering
document.addEventListener('DOMContentLoaded', function() {
  // Project filtering functionality
  const projectTabs = document.querySelectorAll('.projects-tab');
  const projectBoxes = document.querySelectorAll('.project-box');

  // Add click event to each tab
  projectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      projectTabs.forEach(t => t.classList.remove('active'));

      // Add active class to clicked tab
      tab.classList.add('active');

      // Get filter value
      const filterValue = tab.getAttribute('data-filter');

      // Filter projects
      projectBoxes.forEach(box => {
        if (filterValue === 'all' || box.getAttribute('data-category') === filterValue) {
          box.style.display = 'flex';
        } else {
          box.style.display = 'none';
        }
      });

      // Refresh GSAP ScrollTrigger after filtering if available
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });
});
