import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import WelcomePage from './pages/WelcomePage.tsx';
import CharacterCreationWizardV2 from './components/character-creation-v2/CharacterCreationWizardV2.tsx';
import AuthCallback from './pages/AuthCallback.tsx';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import PreviewLayout from './components/PreviewLayout';

// Error boundary wrapper
const WizardWithErrorBoundary: React.FC = () => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    console.log('[Wizard] ✅ Component mounted at', new Date().toISOString());
    window.location.hash = '#wizard-loaded';
    return () => console.log('[Wizard] Component unmounted');
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fee', border: '2px solid red' }}>
        <h2>Error Loading Character Creation</h2>
        <p>Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <CharacterCreationWizardV2 />
    </Suspense>
  );
};

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
            <WizardWithErrorBoundary />
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
