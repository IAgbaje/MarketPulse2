# MarketPulse — Comprehensive Implementation Plan (All Design Specifications & Cross-Browser Polish)

## 1. Overview & Goals
Upgrade **MarketPulse** so every single screen, state, and interaction across both provided HTML design sets is faithfully integrated into a unified, responsive, cross-browser application:

- **Entry Experience**: Launch directly into the **Home Dashboard** (`HomeScreen`) with a prominent **"Product Tour / Landing Page"** switch in the top header and navigation drawer to open the full Desktop Marketing Landing Page (`LandingPageScreen`).
- **Unified 5-Tab Mobile Bottom Navigation & Responsive Desktop Shell**:
  - **Mobile Bottom Bar (5 Tabs)**: **Home**, **Price Map**, **Log**, **History**, and **Budget** (automatically hidden on focused transactional/detail screens per the Semantic Shell Mandate).
  - **Desktop / Tablet Top Bar & Navigation Drawer**: Quick links to **Home**, **Price Map**, **Log**, **History**, **Budget**, **Weekly Report**, **Data Management**, **Account Backup**, and **Landing Page**.
- **Unified Price Map & Discovery Hub (`PriceMapScreen`)**:
  - **Tab 1 — Price Map (National Overview + State/LGA Drill-down + Market Detail Sheet)**:
    - Switch between **National Overview** (Nigeria map with commodity picker, `Prices up ↑15% nationally` context chip, and `30-day Price Change` confidence legend: Solid, Striped `<5 reports`, Dotted `No data`) and **Lagos LGA Choropleth** (`Ikeja`, `Surulere`, `Eti-Osa`, `Alimosho`, `Kosofe`, `Oshodi-Isolo`, `Lagos Mainland`, `Ikorodu`).
    - Tap any market pin (`Mile 12`, `Oyingbo`, `Balogun`) or LGA tile to open the interactive **Market Detail Bottom Sheet / Floating Card** featuring distance & transit estimate (`2.4km · ~₦400 transit`), horizontal commodity switcher (`Tomatoes (Basket)`, `Rice (50kg)`, `Onions (Bag)`), current average (`₦42,500`), report count (`Based on 14 reports · Updated 2 days ago`), 7-day SVG sparkline, **Compare with another market**, and **Add to watchlist**.
  - **Tab 2 — Where is It Cheapest? (Commodity Price Comparison)**:
    - Interactive **Commodity Selector** (`Long Grain Parboiled Rice (50kg bag)`, `Tomatoes (Big Basket)`, `Palm Oil (25L)`, `Onions (Bag)`, `Garri (Paint Bucket)`), **Search Radius Slider** (`1 km – 50 km`, default `15 km`), and market-type filter chips (`All Markets`, `Supermarkets Only`, `Open Markets Only`).
    - Ranked market cards with `BEST VALUE` badge, distance, weekly price delta, report counts, and `"Help expand the map"` callout with direct `"Add a Price"` action.
  - **Tab 3 — Basket Comparison (`Where is your basket cheapest today?`)**:
    - **Baseline Card**: User's usual shop (`Oyingbo Market`, estimated cost `₦34,500` across `12 items`, or dynamically computed from the user's logged trips).
    - **Ranked Market Options (`#1 Mile 12 Market`, `#2 Shoprite Ikeja`, `#3 Tejuosho Market`)** with **Mandatory Basket Coverage Gate** (`100% (12/12)` vs partial `83% (10/12)` with amber warning listing missing items like `Red Palm Oil, Crayfish`).
- **Dedicated Weekly Wrap-up Report (`WeeklyReportScreen`)**:
  - Accessible from the Top Bar, Navigation Drawer, Home Dashboard, and Price Map.
  - Displays **"This Week's Movers"** (`Tomatoes (Basket) ₦18,500 ↑₦2,100 (12%) — Feeling spicy this week`, `Rice (Derica) ₦1,100 ↓₦50 (4%) — Cooling down slightly`), local report attribution, and a one-tap **Share on WhatsApp** action (using Web Share API / `wa.me` share link + clipboard fallback).

---

## 2. Screen-by-Screen Upgrades Across Existing Flows

### A. Home Dashboard (`src/screens/HomeScreen.tsx`)
- **Monthly Budget Pace Card**: Multi-segment progress bar showing safe spend fill (`#00567c`), mid-month target line marker, and over-pace warning segment (`#714800` tertiary amber) with `"₦4,200 over your budget so far"` callout.
- **Movers This Month ("Prices went up")**: Responsive 2-column grid of commodity mover cards with market badges (`MILE 12`, `OYINGBO`, `KETU`), report counts, and Naira increases, plus quick links to **Price Map** and **Weekly Wrap-up**.
- **Recent Trips & FAB**: Recent market visits (`shopping_bag` for open markets, `storefront` for supermarkets) and floating `"Log a shop"` button.

