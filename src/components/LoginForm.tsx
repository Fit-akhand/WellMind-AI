import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { safeReturnPath } from '../lib/safeReturnPath';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import SignupForm from './SignupForm';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupInternal, setShowSignupInternal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
        const from = (location.state as { from?: string } | null)?.from;
        navigate(safeReturnPath(from), { replace: true });
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignupInternal) {
    return <SignupForm onBackToLogin={() => setShowSignupInternal(false)} />;
  }

  return (
    <div className="w-full max-w-md p-8 card rounded-2xl shadow-xl">
      <div className="text-center">
        <p className="eyebrow">Welcome back</p>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-ink-mute">
          Continue your wellness journey with WellMind AI.
        </p>
      </div>

      {error && (
        <div
          className="mt-6 p-3 text-sm text-coral bg-coral-soft rounded-lg flex items-center"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-ink-soft mb-1 uppercase tracking-wider">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-mute pointer-events-none" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input !pl-9"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-ink-soft mb-1 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-mute pointer-events-none" />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input !pl-9"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full !py-3 !rounded-lg mt-2"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-ink-mute">
          Don’t have an account?{' '}
          <button
            onClick={() => {
              if (onSwitchToSignup) onSwitchToSignup();
              else setShowSignupInternal(true);
            }}
            className="font-semibold text-lavender-deep hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
