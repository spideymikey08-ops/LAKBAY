/**
 * Lakbay | Screen 1: Home
 * Dashboard, trip progress card, featured destinations and carousel.
 */
'use strict';

/* ==========================================================================
   SCREEN 1: HOME (Dashboard, Stats, Progress, Carousel)
   ========================================================================== */
function renderHomeProgress() {
  const hasBudget = appState.hasConfirmedBudget;
  const stopCount = appState.itinerary.length;

  let completedSteps = 0;
  if (hasBudget) completedSteps++;
  if (stopCount > 0) completedSteps++;

  const percentage = Math.round((completedSteps / 2) * 100);

  const percentLabel = document.getElementById('hero-progress-percent');
  const progressBar = document.getElementById('hero-progress-bar');
  const stepBudget = document.getElementById('step-budget');
  const stepStops = document.getElementById('step-stops');

  const stepBudgetStatus = document.getElementById('step-budget-status');
  const stepStopsStatus = document.getElementById('step-stops-status');

  const nextStepText = document.getElementById('hero-next-step-text');
  const nextStepBtn = document.getElementById('hero-next-step-btn');

  if (percentLabel) percentLabel.textContent = `${percentage}%`;
  if (progressBar) progressBar.style.width = `${percentage}%`;

  if (stepBudget) {
    stepBudget.classList.toggle('completed', hasBudget);
    if (stepBudgetStatus) {
      stepBudgetStatus.textContent = hasBudget ? `₱${formatNumber(appState.trip.budgetMin)} – ₱${formatNumber(appState.trip.budgetMax)}` : 'Not established yet';
    }
  }

  if (stepStops) {
    stepStops.classList.toggle('completed', stopCount > 0);
    if (stepStopsStatus) {
      stepStopsStatus.textContent = stopCount > 0 ? `${stopCount} stop${stopCount === 1 ? '' : 's'} planned` : '0 stops planned';
    }
  }

  // Dynamic next step guidance
  if (nextStepText && nextStepBtn) {
    if (!hasBudget) {
      nextStepText.textContent = 'Establish your estimated travel budget in the Itinerary Planner.';
      nextStepBtn.setAttribute('data-section', 'itinerary');
      nextStepBtn.textContent = 'Set Travel Budget →';
    } else if (stopCount === 0) {
      nextStepText.textContent = 'Organize and schedule your planned stops in Baguio.';
      nextStepBtn.setAttribute('data-section', 'itinerary');
      nextStepBtn.textContent = 'Plan Itinerary →';
    } else {
      nextStepText.textContent = 'Your trip plan is ready! Review and print your summary.';
      nextStepBtn.setAttribute('data-section', 'summary');
      nextStepBtn.textContent = 'View Summary →';
    }
  }
}

function renderFeaturedDestinations() {
  const container = document.getElementById('home-featured-grid');
  if (!container) return;

  const featured = sampleDestinations.filter(d => d.featured).slice(0, 6);
  container.innerHTML = featured.map(dest => createDestinationCardHTML(dest, true)).join('');
}

function setupFeaturedCarousel() {
  const dotsContainer = document.getElementById('featured-carousel-dots');
  if (!dotsContainer) return;

  dotsContainer.addEventListener('click', (e) => {
    const dot = e.target.closest('.carousel-dot');
    if (!dot) return;

    dotsContainer.querySelectorAll('.carousel-dot').forEach(d => {
      d.classList.remove('active');
      d.setAttribute('aria-selected', 'false');
    });

    dot.classList.add('active');
    dot.setAttribute('aria-selected', 'true');

    const page = parseInt(dot.getAttribute('data-page'), 10) || 0;
    const allCards = sampleDestinations.filter(d => d.featured);
    const pageSize = 3;
    const start = (page * pageSize) % allCards.length;
    const sliced = allCards.slice(start, start + pageSize);

    const container = document.getElementById('home-featured-grid');
    if (container) {
      container.innerHTML = sliced.map(dest => createDestinationCardHTML(dest, true)).join('');
    }
  });
}

function setupHomeQuickPlanner() {
  // Quick navigation buttons from Home are handled by global [data-section] listener
}

