/**
 * ==============================================================================
 * Lakbay - Travel Destination Explorer & Itinerary Planner
 * Universidad de Dagupan - ITP10 Event-Driven Programming Final Project
 *
 * Implements all 17 event-driven interactions (E1 to E17) defined in the
 * approved Wireframes and Event Map.
 * ==============================================================================
 */

// Application State Object
const appState = {
  currentSection: 'home',
  activeCategory: 'All',
  searchQuery: '',
  sortOrder: 'name-asc',
  favorites: [], // Array of destination IDs: [1, 3, 5]
  itinerary: [], // Array of stop objects: [{ id, destinationId, destinationName, date, time, activity }]
  budget: {
    transportation: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    travelers: 1,
    total: 0,
    perPerson: 0
  },
  modalDestinationId: null
};

// LocalStorage Keys
const STORAGE_KEYS = {
  FAVORITES: 'lakbay_favorites',
  ITINERARY: 'lakbay_itinerary',
  BUDGET: 'lakbay_budget'
};

/* ==========================================================================
   E1: INITIALIZATION & DATA RESTORATION (DOMContentLoaded)
   ========================================================================== */
/**
 * Loads sample destinations, restores saved data from localStorage,
 * renders Home and Explore, and sets up all global event listeners.
 */
function init() {
  console.log('[Lakbay] App initialized. Event E1 triggered.');

  // 1. Restore persistent user data from localStorage
  loadData();

  // 2. Setup Navigation and Section Switching Listeners
  setupNavigation();

  // 3. Populate Itinerary Destination Dropdown
  populateDestinationSelect();

  // 4. Render Initial Views
  renderHomeStats();
  renderFeaturedDestinations();
  renderExploreGallery();
  renderFavoritesList();
  renderItineraryList();
  restoreBudgetInputs();
  calculateBudget();

  // 5. Setup Explore Search, Filter, and Sort Listeners (E3, E4, E5)
  setupExploreControls();

  // 6. Setup Modal Listeners (E6, E7, E8, E10)
  setupModalControls();

  // 7. Setup Itinerary Form Listeners (E11, E13)
  setupItineraryControls();

  // 8. Setup Budget Calculator Listeners (E14, E15, E16)
  setupBudgetControls();

  // 9. Setup Summary Actions (E17)
  setupSummaryControls();

  // Check URL Hash for deep linking (e.g. #explore)
  handleInitialHash();
}

/* ==========================================================================
   LOCALSTORAGE PERSISTENCE (saveData, loadData)
   ========================================================================== */
/**
 * Reads favorites, itinerary, and budget back from localStorage inside init()
 */
function loadData() {
  try {
    const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (savedFavs) {
      appState.favorites = JSON.parse(savedFavs);
    }

    const savedItinerary = localStorage.getItem(STORAGE_KEYS.ITINERARY);
    if (savedItinerary) {
      appState.itinerary = JSON.parse(savedItinerary);
    }

    const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (savedBudget) {
      appState.budget = { ...appState.budget, ...JSON.parse(savedBudget) };
    }
  } catch (err) {
    console.error('[Lakbay] Error loading saved data from localStorage:', err);
  }
}
const loadSavedData = loadData;

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(appState.favorites));
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(appState.itinerary));
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(appState.budget));
    renderHomeStats();
    updateFavoritesBadge();
  } catch (err) {
    console.error('[Lakbay] Error saving data to localStorage:', err);
  }
}

/* ==========================================================================
   E2: NAVIGATION (showSection)
   ========================================================================== */
/**
 * Shows the chosen section, hides others, updates navbar active state,
 * and maintains history hash.
 * @param {string} sectionName - 'home' | 'explore' | 'itinerary' | 'favorites' | 'budget' | 'summary'
 */
function showSection(sectionName) {
  const targetSectionId = `section-${sectionName}`;
  const targetElement = document.getElementById(targetSectionId);

  if (!targetElement) {
    console.warn(`[Lakbay] Section "${sectionName}" not found.`);
    return;
  }

  // Hide all screens
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Activate selected screen
  targetElement.classList.add('active');
  appState.currentSection = sectionName;

  // Update Navigation menu active styles
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-section') === sectionName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Close mobile nav menu if open
  const navLinks = document.getElementById('nav-links');
  if (navLinks && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
  }

  // Smooth scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update browser address bar hash without reloading
  if (window.location.hash !== `#${sectionName}`) {
    history.replaceState(null, '', `#${sectionName}`);
  }

  // Refresh section-specific data
  if (sectionName === 'favorites') {
    renderFavoritesList();
  } else if (sectionName === 'itinerary') {
    renderItineraryList();
  } else if (sectionName === 'home') {
    renderHomeStats();
  }
}

function setupNavigation() {
  // Nav bar links
  const navContainer = document.getElementById('main-nav');
  if (navContainer) {
    navContainer.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-section]');
      if (navBtn) {
        e.preventDefault();
        const section = navBtn.getAttribute('data-section');
        showSection(section);
      }
    });
  }

  // Any button/link in page with data-section (e.g., "Start exploring", stats cards)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-section]');
    if (trigger && !trigger.closest('#main-nav')) {
      e.preventDefault();
      const section = trigger.getAttribute('data-section');
      showSection(section);
    }
  });

  // Mobile hamburger toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

