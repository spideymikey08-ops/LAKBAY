# Lakbay: Baguio City Travel Destination Explorer & Itinerary Planner System

> **Course**: ITP10 | Event-Driven Programming  
> **Institution**: Universidad de Dagupan - School of Information Technology Education  
> **Architecture**: Single Page Application (SPA) using Semantic HTML5, CSS3, and Vanilla JavaScript  
> **Theme**: Modern Nature / Emerald Teal (`#0f766e` / `#059669`)

---

## 🌲 Project Overview

**Lakbay** is an interactive, event-driven Single Page Application (SPA) designed to help travelers discover tourist attractions in **Baguio City** (The Summer Capital of the Philippines), organize step-by-step travel schedules, save bookmarks, and estimate travel expenses with real-time budget calculations.

All user data (favorites, itinerary stops, and budget estimates) seamlessly persists in the browser via `localStorage`, ensuring trip plans survive page refreshes.

---

## 🚀 How to Run the Application

### Option A: Via Local Browser (Direct Open)
1. Navigate to the project directory: `c:\xampp\htdocs\LAKBAY-1`
2. Double-click [index.html](file:///c:/xampp/htdocs/LAKBAY-1/index.html) or right-click and choose **Open with Google Chrome / Microsoft Edge / Firefox**.

### Option B: Via XAMPP Apache Server
1. Open the **XAMPP Control Panel**.
2. Start the **Apache** module.
3. Open your browser and navigate to:
   ```
   http://localhost/LAKBAY-1/
   ```

---

## 📱 7 Application Screens & Modals

1. **Screen 1 · Home Dashboard (`#section-home`)**:
   - Hero banner with quick "Start exploring" call-to-action.
   - Dynamic Stats Counter: Saved places count, Planned stops count, and Estimated budget (restored from `localStorage`).
   - Featured Baguio destinations cards with quick bookmark toggle.
   - Travel tips and recommendations for visiting Baguio.

2. **Screen 2 · Explore Gallery (`#section-explore`)**:
   - Live Search input with dynamic filtering across names, locations, and activities.
   - Category filter chips: `All`, `Beaches`, `Mountains`, `Historical`, `Adventure`.
   - Sort dropdown: `A to Z`, `Z to A`, `Entrance Fee: Low to High`, `Entrance Fee: High to Low`.
   - Live results counter (e.g., *"Showing 8 destinations"*).
   - Empty state when no search matches found with a one-click reset button.

3. **Screen 3 · Destination Details Modal (`#destination-modal`)**:
   - Dimmed backdrop overlay over the Explore gallery.
   - High-resolution hero image, category badge, and entrance fee badge.
   - Detailed history/description and tag list of activities.
   - Actions: "Save to favorites" toggle, "Add to itinerary" shortcut, Close button, and `Esc` keyboard shortcut listener.

4. **Screen 4 · Itinerary Planner (`#section-itinerary`)**:
   - Two-column responsive layout:
     - **Left Column**: "Add a stop" form with fields for Destination, Date, Time, and Activity. Includes field-level validation and red/green feedback messages.
     - **Right Column**: Chronologically sorted itinerary list grouped with Day tags (`Day 1`, `Day 2`), time badges, destination names, activities, and individual "Delete" buttons.
   - "Clear all" button with confirmation prompt and empty state UI.

5. **Screen 5 · Favorites (`#section-favorites`)**:
   - Displays all bookmarked destinations.
   - Actions to remove from favorites or quickly send to the Itinerary Planner with pre-filled fields.
   - Synchronized with the navbar badge count.
   - Empty state UI when no places are saved.

6. **Screen 6 · Travel Budget Calculator (`#section-budget`)**:
   - Expense input fields: Transportation (₱), Accommodation (₱), Food (₱), Activities & Entrance Fees (₱), and Number of Travelers.
   - **Real-Time Live Calculation**: Total budget and Per-traveler amounts recalculate automatically as the user types.
   - Input validation (flags negative or invalid amounts).
   - "Save budget" (persists to `localStorage` and updates Home screen stat) and "Reset" buttons with feedback messages.

7. **Screen 7 · Travel Plan Summary (`#section-summary`)**:
   - "Generate summary" compiles all bookmarked favorites, day-by-day itinerary stops, and complete budget breakdown into a printable report.
   - "Print / Save PDF" button with print-optimized CSS.
   - Empty state UI when no data has been added yet.

---

## ⚡ Event Map Implementation (Events E1 to E17)

Every interaction strictly satisfies the project's Event-Driven Programming specification:

| Event ID | Feature | User Action | DOM Event | JavaScript Function | Expected Result |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **E1** | Home Dashboard | Open or refresh the page | `DOMContentLoaded` | `init()` | Loads destinations dataset, restores saved data from `localStorage`, renders Home and Explore views. |
| **E2** | Navigation | Click nav link or "Start exploring" | `click` | `showSection(name)` | Activates the chosen section, hides inactive sections, updates active nav link, closes mobile menu. |
| **E3** | Search & Filter | Type in search box | `input` | `searchDestinations()` | Cards filter live by name, activity, location, or description; shows empty state if no match. |
| **E4** | Search & Filter | Click category chip | `click` | `filterByCategory(category)` | Only matching category cards remain visible; chip highlighted with emerald background. |
| **E5** | Search & Filter | Change sort dropdown | `change` | `sortDestinations()` | Visible cards reorder alphabetically or by entrance fee; results counter updates. |
| **E6** | Destination Details | Click "Details" button | `click` | `showDetails(id)` | Opens modal with photo, fee, description, activities tags, and location. |
| **E7** | Destination Details | Click Close or press `Esc` | `click`, `keydown` | `closeDetails()` | Closes modal and restores background interaction. |
| **E8** | Favorite Destinations | Click heart icon button | `click` | `toggleFavorite(id)`, `saveData()` | Adds/removes destination ID, updates heart fill, updates navbar badge and home stats, saves to storage. |
| **E9** | Favorite Destinations | Click "Remove" on favorite | `click` | `removeFavorite(id)` | Removes destination from bookmarks, refreshes list, updates counters and storage. |
| **E10** | Itinerary Planner | Click "Add to itinerary" | `click` | `prefillItineraryForm(id)` | Navigates to Screen 4 with destination pre-selected, suggested activity, and today's date pre-filled. |
| **E11** | Itinerary Planner | Submit itinerary form | `submit` | `validateItineraryForm()`, `addStop()` | Validates inputs (shows red error message if invalid); adds stop, sorts chronologically, saves to storage, shows green success message. |
| **E12** | Itinerary Planner | Click "Delete" on stop | `click` | `deleteStop(id)` | Removes stop from list and storage; updates stop counters. |
| **E13** | Itinerary Planner | Click "Clear all" | `click` | `clearItinerary()` | Prompts user confirmation, clears all stops, updates storage, displays empty state. |
| **E14** | Budget Calculator | Type in cost/traveler field | `input` | `calculateBudget()` | Live computation of Total and Per-Traveler amounts as user types. |
| **E15** | Budget Calculator | Click "Save budget" | `click` | `saveBudget()` | Validates inputs, saves budget to `localStorage`, updates Home dashboard stat, displays green confirmation. |
| **E16** | Budget Calculator | Click "Reset" | `click` | `resetBudget()` | Resets all input fields, sets totals to ₱ 0.00, clears stored budget, displays notification. |
| **E17** | Plan Summary | Click "Generate summary" | `click` | `generateSummary()` | Aggregates favorites, chronological itinerary, and budget breakdown into consolidated report; shows print option. |

---

## 💾 LocalStorage Data Schema

```json
{
  "lakbay_favorites": [1, 2, 5],
  "lakbay_itinerary": [
    {
      "id": 1699200000000,
      "destinationId": 1,
      "destinationName": "Mines View Park & Ridge",
      "category": "Mountains",
      "fee": 20,
      "date": "2026-11-10",
      "time": "08:00",
      "activity": "Cordillera Overlook View Deck & Strawberry Taho"
    }
  ],
  "lakbay_budget": {
    "transportation": 1500,
    "accommodation": 3000,
    "food": 2000,
    "activities": 800,
    "travelers": 2,
    "total": 7300,
    "perPerson": 3650
  }
}
```

---

## 📁 File Structure

```
LAKBAY-1/
├── index.html            # Semantic HTML5 Single Page Application container (Screens 1 to 7 + Modal)
├── css/
│   └── style.css         # Modern Nature / Emerald Teal responsive stylesheet
├── js/
│   ├── destinations.js   # Baguio City tourist spots dataset (Mountains, Historical, Adventure, Beaches)
│   └── app.js            # Pure event-driven JavaScript handling E1 to E17 & localStorage
├── assets/
│   └── images/           # Asset directory for local media
└── README.md             # Project documentation and run guide
```
