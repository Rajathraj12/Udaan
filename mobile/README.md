# Udaan Mobile App

React Native mobile application for Udaan - Digital Infrastructure for Early-Stage Founders.

## 📱 Screens

### 1. **Auth Screen (Login/Signup)**
- App logo and branding
- Email/Password authentication
- Role selection (Founder/Team Member)
- Demo credentials display
- Error handling

### 2. **Founder Home Dashboard**
- Startup Health Score (0-100)
- Risk Level Indicator
- Startup Stage Badge
- Next Best Action Card
- AI-Powered Insights

### 3. **Team Member Home**
- Assigned tasks count
- Today's tasks list
- Quick status update buttons
- Task completion tracking

### 4. **Tasks Screen**
- Task list with cards
- Status badges (Todo/In Progress/Done)
- Due dates
- Milestone labels
- One-tap status updates

### 5. **Milestones Screen**
- Milestone list
- Progress bars
- Completion percentages
- Status indicators (On Track/At Risk)

### 6. **Investor Readiness Screen**
- Vertical timeline
- 4 Stages: Idea Validated → MVP Ready → Traction Signals → Investor Ready
- Locked stages (visually disabled)
- Current stage highlighted
- Helper text

### 7. **Insights Screen**
- AI-Powered recommendations
- Action-oriented cards
- Icon + text layout
- Limited to top 2 insights

### 8. **Profile Screen**
- User email display
- Role badge
- Startup name
- Account settings menu
- Logout button

## 🎨 Reusable Components

- **Card**: White background with shadow
- **Badge**: Color-coded status indicators (success, warning, danger, info)
- **ProgressBar**: Animated progress with percentage
- **RiskIndicator**: Color-coded risk levels (high, medium, low)
- **EmptyState**: Icon + message for empty lists
- **Loader**: Centered activity indicator

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android)

### Installation

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint:**
   
   Edit `src/services/api.js` and update the `API_BASE_URL`:
   
   - For **physical device**: Use your computer's IP address
     ```javascript
     const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
     ```
   
   - For **Android emulator**: Use `10.0.2.2`
     ```javascript
     const API_BASE_URL = 'http://10.0.2.2:5000/api';
     ```
   
   - For **iOS simulator**: Use `localhost`
     ```javascript
     const API_BASE_URL = 'http://localhost:5000/api';
     ```

4. **Start the backend server** (from the hackathon root):
   ```bash
   cd backend
   npm run dev
   ```

5. **Start Expo:**
   ```bash
   cd mobile
   npm start
   ```

6. **Run on device/simulator:**
   - Scan the QR code with Expo Go (physical device)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 📝 Demo Credentials

**Founder Account:**
- Email: `founder@startup.com`
- Password: `Founder123!`

**Investor Account:**
- Email: `investor@demo.com`
- Password: `Investor123!`

**Mentor Account:**
- Email: `mentor@test.com`
- Password: `Mentor123!`

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Card.js
│   │   ├── Badge.js
│   │   ├── ProgressBar.js
│   │   ├── RiskIndicator.js
│   │   ├── EmptyState.js
│   │   └── Loader.js
│   ├── context/             # React Context providers
│   │   └── AuthContext.js
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/             # App screens
│   │   ├── AuthScreen.js
│   │   ├── FounderHomeScreen.js
│   │   ├── TeamMemberHomeScreen.js
│   │   ├── TasksScreen.js
│   │   ├── MilestonesScreen.js
│   │   ├── InvestorReadinessScreen.js
│   │   ├── InsightsScreen.js
│   │   └── ProfileScreen.js
│   └── services/            # API integration
│       └── api.js
├── App.js                   # Root component
├── app.json                 # Expo config
├── package.json
└── README.md
```

## 🎯 Features

### Authentication
- Firebase-based authentication
- Role-based access (Founder/Team Member)
- Persistent login with AsyncStorage
- Automatic token refresh

### Role-Based UI

**Founder Access:**
- Full dashboard with analytics
- Health Score tracking
- Investor Readiness timeline
- AI-powered insights
- Complete task and milestone management

**Team Member Access:**
- Simplified task-focused interface
- Today's tasks view
- Task status updates
- Basic profile management

### Offline Support
- Data caching with AsyncStorage
- Pull-to-refresh on all screens
- Error handling for network issues

### UX Features
- Loading indicators
- Pull-to-refresh
- Empty states
- Error messages
- Optimistic UI updates

## 🔧 Troubleshooting

### Cannot connect to backend

1. Make sure backend is running on port 5000
2. Check your computer's IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Ensure phone and computer are on the same WiFi network
4. Update `API_BASE_URL` in `src/services/api.js`

### Expo Go won't scan QR code

1. Make sure you're on the same network
2. Try typing the URL manually in Expo Go
3. Restart Expo: `npm start --reset-cache`

### Module not found errors

```bash
rm -rf node_modules
npm install
npm start --reset-cache
```

## 📦 Build for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## 🎨 Design System

### Colors
- Primary: `#2563EB` (Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)
- Gray 50: `#F9FAFB`
- Gray 900: `#111827`

### Typography
- Headers: 18-32px, Bold
- Body: 14-16px, Regular
- Small: 12px, Regular

## 📄 License

Built with ❤️ for IIT Jammu Techpreneur Hackathon 2026