function handleInitialHash() {
  const hash = window.location.hash.replace('#', '');
  const validSections = ['home', 'explore', 'itinerary', 'favorites', 'budget', 'summary'];
  if (validSections.includes(hash)) {
    showSection(hash);
  } else {
    showSection('home');
  }
}

/* ==========================================================================
   SCREEN 1: HOME DASHBOARD (E1, E2, E8)
   ========================================================================== */
function renderHomeStats() {
  const favCountEl = document.getElementById('home-stat-favorites');
  const stopsCountEl = document.getElementById('home-stat-stops');
  const budgetEl = document.getElementById('home-stat-budget');

  if (favCountEl) favCountEl.textContent = appState.favorites.length;
  if (stopsCountEl) stopsCountEl.textContent = appState.itinerary.length;
  if (budgetEl) {
    const formattedBudget = formatCurrency(appState.budget.total || 0);
    budgetEl.textContent = formattedBudget;
  }

  updateFavoritesBadge();
}

function updateFavoritesBadge() {
  const badge = document.getElementById('nav-fav-badge');
  const favHeader = document.getElementById('favorites-count-header');
  const count = appState.favorites.length;

  if (badge) badge.textContent = count;
  if (favHeader) favHeader.textContent = count;
}

function renderFeaturedDestinations() {
  const grid = document.getElementById('home-featured-grid');
  if (!grid) return;

  // Filter 3 featured spots
  const featured = sampleDestinations.filter(d => d.featured).slice(0, 3);
  grid.innerHTML = featured.map(dest => createDestinationCardHTML(dest, true)).join('');
}

/* ==========================================================================
   SCREEN 2: EXPLORE GALLERY (E3, E4, E5, E6, E8)
   ========================================================================== */
function setupExploreControls() {
  // E3: Search input
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value.trim().toLowerCase();
      if (searchClearBtn) {
        searchClearBtn.style.display = appState.searchQuery ? 'block' : 'none';
      }
      searchDestinations();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      appState.searchQuery = '';
      searchClearBtn.style.display = 'none';
      searchDestinations();
    });
  }

  // E4: Category chips
  const chipsContainer = document.getElementById('category-chips-container');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const category = chip.getAttribute('data-category');
        filterByCategory(category);
      }
    });
  }

  // E5: Sort dropdown
  const sortDropdown = document.getElementById('sort-dropdown');
  if (sortDropdown) {
    sortDropdown.addEventListener('change', (e) => {
      appState.sortOrder = e.target.value;
      sortDestinations();
    });
  }

  // Reset Filters button inside empty state
  const resetBtn = document.getElementById('btn-reset-explore-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      appState.searchQuery = '';
      appState.activeCategory = 'All';
      appState.sortOrder = 'name-asc';

      if (chipsContainer) {
        chipsContainer.querySelectorAll('.chip').forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-category') === 'All');
        });
      }
      if (sortDropdown) sortDropdown.value = 'name-asc';
      if (searchClearBtn) searchClearBtn.style.display = 'none';

      renderExploreGallery();
    });
  }

  // Gallery Card Event Delegation for Details (E6) and Favorite (E8)
  const exploreGrid = document.getElementById('explore-cards-grid');
  if (exploreGrid) {
    exploreGrid.addEventListener('click', (e) => {
      // E8: Click Heart Button
      const heartBtn = e.target.closest('.card-heart-btn');
      if (heartBtn) {
        e.stopPropagation();
        const id = parseInt(heartBtn.getAttribute('data-id'), 10);
        toggleFavorite(id);
        return;
      }

      // E6: Click Details Button
      const detailsBtn = e.target.closest('.btn-show-details');
      if (detailsBtn) {
        e.stopPropagation();
        const id = parseInt(detailsBtn.getAttribute('data-id'), 10);
        showDetails(id);
      }
    });
  }

  // Home Featured Grid Event Delegation for Details (E6) and Favorite (E8)
  const homeGrid = document.getElementById('home-featured-grid');
  if (homeGrid) {
    homeGrid.addEventListener('click', (e) => {
      const heartBtn = e.target.closest('.card-heart-btn');
      if (heartBtn) {
        e.stopPropagation();
        const id = parseInt(heartBtn.getAttribute('data-id'), 10);
        toggleFavorite(id);
        return;
      }
      const detailsBtn = e.target.closest('.btn-show-details');
      if (detailsBtn) {
        e.stopPropagation();
        const id = parseInt(detailsBtn.getAttribute('data-id'), 10);
        showDetails(id);
      }
    });
  }
}

/**
 * E3: Filters destinations based on search keyword
 */
function searchDestinations() {
  renderExploreGallery();
}

/**
 * E4: Filters destinations based on selected category chip
 * @param {string} category - 'All' | 'Beaches' | 'Mountains' | 'Historical' | 'Adventure'
 */
function filterByCategory(category) {
  appState.activeCategory = category;
  renderExploreGallery();
}

/**
 * E5: Sorts visible destinations by name or entrance fee
 */
function sortDestinations() {
  renderExploreGallery();
}

/**
 * Computes the filtered & sorted destination list and updates the DOM
 */
