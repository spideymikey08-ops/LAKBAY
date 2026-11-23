/**
 * Lakbay | Screen 2: Explore
 * Search, category/price/rating filters, sorting, and destination cards.
 */
'use strict';

/* ==========================================================================
   SCREEN 2: EXPLORE (Filtering, Search, Rating, Map View, Cards)
   ========================================================================== */
function setupExploreControls() {
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const chipsContainer = document.getElementById('category-chips-container');
  const priceSelect = document.getElementById('price-filter-select');
  const ratingFilter = document.getElementById('filter-rating');
  const sortDropdown = document.getElementById('sort-dropdown');
  const mapToggleBtn = document.getElementById('btn-toggle-explore-map');
  const resetBtn = document.getElementById('btn-reset-explore-filters');

  // Restore stored session preferences in UI controls
  if (chipsContainer) {
    chipsContainer.querySelectorAll('.chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-category') === appState.activeCategory);
    });
  }
  if (priceSelect) {
    priceSelect.value = appState.priceFilter || 'all';
  }
  if (ratingFilter) {
    ratingFilter.value = appState.ratingFilter || 'all';
  }
  if (sortDropdown) {
    sortDropdown.value = appState.sortOrder || 'name-asc';
  }

  // 1. Search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      appState.searchQuery = searchInput.value.trim().toLowerCase();
      if (searchClearBtn) {
        searchClearBtn.style.display = searchInput.value ? 'block' : 'none';
      }
      renderExploreGallery();
    });
  }

  // 2. Search clear button
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchClearBtn.style.display = 'none';
      appState.searchQuery = '';
      renderExploreGallery();
    });
  }

  // 3. Category chips
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      appState.activeCategory = chip.getAttribute('data-category') || 'All';
      saveFilterPrefs();
      renderExploreGallery();
    });
  }

  // 4. Entry fee dropdown
  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      appState.priceFilter = e.target.value || 'all';
      saveFilterPrefs();
      renderExploreGallery();
    });
  }

  // 5. Rating filter dropdown
  if (ratingFilter) {
    ratingFilter.addEventListener('change', (e) => {
      appState.ratingFilter = e.target.value;
      saveFilterPrefs();
      renderExploreGallery();
    });
  }

  // 7. Sort dropdown
  if (sortDropdown) {
    sortDropdown.addEventListener('change', (e) => {
      appState.sortOrder = e.target.value;
      saveFilterPrefs();
      renderExploreGallery();
    });
  }

  // 8. Map view toggle
  if (mapToggleBtn) {
    mapToggleBtn.addEventListener('click', () => {
      const container = document.getElementById('explore-map-container');
      const textSpan = document.getElementById('btn-toggle-explore-map-text');
      if (!container) return;

      const isHidden = container.style.display === 'none';
      if (isHidden) {
        container.style.display = 'block';
        if (textSpan) textSpan.textContent = 'Hide Map';
        initOrUpdateBaguioMap();
      } else {
        container.style.display = 'none';
        if (textSpan) textSpan.textContent = 'Show Map';
      }
    });
  }

  // 9. Reset and Clear Filters
  const resetAllFilters = () => {
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    appState.searchQuery = '';
    appState.activeCategory = 'All';
    appState.priceFilter = 'all';
    appState.ratingFilter = 'all';
    appState.sortOrder = 'name-asc';

    if (chipsContainer) {
      chipsContainer.querySelectorAll('.chip').forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-category') === 'All');
      });
    }

    if (priceSelect) priceSelect.value = 'all';

    if (ratingFilter) ratingFilter.value = 'all';
    if (sortDropdown) sortDropdown.value = 'name-asc';

    saveFilterPrefs();
    renderExploreGallery();
  };

  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

  // Gallery Card Event Delegation
  const exploreGrid = document.getElementById('explore-cards-grid');
  if (exploreGrid) {
    exploreGrid.addEventListener('click', handleCardActions);
  }

  const homeGrid = document.getElementById('home-featured-grid');
  if (homeGrid) {
    homeGrid.addEventListener('click', handleCardActions);
  }
}

function handleCardActions(e) {
  // 1. Details Modal
  const detailsBtn = e.target.closest('.btn-show-details');
  if (detailsBtn) {
    e.stopPropagation();
    const id = parseInt(detailsBtn.getAttribute('data-id'), 10);
    showDetails(id);
    return;
  }

  // 2. Quick-Add Popover
  const quickItineraryBtn = e.target.closest('.btn-quick-itinerary');
  if (quickItineraryBtn) {
    e.stopPropagation();
    const id = parseInt(quickItineraryBtn.getAttribute('data-id'), 10);
    openQuickAddPopover(id, quickItineraryBtn);
  }
}

