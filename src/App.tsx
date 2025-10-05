import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TypingGame } from './components/TypingGame';
import { ProfileSetup } from './components/ProfileSetup';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/play"
            element={
              <ProtectedRoute>
                <TypingGame />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
