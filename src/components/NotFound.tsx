import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <p className="text-sm text-ink-mute">Restoring your session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="card rounded-2xl p-8 max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-display text-3xl font-semibold text-ink mt-1">Page not found</h1>
        <p className="text-sm text-ink-soft mt-3">
          That address is not part of WellMind AI. Check the URL, or return to a page that exists.
        </p>
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn-primary mt-6 inline-flex">
          {isAuthenticated ? 'Back to dashboard' : 'Back to home'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
