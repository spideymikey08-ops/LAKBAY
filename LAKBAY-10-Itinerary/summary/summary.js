/**
 * Lakbay | Screen 6: Travel Plan Summary
 * Day-by-day summary, print, and summary action buttons.
 */
'use strict';

/* ==========================================================================
   SCREEN 6: TRAVEL PLAN SUMMARY (Day-by-Day, Export JSON, Copy Plan, Print)
   ========================================================================== */
function setupSummaryControls() {
  const printBtn = document.getElementById('btn-print-summary');
  const copyBtn = document.getElementById('btn-summary-copy-plan');
  const exportBtn = document.getElementById('btn-summary-export-json');

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', copyPlanAsText);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportJSON);
  }
}

function buildSummary() {
  const reportCard = document.getElementById('summary-report-card');
  const emptyState = document.getElementById('summary-empty-state');
  const printBtn = document.getElementById('btn-print-summary');

  const stops = appState.itinerary;
  const trip = appState.trip;

  const hasData = stops.length > 0 || appState.hasConfirmedBudget;

  if (!hasData) {
    if (reportCard) reportCard.style.display = 'none';
    if (printBtn) printBtn.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (reportCard) reportCard.style.display = 'block';
  if (printBtn) printBtn.style.display = 'inline-flex';

  // 1. Meta Details
  const metaDays = document.getElementById('summary-meta-days');
  const metaTravelers = document.getElementById('summary-meta-travelers');
  const metaStops = document.getElementById('summary-meta-stops-count');

  const daysCount = trip.days || 2;
  const nightsCount = Math.max(1, daysCount - 1);
  const travelersCount = 1;

  if (metaDays) metaDays.textContent = `${daysCount} Day${daysCount === 1 ? '' : 's'} (${nightsCount} Night${nightsCount === 1 ? '' : 's'})`;
  if (metaTravelers) metaTravelers.textContent = `${travelersCount} Person${travelersCount === 1 ? '' : 's'}`;
  if (metaStops) metaStops.textContent = `${stops.length} Stop${stops.length === 1 ? '' : 's'}`;

  // 3. Day-by-Day Itinerary Schedule with Per-Day Subtotals
  const itineraryContainer = document.getElementById('summary-itinerary-list');
  if (itineraryContainer) {
    if (stops.length === 0) {
      itineraryContainer.innerHTML = '<span style="color: #94a3b8; font-style: italic;">No planned stops yet.</span>';
    } else {
      const uniqueDates = [...new Set(stops.map(s => s.date))].sort();
      itineraryContainer.innerHTML = uniqueDates.map((dateStr, idx) => {
        const dayStops = stops.filter(s => s.date === dateStr);
        const dayNumber = idx + 1;
        const formattedDate = formatDate(dateStr);
        const dayFees = dayStops.reduce((sum, s) => sum + (Number(s.fee) || 0), 0);

        return `
          <div class="summary-day-group">
            <div class="summary-day-header">
              Day ${dayNumber} — ${formattedDate} (${dayStops.length} stops · Entrance Fees: ${dayFees === 0 ? 'Free' : '₱' + dayFees.toFixed(2)}/person)
            </div>
            ${dayStops.map(stop => {
              const duration = stop.duration || 90;
              const startMins = timeToMinutes(stop.time);
              const endMins = startMins + duration;
              const rangeStr = `${stop.time} – ${minutesToTime(endMins)}`;
              const isDone = isPastDate(stop.date);

              return `
                <div class="summary-itinerary-item">
                  <span class="summary-time-tag">${rangeStr}</span>
                  <span class="summary-itinerary-text">
                    <strong>${escapeHTML(stop.destinationName)}</strong>
                    ${isDone ? ' <span class="stop-status-badge completed">✓ Completed</span>' : ''}
                    ${stop.activity && stop.activity.trim() ? `: ${escapeHTML(stop.activity)}` : ''}
                    ${stop.fee > 0 ? ` <small style="color: #10352b; font-weight:700;">(Fee: ₱${stop.fee})</small>` : ' <small style="color: #5f7e75;">(Free)</small>'}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('');
    }
  }

  // 4. Budget Breakdown (Calculated from Itinerary Budget Selection)
  const costTrans = document.getElementById('summary-cost-trans');
  const costAcc = document.getElementById('summary-cost-acc');
  const costFood = document.getElementById('summary-cost-food');
  const costAct = document.getElementById('summary-cost-activities');
  const costExtra = document.getElementById('summary-cost-extra');
  const costTotal = document.getElementById('summary-cost-total');
  const costPerPerson = document.getElementById('summary-cost-per-person');
  const costTravelers = document.getElementById('summary-cost-travelers');

  const maxBudget = trip.budgetMax || 3500;
  const lodging = Math.round(maxBudget * 0.40);
  const food = Math.round(maxBudget * 0.25);
  const transpo = Math.round(maxBudget * 0.15);
  const stopsFees = stops.reduce((sum, s) => sum + (Number(s.fee) || 0), 0);
  const other = Math.round(maxBudget * 0.10);

  if (costTrans) costTrans.textContent = formatCurrency(transpo);
  if (costAcc) costAcc.textContent = formatCurrency(lodging);
  if (costFood) costFood.textContent = formatCurrency(food);
  if (costAct) costAct.textContent = formatCurrency(stopsFees);
  if (costExtra) costExtra.textContent = formatCurrency(other);
  if (costTotal) costTotal.textContent = `₱${formatNumber(trip.budgetMin || 1500)} – ₱${formatNumber(maxBudget)}`;
  if (costPerPerson) costPerPerson.textContent = `₱${formatNumber(trip.budgetMin || 1500)} – ₱${formatNumber(maxBudget)}`;
  if (costTravelers) costTravelers.textContent = travelersCount;
}

const generateSummary = buildSummary;

