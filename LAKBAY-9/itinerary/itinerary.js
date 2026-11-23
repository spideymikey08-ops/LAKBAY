/**
 * Lakbay | Screen 4: Itinerary - Budget & Workspace
 * Budget range selector (step 1), workspace health toolbar and day filter tabs (step 2).
 */
'use strict';

/* ==========================================================================
   SCREEN 4: ITINERARY PLANNER (Budget Selection & Day-by-Day Timeline)
   ========================================================================== */

const BUDGET_SLIDER_CONFIG = {
  MIN_ALLOWED: 500,
  MAX_ALLOWED: 25000,
  STEP: 100,
  MIN_GAP: 100
};

let stopEditorTargetId = null;
let activeDayFilter = 'all';
let stopEditorSyncNameOnPreview = true;

/**
 * Main itinerary renderer: toggles between View 1 (Budget Selector) and View 2 (Confirmed Workspace)
 */
function renderItineraryList() {
  const selectorView = document.getElementById('budget-selector-view');
  const confirmedView = document.getElementById('budget-confirmed-view');
  if (!selectorView || !confirmedView) return;

  if (appState.hasConfirmedBudget) {
    selectorView.style.display = 'none';
    confirmedView.style.display = 'grid';
    renderItineraryWorkspace();
  } else {
    selectorView.style.display = 'block';
    confirmedView.style.display = 'none';
    syncBudgetInputsFromState();
  }
}

/**
 * Synchronizes the always-visible trip setup card from appState.
 */
function syncTripSetupFromState() {
  const dateInput = document.getElementById('trip-start-date');
  const travelersInput = document.getElementById('trip-travelers');
  const daysInput = document.getElementById('budget-trip-days');

  const startDate = appState.trip.startDate || getTodayDateString();
  if (!appState.trip.startDate) appState.trip.startDate = startDate;

  if (dateInput) dateInput.value = startDate;
  if (travelersInput) travelersInput.value = String(appState.budget.travelers || 1);
  if (daysInput) daysInput.value = String(appState.trip.days || 2);
}

/**
 * Synchronizes inputs and UI elements from current appState.trip
 */
function syncBudgetInputsFromState() {
  syncTripSetupFromState();
  const minVal = appState.trip.budgetMin || 1500;
  const maxVal = appState.trip.budgetMax || 3500;
  const daysVal = appState.trip.days || 2;

  const sliderMin = document.getElementById('budget-slider-min');
  const sliderMax = document.getElementById('budget-slider-max');
  const numMin = document.getElementById('budget-num-min');
  const numMax = document.getElementById('budget-num-max');
  const daysInput = document.getElementById('budget-trip-days');

  if (sliderMin) sliderMin.value = minVal;
  if (sliderMax) sliderMax.value = maxVal;
  if (numMin) numMin.value = minVal;
  if (numMax) numMax.value = maxVal;
  if (daysInput) daysInput.value = daysVal;

  updateBudgetCalculations(minVal, maxVal, daysVal);
  updateSliderTrackHighlight(minVal, maxVal);
  highlightMatchingPreset(minVal, maxVal);
}

/**
 * Updates the highlight bar on the dual-range track
 */
function updateSliderTrackHighlight(minVal, maxVal) {
  const highlightBar = document.getElementById('budget-highlight-track');
  if (!highlightBar) return;

  const totalRange = BUDGET_SLIDER_CONFIG.MAX_ALLOWED - BUDGET_SLIDER_CONFIG.MIN_ALLOWED;
  const leftPct = Math.max(0, Math.min(100, ((minVal - BUDGET_SLIDER_CONFIG.MIN_ALLOWED) / totalRange) * 100));
  const widthPct = Math.max(0, Math.min(100 - leftPct, ((maxVal - minVal) / totalRange) * 100));

  highlightBar.style.left = `${leftPct.toFixed(2)}%`;
  highlightBar.style.width = `${widthPct.toFixed(2)}%`;
}

/**
 * Calculates live daily allowance and projected category allocations
 */
function updateBudgetCalculations(minVal, maxVal, days) {
  const safeDays = Math.max(1, parseInt(days, 10) || 1);
  const minDaily = Math.round(minVal / safeDays);
  const maxDaily = Math.round(maxVal / safeDays);

  const dailyEl = document.getElementById('budget-calc-daily');
  const maxEl = document.getElementById('budget-calc-max');
  const lodgingEl = document.getElementById('alloc-lodging');
  const foodEl = document.getElementById('alloc-food');
  const transpoEl = document.getElementById('alloc-transpo');
  const activitiesEl = document.getElementById('alloc-activities');
  const otherEl = document.getElementById('alloc-other');

  if (dailyEl) dailyEl.textContent = `₱${formatNumber(minDaily)} – ₱${formatNumber(maxDaily)} / day`;
  if (maxEl) maxEl.textContent = formatNumber(maxVal);

  if (lodgingEl) lodgingEl.textContent = `₱${formatNumber(Math.round(maxVal * 0.40))}`;
  if (foodEl) foodEl.textContent = `₱${formatNumber(Math.round(maxVal * 0.25))}`;
  if (transpoEl) transpoEl.textContent = `₱${formatNumber(Math.round(maxVal * 0.15))}`;
  if (activitiesEl) activitiesEl.textContent = `₱${formatNumber(Math.round(maxVal * 0.10))}`;
  if (otherEl) otherEl.textContent = `₱${formatNumber(Math.round(maxVal * 0.10))}`;
}

/**
 * Highlights a preset button if current values match
 */
