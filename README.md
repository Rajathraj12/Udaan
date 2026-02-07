# Udaan - Digital Infrastructure for Early-Stage Founders

A unified digital platform that acts as an operational workspace for early-stage founders, helping them manage execution, validate ideas, collaborate with their teams, and gain actionable insights to scale efficiently.

**Available on Web and Mobile!**

## 🎯 Problem Statement

Early-stage startups often struggle not because of a lack of ideas, but due to poor execution, unstructured planning, lack of validation, and absence of data-driven decision-making. Founders typically rely on multiple disconnected tools to manage tasks, track progress, validate ideas, and prepare for growth, which leads to inefficiencies and loss of focus.

## 🚀 Solution

Udaan provides a founder-centric, intuitive platform that combines:
- **Execution Management**: Track tasks and milestones
- **Idea Validation**: Structured feedback collection and validation metrics
- **Team Collaboration**: Role-based access and team management
- **Data-Driven Insights**: Analytics dashboard with meaningful metrics
- **Investor Readiness**: Auto-generated pitch materials and stage-based timeline
- **Mobile Access**: Full-featured React Native app for iOS and Android

## 🛠️ Tech Stack

### Web Application
- **Frontend**: React.js 18, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: Firebase (Firestore, Authentication, Storage)

### Mobile Application
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Storage**: AsyncStorage
- **API Integration**: Axios with JWT authentication

## 📦 Project Structure

```
Udaan/
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.js
│   └── package.json
├── backend/               # Node.js API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── controllers/   # Route controllers
│   │   └── config/        # Configuration files
│   └── package.json
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── components/    # UI components
│   │   ├── navigation/    # Navigation setup
│   │   ├── context/       # Auth context
│   │   └── services/      # API integration
│   ├── App.js
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Mobile Setup
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Update API endpoint in src/services/api.js
# For physical device: use your computer's IP address
# For Android emulator: use 10.0.2.2
# For iOS simulator: use localhost

# Start Expo
npm start

# Scan QR code with Expo Go app (iOS/Android)
# OR press 'a' for Android emulator
# OR press 'i' for iOS simulator
```

**See `mobile/README.md` for detailed mobile setup instructions.**

### Environment Variables

**Frontend (.env)**
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=http://localhost:5000
```

**Backend (.env)**
```
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## ✨ Key Features

### Mandatory Core Modules

1. **Authentication & Authorization**
   - Secure login system with Firebase Auth
   - Role-based access (Founder, Co-Founder, Team Member)
   - Protected routes and features

2. **Startup Profile & Workspace**
   - Centralized workspace for the team
   - Editable startup details
   - Team member management

3. **Task & Milestone Tracking**
   - Task creation, assignment, and status updates
   - Milestone-based progress tracking
   - Kanban board visualization
   - Calendar and timeline views

4. **Feedback & Validation System**
   - Collect internal/external feedback
   - Idea validation metrics
   - Iteration tracking
   - Sentiment analysis

5. **Analytics Dashboard**
   - Progress indicators and insights
   - Task completion trends
   - Team productivity metrics
   - Visual data representation

### Bonus Features (Score Enhancers)

- **AI-Based Insights**: Smart suggestions for tasks and growth
- **Investor Pitch Generator**: Auto-generated pitch outlines
- **Cloud Deployment**: Live demo with production readiness

## 🎨 UI/UX Highlights

- Clean, modern, founder-centric design
- Intuitive navigation and user flow
- Responsive design (mobile, tablet, desktop)
- Data visualization with interactive charts
- Consistent branding and color scheme

## 📊 Judging Criteria Alignment

- **Problem Understanding (20%)**: Clear problem-solution fit addressing real startup challenges
- **Tech Implementation (30%)**: Clean code, proper architecture, full-stack integration
- **UI/UX (15%)**: Intuitive design, smooth user experience, visual appeal
- **Business Logic (20%)**: Practical features, scalability, real-world applicability
- **Innovation & Scalability (15%)**: Unique features, growth potential, extensibility

## 🏆 Competitive Advantages

1. **All-in-One Platform**: Eliminates need for multiple tools
2. **Founder-Centric Design**: Built specifically for early-stage needs
3. **Data-Driven Insights**: Actionable analytics, not just data
4. **Investor Ready**: Built-in pitch generation and progress tracking
5. **Scalable Architecture**: Multi-tenant design supporting growth

## 📱 Demo Credentials

```
Founder Account:
Email: founder@startup.com
Password: Founder123!

Team Member Account:
Email: team@startup.com
Password: Team123!
```

## 🚀 Deployment

### Frontend (Firebase Hosting)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend (Railway/Render)
```bash
# Push to GitHub
# Connect to Railway/Render
# Auto-deploy on push
```

## 📹 Demo Pitch Structure

1. **Problem Introduction (30s)**: Show the chaos founders face
2. **Solution Overview (1min)**: Platform walkthrough
3. **Feature Demo (3min)**: Live demonstration of key modules
4. **Innovation Highlight (1min)**: Unique aspects and AI features
5. **Future Vision (30s)**: Scalability and growth potential

## 🤝 Team

- **Your Name** - Full Stack Developer
- **Team Members** - Add your team

## 📄 License

MIT License - Feel free to use for the hackathon and beyond

## 🙏 Acknowledgments

- IIT Jammu Techpreneur Hackathon
- Firebase for backend infrastructure
- React community for amazing libraries

---

**Live Demo**: [Your Deployment URL]
**GitHub**: [Your Repository URL]
**Presentation**: [Your Pitch Deck Link]

**Built with ❤️ for founders, by founders**
