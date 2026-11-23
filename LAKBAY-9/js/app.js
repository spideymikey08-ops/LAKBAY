/**
 * ==============================================================================
 * Lakbay - Baguio City Travel Destination Explorer & Itinerary Planner
 * ==============================================================================
 * Comprehensive Event-Driven Single Page Application (Vanilla JavaScript)
 * Features:
 * - Ambient Sage / Deep Spruce aesthetic with frosted glass components
 * - Safe localStorage persistence & schema validation
 * - Dynamic Day-by-day Itinerary with Duration & non-blocking Clash Warnings
 * - Area-aware distance hop buffer alerts (Downtown, Mines View, Outskirts, etc.)
 * - Past dates completion tracking (✓ Completed badge & filter)
 * - Automatic Stop Entrance Fees synchronization with Budget Calculator
 * - Budget Presets (Backpacker, Standard, Comfort) & Visual Comparison Bar
 * - Interactive Leaflet Baguio Map with 20 destination pins
 * - Export / Import JSON & Copy Plan as text
 * - Quick Sample 1-Day Baguio Plan loader
 * - WCAG AA accessible modal focus traps and keyboard navigation
 */

'use strict';

/* ==========================================================================
   INITIALIZATION & DATA RESTORATION (DOMContentLoaded)
   ========================================================================== */
function init() {
  // 1. Restore persistent user data from localStorage with isolated try/catch
  loadData();
  loadFilterPrefs();
  initAppearance();

  // 2. Setup Navigation and Section Switching Listeners
  setupNavigation();

  // 3. Populate Itinerary Destination Dropdown
  populateDestinationSelect();

  // 4. Configure Minimum Dates
  setupDateConstraints();

  // 5. Render Initial Views
  renderFeaturedDestinations();
  renderExploreGallery();
  renderItineraryList();

  // 6. Setup Explore Controls, Search, Filter, Price, Rating, Sort
  setupExploreControls();
  setupHomeQuickPlanner();
  setupFeaturedCarousel();

  // 7. Setup Modal and Confirmation Dialog Listeners
  setupModalControls();
  setupConfirmDialog();
  setupQuickAddPopover();

  // 8. Setup Itinerary Form Listeners
  setupItineraryControls();
  setupDestinationDropdown();

  // 9. Setup Summary Actions (Print, Export, Copy)
  setupSummaryControls();

  // Check URL Hash for deep linking (e.g. #summary or #explore)
  handleInitialHash();
}

/* ==========================================================================
   ENTRY POINT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', init);