function highlightMatchingPreset(minVal, maxVal) {
  const presetBtns = document.querySelectorAll('#budget-preset-buttons .btn-preset');
  presetBtns.forEach(btn => {
    const pMin = parseInt(btn.getAttribute('data-min'), 10);
    const pMax = parseInt(btn.getAttribute('data-max'), 10);
    if (pMin === minVal && pMax === maxVal) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Renders the confirmed workspace: Live budget tracker meter, day tabs, and stops timeline
 */
function renderItineraryWorkspace() {
  const trip = appState.trip;
  const days = trip.days || 2;
  const minBudget = trip.budgetMin || 1500;
  const maxBudget = trip.budgetMax || 3500;
  const stops = appState.itinerary || [];

  // 1. Top Badges & Trip Title
  const tripTitleEl = document.getElementById('confirmed-trip-title');
  const budgetDisplay = document.getElementById('confirmed-budget-display');
  const daysDisplay = document.getElementById('confirmed-days-display');

  if (tripTitleEl) tripTitleEl.textContent = `${trip.city || 'Baguio City'} · ${days} Day${days > 1 ? 's' : ''}`;
  if (budgetDisplay) budgetDisplay.textContent = `₱${formatNumber(minBudget)} – ₱${formatNumber(maxBudget)}`;
  if (daysDisplay) daysDisplay.textContent = `${days} Day${days > 1 ? 's' : ''}`;

  // Compact header strip + sidebar labels (reference layout)
  const dayLabel = `${days} Day${days > 1 ? 's' : ''}`;
  const travelers = appState.budget.travelers || 1;
  const travelerLabel = `${travelers} Traveler${travelers > 1 ? 's' : ''}`;
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('summary-date-range', `${formatDate(getDateForDay(1))} – ${formatDate(getDateForDay(days))}`);
  setText('summary-travelers', travelerLabel);
  setText('summary-days', dayLabel);
  setText('summary-total-budget', `₱${formatNumber(maxBudget)}`);
  setText('consolidated-total', `₱${formatNumber(maxBudget)}`);
  setText('consolidated-city', trip.city || 'Baguio City');

  // 2. Budget Utilization Calculations
  const stopsFees = stops.reduce((sum, s) => {
    const d = sampleDestinations.find(dest => dest.id === s.destinationId);
    return sum + (Number(s.fee) || (d ? Number(d.fee) || 0 : 0));
  }, 0);

  const baseLivingCost = Math.round(maxBudget * 0.80);
  const totalPlannedSpent = baseLivingCost + stopsFees;
  const remainingBudget = maxBudget - totalPlannedSpent;

  // Update Tracker Metrics
  const feesEl = document.getElementById('tracker-stops-fees');
  const countEl = document.getElementById('tracker-stops-count');
  const baseEl = document.getElementById('tracker-base-living');
  const remBox = document.getElementById('tracker-remaining-box');
  const remEl = document.getElementById('tracker-remaining-budget');
  const remStatusEl = document.getElementById('tracker-remaining-status');

  if (feesEl) feesEl.textContent = `₱${formatNumber(stopsFees)}`;
  if (countEl) countEl.textContent = `${stops.length} stop${stops.length === 1 ? '' : 's'} planned`;
  if (baseEl) baseEl.textContent = `₱${formatNumber(baseLivingCost)}`;

  if (remEl) {
    if (remainingBudget >= 0) {
      remEl.textContent = `₱${formatNumber(remainingBudget)}`;
      remEl.style.color = '#10352b';
      if (remBox) {
        remBox.style.background = '#f0fdf4';
        remBox.style.borderColor = '#bbf7d0';
      }
      if (remStatusEl) {
        remStatusEl.textContent = 'Within Budget ✓';
        remStatusEl.style.color = '#15803d';
      }
    } else {
      remEl.textContent = `-₱${formatNumber(Math.abs(remainingBudget))}`;
      remEl.style.color = '#b91c1c';
      if (remBox) {
        remBox.style.background = '#fef2f2';
        remBox.style.borderColor = '#fecaca';
      }
      if (remStatusEl) {
        remStatusEl.textContent = 'Over Ceiling ⚠️';
        remStatusEl.style.color = '#b91c1c';
      }
    }
  }

  // Meter Bar
  const meterPercent = Math.min(100, Math.round((totalPlannedSpent / maxBudget) * 100));
  const meterPercentEl = document.getElementById('tracker-meter-percent');
  const meterCeilingEl = document.getElementById('tracker-meter-ceiling');
  const meterFill = document.getElementById('tracker-meter-fill');
  const alertBanner = document.getElementById('tracker-budget-alert');
  const alertMsg = document.getElementById('tracker-alert-message');

  if (meterPercentEl) meterPercentEl.textContent = `${meterPercent}%`;
  if (meterCeilingEl) meterCeilingEl.textContent = `Max Ceiling: ₱${formatNumber(maxBudget)}`;
  if (meterFill) {
    meterFill.style.width = `${meterPercent}%`;
    meterFill.className = 'meter-fill' + (meterPercent >= 100 ? ' overflow' : (meterPercent >= 85 ? ' warning' : ''));
  }

  if (alertBanner) {
    if (remainingBudget < 0) {
      alertBanner.style.display = 'flex';
      if (alertMsg) {
        alertMsg.textContent = `Planned expenses (₱${formatNumber(totalPlannedSpent)}) exceed your ₱${formatNumber(maxBudget)} ceiling by ₱${formatNumber(Math.abs(remainingBudget))}. Consider swapping paid attractions for free favorites like Burnham Park, Wright Park, or The Mansion!`;
      }
    } else {
      alertBanner.style.display = 'none';
    }
  }

  // 3. Render Day Filter Tabs
  renderDayFilterTabs(days);

  // 4. Render Chronological Day-by-Day Timeline
  renderTimelineDays(days, stops);
}

/**
 * Generates Day Tabs ("All Days", "Day 1", "Day 2"...)
 */
function renderDayFilterTabs(daysCount) {
  const tabsContainer = document.getElementById('itinerary-day-tabs');
  if (!tabsContainer) return;

  let tabsHTML = `<button type="button" class="day-tab-pill ${activeDayFilter === 'all' ? 'active' : ''}" data-day="all">All Days (${daysCount})</button>`;
  for (let i = 1; i <= daysCount; i++) {
    const isActive = activeDayFilter === String(i);
    tabsHTML += `<button type="button" class="day-tab-pill ${isActive ? 'active' : ''}" data-day="${i}">Day ${i}</button>`;
  }

  tabsContainer.innerHTML = tabsHTML;

  tabsContainer.querySelectorAll('.day-tab-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDayFilter = btn.getAttribute('data-day');
      renderItineraryWorkspace();
    });
  });
}


/**
 * Lakbay | Screen 4: Itinerary - Timeline
 * Day/stop index helpers, schedule clash detection and the hourly timeline grid.
 */
'use strict';

/**
 * Calculates day index (1-based) from stop date and trip startDate
 */
function getStopDayIndex(stopDateStr) {
  const startDateStr = appState.trip.startDate || getTodayDateString();
  const start = new Date(startDateStr);
  const stopDate = new Date(stopDateStr);
  const diffDays = Math.floor((stopDate - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(appState.trip.days || 2, diffDays + 1));
}

/**
 * Computes calendar date string for Day N
 */
function getDateForDay(dayIndex) {
  const startDateStr = appState.trip.startDate || getTodayDateString();
  const date = new Date(startDateStr);
  date.setDate(date.getDate() + (dayIndex - 1));
  return date.toISOString().split('T')[0];
}

/**
 * Clash detector: identifies overlapping time windows on the same date
 */
function findItineraryClashes(stops) {
  const clashMap = {};
  for (let i = 0; i < stops.length; i++) {
    const s1 = stops[i];
    const start1 = timeToMinutes(s1.time);
    const end1 = start1 + (Number(s1.duration) || 90);

    for (let j = i + 1; j < stops.length; j++) {
      const s2 = stops[j];
      if (s1.date !== s2.date) continue;

      const start2 = timeToMinutes(s2.time);
      const end2 = start2 + (Number(s2.duration) || 90);

      if (start1 < end2 && start2 < end1) {
        clashMap[s1.id] = {
          withName: s2.destinationName || 'Another Stop',
          timeRange: `${s2.time} – ${minutesToTime(end2)}`
        };
        clashMap[s2.id] = {
          withName: s1.destinationName || 'Another Stop',
          timeRange: `${s1.time} – ${minutesToTime(end1)}`
        };
      }
    }
  }
  return clashMap;
}

/**
 * Estimates travel time between two destinations from their coordinates.
 * Uses a gentle city-driving speed plus a short buffer for traffic/parking.
 */
function getTravelMinutesBetween(from, to) {
  if (!from || !to || !Number.isFinite(from.lat) || !Number.isFinite(from.lng) ||
      !Number.isFinite(to.lat) || !Number.isFinite(to.lng)) {
    return null;
  }

  const toRad = value => value * Math.PI / 180;
  const earthKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  const distanceKm = earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (distanceKm < 0.35) return 10;

  const minutes = (distanceKm / 18) * 60 + 8;
  return Math.max(10, Math.min(75, Math.round(minutes / 5) * 5));
}

/* ---------- Horizontal plan-timeline helpers (reference layout) ---------- */
const PLAN_DAY_START = 7 * 60;   // 7 AM
const PLAN_DAY_END = 22 * 60;    // 10 PM
const PLAN_DAY_SPAN = PLAN_DAY_END - PLAN_DAY_START;

/** Converts a minute-of-day value into a percentage along the plan timeline. */
function planTimePercent(mins) {
  const clamped = Math.max(PLAN_DAY_START, Math.min(PLAN_DAY_END, Number(mins) || 0));
  return ((clamped - PLAN_DAY_START) / PLAN_DAY_SPAN) * 100;
}

/** Formats an hour number as "7 AM" / "12 PM" for the timeline ruler. */
function planHourLabel(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12} ${suffix}`;
}

/** Formats "14:30" as "2 PM" for the compact plan table. */
function formatClockShort(timeStr) {
  const parts = String(timeStr || '09:00').split(':');
  const hour = parseInt(parts[0], 10) || 0;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12} ${suffix}`;
}