function renderExploreGallery() {
  const grid = document.getElementById('explore-cards-grid');
  const emptyState = document.getElementById('explore-empty-state');
  const countText = document.getElementById('results-count-text');
  if (!grid) return;

  // 1. Category Filter
  let list = sampleDestinations.filter(item => {
    if (appState.activeCategory === 'All') return true;
    return item.category.toLowerCase() === appState.activeCategory.toLowerCase();
  });

  // 2. Price Filter
  if (appState.priceFilter === 'free') {
    list = list.filter(item => item.fee === 0);
  } else if (appState.priceFilter === '50') {
    list = list.filter(item => item.fee <= 50);
  } else if (appState.priceFilter === '100') {
    list = list.filter(item => item.fee <= 100);
  }

  // 3. Rating Filter
  if (appState.ratingFilter === '4.7') {
    list = list.filter(item => item.rating >= 4.7);
  } else if (appState.ratingFilter === '4.8') {
    list = list.filter(item => item.rating >= 4.8);
  }

  // 4. Search Query Filter
  if (appState.searchQuery) {
    const q = appState.searchQuery;
    list = list.filter(item => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchLocation = item.location.toLowerCase().includes(q);
      const matchArea = item.area ? item.area.toLowerCase().includes(q) : false;
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchActivities = item.activities.some(act => act.toLowerCase().includes(q));
      return matchName || matchLocation || matchArea || matchDesc || matchActivities;
    });
  }

  // 6. Sort
  list.sort((a, b) => {
    if (appState.sortOrder === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (appState.sortOrder === 'name-desc') {
      return b.name.localeCompare(a.name);
    } else if (appState.sortOrder === 'rating-desc') {
      return b.rating - a.rating;
    } else if (appState.sortOrder === 'fee-asc') {
      return a.fee - b.fee;
    } else if (appState.sortOrder === 'fee-desc') {
      return b.fee - a.fee;
    }
    return 0;
  });

  // 7. Results Counter
  if (countText) {
    countText.textContent = `Showing ${list.length} destination${list.length === 1 ? '' : 's'}`;
  }

  // 8. Output
  if (list.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = list.map(dest => createDestinationCardHTML(dest)).join('');
  }
}

/**
 * Returns a friendly estimated visiting duration for a destination.
 * Used on gallery cards so travelers can pace their day before planning.
 */
function getVisitDuration(dest) {
  const byId = {
    2: '1–1.5 hours', 4: '30–45 min', 7: '45 min', 9: '1.5 hours',
    11: '2–3 hours', 14: '20–30 min', 15: '1.5–2 hours', 17: '1–2 hours',
    18: '1.5 hours', 19: '1.5 hours', 21: '1–2 hours'
  };

  if (byId[dest.id]) return byId[dest.id];

  switch (dest.category) {
    case 'Museums & Arts': return '1.5–2 hours';
    case 'Nature & Parks': return '1–2 hours';
    case 'Viewpoints': return '45–75 min';
    case 'Food & Shopping': return '1–1.5 hours';
    case 'Culture & Heritage': return '45–90 min';
    default: return 'About 1 hour';
  }
}

/**
 * Inline category glyphs for the travel card (lucide-style 24x24 paths).
 */
function getCategoryIconPaths(category) {
  const icons = {
    'Nature & Parks': '<path d="M12 22v-7"></path><path d="m8 15 4-9 4 9z"></path><path d="M5 18h14"></path>',
    'Viewpoints': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle>',
    'Culture & Heritage': '<path d="M3 21h18"></path><path d="M5 21V10l7-5 7 5v11"></path><path d="M9 21v-7h6v7"></path>',
    'Museums & Arts': '<path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h1.5a2.5 2.5 0 0 0 0-5H12z"></path><circle cx="7.5" cy="10.5" r="0.8" fill="currentColor" stroke="none"></circle><circle cx="9.5" cy="7" r="0.8" fill="currentColor" stroke="none"></circle><circle cx="15" cy="7.5" r="0.8" fill="currentColor" stroke="none"></circle>',
    'Food & Shopping': '<path d="M6 2h12l2 20H4L6 2z"></path><path d="M9 6V5a3 3 0 0 1 6 0v1"></path>'
  };
  return icons[category] || '<path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>';
}

