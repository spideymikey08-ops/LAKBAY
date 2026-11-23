/**
 * Lakbay | Core: Application State
 * Shared appState object and storage keys used by every other file.
 */
'use strict';

// Application State Object
const appState = {
  currentSection: 'home',
  activeCategory: 'All',
  priceFilter: 'all', // 'all' | 'free' | '50' | '100'
  ratingFilter: 'all', // 'all' | '4.7' | '4.8'
  searchQuery: '',
  sortOrder: 'name-asc',
  itineraryViewFilter: 'all', // 'all' | 'upcoming' | 'completed'
  itinerary: [], // Array of stop objects: [{ id, destinationId, destinationName, date, time, duration, activity, fee }]
  budget: {
    days: 2,
    travelers: 1,
    transportation: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    extraActivities: 0,
    total: 0,
    perPerson: 0
  },
  trip: {
    name: 'Baguio Mountain Holiday',
    city: 'Baguio City',
    days: 2,
    startDate: '',
    budgetMin: 1500,
    budgetMax: 3500,
    budgetConfirmed: false
  },
  hasConfirmedBudget: false,
  selectedStopId: null,
  pickerDay: 0,
  pickerTime: '09:00',
  pickerDuration: 90,
  pickerCategory: 'All',
  pickerBudgetFilter: 'all',
  pickerSearchQuery: '',
  modalDestinationId: null,
  editingStopId: null,
  lastDeletedStop: null, // For undo delete
  lastFocusedElement: null, // For accessible focus return
  mapInstance: null,
  mapMarkers: []
};

// Storage Keys
const STORAGE_KEYS = {
  ITINERARY: 'lakbay_itinerary',
  BUDGET: 'lakbay_budget',
  TRIP: 'lakbay_trip',
  APPEARANCE: 'lakbay_appearance'
};

const SESSION_KEYS = {
  FILTER_PREFS: 'lakbay_explore_filters'
};