function renderExploreGallery() {
  const grid = document.getElementById('explore-cards-grid');
  const emptyState = document.getElementById('explore-empty-state');
  const countText = document.getElementById('results-count-text');
  if (!grid) return;

  // 1. Filter by category
  let list = sampleDestinations.filter(item => {
    if (appState.activeCategory === 'All') return true;
    return item.category.toLowerCase() === appState.activeCategory.toLowerCase();
  });

  // 2. Filter by search query (Name, Activities, Location, Description)
  if (appState.searchQuery) {
    const q = appState.searchQuery;
    list = list.filter(item => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchLocation = item.location.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchActivities = item.activities.some(act => act.toLowerCase().includes(q));
      return matchName || matchLocation || matchDesc || matchActivities;
    });
  }

  // 3. Sort list
  list.sort((a, b) => {
    if (appState.sortOrder === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (appState.sortOrder === 'name-desc') {
      return b.name.localeCompare(a.name);
    } else if (appState.sortOrder === 'fee-asc') {
      return a.fee - b.fee;
    } else if (appState.sortOrder === 'fee-desc') {
      return b.fee - a.fee;
    }
    return 0;
  });

  // 4. Update count label
  if (countText) {
    countText.textContent = `Showing ${list.length} destination${list.length === 1 ? '' : 's'}`;
  }

  // 5. Render cards or empty state
  if (list.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = list.map(dest => createDestinationCardHTML(dest)).join('');
  }
}

/**
 * Template Helper: Generates HTML string for a destination card
 */
