/**
 * Lakbay | Feature: Export & Share
 * Copy plan as text, export JSON, import JSON.
 */
'use strict';

/**
 * Text export formatter for Screen 6
 */
function copyPlanAsText() {
  const trip = appState.trip;
  const stops = appState.itinerary;
  const days = trip.days || 2;
  const nights = Math.max(1, days - 1);
  const minBudget = trip.budgetMin || 1500;
  const maxBudget = trip.budgetMax || 3500;

  const totalFees = stops.reduce((sum, s) => {
    const d = sampleDestinations.find(dest => dest.id === s.destinationId);
    return sum + (d ? Number(d.fee) || 0 : (Number(s.fee) || 0));
  }, 0);

  let text = `=================================================\n`;
  text += `LAKBAY PH — ${(trip.name || 'BAGUIO MOUNTAIN HOLIDAY').toUpperCase()}\n`;
  text += `=================================================\n`;
  text += `Destination: ${trip.city || 'Baguio City'}\n`;
  text += `Duration: ${days} Day(s) (${nights} Night(s))\n`;
  text += `Budget Limit: ₱${formatNumber(minBudget)} – ₱${formatNumber(maxBudget)}\n`;
  text += `Total Entrance Fees: ₱${formatNumber(totalFees)}\n`;
  text += `=================================================\n\n`;

  if (stops.length === 0) {
    text += `No stops scheduled yet.\n`;
  } else {
    const uniqueDates = [...new Set(stops.map(s => s.date))].sort();
    uniqueDates.forEach((dateStr, idx) => {
      const dayStops = stops.filter(s => s.date === dateStr);
      text += `Day ${idx + 1} (${formatDate(dateStr)}):\n`;
      dayStops.forEach((s, sIdx) => {
        const d = sampleDestinations.find(item => item.id === s.destinationId);
        const feeStr = (d && d.fee > 0) ? `₱${d.fee}` : 'Free';
        const end = minutesToTime(timeToMinutes(s.time) + (s.duration || 90));
        text += `  ${sIdx + 1}. ${s.time} – ${end} | ${s.destinationName} (${feeStr})\n`;
        if (s.activity) text += `     Activity: ${s.activity}\n`;
      });
      text += `\n`;
    });
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Travel plan copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Travel plan copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy to clipboard.', 'danger');
  }
  document.body.removeChild(textarea);
}

/* ==========================================================================
   EXPORT & SHARE (Copy as Text, Export JSON, Import JSON)
   ========================================================================== */
function exportJSON() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    city: 'Baguio City, Philippines',
    itinerary: appState.itinerary,
    trip: appState.trip
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `lakbay-baguio-plan-${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Itinerary plan exported as JSON backup.', 'success');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      // Validate & restore itinerary
      if (Array.isArray(parsed.itinerary)) {
        appState.itinerary = parsed.itinerary
          .filter(stop => {
            const destId = Number(stop.destinationId);
            return sampleDestinations.some(d => d.id === destId) && stop.date && stop.time;
          })
          .map(stop => {
            const destObj = sampleDestinations.find(d => d.id === Number(stop.destinationId));
            return {
              id: String(stop.id || generateUniqueId()),
              destinationId: Number(stop.destinationId),
              destinationName: destObj ? destObj.name : 'Destination',
              category: destObj ? destObj.category : '',
              fee: destObj ? destObj.fee : 0,
              date: String(stop.date),
              time: String(stop.time),
              duration: parseInt(stop.duration, 10) || 90,
              activity: String(stop.activity || '')
            };
          });
      }

      // Validate & restore trip
      if (parsed.trip && typeof parsed.trip === 'object') {
        const bMin = Math.max(500, parseInt(parsed.trip.budgetMin, 10) || 1500);
        const bMax = Math.max(bMin, parseInt(parsed.trip.budgetMax, 10) || 3500);
        const days = Math.max(1, parseInt(parsed.trip.days, 10) || 2);
        const confirmed = Boolean(parsed.trip.budgetConfirmed);
        appState.trip = {
          name: parsed.trip.name ? String(parsed.trip.name).trim() : 'Baguio Mountain Holiday',
          city: parsed.trip.city ? String(parsed.trip.city).trim() : 'Baguio City',
          days: days,
          startDate: parsed.trip.startDate || getTodayDateString(),
          budgetMin: bMin,
          budgetMax: bMax,
          budgetConfirmed: confirmed
        };
        appState.hasConfirmedBudget = confirmed;
      }

      sortItineraryChronologically();
      saveData();

          renderHomeProgress();
      renderExploreGallery();
      renderItineraryList();

      showToast(`Imported ${appState.itinerary.length} stops and trip data successfully!`, 'success');
    } catch (err) {
      console.error('[Lakbay] Import error:', err);
      showToast('Error importing JSON. Please ensure the file is a valid Lakbay backup.', 'danger');
    }
  };
  reader.readAsText(file);
}