/** Formats a trip date as "SUN 15" for the compact plan table. */
function formatPlanDay(dateStr) {
  try {
    const parts = String(dateStr || '').split('-');
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(date.getTime())) {
      return `${date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} ${date.getDate()}`;
    }
  } catch (e) { /* fall through */ }
  return 'BAGUIO';
}

/**
 * Renders the day sections and timeline stop cards
 */
function renderTimelineDays(daysCount, stops) {
  const container = document.getElementById('itinerary-days-list');
  if (!container) return;

  sortItineraryChronologically();
  const clashesMap = findItineraryClashes(stops);

  // Horizontal time ruler (7 AM – 10 PM) like the reference planner.
  const ruler = Array.from({ length: 16 }, (_, i) => {
    const hour = 7 + i;
    return `<span class="plan-hour" style="left:${planTimePercent(hour * 60)}%">${planHourLabel(hour)}</span>`;
  }).join('');

  let html = `
    <div class="plan-timeline-scroll">
    <div class="plan-timeline-head" aria-hidden="true">
      <span class="plan-head-day">Day</span>
      <span class="plan-head-area">Area</span>
      <div class="plan-ruler">${ruler}</div>
      <span class="plan-head-stay">Stay</span>
    </div>
  `;

  for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
    if (activeDayFilter !== 'all' && activeDayFilter !== String(dayNum)) {
      continue;
    }

    const dayDateStr = getDateForDay(dayNum);
    const formattedDate = formatDate(dayDateStr);

    const dayStops = stops.filter(s => {
      if (s.date === dayDateStr) return true;
      return getStopDayIndex(s.date) === dayNum;
    });

    const dayFeesSum = dayStops.reduce((sum, s) => {
      const d = sampleDestinations.find(dest => dest.id === s.destinationId);
      return sum + (Number(s.fee) || (d ? Number(d.fee) || 0 : 0));
    }, 0);

    const totalMinutes = dayStops.reduce((sum, s) => sum + (Number(s.duration) || 90), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeTotalStr = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;

    // Stacked date card: day number, month, weekday (e.g. 15 / NOV / SUN).
    const dateParts = String(dayDateStr).split('-');
    const dateObj = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    const dayNumText = String(dateObj.getDate()).padStart(2, '0');
    const dayMonText = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayDowText = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const areaCity = appState.trip.city || 'Baguio';

    html += `
      <section class="itinerary-day-section" data-day="${dayNum}">
        <div class="day-section-header">
          <div class="day-section-title-wrap">
            <h3 class="day-section-title">Day ${dayNum}</h3>
            <span class="day-section-date">· ${formattedDate}</span>
            <div class="day-meta-pills">
              <span class="day-meta-pill">${dayStops.length} Stop${dayStops.length === 1 ? '' : 's'}</span>
              <span class="day-meta-pill">⏱️ ${timeTotalStr}</span>
              <span class="day-meta-pill">🎟️ ${dayFeesSum === 0 ? 'Free Entry' : '₱' + formatNumber(dayFeesSum)}</span>
            </div>
          </div>
          <button type="button" class="day-add-stop-btn" data-day="${dayNum}">
            + Add to Day ${dayNum}
          </button>
        </div>

        <div class="plan-day-row">
          <div class="plan-day-cell">
            <span class="plan-day-num">${dayNumText}</span>
            <span class="plan-day-mon">${dayMonText}</span>
            <span class="plan-day-dow">${dayDowText}</span>
          </div>
          <div class="plan-area-cell">
            <span class="plan-area-country">Philippines</span>
            <span class="plan-area-city">${escapeHTML(areaCity)}</span>
          </div>
          <div class="plan-time-grid" data-day="${dayNum}">
            <span class="plan-grid-shade" style="left:${planTimePercent(12 * 60)}%; width:${planTimePercent(13 * 60) - planTimePercent(12 * 60)}%"></span>
            <span class="plan-grid-shade" style="left:${planTimePercent(18 * 60)}%; width:${planTimePercent(19 * 60) - planTimePercent(18 * 60)}%"></span>
    `;

    if (dayStops.length === 0) {
      html += `
        <div class="plan-empty-grid">
          <span>No stops scheduled — drag a place here or use “+ Add to Day ${dayNum}”.</span>
        </div>
      `;
    } else {
      let previousDest = null;

      dayStops.forEach((stop) => {
        const dest = sampleDestinations.find(d => d.id === stop.destinationId) || {
          name: stop.destinationName || 'Destination',
          category: stop.category || 'Sightseeing',
          fee: stop.fee || 0,
          image: 'assets/images/burnham-park.jpg',
          area: 'Baguio City'
        };

        const duration = Number(stop.duration) || 90;
        const startMins = timeToMinutes(stop.time);
        const endMins = startMins + duration;
        const startTimeStr = stop.time || '09:00';
        const endTimeStr = minutesToTime(endMins);
        const planDayLabel = formatPlanDay(stop.date || dayDateStr);
        const planArea = dest.area || dest.location || 'Baguio';

        const fee = Number(stop.fee) || dest.fee || 0;
        const clashInfo = clashesMap[stop.id];
        const travelMinutes = previousDest ? getTravelMinutesBetween(previousDest, dest) : null;

        if (travelMinutes !== null) {
          html += `
            <div class="travel-hop" aria-label="Estimated travel time from previous stop">
              <span class="travel-hop-line"></span>
              <span>≈ ${travelMinutes} min hop</span>
              <span class="travel-hop-line"></span>
            </div>
          `;
        }

        // Position the bar on the 7 AM – 10 PM ruler using this stop's times.
        const leftPct = planTimePercent(startMins);
        const rightPct = planTimePercent(endMins);
        const widthPct = Math.max(0.8, rightPct - leftPct);
        const tipParts = [
          `${formatClockShort(startTimeStr)} – ${formatClockShort(endTimeStr)}`,
          fee > 0 ? `₱${formatNumber(fee)}` : 'Free Entry',
          stop.activity, stop.description, stop.address, stop.phone, stop.website
        ].filter(Boolean);
        if (clashInfo) tipParts.push(`⚠️ Overlaps with ${clashInfo.withName} (${clashInfo.timeRange})`);

        html += `
          <div class="itinerary-stop-card" data-stop-id="${stop.id}" data-day="${dayNum}"
               draggable="true" style="left:${leftPct}%; width:${widthPct}%"
               title="${escapeHTML(tipParts.join(' · '))}">
            <span class="stop-bar-name">${escapeHTML(dest.name)}</span>
            <span class="stop-bar-time">${formatClockShort(startTimeStr)}–${formatClockShort(endTimeStr)}</span>
            <span class="stop-drag-handle" aria-hidden="true" title="Drag to change time">⠿</span>
            <div class="stop-actions-col">
              <button type="button" class="btn-icon-action btn-edit-stop" data-stop-id="${stop.id}" title="Edit place details">✏️</button>
              <button type="button" class="btn-icon-action action-delete btn-delete-stop" data-stop-id="${stop.id}" title="Remove place">🗑️</button>
            </div>
          </div>
        `;

        previousDest = dest;
      });
    }

    html += `
          </div>
          <div class="plan-stay-cell">
            ${dayStops.length ? `<span>${dayStops.length} stop${dayStops.length === 1 ? '' : 's'}</span><small>${timeTotalStr}</small>` : '<span class="plan-stay-empty">—</span>'}
          </div>
        </div>
      </section>
    `;
  }

  html += `</div>`; // .plan-timeline-scroll
  container.innerHTML = html;

  // Attach card event listeners
  container.querySelectorAll('.day-add-stop-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.getAttribute('data-day');
      openStopEditor({ day });
    });
  });

  container.querySelectorAll('.btn-edit-stop').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopId = btn.getAttribute('data-stop-id');
      openStopEditor({ stopId });
    });
  });

  container.querySelectorAll('.btn-delete-stop').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopId = btn.getAttribute('data-stop-id');
      deleteStop(stopId);
    });
  });

  // Drag & drop: drag a bar to change its time, drop it on another bar to swap slots.
  let draggedStopId = null;

  const clearDropStyles = () => {
    container.querySelectorAll('.dragging, .drop-target, .drop-active')
      .forEach(el => el.classList.remove('dragging', 'drop-target', 'drop-active'));
  };

  container.querySelectorAll('.itinerary-stop-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      if (e.target.closest('button, a')) {
        e.preventDefault();
        return;
      }
      draggedStopId = card.getAttribute('data-stop-id');
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedStopId);
    });

    card.addEventListener('dragover', (e) => {
      if (!draggedStopId || draggedStopId === card.getAttribute('data-stop-id')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      card.classList.add('drop-target');
    });

    card.addEventListener('dragleave', () => card.classList.remove('drop-target'));

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetId = card.getAttribute('data-stop-id');
      const movingId = draggedStopId || e.dataTransfer.getData('text/plain');
      clearDropStyles();
      draggedStopId = null;
      dropStopOn(movingId, targetId);
    });

    card.addEventListener('dragend', () => {
      clearDropStyles();
      draggedStopId = null;
    });
  });

  // Dropping on the timeline grid sets the stop's start time from the drop position.
  container.querySelectorAll('.plan-time-grid').forEach(grid => {
    grid.addEventListener('dragover', (e) => {
      if (!draggedStopId || e.target.closest('.itinerary-stop-card')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      grid.classList.add('drop-active');
    });

    grid.addEventListener('dragleave', (e) => {
      if (!grid.contains(e.relatedTarget)) grid.classList.remove('drop-active');
    });

    grid.addEventListener('drop', (e) => {
      if (e.target.closest('.itinerary-stop-card')) return;
      e.preventDefault();
      e.stopPropagation();
      const movingId = draggedStopId || e.dataTransfer.getData('text/plain');
      const day = grid.getAttribute('data-day');
      clearDropStyles();
      draggedStopId = null;
      dropStopAtTime(movingId, day, e.clientX, grid);
    });
  });

  container.querySelectorAll('.itinerary-day-section').forEach(section => {
    section.addEventListener('dragover', (e) => {
      if (!draggedStopId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
  });
}

/**
 * Moves a dragged stop to a specific time based on where it was dropped on the ruler.
 */
function dropStopAtTime(draggedId, dayValue, clientX, gridEl) {
  if (!draggedId || !dayValue || !gridEl) return;
  const stop = appState.itinerary.find(s => s.id === draggedId);
  if (!stop) return;

  const rect = gridEl.getBoundingClientRect();
  if (!rect.width) return;
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const rawMins = PLAN_DAY_START + pct * PLAN_DAY_SPAN;
  const snapped = Math.round(rawMins / 15) * 15;
  const duration = Number(stop.duration) || 90;
  const maxStart = PLAN_DAY_END - duration;
  const newMins = Math.max(PLAN_DAY_START, Math.min(maxStart, snapped));

  stop.time = minutesToTime(newMins);
  stop.date = getDateForDay(Number(dayValue));
  sortItineraryChronologically();
  saveData();
  renderItineraryWorkspace();
  showToast(`Moved "${stop.destinationName || 'place'}" to ${formatClockShort(stop.time)} on Day ${dayValue}.`, 'success');
}

/**
 * Drops a dragged stop onto another stop: they swap time slots (and days if needed).
 */
function dropStopOn(draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) return;
  const dragged = appState.itinerary.find(s => s.id === draggedId);
  const target = appState.itinerary.find(s => s.id === targetId);
  if (!dragged || !target) return;

  const dragTime = dragged.time;
  const dragDate = dragged.date;
  dragged.time = target.time;
  dragged.date = target.date;
  target.time = dragTime;
  target.date = dragDate;

  sortItineraryChronologically();
  saveData();
  renderItineraryWorkspace();
  showToast(`Moved "${dragged.destinationName || 'place'}" to ${target.time} on ${formatDate(target.date)}.`, 'success');
}

/**
 * Drops a dragged stop into a day section (keeps its time, updates its date).
 */
function dropStopOnDay(draggedId, dayValue) {
  if (!draggedId || !dayValue) return;
  const dragged = appState.itinerary.find(s => s.id === draggedId);
  if (!dragged) return;

  const day = Number(dayValue);
  const newDate = getDateForDay(day);
  if (dragged.date === newDate) return;

  dragged.date = newDate;
  sortItineraryChronologically();
  saveData();
  renderItineraryWorkspace();
  showToast(`Moved "${dragged.destinationName || 'place'}" to Day ${day}.`, 'success');
}


/**
 * Lakbay | Screen 4: Itinerary - Stop Actions
 * Delete/undo, reorder, sample plan loader, clear itinerary.
 */
'use strict';

/**
 * Removes a stop and offers an Undo toast
 */
function deleteStop(stopId) {
  const index = appState.itinerary.findIndex(s => s.id === stopId);
  if (index === -1) return;

  const deleted = appState.itinerary.splice(index, 1)[0];
  appState.lastDeletedStop = deleted;
  saveData();
  renderItineraryWorkspace();

  showToast(`Removed "${deleted.destinationName || 'stop'}".`, 'info', true);
}

/**
 * Undoes previous delete
 */
function undoDeleteStop() {
  if (!appState.lastDeletedStop) return;
  appState.itinerary.push(appState.lastDeletedStop);
  appState.lastDeletedStop = null;
  sortItineraryChronologically();
  saveData();
  renderItineraryWorkspace();
  showToast('Restored stop.', 'success');
}

/**
 * Reorders a stop earlier or later in time
 */
function reorderStop(stopId, direction) {
  const stop = appState.itinerary.find(s => s.id === stopId);
  if (!stop) return;

  const currentMins = timeToMinutes(stop.time);
  const delta = direction === 'up' ? -30 : 30;
  const newMins = Math.max(360, Math.min(1380, currentMins + delta)); // between 06:00 and 23:00

  stop.time = minutesToTime(newMins);
  sortItineraryChronologically();
  saveData();
  renderItineraryWorkspace();
}

/**
 * Loads a curated 2-day Baguio itinerary that fits within the budget
 */
function loadSampleItinerary() {
  const startDate = appState.trip.startDate || getTodayDateString();
  const dateDay1 = getDateForDay(1);
  const dateDay2 = getDateForDay(2);

  appState.trip.days = Math.max(2, appState.trip.days || 2);

  appState.itinerary = [
    // Day 1
    {
      id: generateUniqueId(),
      destinationId: 3, // Wright Park
      destinationName: 'Wright Park',
      category: 'Nature & Parks',
      fee: 0,
      date: dateDay1,
      time: '09:00',
      duration: 60,
      activity: 'Morning stroll along the Pool of Pines'
    },
    {
      id: generateUniqueId(),
      destinationId: 4, // The Mansion
      destinationName: 'The Mansion',
      category: 'Culture & Heritage',
      fee: 0,
      date: dateDay1,
      time: '10:15',
      duration: 45,
      activity: 'Sightseeing at the presidential summer palace gates'
    },
    {
      id: generateUniqueId(),
      destinationId: 2, // Mines View Park
      destinationName: 'Mines View Park',
      category: 'Viewpoints',
      fee: 10,
      date: dateDay1,
      time: '11:30',
      duration: 90,
      activity: 'Panoramic ridge views and buying Good Shepherd strawberry jam'
    },
    {
      id: generateUniqueId(),
      destinationId: 15, // Baguio Night Market (actual ID 15)
      destinationName: 'Baguio Night Market',
      category: 'Food & Shopping',
      fee: 0,
      date: dateDay1,
      time: '21:00',
      duration: 90,
      activity: 'Street food tasting, strawberry taho, and thrift shopping'
    },
    // Day 2
    {
      id: generateUniqueId(),
      destinationId: 1, // Burnham Park
      destinationName: 'Burnham Park',
      category: 'Nature & Parks',
      fee: 0,
      date: dateDay2,
      time: '09:00',
      duration: 90,
      activity: 'Swan paddleboat lagoon rowing and rose garden walk'
    },
    {
      id: generateUniqueId(),
      destinationId: 6, // Camp John Hay (actual ID 6)
      destinationName: 'Camp John Hay',
      category: 'Nature & Parks',
      fee: 80,
      date: dateDay2,
      time: '11:00',
      duration: 120,
      activity: 'Trekking the Yellow Trail and visiting Bell Amphitheater'
    },
    {
      id: generateUniqueId(),
      destinationId: 5, // Baguio Botanical Garden (actual ID 5)
      destinationName: 'Baguio Botanical Garden',
      category: 'Nature & Parks',
      fee: 10,
      date: dateDay2,
      time: '14:30',
      duration: 60,
      activity: 'Exploring Igorot cultural village replicas and indigenous pines'
    }
  ];

  sortItineraryChronologically();
  saveData();
  renderItineraryWorkspace();

  showToast('Loaded sample 2-day Baguio itinerary!', 'success');
}

/**
 * Clears all itinerary stops after user confirmation
 */
function clearItinerary() {
  openConfirmDialog(
    'Clear All Itinerary Stops?',
    'Are you sure you want to remove all planned stops? Your established budget settings will remain intact.',
    () => {
      appState.itinerary = [];
      saveData();
      renderItineraryWorkspace();
      showToast('Itinerary stops cleared.', 'info');
    }
  );
}


/**
 * Lakbay | Screen 4: Itinerary - Stop Editor Modal
 * Add / edit stop dialog and its inspector logic.
 */
'use strict';

/**
 * Setup Stop Editor Modal dialog and controls
 */
function setupStopEditorModal() {
  const modal = document.getElementById('stop-editor-modal');
  const backdrop = document.getElementById('stop-editor-backdrop');
  const closeBtn = document.getElementById('stop-modal-close');
  const cancelBtn = document.getElementById('btn-cancel-stop-modal');
  const form = document.getElementById('stop-editor-form');

  const destSelect = document.getElementById('stop-destination-select');
  const placeInput = document.getElementById('stop-place-input');
  const placeOptions = document.getElementById('stop-place-options');
  const daySelect = document.getElementById('stop-day-select');
  const dateInput = document.getElementById('stop-date-input');
  const timeInput = document.getElementById('stop-time-input');
  const endTimeInput = document.getElementById('stop-end-time-input');
  const durInput = document.getElementById('stop-duration-input');
  const activityInput = document.getElementById('stop-activity-input');
  const descInput = document.getElementById('stop-description-input');
  const websiteInput = document.getElementById('stop-website-input');
  const phoneInput = document.getElementById('stop-phone-input');
  const addressInput = document.getElementById('stop-address-input');
  const feeInput = document.getElementById('stop-fee-input');
  const removeBtn = document.getElementById('btn-remove-stop');
  const saveBtn = document.getElementById('btn-save-stop');
  const footer = document.querySelector('#stop-editor-modal .drawer-form-footer');

  const previewStrip = document.getElementById('stop-dest-preview-strip');
  const previewImg = document.getElementById('stop-preview-img');
  const previewName = document.getElementById('stop-preview-name');
  const previewCat = document.getElementById('stop-preview-category');
  const previewFee = document.getElementById('stop-preview-fee');
  const previewArea = document.getElementById('stop-preview-area');

  const suggRow = document.getElementById('stop-activity-suggestions');
  const suggChipsWrap = document.getElementById('stop-suggestions-chips');

  const impactFee = document.getElementById('modal-impact-fee');
  const impactRemaining = document.getElementById('modal-impact-remaining');

  const populateDestPicker = (selectedId = null) => {
    if (!destSelect) return;
    const list = sampleDestinations;

    destSelect.innerHTML = '<option value="">-- Choose a Baguio Destination --</option>' +
      list.map(d => {
        const feeStr = d.fee > 0 ? `₱${d.fee}` : 'Free';
        return `<option value="${d.id}">${escapeHTML(d.name)} (${escapeHTML(d.category)}) — ${feeStr}</option>`;
      }).join('');

    if (placeOptions) {
      placeOptions.innerHTML = list.map(d => {
        const label = `${d.category} · ${d.area || d.location || 'Baguio City'}`;
        return `<option value="${escapeHTML(d.name)}" label="${escapeHTML(label)}"></option>`;
      }).join('');
    }

    if (selectedId) {
      destSelect.value = selectedId;
    }
  };

  /** Matches the typed place to a known destination (exact name, case-insensitive). */
  const findDestinationByName = (name) => {
    const clean = (name || '').trim().toLowerCase();
    if (!clean) return null;
    return sampleDestinations.find(d => (d.name || '').toLowerCase() === clean) || null;
  };

  /** Recalculates the budget impact using the editable cost field. */
  const updateBudgetImpact = () => {
    const currentFee = Math.max(0, Number(feeInput && feeInput.value) || 0);
    if (impactFee) {
      impactFee.textContent = currentFee > 0 ? `₱${formatNumber(currentFee)}` : 'Free Entry';
    }

    const maxBudget = appState.trip.budgetMax || 3500;
    const baseCost = Math.round(maxBudget * 0.80);
    const currentStopsFees = appState.itinerary
      .filter(s => s.id !== stopEditorTargetId)
      .reduce((sum, s) => sum + (Number(s.fee) || 0), 0);

    const projectedRemaining = maxBudget - (baseCost + currentStopsFees + currentFee);
    if (impactRemaining) {
      impactRemaining.textContent = projectedRemaining >= 0
        ? `₱${formatNumber(projectedRemaining)}`
        : `-₱${formatNumber(Math.abs(projectedRemaining))} (Over Limit)`;
      impactRemaining.style.color = projectedRemaining >= 0 ? '#10352b' : '#b91c1c';
    }
  };

  const updateDestPreview = () => {
    const destId = Number(destSelect.value);
    const dest = sampleDestinations.find(d => d.id === destId);
    if (!dest) {
      if (previewStrip) previewStrip.style.display = 'none';
      if (suggRow) suggRow.style.display = 'none';
      updateBudgetImpact();
      return;
    }

    // Keep the visible name field in sync when a known destination is chosen.
    if (placeInput && stopEditorSyncNameOnPreview) placeInput.value = dest.name;

    if (previewStrip) previewStrip.style.display = 'flex';
    if (previewImg) previewImg.src = dest.image;
    if (previewName) previewName.textContent = dest.name;
    if (previewCat) previewCat.textContent = dest.category;
    if (previewFee) {
      previewFee.textContent = dest.fee > 0 ? `₱${dest.fee}` : 'Free Entry';
      previewFee.className = `badge ${dest.fee > 0 ? 'badge-fee-paid' : 'badge-fee-free'}`;
    }
    if (previewArea) previewArea.textContent = dest.area || dest.location;

    // Auto-fill the optional details from the destination when available.
    const fillIfEmpty = (el, value) => {
      if (el && value && !String(el.value || '').trim()) el.value = value;
    };
    fillIfEmpty(descInput, dest.description);
    fillIfEmpty(websiteInput, dest.website);
    fillIfEmpty(addressInput, dest.address || dest.location || dest.area);
    fillIfEmpty(phoneInput, dest.phone);
    if (feeInput) feeInput.value = String(Number(dest.fee) || 0);

    // Suggestions chips
    if (suggRow && suggChipsWrap) {
      if (dest.activities && dest.activities.length) {
        suggRow.style.display = 'flex';
        suggChipsWrap.innerHTML = dest.activities.map(act => `
          <button type="button" class="sugg-chip" data-act="${escapeHTML(act)}">${escapeHTML(act)}</button>
        `).join('');

        suggChipsWrap.querySelectorAll('.sugg-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            if (activityInput) activityInput.value = chip.getAttribute('data-act');
          });
        });
      } else {
        suggRow.style.display = 'none';
      }
    }

    updateBudgetImpact();
  };

  if (destSelect) {
    destSelect.addEventListener('change', updateDestPreview);
  }

  // Typing a known place binds it to the destination; anything else stays a custom place.
  if (placeInput) {
    placeInput.addEventListener('input', () => {
      const match = findDestinationByName(placeInput.value);
      const nextValue = match ? String(match.id) : '';
      if (destSelect && destSelect.value !== nextValue) {
        destSelect.value = nextValue;
        updateDestPreview();
      }
      if (!match) {
        if (previewStrip) previewStrip.style.display = 'none';
        if (suggRow) suggRow.style.display = 'none';
        updateBudgetImpact();
      }
    });
  }

  if (feeInput) feeInput.addEventListener('input', updateBudgetImpact);

  if (daySelect && dateInput) {
    daySelect.addEventListener('change', () => {
      const dayNum = parseInt(daySelect.value, 10) || 1;
      dateInput.value = getDateForDay(dayNum);
    });

    dateInput.addEventListener('change', () => {
      const dayNum = getStopDayIndex(dateInput.value);
      daySelect.value = String(dayNum);
    });
  }

  const durChips = document.querySelectorAll('.duration-chip');
  durChips.forEach(chip => {
    chip.addEventListener('click', () => {
      durChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (durInput) durInput.value = chip.getAttribute('data-dur');
      syncDepartureFromDuration();
    });
  });

  const syncDepartureFromDuration = () => {
    if (!timeInput || !endTimeInput || !durInput) return;
    const start = timeToMinutes(timeInput.value || '09:00');
    const duration = Math.max(15, parseInt(durInput.value, 10) || 90);
    endTimeInput.value = minutesToTime(start + duration);
  };

  const syncDurationFromDeparture = () => {
    if (!timeInput || !endTimeInput || !durInput) return;
    const start = timeToMinutes(timeInput.value || '09:00');
    const end = timeToMinutes(endTimeInput.value || minutesToTime(start + 90));
    let duration = end - start;
    if (duration < 15) {
      duration += 24 * 60;
    }
    if (duration > 480) duration = 480;
    durInput.value = String(Math.max(15, Math.round(duration / 15) * 15));
    durChips.forEach(c => c.classList.toggle('active', Number(c.getAttribute('data-dur')) === Number(durInput.value)));
  };

  if (timeInput) timeInput.addEventListener('change', syncDepartureFromDuration);
  if (durInput) durInput.addEventListener('change', syncDepartureFromDuration);
  if (endTimeInput) endTimeInput.addEventListener('change', syncDurationFromDeparture);

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
    stopEditorTargetId = null;
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      const targetId = stopEditorTargetId;
      if (!targetId) return;
      appState.itinerary = appState.itinerary.filter(s => s.id !== targetId);
      if (appState.selectedStopId === targetId) appState.selectedStopId = null;
      sortItineraryChronologically();
      saveData();
      renderItineraryWorkspace();
      closeModal();
      showToast('Place removed from your itinerary.', 'success');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const placeName = (placeInput ? placeInput.value : '').trim();
      if (!placeName) {
        showToast('Please enter a place or activity name.', 'warning');
        if (placeInput) placeInput.focus();
        return;
      }

      const destId = Number(destSelect.value) || null;
      const dest = destId ? sampleDestinations.find(d => d.id === destId) : null;
      const scheduledDate = dateInput.value || getDateForDay(1);
      const startTime = timeInput.value || '09:00';
      const duration = Math.max(15, parseInt(durInput.value, 10) || 90);
      const details = {
        destinationId: destId,
        destinationName: placeName,
        category: dest ? dest.category : 'Custom Place',
        fee: Math.max(0, Number(feeInput && feeInput.value) || 0),
        date: scheduledDate,
        time: startTime,
        duration: duration,
        activity: (activityInput.value || '').trim(),
        description: (descInput && descInput.value || '').trim(),
        website: (websiteInput && websiteInput.value || '').trim(),
        phone: (phoneInput && phoneInput.value || '').trim(),
        address: (addressInput && addressInput.value || '').trim()
      };

      if (stopEditorTargetId) {
        const stop = appState.itinerary.find(s => s.id === stopEditorTargetId);
        if (stop) {
          Object.assign(stop, details);
          showToast(`Updated "${placeName}"!`, 'success');
        }
      } else {
        appState.itinerary.push({ id: generateUniqueId(), ...details });
        showToast(`Added "${placeName}" to Day ${getStopDayIndex(scheduledDate)}!`, 'success');
      }

      sortItineraryChronologically();
      saveData();
      renderItineraryWorkspace();
      closeModal();
    });
  }
}