function createDestinationCardHTML(dest, isFeatured = false) {
  const isFav = appState.favorites.includes(dest.id);
  const badgeClass = `badge-${dest.category.toLowerCase()}`;
  const feeText = dest.fee === 0 ? 'Free Entry' : `Fee: ₱ ${dest.fee}`;

  return `
    <article class="destination-card" data-id="${dest.id}">
      <div class="card-image-wrap">
        <img 
          src="${dest.image}" 
          alt="${dest.name}" 
          class="card-img" 
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'"
        >
        <button 
          type="button" 
          class="card-heart-btn ${isFav ? 'active' : ''}" 
          data-id="${dest.id}" 
          aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
          title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="card-content">
        <div class="card-meta-row">
          <span class="badge ${badgeClass}">${dest.category}</span>
          <span class="card-fee-text ${dest.fee === 0 ? '' : 'card-fee-highlight'}">${feeText}</span>
        </div>
        <h3 class="card-title">${dest.name}</h3>
        <p class="card-location">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${dest.location}
        </p>
        <div class="card-actions">
          <button type="button" class="btn btn-outline btn-sm btn-show-details" data-id="${dest.id}">
            Details
          </button>
          <button type="button" class="btn btn-primary btn-sm btn-quick-itinerary" data-id="${dest.id}">
            + Itinerary
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   SCREEN 3: DESTINATION DETAILS MODAL (E6, E7, E8, E10)
   ========================================================================== */
function setupModalControls() {
  const modal = document.getElementById('destination-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const backdrop = document.getElementById('modal-backdrop');
  const favBtn = document.getElementById('modal-fav-btn');
  const itineraryBtn = document.getElementById('modal-itinerary-btn');

  // E7: Close modal via X button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDetails);
  }

  // E7: Close modal via backdrop click
  if (backdrop) {
    backdrop.addEventListener('click', closeDetails);
  }

  // E7: Close modal via Esc keypress
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (modal && modal.style.display !== 'none') {
        closeDetails();
      }
    }
  });

  // Modal Favorite Toggle (E8)
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      if (appState.modalDestinationId !== null) {
        toggleFavorite(appState.modalDestinationId);
        updateModalFavoriteButtonState(appState.modalDestinationId);
      }
    });
  }

  // Modal Jump to Itinerary (E10)
  if (itineraryBtn) {
    itineraryBtn.addEventListener('click', () => {
      if (appState.modalDestinationId !== null) {
        const destId = appState.modalDestinationId;
        closeDetails();
        prefillItineraryForm(destId);
      }
    });
  }

  // Card Quick Itinerary button delegation
  document.addEventListener('click', (e) => {
    const quickBtn = e.target.closest('.btn-quick-itinerary');
    if (quickBtn) {
      e.stopPropagation();
      const id = parseInt(quickBtn.getAttribute('data-id'), 10);
      prefillItineraryForm(id);
    }
  });
}

/**
 * E6: Opens the Destination Details Modal
 * @param {number} id - Destination ID
 */
function showDetails(id) {
  const dest = sampleDestinations.find(d => d.id === id);
  if (!dest) return;

  appState.modalDestinationId = id;
  const modal = document.getElementById('destination-modal');

  // Populate Modal Fields
  const img = document.getElementById('modal-img');
  const title = document.getElementById('modal-title');
  const categoryBadge = document.getElementById('modal-category');
  const feeBadge = document.getElementById('modal-fee');
  const locText = document.getElementById('modal-location-text');
  const desc = document.getElementById('modal-description');
  const activitiesWrap = document.getElementById('modal-activities');

  if (img) {
    img.src = dest.image;
    img.alt = dest.name;
  }
  if (title) title.textContent = dest.name;
  if (locText) locText.textContent = dest.location;
  if (desc) desc.textContent = dest.description;

  if (categoryBadge) {
    categoryBadge.textContent = dest.category;
    categoryBadge.className = `badge badge-${dest.category.toLowerCase()}`;
  }

  if (feeBadge) {
    feeBadge.textContent = dest.fee === 0 ? 'Free Entry' : `Entrance Fee: ₱ ${dest.fee}`;
  }

  if (activitiesWrap) {
    activitiesWrap.innerHTML = dest.activities
      .map(act => `<span class="activity-tag">✨ ${act}</span>`)
      .join('');
  }

  updateModalFavoriteButtonState(id);

  // Show Modal
  if (modal) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

/**
 * E7: Closes the Destination Details Modal
 */
function closeDetails() {
  const modal = document.getElementById('destination-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  appState.modalDestinationId = null;
}

function updateModalFavoriteButtonState(id) {
  const favBtn = document.getElementById('modal-fav-btn');
  const favBtnText = document.getElementById('modal-fav-btn-text');
  if (!favBtn || !favBtnText) return;

  const isFav = appState.favorites.includes(id);
  const heartSvg = favBtn.querySelector('svg');

  if (isFav) {
    favBtnText.textContent = 'Remove favorite';
    favBtn.classList.add('btn-outline-danger');
    favBtn.classList.remove('btn-outline');
    if (heartSvg) {
      heartSvg.setAttribute('fill', '#ef4444');
      heartSvg.setAttribute('stroke', '#ef4444');
    }
  } else {
    favBtnText.textContent = 'Save to favorites';
    favBtn.classList.remove('btn-outline-danger');
    favBtn.classList.add('btn-outline');
    if (heartSvg) {
      heartSvg.setAttribute('fill', 'none');
      heartSvg.setAttribute('stroke', 'currentColor');
    }
  }
}

/* ==========================================================================
   SCREEN 5: FAVORITES (E8, E9, E10)
   ========================================================================== */
/**
 * E8: Toggles favorite bookmark on/off and updates storage & UI
 * @param {number} id - Destination ID
 */
function toggleFavorite(id) {
  const index = appState.favorites.indexOf(id);
  const dest = sampleDestinations.find(d => d.id === id);
  const destName = dest ? dest.name : 'Destination';

  if (index > -1) {
    // Remove
    appState.favorites.splice(index, 1);
    showToast(`Removed "${destName}" from favorites.`, 'info');
  } else {
    // Add
    appState.favorites.push(id);
    showToast(`Saved "${destName}" to favorites! ❤️`, 'success');
  }

  saveData();

  // Re-render UI components reflecting favorite state
  renderHomeStats();
  renderExploreGallery();
  renderFeaturedDestinations();
  renderFavoritesList();
}

/**
 * E9: Removes a destination directly from Favorites section
 * @param {number} id - Destination ID
 */
function removeFavorite(id) {
  const index = appState.favorites.indexOf(id);
  if (index > -1) {
    const dest = sampleDestinations.find(d => d.id === id);
    appState.favorites.splice(index, 1);
    saveData();
    renderFavoritesList();
    renderHomeStats();
    renderExploreGallery();
    renderFeaturedDestinations();
    showToast(`Removed "${dest ? dest.name : 'Destination'}" from favorites.`, 'info');
  }
}

/**
 * Renders the saved favorites grid or empty state
 */
function renderFavoritesList() {
  const grid = document.getElementById('favorites-grid');
  const emptyState = document.getElementById('favorites-empty-state');
  if (!grid) return;

  const favList = sampleDestinations.filter(d => appState.favorites.includes(d.id));

  if (favList.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = favList.map(dest => `
      <article class="destination-card favorite-card" data-id="${dest.id}">
        <div class="card-image-wrap">
          <img src="${dest.image}" alt="${dest.name}" class="card-img" loading="lazy">
        </div>
        <div class="card-content">
          <div class="card-meta-row">
            <span class="badge badge-${dest.category.toLowerCase()}">${dest.category}</span>
            <span class="card-fee-text">${dest.fee === 0 ? 'Free' : `₱ ${dest.fee}`}</span>
          </div>
          <h3 class="card-title">${dest.name}</h3>
          <p class="card-location">${dest.location}</p>
          <div class="favorite-actions">
            <button type="button" class="btn btn-outline-danger btn-sm btn-remove-fav" data-id="${dest.id}">
              Remove
            </button>
            <button type="button" class="btn btn-primary btn-sm btn-fav-itinerary" data-id="${dest.id}">
              Add to itinerary
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Bind removal & itinerary jumps inside Favorites section
  grid.onclick = (e) => {
    const removeBtn = e.target.closest('.btn-remove-fav');
    if (removeBtn) {
      const id = parseInt(removeBtn.getAttribute('data-id'), 10);
      removeFavorite(id);
      return;
    }

    const itBtn = e.target.closest('.btn-fav-itinerary');
    if (itBtn) {
      const id = parseInt(itBtn.getAttribute('data-id'), 10);
      prefillItineraryForm(id);
    }
  };
}

/* ==========================================================================
   SCREEN 4: ITINERARY PLANNER (E10, E11, E12, E13)
   ========================================================================== */
