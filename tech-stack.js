// Tech Stack Visualization - Interactive Tech Icons
document.addEventListener('DOMContentLoaded', function() {
  const techIcons = document.querySelectorAll('.tech-icon');
  
  // Add click handler for tech icons
  techIcons.forEach(icon => {
    icon.addEventListener('click', function() {
      const tech = this.dataset.tech;
      const techName = this.title;
      
      // Highlight all icons with the same tech
      highlightSameTech(tech);
      
      // Track tech interaction
      trackTechInteraction(tech, techName);
    });
  });
  
  // Highlight same tech across all projects
  function highlightSameTech(tech) {
    // Remove previous highlights
    document.querySelectorAll('.tech-icon.highlighted').forEach(icon => {
      icon.classList.remove('highlighted');
    });
    
    // Add highlight to matching tech icons
    document.querySelectorAll(`.tech-icon[data-tech="${tech}"]`).forEach(icon => {
      icon.classList.add('highlighted');
    });
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
      document.querySelectorAll('.tech-icon.highlighted').forEach(icon => {
        icon.classList.remove('highlighted');
      });
    }, 2000);
  }
  
  // Track tech interaction
  function trackTechInteraction(tech, techName) {
    let techStats = JSON.parse(localStorage.getItem('techStats') || '{}');
    
    if (techStats[tech]) {
      techStats[tech].count++;
      techStats[tech].lastInteracted = new Date().toISOString();
    } else {
      techStats[tech] = {
        name: techName,
        count: 1,
        firstInteracted: new Date().toISOString(),
        lastInteracted: new Date().toISOString()
      };
    }
    
    localStorage.setItem('techStats', JSON.stringify(techStats));
  }
  
  // Get popular technologies
  function getPopularTechs() {
    const techStats = JSON.parse(localStorage.getItem('techStats') || '{}');
    const sorted = Object.entries(techStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    return sorted.map(([tech, data]) => ({ tech, ...data }));
  }
  
  // Add staggered animation on page load
  const projectBoxes = document.querySelectorAll('.project-box');
  projectBoxes.forEach((box, boxIndex) => {
    const techStack = box.querySelector('.tech-stack');
    if (techStack) {
      const icons = techStack.querySelectorAll('.tech-icon');
      icons.forEach((icon, iconIndex) => {
        icon.style.opacity = '0';
        icon.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          icon.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          icon.style.opacity = '1';
          icon.style.transform = 'translateY(0)';
        }, (boxIndex * 100) + (iconIndex * 50));
      });
    }
  });
});
