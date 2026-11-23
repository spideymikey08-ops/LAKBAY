/**
 * Lakbay | Core: Helpers
 * Escaping, unique IDs, time/date/currency formatting, and form setup helpers.
 */
'use strict';

/* ==========================================================================
   HELPERS (Escaping, Unique IDs, Time & Date)
   ========================================================================== */
function generateUniqueId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

function escapeHTML(str) {
  const s = String(str ?? '');
  return s.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = String(timeStr).split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

function minutesToTime(totalMins) {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const parts = String(timeStr).split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getDateFromStart(startDateStr, dayIndex) {
  if (!startDateStr) startDateStr = getTodayDateString();
  const parts = String(startDateStr).split('-');
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + (parseInt(dayIndex, 10) || 0));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayCellDate(dateStr) {
  if (!dateStr) return { dayOfMonth: '1', monthShort: 'DAY', weekDayShort: 'TODAY' };
  try {
    const parts = String(dateStr).split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfMonth = d.getDate();
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const weekDayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return { dayOfMonth, monthShort, weekDayShort };
  } catch (e) {
    return { dayOfMonth: '1', monthShort: 'DAY', weekDayShort: 'TODAY' };
  }
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPastDate(dateStr) {
  if (!dateStr) return false;
  return dateStr < getTodayDateString();
}

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

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₱' + num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatNumber(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function populateDestinationSelect() {
  const select = document.getElementById('itinerary-destination');
  if (!select) return;
  select.innerHTML = '<option value="">-- Choose a Destination --</option>' +
    sampleDestinations.map(d => `<option value="${d.id}">${escapeHTML(d.name)}</option>`).join('');
}

function setupDateConstraints() {
  const todayStr = getTodayDateString();
  const dateInput = document.getElementById('itinerary-date');
  const quickDateInput = document.getElementById('quick-add-date');
  const tripStartDateInput = document.getElementById('trip-start-date');

  if (tripStartDateInput) {
    tripStartDateInput.min = todayStr;
    if (!tripStartDateInput.value) {
      tripStartDateInput.value = appState.trip.startDate || todayStr;
    }
  }

  if (dateInput) {
    dateInput.min = todayStr;
    if (!dateInput.value) {
      dateInput.value = todayStr;
    }
  }

  if (quickDateInput) {
    quickDateInput.min = todayStr;
    if (!quickDateInput.value) {
      quickDateInput.value = todayStr;
    }
  }
}
