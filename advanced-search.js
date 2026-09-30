// Advanced Search & Filtering for Projects
document.addEventListener('DOMContentLoaded', function() {
  const projectSearch = document.getElementById('projectSearch');
  const advancedFiltersToggle = document.getElementById('advancedFiltersToggle');
  const advancedFiltersPanel = document.getElementById('advancedFiltersPanel');
  const projectBoxes = document.querySelectorAll('.project-box');
  const saveFiltersBtn = document.getElementById('saveFilters');
  const clearAllFiltersBtn = document.getElementById('clearAllFilters');
  const showAnalyticsBtn = document.getElementById('showAnalytics');
  const savedFiltersContainer = document.getElementById('savedFilters');
  const searchAnalyticsContainer = document.getElementById('searchAnalytics');
  const projectTabs = document.querySelectorAll('.projects-tab');
  const techFilters = document.querySelectorAll('.tech-filter');
  const typeFilters = document.querySelectorAll('.type-filter');

  // Toggle advanced filters panel
  if (advancedFiltersToggle && advancedFiltersPanel) {
    advancedFiltersToggle.addEventListener('click', function() {
      advancedFiltersPanel.classList.toggle('open');
    });
  }

  // Real-time search with highlighting
  if (projectSearch) {
    projectSearch.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      filterProjects(searchTerm);
    });
  }

  // Category tabs
  projectTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      projectTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.dataset.filter;
      filterProjects(projectSearch ? projectSearch.value.toLowerCase() : '', category);
    });
  });

  // Technology filters
  techFilters.forEach(filter => {
    filter.addEventListener('change', function() {
      applyFilters();
    });
  });

  // Type filters
  typeFilters.forEach(filter => {
    filter.addEventListener('change', function() {
      applyFilters();
    });
  });

  // Save filters
  if (saveFiltersBtn) {
    saveFiltersBtn.addEventListener('click', function() {
      const filterName = prompt('Enter a name for this filter combination:');
      if (filterName) {
        saveFilterPreset(filterName);
      }
    });
  }

  // Clear all filters
  if (clearAllFiltersBtn) {
    clearAllFiltersBtn.addEventListener('click', function() {
      clearAllFilters();
    });
  }

  // Show search analytics
  if (showAnalyticsBtn) {
    showAnalyticsBtn.addEventListener('click', function() {
      toggleSearchAnalytics();
    });
  }

  // Load saved filters on page load
  loadSavedFilters();

  // Filter projects function
  function filterProjects(searchTerm = '', category = 'all') {
    projectBoxes.forEach(box => {
      const projectTitle = box.querySelector('h3').textContent.toLowerCase();
      const projectDescription = box.querySelector('p') ? box.querySelector('p').textContent.toLowerCase() : '';
      const projectCategory = box.dataset.category;
      
      const matchesSearch = projectTitle.includes(searchTerm) || projectDescription.includes(searchTerm);
      const matchesCategory = category === 'all' || projectCategory === category;
      
      if (matchesSearch && matchesCategory) {
        box.style.display = 'flex';
        // Highlight search terms
        if (searchTerm) {
          highlightSearchTerms(box, searchTerm);
        } else {
          removeHighlight(box);
        }
      } else {
        box.style.display = 'none';
      }
    });
  }

  // Apply all filters
  function applyFilters() {
    const searchTerm = projectSearch ? projectSearch.value.toLowerCase() : '';
    const activeTab = document.querySelector('.projects-tab.active');
    const category = activeTab ? activeTab.dataset.filter : 'all';
    
    const selectedTech = Array.from(techFilters)
      .filter(f => f.checked)
      .map(f => f.value);
    
    const selectedTypes = Array.from(typeFilters)
      .filter(f => f.checked)
      .map(f => f.value);
    
    projectBoxes.forEach(box => {
      const projectTitle = box.querySelector('h3').textContent.toLowerCase();
      const projectDescription = box.querySelector('p') ? box.querySelector('p').textContent.toLowerCase() : '';
      const projectCategory = box.dataset.category;
      const projectTech = box.dataset.tech ? box.dataset.tech.split(',') : [];
      const projectType = box.dataset.type ? box.dataset.type.split(',') : [];
      
      const matchesSearch = projectTitle.includes(searchTerm) || projectDescription.includes(searchTerm);
      const matchesCategory = category === 'all' || projectCategory === category;
      const matchesTech = selectedTech.length === 0 || selectedTech.some(tech => projectTech.includes(tech));
      const matchesType = selectedTypes.length === 0 || selectedTypes.some(type => projectType.includes(type));
      
      if (matchesSearch && matchesCategory && matchesTech && matchesType) {
        box.style.display = 'flex';
        if (searchTerm) {
          highlightSearchTerms(box, searchTerm);
        } else {
          removeHighlight(box);
        }
      } else {
        box.style.display = 'none';
      }
    });
  }

  // Highlight search terms
  function highlightSearchTerms(box, searchTerm) {
    const title = box.querySelector('h3');
    const description = box.querySelector('p');
    
    if (title) {
      highlightText(title, searchTerm);
    }
    if (description) {
      highlightText(description, searchTerm);
    }
  }

  function highlightText(element, searchTerm) {
    const originalText = element.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    element.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
  }

  function removeHighlight(box) {
    const title = box.querySelector('h3');
    const description = box.querySelector('p');
    
    if (title) {
      title.innerHTML = title.textContent;
    }
    if (description) {
      description.innerHTML = description.textContent;
    }
  }

  // Save filter preset
  function saveFilterPreset(name) {
    const preset = {
      name: name,
      searchTerm: projectSearch.value,
      category: document.querySelector('.projects-tab.active').dataset.filter,
      tech: Array.from(techFilters).filter(f => f.checked).map(f => f.value),
      type: Array.from(typeFilters).filter(f => f.checked).map(f => f.value),
      savedAt: new Date().toISOString()
    };
    
    let savedFilters = JSON.parse(localStorage.getItem('projectFilters') || '[]');
    savedFilters.push(preset);
    localStorage.setItem('projectFilters', JSON.stringify(savedFilters));
    
    renderSavedFilters();
  }

  // Render saved filters
  function renderSavedFilters() {
    const savedFilters = JSON.parse(localStorage.getItem('projectFilters') || '[]');
    savedFiltersContainer.innerHTML = '';
    
    savedFilters.forEach((preset, index) => {
      const tag = document.createElement('span');
      tag.className = 'saved-filter-tag';
      tag.innerHTML = `${preset.name} <span class="delete-filter" data-index="${index}">×</span>`;
      tag.addEventListener('click', function() {
        applySavedFilter(index);
      });
      savedFiltersContainer.appendChild(tag);
    });
  }

  // Apply saved filter
  function applySavedFilter(index) {
    const savedFilters = JSON.parse(localStorage.getItem('projectFilters') || '[]');
    const preset = savedFilters[index];
    
    if (preset) {
      projectSearch.value = preset.searchTerm;
      
      // Set category tab
      projectTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === preset.category) {
          tab.classList.add('active');
        }
      });
      
      // Set tech filters
      techFilters.forEach(filter => {
        filter.checked = preset.tech.includes(filter.value);
      });
      
      // Set type filters
      typeFilters.forEach(filter => {
        filter.checked = preset.type.includes(filter.value);
      });
      
      applyFilters();
    }
  }

  // Delete saved filter
  savedFiltersContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-filter')) {
      const index = parseInt(e.target.dataset.index);
      let savedFilters = JSON.parse(localStorage.getItem('projectFilters') || '[]');
      savedFilters.splice(index, 1);
      localStorage.setItem('projectFilters', JSON.stringify(savedFilters));
      renderSavedFilters();
    }
  });

  // Clear all filters
  function clearAllFilters() {
    projectSearch.value = '';
    
    projectTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.filter === 'all') {
        tab.classList.add('active');
      }
    });
    
    techFilters.forEach(filter => {
      filter.checked = false;
    });
    
    typeFilters.forEach(filter => {
      filter.checked = false;
    });
    
    projectBoxes.forEach(box => {
      box.style.display = 'flex';
      removeHighlight(box);
    });
  }

  // Search analytics
  function trackSearchTerm(term) {
    if (!term) return;
    
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '{}');
    
    if (searchHistory[term]) {
      searchHistory[term].count++;
      searchHistory[term].lastSearched = new Date().toISOString();
    } else {
      searchHistory[term] = {
        count: 1,
        firstSearched: new Date().toISOString(),
        lastSearched: new Date().toISOString()
      };
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }

  // Debounce search tracking
  let searchTimeout;
  if (projectSearch) {
    projectSearch.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        trackSearchTerm(e.target.value);
      }, 500);
    });
  }

  // Get popular searches
  function getPopularSearches() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '{}');
    const sorted = Object.entries(searchHistory)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    return sorted.map(([term, data]) => ({ term, ...data }));
  }

  // Toggle search analytics display
  function toggleSearchAnalytics() {
    searchAnalyticsContainer.classList.toggle('open');
    
    if (searchAnalyticsContainer.classList.contains('open')) {
      displaySearchAnalytics();
    }
  }

  // Display search analytics
  function displaySearchAnalytics() {
    const popularSearches = getPopularSearches();
    
    if (popularSearches.length === 0) {
      searchAnalyticsContainer.innerHTML = `
        <h4>Search Analytics</h4>
        <div class="search-analytics-empty">No search data available yet. Start searching to see analytics!</div>
      `;
      return;
    }
    
    let html = '<h4>Popular Search Terms (Top 10)</h4>';
    
    popularSearches.forEach((item, index) => {
      const lastSearched = new Date(item.lastSearched).toLocaleDateString();
      html += `
        <div class="search-analytics-item">
          <span class="term">${index + 1}. ${item.term}</span>
          <div class="stats">
            <span class="count">${item.count} searches</span>
            <span>Last: ${lastSearched}</span>
          </div>
        </div>
      `;
    });
    
    searchAnalyticsContainer.innerHTML = html;
  }
});
