/**
 * Lakbay | Core: Navigation
 * Sidebar navigation and section (screen) switching.
 */
'use strict';

/* ==========================================================================
   NAVIGATION & SECTION SWITCHING (ANI-12 Left Sidebar Layout)
   ========================================================================== */
function setupNavigation() {
  const navContainer = document.getElementById('main-nav');
  const mobileToggle = document.getElementById('mobile-toggle');

  // Event Delegation for nav-items and data-section buttons
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-section]');
    if (navBtn) {
      const section = navBtn.getAttribute('data-section');
      if (section) {
        showSection(section);
      }
    }
  });

  // Mobile toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (navContainer) {
        navContainer.classList.toggle('nav-open');
      }
    });
  }

  // Close mobile nav on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && navContainer && navContainer.classList.contains('nav-open')) {
      navContainer.classList.remove('nav-open');
    }
  });

  // Popstate hash change
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      showSection(hash, false);
    }
  });
}

function showSection(sectionId, updateHash = true) {
  const validSections = ['home', 'explore', 'itinerary', 'budget', 'summary'];
  const targetId = validSections.includes(sectionId) ? sectionId : 'home';

  // Hide all screens
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Show target screen
  const targetScreen = document.getElementById(`section-${targetId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Update active state in sidebar nav items
  document.querySelectorAll('.sidebar .nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-section') === targetId);
  });

  appState.currentSection = targetId;

  if (updateHash) {
    history.replaceState(null, '', `#${targetId}`);
  }

  // Close mobile navigation drawer if open
  const navContainer = document.getElementById('main-nav');
  if (navContainer && navContainer.classList.contains('nav-open')) {
    navContainer.classList.remove('nav-open');
  }

  // Section-specific triggers
  if (targetId === 'summary') {
    buildSummary();
  } else if (targetId === 'explore') {
    renderExploreGallery();
  } else if (targetId === 'itinerary') {
    renderItineraryList();
  }

  // Scroll viewport smoothly to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleInitialHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    showSection(hash, false);
  }
}