function createDestinationCardHTML(dest, isFeatured = false) {
  const isPlanned = appState.itinerary.some(s => s.destinationId === dest.id);
  const feeText = dest.fee === 0 ? 'FREE' : `₱${dest.fee}`;
  const feeLabel = dest.fee === 0 ? 'No entry fee' : 'Est. entry fee';
  const description = dest.description
    ? escapeHTML(dest.description.length > 105 ? dest.description.substring(0, 105).trim() + '…' : dest.description)
    : 'Discover this Baguio favorite and make it part of your mountain getaway.';

  return `
    <article class="destination-card travel-card" data-id="${dest.id}">
      <img
        src="${escapeHTML(dest.image)}"
        alt="${escapeHTML(dest.name)}"
        class="travel-card-img"
        loading="lazy"
        onerror="this.src='assets/images/burnham-park.jpg'"
      >
      <div class="travel-card-overlay" aria-hidden="true"></div>
      <div class="travel-card-body">
        <div class="travel-card-top">
          <span class="travel-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${getCategoryIconPaths(dest.category)}</svg>
          </span>
          <span class="travel-card-category">${escapeHTML(dest.category)}</span>
        </div>
        ${isPlanned ? `<span class="travel-card-planned"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> In itinerary</span>` : ''}
        <div class="travel-card-main">
          <h3 class="travel-card-title">${escapeHTML(dest.name)}</h3>
          <p class="travel-card-subtitle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${escapeHTML(dest.area || dest.location)}</span>
          </p>
          <h4 class="travel-card-eyebrow">OVERVIEW</h4>
          <p class="travel-card-desc">${description}</p>
          <div class="travel-card-facts">
            <span class="travel-card-fact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
              Est. ${getVisitDuration(dest)}
            </span>
            <span class="travel-card-fact">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${dest.rating}
            </span>
            <span class="travel-card-fact travel-card-fact--fee">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12 12 4H4v8l8 8 8-8z"></path><circle cx="7.5" cy="7.5" r="1"></circle></svg>
              ${feeText}
            </span>
          </div>
        </div>
        <div class="travel-card-reveal">
          <div class="travel-card-price-block">
            <span class="travel-card-price">${feeText}</span>
            <span class="travel-card-price-label">${feeLabel}</span>
          </div>
          <div class="travel-card-actions">
            <button type="button" class="travel-card-btn travel-card-btn-explore btn-show-details" data-id="${dest.id}">
              Explore
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
            <button type="button" class="travel-card-btn travel-card-btn-add btn-quick-itinerary ${isPlanned ? 'is-added' : ''}" data-id="${dest.id}">
              ${isPlanned ? 'Added' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}


/**
 * Lakbay | Explore: Leaflet Map
 * Interactive Baguio map with destination pins.
 */
'use strict';

/* ==========================================================================
   INTERACTIVE BAGUIO LEAFLET MAP
   ========================================================================== */
function initOrUpdateBaguioMap() {
  const mapEl = document.getElementById('baguio-map');
  if (!mapEl) return;

  if (typeof L === 'undefined') {
    mapEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:2rem;text-align:center;color:#10352b;background:rgba(255,255,255,0.75);">
        <div>
          <h4 style="margin-bottom:0.4rem;font-weight:800;">📍 Baguio City Tourist Map</h4>
          <p style="font-size:0.9rem;color:#38554d;max-width:420px;margin:0 auto 0.75rem;">
            To view live interactive map tiles, connect to the internet. All 20 Baguio destinations have precise GPS coordinates configured!
          </p>
          <p style="font-size:0.85rem;color:#5f7e75;">
            You can also click "Open in Google Maps" inside any destination details modal.
          </p>
        </div>
      </div>
    `;
    return;
  }

  if (!appState.mapInstance) {
    appState.mapInstance = L.map('baguio-map').setView([16.4124, 120.5937], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(appState.mapInstance);
  }

  // Clear existing markers
  appState.mapMarkers.forEach(m => appState.mapInstance.removeLayer(m));
  appState.mapMarkers = [];

  // Plot all destinations
  sampleDestinations.forEach(dest => {
    if (!dest.lat || !dest.lng) return;
    const isPlanned = appState.itinerary.some(s => s.destinationId === dest.id);
    const marker = L.marker([dest.lat, dest.lng]).addTo(appState.mapInstance);

    const popupHtml = `
      <div class="map-popup-wrap">
        <strong class="map-popup-title">${escapeHTML(dest.name)}</strong>
        <span class="map-popup-meta">${escapeHTML(dest.category)} · ${dest.fee === 0 ? 'Free' : '₱' + dest.fee}</span>
        <span class="map-popup-meta">📍 ${escapeHTML(dest.area || dest.location)}</span>
        <button type="button" class="map-popup-btn" onclick="showDetails(${dest.id})">
          ${isPlanned ? 'View Stop Details' : 'View Details'}
        </button>
      </div>
    `;
    marker.bindPopup(popupHtml);
    appState.mapMarkers.push(marker);
  });

  setTimeout(() => {
    if (appState.mapInstance) {
      appState.mapInstance.invalidateSize();
    }
  }, 250);
}