/**
 * Opens Stop Editor Modal for adding or editing
 */
function openStopEditor(options = {}) {
  const modal = document.getElementById('stop-editor-modal');
  if (!modal) return;

  const titleEl = document.getElementById('stop-modal-title');
  const destSelect = document.getElementById('stop-destination-select');
  const placeInput = document.getElementById('stop-place-input');
  const daySelect = document.getElementById('stop-day-select');
  const dateInput = document.getElementById('stop-date-input');
  const timeInput = document.getElementById('stop-time-input');
  const endTimeInput = document.getElementById('stop-end-time-input');
  const durInput = document.getElementById('stop-duration-input');
  const activityInput = document.getElementById('stop-activity-input');
  const descInput = document.getElementById('stop-description-input');
  const websiteInput = document.getElementById('stop-website-input');
  const phoneInput = document.getElementById('stop-phone-input');
  const addressInput = document.getElementById('stop-address-input');
  const feeInput = document.getElementById('stop-fee-input');
  const removeBtn = document.getElementById('btn-remove-stop');
  const saveBtn = document.getElementById('btn-save-stop');
  const footer = document.querySelector('#stop-editor-modal .drawer-form-footer');

  const daysCount = appState.trip.days || 2;
  if (daySelect) {
    daySelect.innerHTML = Array.from({ length: daysCount }, (_, i) => i + 1)
      .map(d => `<option value="${d}">Day ${d}</option>`)
      .join('');
  }

  destSelect.innerHTML = '<option value="">-- Choose a Baguio Destination --</option>' +
    sampleDestinations.map(d => {
      const feeStr = d.fee > 0 ? `₱${d.fee}` : 'Free';
      return `<option value="${d.id}">${escapeHTML(d.name)} (${escapeHTML(d.category)}) — ${feeStr}</option>`;
    }).join('');

  const placeOptions = document.getElementById('stop-place-options');
  if (placeOptions) {
    placeOptions.innerHTML = sampleDestinations.map(d => {
      const label = `${d.category} · ${d.area || d.location || 'Baguio City'}`;
      return `<option value="${escapeHTML(d.name)}" label="${escapeHTML(label)}"></option>`;
    }).join('');
  }

  const isEditing = !!options.stopId;
  if (isEditing) {
    stopEditorTargetId = options.stopId;
    if (titleEl) titleEl.textContent = 'Edit Place in Itinerary';
    const stop = appState.itinerary.find(s => s.id === options.stopId);
    if (stop) {
      const matchedDest = sampleDestinations.find(d => d.id === stop.destinationId);
      if (destSelect) destSelect.value = matchedDest ? matchedDest.id : '';
      if (placeInput) placeInput.value = stop.destinationName || (matchedDest ? matchedDest.name : '');
      const dayNum = getStopDayIndex(stop.date);
      if (daySelect) daySelect.value = String(dayNum);
      if (dateInput) dateInput.value = stop.date;
      if (timeInput) timeInput.value = stop.time;
      if (durInput) durInput.value = stop.duration || 90;
      if (endTimeInput) {
        endTimeInput.value = minutesToTime(timeToMinutes(stop.time || '09:00') + (Number(stop.duration) || 90));
      }
      if (activityInput) activityInput.value = stop.activity || '';
      if (descInput) descInput.value = stop.description || '';
      if (websiteInput) websiteInput.value = stop.website || '';
      if (phoneInput) phoneInput.value = stop.phone || '';
      if (addressInput) addressInput.value = stop.address || '';
      if (feeInput) feeInput.value = String(Number(stop.fee) || 0);
    }
  } else {
    stopEditorTargetId = null;
    if (titleEl) titleEl.textContent = 'Add Place to Itinerary';
    const targetDay = options.day ? Number(options.day) : 1;
    if (daySelect) daySelect.value = String(targetDay);
    if (dateInput) dateInput.value = getDateForDay(targetDay);

    if (options.destinationId && destSelect) {
      destSelect.value = options.destinationId;
    } else if (destSelect) {
      destSelect.value = '';
    }

    if (placeInput) placeInput.value = '';
    if (timeInput) timeInput.value = '09:00';
    if (durInput) durInput.value = '90';
    if (endTimeInput) endTimeInput.value = '10:30';
    if (activityInput) activityInput.value = '';
    if (descInput) descInput.value = '';
    if (websiteInput) websiteInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (addressInput) addressInput.value = '';
    if (feeInput) feeInput.value = '0';
  }

  if (removeBtn) removeBtn.style.display = isEditing ? '' : 'none';
  if (footer) footer.classList.toggle('has-remove', isEditing);
  if (saveBtn) saveBtn.textContent = isEditing ? 'Save Changes' : 'Add to Itinerary';

  // Refresh the preview, but keep a custom name the user may have typed over a known destination.
  const matched = sampleDestinations.find(d => d.id === Number(destSelect.value));
  const keepsCustomName = isEditing && placeInput && placeInput.value && matched &&
    placeInput.value.toLowerCase() !== (matched.name || '').toLowerCase();
  stopEditorSyncNameOnPreview = !keepsCustomName;
  destSelect.dispatchEvent(new Event('change'));
  stopEditorSyncNameOnPreview = true;
  modal.style.display = 'flex';
}


