/**
 * Lakbay | Screen 1: Home
 * Featured destinations center-focus slider.
 */
'use strict';

/* ==========================================================================
   SCREEN 1: HOME (Featured Destinations Center-Focus Slider)
   ========================================================================== */
const FEATURED_SLIDER_COUNT = 6;

let featuredDestinations = [];
let activeFeaturedIndex = 0;

function getFeaturedDestinations() {
  const featured = sampleDestinations.filter(d => d.featured).slice(0, FEATURED_SLIDER_COUNT);
  if (featured.length >= FEATURED_SLIDER_COUNT) return featured;

  const extras = sampleDestinations
    .filter(d => !d.featured)
    .slice(0, FEATURED_SLIDER_COUNT - featured.length);
  return featured.concat(extras);
}

function featuredSlideHTML(dest, index) {
  const feeText = dest.fee === 0 ? 'FREE' : `₱${dest.fee}`;
  const isPlanned = appState.itinerary.some(s => s.destinationId === dest.id);
  const description = dest.description
    ? escapeHTML(dest.description.length > 120 ? dest.description.substring(0, 120).trim() + '…' : dest.description)
    : 'Discover this Baguio favorite and make it part of your mountain getaway.';

  return `
    <article class="featured-slide${index === activeFeaturedIndex ? ' is-active' : ''}" data-index="${index}">
      <img
        src="${escapeHTML(dest.image)}"
        alt="${escapeHTML(dest.name)}"
        class="featured-slide-img"
        loading="lazy"
        onerror="this.src='assets/images/burnham-park.jpg'"
      >
      <span class="featured-slide-shade" aria-hidden="true"></span>
      <div class="featured-slide-content">
        <span class="featured-slide-tag">${escapeHTML(dest.category)}</span>
        <h3 class="featured-slide-title">${escapeHTML(dest.name)}</h3>
        <p class="featured-slide-area">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${escapeHTML(dest.area || dest.location)}
        </p>
        <p class="featured-slide-desc">${description}</p>
        <div class="featured-slide-actions">
          <button type="button" class="featured-slide-btn featured-slide-explore btn-show-details" data-id="${dest.id}">
            Explore place
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
          <button type="button" class="featured-slide-btn featured-slide-add btn-quick-itinerary ${isPlanned ? 'is-added' : ''}" data-id="${dest.id}">
            ${isPlanned ? 'Added' : '+ Add'}
          </button>
          <span class="featured-slide-fee">${feeText}</span>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedDots() {
  const dotsContainer = document.getElementById('featured-carousel-dots');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = featuredDestinations.map((dest, index) => `
    <button type="button" class="carousel-dot${index === activeFeaturedIndex ? ' active' : ''}"
            data-slide="${index}" aria-label="Show ${escapeHTML(dest.name)}"
            role="tab" aria-selected="${index === activeFeaturedIndex}"></button>
  `).join('');
}

function updateFeaturedSlide(index, animate = true) {
  const track = document.getElementById('home-featured-grid');
  const viewport = document.getElementById('featured-slider-viewport');
  const counter = document.getElementById('featured-counter');
  const caption = document.getElementById('featured-caption');
  if (!track || !featuredDestinations.length) return;

  activeFeaturedIndex = (index + featuredDestinations.length) % featuredDestinations.length;
  const active = featuredDestinations[activeFeaturedIndex];

  if (!animate) track.classList.add('no-transition');
  track.querySelectorAll('.featured-slide').forEach((slide, i) => {
    const isActive = i === activeFeaturedIndex;
    slide.classList.toggle('is-active', isActive);
    slide.querySelectorAll('button').forEach(btn => { btn.tabIndex = isActive ? 0 : -1; });
  });

  if (viewport) {
    const activeSlide = track.querySelector('.featured-slide.is-active');
    if (activeSlide) {
      const offset = viewport.clientWidth / 2 - (activeSlide.offsetLeft + activeSlide.offsetWidth / 2);
      track.style.transform = `translateX(${offset}px)`;
    }
  }

  if (counter) counter.textContent = `${activeFeaturedIndex + 1}/${featuredDestinations.length}`;
  if (caption) caption.textContent = active.description || '';

  document.querySelectorAll('#featured-carousel-dots .carousel-dot').forEach((dot, i) => {
    const isActive = i === activeFeaturedIndex;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });

  if (!animate) requestAnimationFrame(() => track.classList.remove('no-transition'));
}

function goToFeaturedSlide(index) {
  updateFeaturedSlide(index);
}

function renderFeaturedDestinations() {
  const container = document.getElementById('home-featured-grid');
  if (!container) return;

  featuredDestinations = getFeaturedDestinations();
  activeFeaturedIndex = 0;
  container.innerHTML = featuredDestinations.map(featuredSlideHTML).join('');
  renderFeaturedDots();
  requestAnimationFrame(() => updateFeaturedSlide(0, false));
}

function setupHomeQuickPlanner() {
  // Quick navigation buttons from Home are handled by global [data-section] listener
}

function setupFeaturedCarousel() {
  const track = document.getElementById('home-featured-grid');
  if (!track) return;

  const prevBtn = document.getElementById('featured-prev');
  const nextBtn = document.getElementById('featured-next');
  const dotsContainer = document.getElementById('featured-carousel-dots');

  if (prevBtn) prevBtn.addEventListener('click', () => goToFeaturedSlide(activeFeaturedIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToFeaturedSlide(activeFeaturedIndex + 1));

  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      const dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      goToFeaturedSlide(parseInt(dot.getAttribute('data-slide'), 10) || 0);
    });
  }

  track.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    const slide = e.target.closest('.featured-slide');
    if (!slide) return;
    const index = parseInt(slide.getAttribute('data-index'), 10);
    if (index !== activeFeaturedIndex) goToFeaturedSlide(index);
  });

  window.addEventListener('resize', () => updateFeaturedSlide(activeFeaturedIndex, false));
}