### B. 6-Stage Logging Flow (`LogChoiceScreen`, `LogScanScreen`, `LogManualScreen`, `LogConfirmScreen`, `LogPendingScreen`, `LogSuccessScreen`)
- **Log Choice**: Split choice between **Snap a Receipt** and **Type It In** (`45s AVG`).
- **Camera Viewfinder**: Corner brackets, animated scan line, flash toggle, gallery upload trigger, and live OCR simulation.
- **Manual Entry**: Market selector with recent market chips, progressive item entry rows, Naira price fields, unit pills, and sticky total footer.
- **OCR Review & Confirmation**: Confidence badges (`Verified`, `Low Confidence: Price`, `Uncertain: Item`), inline editing, and `Confirm All & Save`.
- **Item Pending Review (`LogPendingScreen`)**: Dual-mode support for both the **Raw Input Review** card (`"Bama Mayonnaise 1kg - Oshodi Market"`, `Continue Trip`, `Edit Item Entry`) and the **Categorization Progress** step.
- **Trip Summary (`LogSuccessScreen`)**: Hero total spend (`₦25,100`) with comparison pill (`₦2,400 more than your last shop at Mile 12`), **Top Movers** list (`Tomatoes +₦300 (14% ↑)`, `Onions +₦500 (20% ↑)`, `Garri -₦100 (8% ↓)`), and an interactive **First-Trip State Preview** toggle (`"This is your starting point — next time we'll show you what changed"`).

### C. Trip History & Trip Detail (`HistoryScreen.tsx`, `TripDetailScreen.tsx`)
- **Trip History**: Populated trip cards with % change badges (`↑ 4.2%`, `↓ 1.5%`, `No previous data`), interactive Empty State preview toggle, and responsive Desktop Sidebar.
- **Trip Detail**: Header card with market name, date, and ambient offline/cloud sync status pill (`Saved on this device, will sync when online`), Bento-style **Items bought** list (tap any item to view its Commodity Price Trends), **Total Spent** primary-container summary card, and inline edit/delete support.

### D. Commodity Price Trends (`CommodityDetailScreen.tsx`)
- **Latest Price & Crowd Comparison**: Latest price (`₦45,000`), % delta badge, and visual **Crowd Comparison** range bar (`₦38k – ₦52k · 142 reports this week`) with user price marker.
- **Multi-Market Price History Chart**: Interactive chart comparing **Mile 12 Market** (`#00567c`) vs **Oyingbo Market** (`#4b6172`) across months, plus **Your Logged Purchases** list.

### E. Budget vs Actual & Budget Setup (`BudgetScreen.tsx`, `SetBudgetScreen.tsx`)
- **Budget Analysis (`BudgetScreen`)**:
  - **Budget Overview**: Spent so far, Remaining, Pace Bar with Today marker, and pace status message.
  - **Category Breakdown**: `Proteins`, `Produce`, and `Pantry Staples` progress bars with over/under budget deltas.
  - **"Why your spend changed" (Variance Decomposition)**: Side-by-side **Prices (`+₦9,200`)** and **Volume (`+₦3,100`)** cards, reconciliation lines for **New items (`+₦4,500`)** and **Stopped buying (`-₦2,500`)**, **Total change (`+₦14,300`)**, substitution insight (`"You switched fresh tomatoes → paste, saved ₦1,400"`), and coverage footer (`"Based on 62% of last month's spend · 3 lines excluded"`).
- **Budget Setup (`SetBudgetScreen`)**:
  - Top primary accent bar, `Monthly Target Amount` input with weekly shop context callout, **Frequency** selector pills (`Weekly`, `Fortnightly`, `Monthly`), and collapsible **Per-category budgets (Optional)** accordion (`Produce`, `Proteins`, `Pantry Staples`, `Grains & Tubers`).

### F. Data Management & Combined Silent Backup / Cloud Sync (`DataManagementScreen.tsx`, `AccountSecurityScreen.tsx`)
- **Data Management**: Responsive Desktop Sidebar layout, constructive **Export my data** card (`Download as CSV` and `Download as JSON` with real file downloads), and high-friction **Delete my data** card with bulleted consequences and confirmation modal.
- **Upgrade Account & Cloud Sync (`AccountSecurityScreen`)**:
  - Combines the **Silent Backup** form (`"Your data is safe. A silent backup already exists. Attach your email or phone number to reach your data from any device, anytime."` with email/phone input, `Secure my account`, and `Maybe later`) alongside one-tap **Google Cloud Sign-In** (Firebase Auth + Firestore real-time sync).

---

## 3. Cross-Browser Compatibility (Safari, Chrome, Samsung Internet)
- **Dynamic Viewport & Safe Areas**: `100dvh` with `100vh` fallback and `env(safe-area-inset-bottom)` / `env(safe-area-inset-top)` padding so fixed headers, bottom sheets, and the 5-tab navigation bar never collide with iOS Safari's home indicator or Samsung Internet's toolbar.
- **No Unwanted Input Zoom on iOS Safari**: Enforce `16px` minimum font-size on mobile form inputs (`< 768px`) while keeping pinch-to-zoom accessible.
- **WebKit Backdrop & Touch Polish**: Include `-webkit-backdrop-filter` prefixes, `-webkit-tap-highlight-color: transparent`, and hardware-accelerated drawer/bottom-sheet transitions.