/**
 * Lakbay | Screen 4: Itinerary - Controls
 * Event listeners for budget setup and planner, plus Explore-to-Itinerary hand-off helpers.
 */
'use strict';

/**
 * Event listeners for the always-visible trip setup card.
 */
function setupTripControls() {
  const dateInput = document.getElementById('trip-start-date');
  const travelersInput = document.getElementById('trip-travelers');
  const daysInput = document.getElementById('budget-trip-days');

  syncTripSetupFromState();

  const syncDaysView = () => {
    const minVal = document.getElementById('budget-num-min');
    const maxVal = document.getElementById('budget-num-max');
    updateBudgetCalculations(
      minVal ? parseInt(minVal.value, 10) || 1500 : 1500,
      maxVal ? parseInt(maxVal.value, 10) || 3500 : 3500,
      appState.trip.days || 2
    );

    if (appState.hasConfirmedBudget) {
      activeDayFilter = 'all';
      renderItineraryWorkspace();
    }
  };

  if (dateInput) {
    dateInput.addEventListener('change', () => {
      if (!dateInput.value) return;
      // Preserve each stop's relative day before shifting the trip dates.
      const relativeDays = appState.itinerary.map(stop => getStopDayIndex(stop.date));
      appState.trip.startDate = dateInput.value;
      appState.itinerary.forEach((stop, index) => {
        const day = Math.min(relativeDays[index] || 1, appState.trip.days || 2);
        stop.date = getDateForDay(day);
      });
      sortItineraryChronologically();
      saveData();
      if (appState.hasConfirmedBudget) renderItineraryWorkspace();
    });
  }

  if (travelersInput) {
    travelersInput.addEventListener('change', () => {
      appState.budget.travelers = Math.max(1, parseInt(travelersInput.value, 10) || 1);
      saveData();
      showToast(`Trip set for ${appState.budget.travelers} traveler${appState.budget.travelers === 1 ? '' : 's'}.`, 'success');
    });
  }

  if (daysInput) {
    const handleSetupDaysChange = () => {
      let days = parseInt(daysInput.value, 10) || 2;
      if (days < 1) days = 1;
      if (days > 30) days = 30;
      daysInput.value = days;
      appState.trip.days = days;
      saveData();
      syncDaysView();
    };
    daysInput.addEventListener('change', handleSetupDaysChange);
    daysInput.addEventListener('blur', handleSetupDaysChange);
  }
}

