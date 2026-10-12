import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MoodProvider } from './contexts/MoodContext';
import { SurveyProvider } from './contexts/SurveyContext';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';
import SurveyForm from './components/SurveyForm';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import { safeReturnPath } from './lib/safeReturnPath';

const AuthScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = safeReturnPath((location.state as { from?: string } | null)?.from);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-ink-mute">Loading…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MoodProvider>
        <SurveyProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthScreen><LoginForm /></AuthScreen>} />
              <Route path="/signup" element={<AuthScreen><SignupForm /></AuthScreen>} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/chat" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/mood" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/wellness" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/progress" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              <Route path="/survey/:surveyId" element={<ProtectedRoute><SurveyForm /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </SurveyProvider>
      </MoodProvider>
    </AuthProvider>
  );
}

export default App;
