/**
 * Lakbay | Core: Storage
 * Safe localStorage / sessionStorage persistence with try/catch and schema validation.
 */
'use strict';

/* ==========================================================================
   SAFE LOCALSTORAGE PERSISTENCE (Isolated Try/Catch & Shape Validation)
   ========================================================================== */
function loadData() {
  // Cleanup: remove leftover favorites data from older versions
  try {
    localStorage.removeItem('lakbay_favorites');
  } catch (err) {
    // ignore
  }

  // 2. Itinerary: validate array, drop orphaned stops with nonexistent destinationId
  try {
    const savedItinerary = localStorage.getItem(STORAGE_KEYS.ITINERARY);
    if (savedItinerary) {
      const parsed = JSON.parse(savedItinerary);
      if (Array.isArray(parsed)) {
        appState.itinerary = parsed
          .filter(stop => {
            if (!stop || typeof stop !== 'object') return false;
            const destId = Number(stop.destinationId);
            return sampleDestinations.some(d => d.id === destId) && stop.date && stop.time;
          })
          .map(stop => {
            const destObj = sampleDestinations.find(d => d.id === Number(stop.destinationId));
            return {
              id: String(stop.id || generateUniqueId()),
              destinationId: Number(stop.destinationId),
              destinationName: destObj ? destObj.name : (stop.destinationName || 'Destination'),
              category: destObj ? destObj.category : (stop.category || ''),
              fee: destObj ? destObj.fee : (Number(stop.fee) || 0),
              date: String(stop.date),
              time: String(stop.time),
              duration: Math.max(15, parseInt(stop.duration, 10) || 90),
              activity: String(stop.activity || '')
            };
          });
      }
    }
  } catch (err) {
    console.warn('[Lakbay] Invalid itinerary data in storage. Resetting.', err);
    appState.itinerary = [];
  }

  // 3. Budget: validate object and sanitize numbers
  try {
    const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (savedBudget) {
      const parsed = JSON.parse(savedBudget);
      if (parsed && typeof parsed === 'object') {
        appState.budget = {
          days: Math.max(1, parseInt(parsed.days, 10) || 1),
          travelers: Math.max(1, parseInt(parsed.travelers, 10) || 1),
          transportation: Math.max(0, parseFloat(parsed.transportation) || 0),
          accommodation: Math.max(0, parseFloat(parsed.accommodation) || 0),
          food: Math.max(0, parseFloat(parsed.food) || 0),
          activities: Math.max(0, parseFloat(parsed.activities) || 0),
          extraActivities: Math.max(0, parseFloat(parsed.extraActivities) || 0),
          total: Math.max(0, parseFloat(parsed.total) || 0),
          perPerson: Math.max(0, parseFloat(parsed.perPerson) || 0)
        };
      }
    }
  } catch (err) {
    console.warn('[Lakbay] Invalid budget data in storage. Resetting.', err);
  }

    // 4. Load Trip Setup / Budget Range
  try {
    const savedTrip = localStorage.getItem(STORAGE_KEYS.TRIP);
    if (savedTrip) {
      const parsed = JSON.parse(savedTrip);
      if (parsed && typeof parsed === 'object') {
        const bMin = Math.max(500, parseInt(parsed.budgetMin, 10) || 1500);
        const bMax = Math.max(bMin, parseInt(parsed.budgetMax, 10) || 3500);
        const days = Math.max(1, parseInt(parsed.days, 10) || 2);
        const confirmed = Boolean(parsed.budgetConfirmed);
        appState.trip = {
          name: parsed.name ? String(parsed.name).trim() : 'Baguio Mountain Holiday',
          city: parsed.city ? String(parsed.city).trim() : 'Baguio City',
          days: days,
          startDate: parsed.startDate || getTodayDateString(),
          budgetMin: bMin,
          budgetMax: bMax,
          budgetConfirmed: confirmed
        };
        appState.hasConfirmedBudget = confirmed;
      }
    }
  } catch (err) {
    console.warn('[Lakbay] Invalid trip data in storage. Resetting.', err);
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(appState.itinerary));
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(appState.budget));
    localStorage.setItem(STORAGE_KEYS.TRIP, JSON.stringify(appState.trip));
    renderHomeProgress();
  } catch (err) {
    console.error('[Lakbay] Error saving data to localStorage:', err);
  }
}

/* SessionStorage for Filter Preferences */
function saveFilterPrefs() {
  try {
    const prefs = {
      category: appState.activeCategory,
      price: appState.priceFilter,
      rating: appState.ratingFilter,
      sort: appState.sortOrder
    };
    sessionStorage.setItem(SESSION_KEYS.FILTER_PREFS, JSON.stringify(prefs));
  } catch (e) {
    // SessionStorage unavailable or restricted
  }
}

function loadFilterPrefs() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEYS.FILTER_PREFS);
    if (raw) {
      const p = JSON.parse(raw);
      if (p.category) appState.activeCategory = p.category;
      if (p.price) appState.priceFilter = p.price;
      if (p.rating) appState.ratingFilter = p.rating;
      if (p.sort) appState.sortOrder = p.sort;
    }
  } catch (e) {
    // ignore
  }
}