/**
 * Event listeners and controls for Step 1 Budget Setup & Itinerary Planner
 */
function setupItineraryControls() {
  // Trip setup (date / travelers / duration) stays visible in both planner views
  setupTripControls();

  const sliderMin = document.getElementById('budget-slider-min');
  const sliderMax = document.getElementById('budget-slider-max');
  const numMin = document.getElementById('budget-num-min');
  const numMax = document.getElementById('budget-num-max');
  const daysInput = document.getElementById('budget-trip-days');
  const presetButtons = document.querySelectorAll('#budget-preset-buttons .btn-preset');
  const btnConfirm = document.getElementById('btn-confirm-budget');
  const btnEdit = document.getElementById('btn-edit-confirmed-budget');

  const btnOpenAddStop = document.getElementById('btn-open-add-stop-modal');
  const btnLoadSample = document.getElementById('btn-load-sample-itinerary');
  const btnClearItin = document.getElementById('btn-clear-itinerary');

  // Setup stop editor modal listeners
  setupStopEditorModal();

  // Planner Workspace Buttons
  if (btnOpenAddStop) {
    btnOpenAddStop.addEventListener('click', () => {
      openStopEditor();
    });
  }

  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', loadSampleItinerary);
  }

  if (btnClearItin) {
    btnClearItin.addEventListener('click', clearItinerary);
  }

  // 1. Min Slider Input
  if (sliderMin && sliderMax && numMin && numMax) {
    sliderMin.addEventListener('pointerdown', () => {
      sliderMin.style.zIndex = '5';
      sliderMax.style.zIndex = '4';
    });
    sliderMax.addEventListener('pointerdown', () => {
      sliderMax.style.zIndex = '5';
      sliderMin.style.zIndex = '4';
    });

    sliderMin.addEventListener('input', () => {
      sliderMin.style.zIndex = '5';
      sliderMax.style.zIndex = '4';
      let minVal = parseInt(sliderMin.value, 10);
      const maxVal = parseInt(sliderMax.value, 10);

      if (minVal > maxVal - BUDGET_SLIDER_CONFIG.MIN_GAP) {
        minVal = maxVal - BUDGET_SLIDER_CONFIG.MIN_GAP;
        sliderMin.value = minVal;
      }

      numMin.value = minVal;
      const days = daysInput ? parseInt(daysInput.value, 10) || 2 : 2;
      updateBudgetCalculations(minVal, maxVal, days);
      updateSliderTrackHighlight(minVal, maxVal);
      highlightMatchingPreset(minVal, maxVal);
    });

    // 2. Max Slider Input
    sliderMax.addEventListener('input', () => {
      sliderMax.style.zIndex = '5';
      sliderMin.style.zIndex = '4';
      const minVal = parseInt(sliderMin.value, 10);
      let maxVal = parseInt(sliderMax.value, 10);

      if (maxVal < minVal + BUDGET_SLIDER_CONFIG.MIN_GAP) {
        maxVal = minVal + BUDGET_SLIDER_CONFIG.MIN_GAP;
        sliderMax.value = maxVal;
      }

      numMax.value = maxVal;
      const days = daysInput ? parseInt(daysInput.value, 10) || 2 : 2;
      updateBudgetCalculations(minVal, maxVal, days);
      updateSliderTrackHighlight(minVal, maxVal);
      highlightMatchingPreset(minVal, maxVal);
    });

    // 3. Min Number Input
    const handleMinNumChange = () => {
      let minVal = parseInt(numMin.value, 10) || BUDGET_SLIDER_CONFIG.MIN_ALLOWED;
      const maxVal = parseInt(numMax.value, 10) || 3500;

      if (minVal < BUDGET_SLIDER_CONFIG.MIN_ALLOWED) {
        minVal = BUDGET_SLIDER_CONFIG.MIN_ALLOWED;
      }
      if (minVal > maxVal - BUDGET_SLIDER_CONFIG.MIN_GAP) {
        minVal = maxVal - BUDGET_SLIDER_CONFIG.MIN_GAP;
      }

      numMin.value = minVal;
      sliderMin.value = minVal;
      const days = daysInput ? parseInt(daysInput.value, 10) || 2 : 2;
      updateBudgetCalculations(minVal, maxVal, days);
      updateSliderTrackHighlight(minVal, maxVal);
      highlightMatchingPreset(minVal, maxVal);
    };
    numMin.addEventListener('change', handleMinNumChange);
    numMin.addEventListener('blur', handleMinNumChange);

    // 4. Max Number Input
    const handleMaxNumChange = () => {
      const minVal = parseInt(numMin.value, 10) || BUDGET_SLIDER_CONFIG.MIN_ALLOWED;
      let maxVal = parseInt(numMax.value, 10) || 3500;

      if (maxVal > BUDGET_SLIDER_CONFIG.MAX_ALLOWED) {
        maxVal = BUDGET_SLIDER_CONFIG.MAX_ALLOWED;
      }
      if (maxVal < minVal + BUDGET_SLIDER_CONFIG.MIN_GAP) {
        maxVal = minVal + BUDGET_SLIDER_CONFIG.MIN_GAP;
      }

      numMax.value = maxVal;
      sliderMax.value = maxVal;
      const days = daysInput ? parseInt(daysInput.value, 10) || 2 : 2;
      updateBudgetCalculations(minVal, maxVal, days);
      updateSliderTrackHighlight(minVal, maxVal);
      highlightMatchingPreset(minVal, maxVal);
    };
    numMax.addEventListener('change', handleMaxNumChange);
    numMax.addEventListener('blur', handleMaxNumChange);
  }

  // 5. Trip Days Input
  if (daysInput) {
    const handleDaysChange = () => {
      let days = parseInt(daysInput.value, 10) || 2;
      if (days < 1) days = 1;
      if (days > 30) days = 30;
      daysInput.value = days;

      const minVal = numMin ? parseInt(numMin.value, 10) || 1500 : 1500;
      const maxVal = numMax ? parseInt(numMax.value, 10) || 3500 : 3500;
      updateBudgetCalculations(minVal, maxVal, days);
    };
    daysInput.addEventListener('input', handleDaysChange);
    daysInput.addEventListener('change', handleDaysChange);
  }

  // 6. Preset Buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pMin = parseInt(btn.getAttribute('data-min'), 10);
      const pMax = parseInt(btn.getAttribute('data-max'), 10);
      if (!pMin || !pMax) return;

      if (sliderMin) sliderMin.value = pMin;
      if (sliderMax) sliderMax.value = pMax;
      if (numMin) numMin.value = pMin;
      if (numMax) numMax.value = pMax;

      const days = daysInput ? parseInt(daysInput.value, 10) || 2 : 2;
      updateBudgetCalculations(pMin, pMax, days);
      updateSliderTrackHighlight(pMin, pMax);
      highlightMatchingPreset(pMin, pMax);
    });
  });

  // 7. Confirm Budget Action
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      const minVal = numMin ? parseInt(numMin.value, 10) || 1500 : 1500;
      const maxVal = numMax ? parseInt(numMax.value, 10) || 3500 : 3500;
      const days = daysInput ? parseInt(daysInput.value, 10) || 2 : 2;
      const startDateInput = document.getElementById('trip-start-date');
      const travelersInput = document.getElementById('trip-travelers');

      if (startDateInput && startDateInput.value) appState.trip.startDate = startDateInput.value;
      if (travelersInput) appState.budget.travelers = Math.max(1, parseInt(travelersInput.value, 10) || 1);

      if (minVal > maxVal) {
        showToast('Minimum budget cannot exceed maximum budget.', 'warning');
        return;
      }

      appState.trip.budgetMin = minVal;
      appState.trip.budgetMax = maxVal;
      appState.trip.days = days;
      appState.trip.budgetConfirmed = true;
      appState.hasConfirmedBudget = true;

      saveData();
      localStorage.setItem('lakbay_budget_range', JSON.stringify({
        min: minVal,
        max: maxVal,
        days: days,
        confirmed: true
      }));

      renderItineraryList();
      showToast(`Budget established: ₱${formatNumber(minVal)} – ₱${formatNumber(maxVal)} (${days} Days)`, 'success');
    });
  }

  // 8. Edit Confirmed Budget Action
  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      appState.hasConfirmedBudget = false;
      appState.trip.budgetConfirmed = false;
      saveData();

      const selectorView = document.getElementById('budget-selector-view');
      const confirmedView = document.getElementById('budget-confirmed-view');
      if (selectorView) selectorView.style.display = 'block';
      if (confirmedView) confirmedView.style.display = 'none';

      syncBudgetInputsFromState();

      if (numMin) numMin.focus();
    });
  }
}

/**
 * Integration Stubs for Other Screens (Explore / Details / Summary)
 */
function prefillItineraryForm(destId) {
  showSection('itinerary');
  const dest = sampleDestinations.find(d => d.id === destId);
  const destName = dest ? dest.name : 'Destination';

  if (!appState.hasConfirmedBudget) {
    showToast(`Please confirm your estimated budget first before planning "${destName}".`, 'info');
  } else {
    openStopEditor({ destinationId: destId });
  }
}

function openQuickAddPopover(destId, anchorBtn) {
  prefillItineraryForm(destId);
}

function setupQuickAddPopover() {
  // Integrated into stop-editor-modal
}

function setupDestinationDropdown() {
  // Handled inside stop editor
}

function sortItineraryChronologically() {
  if (!Array.isArray(appState.itinerary)) return;
  appState.itinerary.sort((a, b) => {
    if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
    return (a.time || '').localeCompare(b.time || '');
  });
}

