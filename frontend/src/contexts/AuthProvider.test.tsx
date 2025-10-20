// /srv/nuaibria/frontend/src/contexts/AuthProvider.test.tsx
import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

// Mock the supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Helper component to consume the AuthContext for testing purposes
const TestComponent = () => {
  const { user, loading, error, signIn, signOut, signUp, clearError } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'true' : 'false'}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="error">{error ? error.message : 'null'}</span>
      <button onClick={() => signIn({ email: 'test@example.com', password: 'password' })}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => signUp({ email: 'new@example.com', password: 'password' })}>Sign Up</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

describe('AuthProvider', () => {
  const mockSupabaseAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;
  let authStateChangeCallback: (event: AuthChangeEvent, session: Session | null) => void;
  let unsubscribeMock: jest.Mock;

  const mockUser: User = {
    id: 'user-id-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    token_type: 'Bearer',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();

    // Default mock for onAuthStateChange to capture the callback
    mockSupabaseAuth.onAuthStateChange.mockImplementation(
      (callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: unsubscribeMock } } } as any;
      }
    );

    // Default mock for getSession
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Utility to render the AuthProvider with a test component
  const renderAuthProvider = () => {
    return render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  };

  // Test 1: Initial session load - no session
  test('should initially be loading and have no user if no session', async () => {
    renderAuthProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('null');

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(mockSupabaseAuth.getSession).toHaveBeenCalledTimes(1);
  });

  // Test 2: Initial session load - with session
  test('should load user from initial session', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    renderAuthProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('null');

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!);
    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  // Test 3: Initial session load - session error
  test('should set error if initial session check fails', async () => {
    const mockError = { name: 'AuthApiError', message: 'Network error' };
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: mockError as any });
    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('error')).toHaveTextContent(mockError.message);
  });

  // Test 4: Token refresh event handling
  test('should update user on TOKEN_REFRESHED event', async () => {
    const initialSession = { ...mockSession, access_token: 'old-token' };
    const refreshedSession = { ...mockSession, access_token: 'new-token' };
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: initialSession }, error: null });
    renderAuthProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!);

    await act(async () => {
      authStateChangeCallback('TOKEN_REFRESHED', refreshedSession);
    });

    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email!);
    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  // Test 5: No memory leaks from listeners (unsubscribe called on unmount)
  test('should unsubscribe from auth state changes on unmount', async () => {
    const { unmount } = renderAuthProvider();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(mockSupabaseAuth.onAuthStateChange).toHaveBeenCalledTimes(1);

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
