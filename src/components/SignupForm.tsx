import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface SignupFormProps {
  onBackToLogin?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup(name, email, password);
      if (res.success) {
        setSuccess(res.message || 'Account created. Sign in to continue.');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 card rounded-2xl shadow-xl">
      <div className="text-center">
        <p className="eyebrow">Join WellMind AI</p>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">
          Create account
        </h1>
        <p className="mt-2 text-sm text-ink-mute">
          A supportive space for your mental wellness.
        </p>
      </div>

      {success && (
        <div className="mt-6 p-3 text-sm text-sage bg-sage-soft rounded-lg" role="status">
          <p>{success}</p>
          {onBackToLogin ? (
            <button type="button" onClick={onBackToLogin} className="font-semibold underline mt-2">
              Go to sign in
            </button>
          ) : (
            <Link to="/login" className="font-semibold underline mt-2 inline-block">
              Go to sign in
            </Link>
          )}
        </div>
      )}

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
          <label className="block text-xs font-semibold text-ink-soft mb-1 uppercase tracking-wider">
            Full name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Alex Smith"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1 uppercase tracking-wider">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-mute pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input !pl-9"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1 uppercase tracking-wider">
            Password (min 8 characters)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-mute pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input !pl-9 !pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 p-1 text-ink-mute hover:text-ink transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1 uppercase tracking-wider">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-mute pointer-events-none" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input !pl-9 !pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 p-1 text-ink-mute hover:text-ink transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full !py-3 !rounded-lg mt-2"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {onBackToLogin && (
        <div className="text-center mt-6">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </button>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
