import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Milestones from './pages/Milestones';
import Feedback from './pages/Feedback';
import Analytics from './pages/Analytics';
import StartupProfile from './pages/StartupProfile';
import Settings from './pages/Settings';
import HealthMeter from './pages/HealthMeter';
import InvestorReadiness from './pages/InvestorReadiness';
import DecisionLog from './pages/DecisionLog';
import AssumptionBoard from './pages/AssumptionBoard';
import PublicFeedbackForm from './pages/PublicFeedbackForm';

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/milestones" 
          element={
            <ProtectedRoute>
              <Milestones />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <ProtectedRoute allowedRoles={['founder']}>
              <Feedback />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['founder']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/startup-profile" 
          element={
            <ProtectedRoute allowedRoles={['founder']}>
              <StartupProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/health" 
          element={
            <ProtectedRoute allowedRoles={['founder']}>
              <HealthMeter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investor-readiness" 
          element={
            <ProtectedRoute allowedRoles={['founder']}>
              <InvestorReadiness />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/decisions" 
          element={
            <ProtectedRoute allowedRoles={['founder']}>
              <DecisionLog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assumptions" 
          element={
            <ProtectedRoute allowedRoles={['founder']}>
              <AssumptionBoard />
            </ProtectedRoute>
          } 
        />

        {/* Public Feedback Form (no auth required) */}
        <Route path="/f/:slug" element={<PublicFeedbackForm />} />
        <Route path="/feedback/:formId" element={<PublicFeedbackForm />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