function populateDestinationSelect() {
  const select = document.getElementById('itinerary-destination');
  if (!select) return;

  // Clear existing options except default placeholder
  select.innerHTML = '<option value="" disabled selected>Choose a destination</option>';

  sampleDestinations.forEach(dest => {
    const opt = document.createElement('option');
    opt.value = dest.id;
    opt.textContent = `${dest.name} (${dest.category} - ${dest.fee === 0 ? 'Free' : '₱' + dest.fee})`;
    select.appendChild(opt);
  });
}

/**
 * E10: Prefills the Itinerary form with the selected destination and navigates to Screen 4
 * @param {number} destinationId
 */
function prefillItineraryForm(destinationId) {
  showSection('itinerary');

  const select = document.getElementById('itinerary-destination');
  if (select) {
    select.value = destinationId;
  }

  // Pre-fill suggested default activity if empty
  const actInput = document.getElementById('itinerary-activity');
  const dest = sampleDestinations.find(d => d.id === destinationId);
  if (actInput && dest && dest.activities.length > 0 && !actInput.value.trim()) {
    actInput.value = dest.activities[0];
  }

  // Default date to today if empty
  const dateInput = document.getElementById('itinerary-date');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Focus time input for quick entry
  const timeInput = document.getElementById('itinerary-time');
  if (timeInput && !timeInput.value) {
    timeInput.value = '09:00';
    timeInput.focus();
  }

  showToast(`Selected "${dest ? dest.name : 'Destination'}" for your itinerary.`, 'info');
}

function setupItineraryControls() {
  const form = document.getElementById('itinerary-form');
  const clearBtn = document.getElementById('btn-clear-itinerary');
  const itemsList = document.getElementById('itinerary-items-list');

  // E11: Submit Itinerary Form
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isValid = validateItineraryForm();
      if (isValid) {
        addStop();
      }
    });
  }

  // E13: Clear all stops
  if (clearBtn) {
    clearBtn.addEventListener('click', clearItinerary);
  }

  // E12: Delete single stop via delegation
  if (itemsList) {
    itemsList.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.stop-delete-btn');
      if (delBtn) {
        const stopId = parseInt(delBtn.getAttribute('data-id'), 10);
        deleteStop(stopId);
      }
    });
  }

  // Clear field errors as user types
  ['itinerary-destination', 'itinerary-date', 'itinerary-time', 'itinerary-activity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.classList.remove('is-invalid');
        const errSpan = document.getElementById(`error-${id}`);
        if (errSpan) errSpan.textContent = '';
      });
    }
  });
}

/**
 * Validates Itinerary form inputs; displays red error messages under fields
 * @returns {boolean}
 */
function validateItineraryForm() {
  let isValid = true;

  const destSelect = document.getElementById('itinerary-destination');
  const dateInput = document.getElementById('itinerary-date');
  const timeInput = document.getElementById('itinerary-time');
  const actInput = document.getElementById('itinerary-activity');

  const errorDest = document.getElementById('error-itinerary-destination');
  const errorDate = document.getElementById('error-itinerary-date');
  const errorTime = document.getElementById('error-itinerary-time');
  const errorAct = document.getElementById('error-itinerary-activity');
  const bannerError = document.getElementById('itinerary-form-error');
  const bannerSuccess = document.getElementById('itinerary-form-success');

  // Reset error states
  [destSelect, dateInput, timeInput, actInput].forEach(el => el.classList.remove('is-invalid'));
  [errorDest, errorDate, errorTime, errorAct].forEach(el => el.textContent = '');
  if (bannerError) bannerError.style.display = 'none';
  if (bannerSuccess) bannerSuccess.style.display = 'none';

  // 1. Destination check
  if (!destSelect.value) {
    destSelect.classList.add('is-invalid');
    if (errorDest) errorDest.textContent = 'Please choose a destination.';
    isValid = false;
  }

  // 2. Date check (Wireframe explicit error: "Please choose a date.")
  if (!dateInput.value) {
    dateInput.classList.add('is-invalid');
    if (errorDate) errorDate.textContent = 'Please choose a date.';
    isValid = false;
  }

  // 3. Time check
  if (!timeInput.value) {
    timeInput.classList.add('is-invalid');
    if (errorTime) errorTime.textContent = 'Please select a planned time.';
    isValid = false;
  }

  // 4. Activity check
  if (!actInput.value.trim()) {
    actInput.classList.add('is-invalid');
    if (errorAct) errorAct.textContent = 'Please describe the planned activity.';
    isValid = false;
  }

  if (!isValid && bannerError) {
    bannerError.textContent = 'Please complete all required fields.';
    bannerError.style.display = 'block';
  }

  return isValid;
}

/**
 * E11: Adds a new validated stop, sorts stops chronologically, and saves
 */
