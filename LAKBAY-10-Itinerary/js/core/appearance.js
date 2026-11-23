/**
 * Lakbay | Core: Appearance
 * Day / night mode toggle with localStorage persistence.
 */
'use strict';

const APPEARANCE_STORAGE_KEY = 'lakbay_appearance';

/* ==========================================================================
   APPEARANCE TOGGLE (data-theme on <html>)
   ========================================================================== */
function applyAppearance(theme) {
  const isNight = theme === 'night';
  document.documentElement.setAttribute('data-theme', isNight ? 'night' : 'day');
  document.documentElement.style.colorScheme = isNight ? 'dark' : 'light';

  const toggle = document.getElementById('appearance-toggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(isNight));
    toggle.setAttribute('aria-label', isNight ? 'Switch to day mode' : 'Switch to night mode');
    toggle.setAttribute('title', isNight ? 'Switch to day mode' : 'Switch to night mode');
  }
}

function getSavedAppearance() {
  try {
    return localStorage.getItem(APPEARANCE_STORAGE_KEY);
  } catch (err) {
    return null;
  }
}

function initAppearance() {
  let saved = getSavedAppearance();

  // First visit: fall back to the operating system preference.
  if (!saved) {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        saved = 'night';
      }
    } catch (err) {
      // ignore
    }
  }

  applyAppearance(saved === 'night' ? 'night' : 'day');

  const toggle = document.getElementById('appearance-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'night' ? 'day' : 'night';
      applyAppearance(next);
      try {
        localStorage.setItem(APPEARANCE_STORAGE_KEY, next);
      } catch (err) {
        // Preference still applies for this session.
      }
    });
  }
}
