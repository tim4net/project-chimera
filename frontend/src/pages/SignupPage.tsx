import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(true);
        // Redirect to character creation after brief delay
        setTimeout(() => {
          navigate('/create-character');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn({ provider: 'discord' });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
      // Note: User will be redirected to Discord, then back to the app
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Discord signup error:', err);
      setLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn({ provider: 'github' });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
      // Note: User will be redirected to GitHub, then back to the app
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('GitHub signup error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg flex items-center justify-center px-4">
      <div className="bg-nuaibria-surface border-2 border-nuaibria-gold/30 p-10 rounded-xl shadow-card-hover w-full max-w-md">
        <h1 className="text-4xl font-display font-bold mb-8 text-center text-nuaibria-gold drop-shadow-lg">
          Join Nuaibria
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-nuaibria-danger/20 border-2 border-nuaibria-danger rounded-lg text-nuaibria-text-primary shadow-inner-dark">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-nuaibria-arcane/20 border-2 border-nuaibria-arcane rounded-lg text-nuaibria-text-primary shadow-inner-dark">
            Account created successfully! Redirecting to character creation...
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDiscordSignup}
            disabled={loading || success}
            className="flex-1 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#5865F2] text-white font-bold py-4 px-6 rounded-lg transition-all hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-[#5865F2]/40 hover:border-[#5865F2]/60"
            type="button"
            title="Sign up with Discord"
          >
            <img src="https://discord.com/assets/f8389ca1a741a115313bede9f85a6604.png" alt="Discord" className="w-6 h-6" />
            {loading ? 'Signing up...' : 'Discord'}
          </button>

          <button
            onClick={handleGitHubSignup}
            disabled={loading || success}
            className="flex-1 bg-gradient-to-r from-nuaibria-elevated to-nuaibria-border hover:from-nuaibria-border hover:to-nuaibria-elevated text-white font-bold py-4 px-6 rounded-lg transition-all hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-nuaibria-gold/20 hover:border-nuaibria-gold/40"
            type="button"
            title="Sign up with GitHub"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            {loading ? 'Signing up...' : 'GitHub'}
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-nuaibria-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-nuaibria-surface text-nuaibria-text-muted font-semibold">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup}>
          <div className="mb-5">
            <label
              className="block text-nuaibria-text-secondary text-sm font-semibold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full py-3 px-4 bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || success}
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-5">
            <label
              className="block text-nuaibria-text-secondary text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full py-3 px-4 bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || success}
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-nuaibria-text-secondary text-sm font-semibold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              className="w-full py-3 px-4 bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || success}
              placeholder="Re-enter your password"
            />
          </div>

          <button
            className="w-full bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            type="submit"
            disabled={loading || success}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="text-center">
            <p className="text-sm text-nuaibria-text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-nuaibria-arcane hover:text-nuaibria-gold font-semibold transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