function addStop() {
  const destSelect = document.getElementById('itinerary-destination');
  const dateInput = document.getElementById('itinerary-date');
  const timeInput = document.getElementById('itinerary-time');
  const actInput = document.getElementById('itinerary-activity');
  const bannerSuccess = document.getElementById('itinerary-form-success');

  const destId = parseInt(destSelect.value, 10);
  const destObj = sampleDestinations.find(d => d.id === destId);

  const newStop = {
    id: Date.now(), // Unique timestamp ID
    destinationId: destId,
    destinationName: destObj ? destObj.name : 'Destination',
    category: destObj ? destObj.category : '',
    fee: destObj ? destObj.fee : 0,
    date: dateInput.value,
    time: timeInput.value,
    activity: actInput.value.trim()
  };

  appState.itinerary.push(newStop);

  // Wireframe Requirement: "Stops are sorted by date and time each time one is added."
  sortItineraryChronologically();

  // Save to localStorage
  saveData();

  // Refresh display
  renderItineraryList();
  renderHomeStats();

  // Show green success alert (Wireframe explicit: "Stop added to your itinerary.")
  if (bannerSuccess) {
    bannerSuccess.textContent = 'Stop added to your itinerary.';
    bannerSuccess.style.display = 'block';
    setTimeout(() => {
      bannerSuccess.style.display = 'none';
    }, 3500);
  }

  showToast(`Added stop: "${newStop.destinationName}"`, 'success');

  // Reset activity input but keep date for consecutive scheduling
  actInput.value = '';
}

/**
 * Sorts the itinerary array chronologically by date ascending, then time ascending
 */
function sortItineraryChronologically() {
  appState.itinerary.sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    return dateTimeA - dateTimeB;
  });
}

/**
 * E12: Deletes a single stop from the itinerary list
 * @param {number} stopId
 */
function deleteStop(stopId) {
  const index = appState.itinerary.findIndex(s => s.id === stopId);
  if (index > -1) {
    const deleted = appState.itinerary.splice(index, 1)[0];
    saveData();
    renderItineraryList();
    renderHomeStats();
    showToast(`Removed "${deleted.destinationName}" from itinerary.`, 'info');
  }
}

/**
 * E13: Clears all stops with confirmation
 */
function clearItinerary() {
  if (appState.itinerary.length === 0) {
    showToast('Your itinerary is already empty.', 'info');
    return;
  }

  const confirmed = window.confirm('Are you sure you want to clear all itinerary stops?');
  if (confirmed) {
    appState.itinerary = [];
    saveData();
    renderItineraryList();
    renderHomeStats();
    showToast('All itinerary stops cleared.', 'info');
  }
}

/**
 * Renders the sorted itinerary list with relative Day labels matching wireframe
 */
