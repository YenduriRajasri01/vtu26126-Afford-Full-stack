# PulseNotify - Notification Management System

PulseNotify is a high-performance, responsive, and beautifully designed Notification Management Dashboard built with **React.js (Vite)**, **Plain CSS**, **Axios**, and **React Router**. It connects to a secure remote API to manage, search, filter, and prioritize campus notification streams (Placement Drives, Academic Results, and Campus Events).

## 🚀 Key Features

- **Sleek, Premium Design**: Modern Notion/Microsoft Fluent-inspired interface with glassmorphism, clean layouts, and micro-animations.
- **Robust Authentication**: Secure login layout including validation, show/hide password toggle, and session persistence in `localStorage`.
- **Advanced Heap-Based Sorting**: Uses a custom-engineered **Min-Heap / Priority Queue** data structure to dynamically sort and extract the **Top N** (10, 15, or 20) highest priority unread notifications in optimal $O(M \log N)$ complexity.
- **Real-Time Synchronisation**: Lightweight polling every 30 seconds to fetch new alerts and update badge counters.
- **Debounced Search**: Text search matching notification message or category, debounced at 350ms to limit CPU and API throttling.
- **Responsive Layout**: Designed mobile-first, supporting all major breakpoints from 320px (compact touch navigation) up to 1440px+ (4-column stats grid and sidebar panels).
- **Graceful Error Handling**: Detects and recovers from 401 Session Expired (auto-logout), 404 (empty state graphics), and 500/Network errors (connection lost warning with manual retry hooks).

---

## 📁 Folder Structure

The project follows a clean, modular architecture:

```
src
 ├── api
 │    └── axiosInstance.js            # Axios client with interceptors
 ├── assets
 │    └── logo.svg                    # Graphic logo asset
 ├── components
 │    ├── Header                      # Top Navigation (Avatar, Logout, Pulse badge)
 │    ├── NotificationCard            # Individual list cards (priority badges, actions)
 │    ├── NotificationList            # Card list wrapper with empty & network-lost states
 │    ├── SearchBar                   # Debounced search bar
 │    ├── Filters                    # Category dropdown filtering
 │    ├── Pagination                  # Page navigator and limit selector
 │    ├── StatisticsCards             # Key counters with Animated Counters
 │    ├── PriorityNotifications       # Top N Sidebar (Min-Heap based prioritization)
 │    ├── Modal                       # Detailed popup displaying UUID, Type, and Weights
 │    ├── Loader                      # Spinners & Skeleton loading components
 │    └── ErrorBoundary               # Class component capturing rendering faults
 ├── pages
 │    ├── Login                       # Form fields with validation checks
 │    └── Dashboard                   # Core workspace layout
 ├── hooks
 │    ├── useNotifications.js         # Axios API logic & 30s background polling
 │    └── usePriorityNotifications.js # State selectors for Heap filtering
 ├── services
 │    └── authService.js              # Mock session token creator & storage
 ├── utils
 │    ├── heap.js                     # Custom Min-Heap Class & Top-N selectors
 │    ├── priorityCalculator.js       # Priority weights map (Placement=3, Result=2, Event=1)
 │    └── dateFormatter.js            # Relative and full date formatting helpers
 ├── styles
 │    ├── variables.css               # Design tokens (colors, shadows, corners)
 │    └── index.css                   # Global resets & animation keyframes
 ├── App.jsx                          # Main routing & Protected Route Guards
 └── main.jsx                         # React bootstrap mounting point
```

---

## 🔧 Installation & Running Instructions

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone & Navigate
```bash
git clone <repository_url>
cd <repository_folder>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
The application will launch on **[http://localhost:3000](http://localhost:3000)**.

### 4. Build for Production
To generate a production-ready package:
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` directory, keeping the final output size extremely minimal and fast.

---

## 🌐 API Configuration

All requests route through a centralized Axios client.

- **Base URL**: `http://4.224.186.213/evaluation-service`
- **Protected Endpoint**: `GET /notifications`
- **Headers**: `Authorization: Bearer <token>`
- **Parameters Supported**:
  - `page` (page number index)
  - `limit` (results returned per query)
  - `notification_type` (`Placement`, `Result`, or `Event`)

---

## ⚙️ Priority Sorting Evaluation

Priority weights are mapped as follows:
- **Placement Drives** = `3` (High Priority)
- **Academic Results** = `2` (Medium Priority)
- **Campus Events** = `1` (Low Priority)

The custom Min-Heap resolves notifications by sorting by weight (descending) first, and timestamp (descending, latest first) second. The Heap size is strictly bound to $N$ (Top 10, 15, or 20), making it highly performant for lists containing thousands of items.

---

## 🛡️ Authentication Credentials

For testing purposes, sign in using:
- **Email**: `admin@example.com`
- **Password**: `password123`
