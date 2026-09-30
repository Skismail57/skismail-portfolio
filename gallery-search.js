// Gallery Search - Real-time certificate search with highlighting
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('gallerySearchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  // Search functionality
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    galleryItems.forEach(item => {
      const certificateName = item.querySelector('.certificate-name');
      const nameText = certificateName.textContent.toLowerCase();
      
      if (searchTerm === '') {
        // Show all items
        item.classList.remove('hidden', 'highlighted');
        certificateName.innerHTML = certificateName.textContent;
      } else if (nameText.includes(searchTerm)) {
        // Show and highlight matching items
        item.classList.remove('hidden');
        item.classList.add('highlighted');
        
        // Highlight matching text
        const originalText = certificateName.textContent;
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        certificateName.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
      } else {
        // Hide non-matching items
        item.classList.add('hidden');
        item.classList.remove('highlighted');
        certificateName.innerHTML = certificateName.textContent;
      }
    });
    
    // Update gallery slider after filtering
    updateGalleryAfterSearch();
  });
  
  // Clear search
  clearSearchBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
  });
  
  // Clear search on Escape key
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      this.value = '';
      this.dispatchEvent(new Event('input'));
    }
  });
  
  // Escape special regex characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Update gallery slider after search
  function updateGalleryAfterSearch() {
    const visibleItems = document.querySelectorAll('.gallery-item:not(.hidden)');
    const galleryTrack = document.getElementById('galleryTrack');
    
    if (visibleItems.length === 0) {
      // Show no results message
      if (!document.querySelector('.no-search-results')) {
        const noResults = document.createElement('div');
        noResults.className = 'no-search-results';
        noResults.textContent = 'No certificates found matching your search.';
        noResults.style.cssText = `
          text-align: center;
          padding: 40px;
          color: #6c757d;
          font-size: 1.1rem;
          grid-column: 1 / -1;
        `;
        galleryTrack.appendChild(noResults);
      }
    } else {
      // Remove no results message if it exists
      const noResults = document.querySelector('.no-search-results');
      if (noResults) {
        noResults.remove();
      }
    }
  }
  
  // Track search analytics
  let searchDebounceTimer;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchDebounceTimer);
    
    searchDebounceTimer = setTimeout(() => {
      const searchTerm = this.value.trim();
      
      if (searchTerm.length >= 2) {
        trackSearch(searchTerm);
      }
    }, 500);
  });
  
  function trackSearch(term) {
    let searchData = JSON.parse(localStorage.getItem('gallerySearchData') || '{}');
    
    if (searchData[term]) {
      searchData[term].count++;
      searchData[term].lastSearched = new Date().toISOString();
    } else {
      searchData[term] = {
        count: 1,
        firstSearched: new Date().toISOString(),
        lastSearched: new Date().toISOString()
      };
    }
    
    localStorage.setItem('gallerySearchData', JSON.stringify(searchData));
  }
  
  function getPopularSearches() {
    const searchData = JSON.parse(localStorage.getItem('gallerySearchData') || '{}');
    const sorted = Object.entries(searchData)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    return sorted.map(([term, data]) => ({ term, ...data }));
  }
});