function renderItineraryList() {
  const container = document.getElementById('itinerary-items-list');
  const emptyState = document.getElementById('itinerary-empty-state');
  const countSpan = document.getElementById('itinerary-count');

  if (!container) return;

  const count = appState.itinerary.length;
  if (countSpan) countSpan.textContent = count;

  if (count === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Compute distinct sorted dates to assign Day 1, Day 2, etc.
  const uniqueDates = [...new Set(appState.itinerary.map(s => s.date))].sort();

  container.innerHTML = appState.itinerary.map(stop => {
    const dayIndex = uniqueDates.indexOf(stop.date) + 1;
    const dayLabel = `Day ${dayIndex}`;

    return `
      <div class="itinerary-stop-card" data-id="${stop.id}">
        <div class="stop-time-badge">
          <span class="stop-day">${dayLabel}</span>
          <span class="stop-clock">${stop.time}</span>
        </div>
        <div class="stop-details">
          <h4>${escapeHTML(stop.destinationName)}</h4>
          <p class="stop-activity">${escapeHTML(stop.activity)}</p>
          <small style="color: #94a3b8; font-size: 0.78rem;">📅 ${formatDate(stop.date)}</small>
        </div>
        <button type="button" class="stop-delete-btn" data-id="${stop.id}" title="Delete stop">
          Delete
        </button>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   SCREEN 6: BUDGET CALCULATOR (E14, E15, E16)
   ========================================================================== */
function setupBudgetControls() {
  const calcInputs = document.querySelectorAll('.budget-calc-input');
  const saveBtn = document.getElementById('btn-save-budget');
  const resetBtn = document.getElementById('btn-reset-budget');

  // E14: Live input computation
  calcInputs.forEach(input => {
    input.addEventListener('input', () => {
      calculateBudget();
    });
  });

  // E15: Click Save budget -> validateBudget(), saveData()
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (validateBudget()) {
        calculateBudget();
        saveData();

        const successBanner = document.getElementById('budget-success-msg');
        if (successBanner) {
          successBanner.textContent = '✓ Budget saved.';
          successBanner.style.display = 'block';
          setTimeout(() => {
            successBanner.style.display = 'none';
          }, 3500);
        }

        showToast('Budget successfully saved! 💰', 'success');
      }
    });
  }

  // E16: Reset budget
  if (resetBtn) {
    resetBtn.addEventListener('click', resetBudget);
  }
}

/**
 * Restores saved values into form inputs
 */
function restoreBudgetInputs() {
  const b = appState.budget;
  const trans = document.getElementById('budget-transportation');
  const acc = document.getElementById('budget-accommodation');
  const food = document.getElementById('budget-food');
  const act = document.getElementById('budget-activities');
  const trav = document.getElementById('budget-travelers');

  if (trans) trans.value = b.transportation || '';
  if (acc) acc.value = b.accommodation || '';
  if (food) food.value = b.food || '';
  if (act) act.value = b.activities || '';
  if (trav) trav.value = b.travelers || 1;
}

/**
 * E14: Computes total and per-traveler budget live as user types
 */
function calculateBudget() {
  const transInput = document.getElementById('budget-transportation');
  const accInput = document.getElementById('budget-accommodation');
  const foodInput = document.getElementById('budget-food');
  const actInput = document.getElementById('budget-activities');
  const travInput = document.getElementById('budget-travelers');

  const transVal = parseFloat(transInput ? transInput.value : 0) || 0;
  const accVal = parseFloat(accInput ? accInput.value : 0) || 0;
  const foodVal = parseFloat(foodInput ? foodInput.value : 0) || 0;
  const actVal = parseFloat(actInput ? actInput.value : 0) || 0;
  const travelers = Math.max(1, parseInt(travInput ? travInput.value : 1, 10) || 1);

  const total = transVal + accVal + foodVal + actVal;
  const perTraveler = total / travelers;

  // Update State
  appState.budget = {
    transportation: transVal,
    accommodation: accVal,
    food: foodVal,
    activities: actVal,
    travelers: travelers,
    total: total,
    perPerson: perTraveler
  };

  // Update Display elements
  const totalDisplay = document.getElementById('display-total-budget');
  const perTravelerDisplay = document.getElementById('display-per-traveler');
  const bdTrans = document.getElementById('summary-breakdown-trans');
  const bdAcc = document.getElementById('summary-breakdown-acc');
  const bdFood = document.getElementById('summary-breakdown-food');
  const bdAct = document.getElementById('summary-breakdown-act');
  const bdCount = document.getElementById('summary-breakdown-count');

  if (totalDisplay) totalDisplay.textContent = formatCurrency(total);
  if (perTravelerDisplay) perTravelerDisplay.textContent = formatCurrency(perTraveler);
  if (bdTrans) bdTrans.textContent = formatCurrency(transVal);
  if (bdAcc) bdAcc.textContent = formatCurrency(accVal);
  if (bdFood) bdFood.textContent = formatCurrency(foodVal);
  if (bdAct) bdAct.textContent = formatCurrency(actVal);
  if (bdCount) bdCount.textContent = `${travelers} traveler${travelers > 1 ? 's' : ''}`;
}

/**
 * E15: Validates budget inputs.
 * Empty, negative or non-numeric values show an error; returns boolean.
 * @returns {boolean}
 */
function validateBudget() {
  const transInput = document.getElementById('budget-transportation');
  const accInput = document.getElementById('budget-accommodation');
  const foodInput = document.getElementById('budget-food');
  const actInput = document.getElementById('budget-activities');
  const travInput = document.getElementById('budget-travelers');

  const errorBanner = document.getElementById('budget-error-msg');
  const successBanner = document.getElementById('budget-success-msg');

  if (errorBanner) errorBanner.style.display = 'none';
  if (successBanner) successBanner.style.display = 'none';

  let isValid = true;
  const costInputs = [transInput, accInput, foodInput, actInput];

  // Clear previous field errors
  ['budget-transportation', 'budget-accommodation', 'budget-food', 'budget-activities', 'budget-travelers'].forEach(id => {
    const el = document.getElementById(id);
    const err = document.getElementById(`error-${id}`);
    if (el) el.classList.remove('is-invalid');
    if (err) err.textContent = '';
  });

  // Check each cost input: empty, non-numeric, or negative
  costInputs.forEach(input => {
    if (!input) return;
    const valStr = input.value.trim();
    const valNum = Number(valStr);

    if (valStr === '' || isNaN(valNum) || valNum < 0) {
      isValid = false;
      input.classList.add('is-invalid');
      const errSpan = document.getElementById(`error-${input.id}`);
      if (errSpan) {
        errSpan.textContent = 'Enter a number of 0 or more.';
      }
    }
  });

  // Check travelers input: must be >= 1 integer
  if (travInput) {
    const travStr = travInput.value.trim();
    const travNum = Number(travStr);
    if (travStr === '' || isNaN(travNum) || travNum < 1) {
      isValid = false;
      travInput.classList.add('is-invalid');
      const errSpan = document.getElementById('error-budget-travelers');
      if (errSpan) {
        errSpan.textContent = 'Enter a number of 1 or more travelers.';
      }
    }
  }

  if (!isValid && errorBanner) {
    errorBanner.textContent = 'Enter a number of 0 or more.';
    errorBanner.style.display = 'block';
  }

  return isValid;
}

/**
 * Backward compatibility alias for saveBudget
 */
function saveBudget() {
  if (validateBudget()) {
    calculateBudget();
    saveData();
    const successBanner = document.getElementById('budget-success-msg');
    if (successBanner) {
      successBanner.textContent = '✓ Budget saved.';
      successBanner.style.display = 'block';
      setTimeout(() => {
        successBanner.style.display = 'none';
      }, 3500);
    }
    showToast('Budget successfully saved! 💰', 'success');
  }
}

/**
 * E16: Clears budget inputs back to 0 and clears the saved budget from localStorage
 */
function resetBudget() {
  const inputs = [
    'budget-transportation',
    'budget-accommodation',
    'budget-food',
    'budget-activities'
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    const err = document.getElementById(`error-${id}`);
    if (el) {
      el.value = '0';
      el.classList.remove('is-invalid');
    }
    if (err) err.textContent = '';
  });

  const travInput = document.getElementById('budget-travelers');
  const travErr = document.getElementById('error-budget-travelers');
  if (travInput) {
    travInput.value = '1';
    travInput.classList.remove('is-invalid');
  }
  if (travErr) travErr.textContent = '';

  const errorBanner = document.getElementById('budget-error-msg');
  const successBanner = document.getElementById('budget-success-msg');
  if (errorBanner) errorBanner.style.display = 'none';
  if (successBanner) successBanner.style.display = 'none';

  // Clear saved budget in localStorage and appState
  localStorage.removeItem(STORAGE_KEYS.BUDGET);
  appState.budget = {
    transportation: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    travelers: 1,
    total: 0,
    perPerson: 0
  };

  calculateBudget();
  renderHomeStats();

  showToast('Fields returned to 0 and saved budget cleared.', 'info');
}

/* ==========================================================================
   SCREEN 7: TRAVEL PLAN SUMMARY (E17)
   ========================================================================== */
function setupSummaryControls() {
  const genBtn = document.getElementById('btn-generate-summary');
  const printBtn = document.getElementById('btn-print-summary');

  // E17: Click Generate summary -> buildSummary()
  if (genBtn) {
    genBtn.addEventListener('click', buildSummary);
  }

  // Print summary report
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/**
 * E17: Plan Summary - Click Generate summary
 * Summary shows favorites, itinerary and budget total, or an empty state.
 */
function buildSummary() {
  const reportCard = document.getElementById('summary-report-card');
  const emptyState = document.getElementById('summary-empty-state');
  const printBtn = document.getElementById('btn-print-summary');

  const favs = sampleDestinations.filter(d => appState.favorites.includes(d.id));
  const stops = appState.itinerary;
  const budget = appState.budget;

  const hasData = favs.length > 0 || stops.length > 0 || (budget && budget.total > 0);

  if (!hasData) {
    if (reportCard) reportCard.style.display = 'none';
    if (printBtn) printBtn.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    showToast('Nothing to summarize yet. Add favorites, stops or a budget.', 'info');
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (reportCard) reportCard.style.display = 'block';
  if (printBtn) printBtn.style.display = 'inline-flex';

  // 1. Render Favorites in Summary
  const favTagsContainer = document.getElementById('summary-fav-tags');
  if (favTagsContainer) {
    if (favs.length === 0) {
      favTagsContainer.innerHTML = '<span style="color: #94a3b8; font-style: italic;">No favorite places bookmarked.</span>';
    } else {
      favTagsContainer.innerHTML = favs.map(f => `
        <span class="summary-fav-pill">📍 ${escapeHTML(f.name)} (${f.category})</span>
      `).join('');
    }
  }

  // 2. Render Itinerary in Summary
  const itineraryContainer = document.getElementById('summary-itinerary-list');
  if (itineraryContainer) {
    if (stops.length === 0) {
      itineraryContainer.innerHTML = '<span style="color: #94a3b8; font-style: italic;">No planned stops yet.</span>';
    } else {
      const uniqueDates = [...new Set(stops.map(s => s.date))].sort();
      itineraryContainer.innerHTML = stops.map(stop => {
        const dayNum = uniqueDates.indexOf(stop.date) + 1;
        return `
          <div class="summary-itinerary-item">
            <span class="summary-time-tag">Day ${dayNum} · ${stop.time}</span>
            <span class="summary-itinerary-text">
              <strong>${escapeHTML(stop.destinationName)}</strong>: ${escapeHTML(stop.activity)}
            </span>
          </div>
        `;
      }).join('');
    }
  }

  // 3. Render Budget in Summary
  const subtotalEl = document.getElementById('summary-cost-subtotal');
  const totalEl = document.getElementById('summary-cost-total');
  const perPersonEl = document.getElementById('summary-cost-per-person');
  const travelersEl = document.getElementById('summary-cost-travelers');

  const total = budget.total || 0;
  const travelers = budget.travelers || 1;
  const perPerson = total / travelers;

  if (subtotalEl) subtotalEl.textContent = formatCurrency(total);
  if (totalEl) totalEl.textContent = formatCurrency(total);
  if (perPersonEl) perPersonEl.textContent = formatCurrency(perPerson);
  if (travelersEl) travelersEl.textContent = travelers;

  showToast('Trip plan summary generated! 📋', 'success');
}
const generateSummary = buildSummary; // Alias for backward compatibility

/* ==========================================================================
   UTILITY & HELPER FUNCTIONS
   ========================================================================== */
/**
 * Formats a number to Philippine Peso currency format (₱ 0.00)
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₱ ' + num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formats a date string (YYYY-MM-DD) into readable format
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

/**
 * Escapes HTML characters to prevent XSS in user input strings
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

/**
 * Displays floating toast notification
 * @param {string} message
 * @param {'success'|'info'|'danger'} type
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  }, 2800);
}

/* ==========================================================================
   ATTACH E1 ENTRY POINT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', init);