/**
 * Lakbay | Screen 3: Destination Details Modal
 * Details dialog with focus trap and focus restore.
 */
'use strict';

/* ==========================================================================
   SCREEN 3: DESTINATION DETAILS MODAL (Focus Trap & Information Rich)
   ========================================================================== */
function setupModalControls() {
  const modal = document.getElementById('destination-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const backdrop = document.getElementById('modal-backdrop');
  const itineraryBtn = document.getElementById('modal-itinerary-btn');

  if (closeBtn) closeBtn.addEventListener('click', closeDetails);
  if (backdrop) backdrop.addEventListener('click', closeDetails);

  // Accessible Escape & Focus Trap
  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display !== 'none') {
      if (e.key === 'Escape') {
        closeDetails();
        return;
      }
      if (e.key === 'Tab') {
        trapFocusInDialog(modal, e);
      }
    }
  });

  // Modal Add to Itinerary
  if (itineraryBtn) {
    itineraryBtn.addEventListener('click', () => {
      if (appState.modalDestinationId !== null) {
        const destId = appState.modalDestinationId;
        closeDetails();
        prefillItineraryForm(destId);
      }
    });
  }
}

function trapFocusInDialog(dialogElement, e) {
  const focusable = dialogElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
}

function showDetails(id) {
  const dest = sampleDestinations.find(d => d.id === id);
  if (!dest) return;

  appState.lastFocusedElement = document.activeElement;
  appState.modalDestinationId = id;

  const modal = document.getElementById('destination-modal');
  const img = document.getElementById('modal-img');
  const title = document.getElementById('modal-title');
  const categoryBadge = document.getElementById('modal-category');
  const feeBadge = document.getElementById('modal-fee');
  const ratingText = document.getElementById('modal-rating-text');
  const locText = document.getElementById('modal-location-text');
  const desc = document.getElementById('modal-description');
  const activitiesWrap = document.getElementById('modal-activities');
  const areaEl = document.getElementById('modal-area');
  const hoursEl = document.getElementById('modal-hours');
  const bestTimeEl = document.getElementById('modal-best-time');
  const howToGetThereEl = document.getElementById('modal-how-to-get-there');
  const tipEl = document.getElementById('modal-tip');
  const gmapsLink = document.getElementById('modal-gmaps-link');

  if (img) {
    img.src = escapeHTML(dest.image);
    img.alt = escapeHTML(dest.name);
  }
  if (title) title.textContent = dest.name;
  if (locText) locText.textContent = dest.location;
  if (desc) desc.textContent = dest.description;
  if (ratingText) ratingText.textContent = dest.rating;

  if (areaEl) areaEl.textContent = dest.area || 'Baguio City';
  if (hoursEl) hoursEl.textContent = dest.openingHours || 'Open daily';
  if (bestTimeEl) bestTimeEl.textContent = dest.bestTimeToVisit || 'Morning to early afternoon';
  if (howToGetThereEl) howToGetThereEl.textContent = dest.howToGetThere || 'Accessible via jeepney or taxi from downtown Baguio.';
  if (tipEl) tipEl.textContent = dest.tip || 'Bring a light jacket as Baguio temperatures can drop suddenly.';

  if (gmapsLink) {
    gmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name + ' Baguio City')}`;
  }

  if (categoryBadge) {
    categoryBadge.textContent = dest.category;
    const categorySlug = dest.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    categoryBadge.className = `badge badge-${categorySlug}`;
  }

  if (feeBadge) {
    feeBadge.textContent = dest.fee === 0 ? 'Free Entry' : `Entrance Fee: ₱${dest.fee}`;
  }

  if (activitiesWrap) {
    activitiesWrap.innerHTML = dest.activities
      .map(act => `<span class="activity-tag">${escapeHTML(act)}</span>`)
      .join('');
  }

  if (modal) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }
}

function closeDetails() {
  const modal = document.getElementById('destination-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  appState.modalDestinationId = null;

  if (appState.lastFocusedElement && typeof appState.lastFocusedElement.focus === 'function') {
    appState.lastFocusedElement.focus();
  }
}

