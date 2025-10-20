import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import WelcomePage from './pages/WelcomePage.tsx';
import CharacterCreationScreen from './components/character-creation/CharacterCreationScreen.tsx';
import AuthCallback from './pages/AuthCallback.tsx';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import PreviewLayout from './components/PreviewLayout';
import MapPreviewPage from './pages/MapPreviewPage.tsx';

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  console.log('[PublicRoute] User state:', user?.email || 'No user');

  if (user) {
    console.log('[PublicRoute] User authenticated, redirecting to /');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* OAuth callback route - no protection needed */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-character"
        element={
          <ProtectedRoute>
            <CharacterCreationScreen />
          </ProtectedRoute>
        }
      />

      <Route
        path="/map-preview"
        element={
          <ProtectedRoute>
            <PreviewLayout>
              <MapPreviewPage />
            </PreviewLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
