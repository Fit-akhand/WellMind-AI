import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { applyTheme, getStoredTheme, Theme } from '../lib/theme';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const PILLS = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/dashboard/chat', label: 'AI Chat' },
  { to: '/dashboard/mood', label: 'Mood' },
  { to: '/dashboard/wellness', label: 'Wellness' },
  { to: '/dashboard/progress', label: 'Progress' },
];

interface TopNavProps {
  onOpenHelp: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onOpenHelp }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3">
      <div className="mx-auto max-w-[1280px] flex flex-wrap items-center gap-x-3 gap-y-2 rounded-full bg-surface/90 backdrop-blur border border-line shadow-sm px-3 py-2">
        <Link to="/dashboard" className="pl-1 pr-3 shrink-0" aria-label="WellMind home">
          <Logo size={32} wordmarkClassName="hidden sm:inline" />
        </Link>

        <nav className="order-last md:order-none w-full md:w-auto md:flex-1 flex md:justify-center gap-1 overflow-x-auto no-scrollbar" aria-label="Main">
          {PILLS.map((pill) => (
            <NavLink
              key={pill.to}
              to={pill.to}
              end={pill.end}
              className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : ''}`}
            >
              {pill.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-1.5 relative">
          <button type="button" onClick={onOpenHelp} className="icon-btn" aria-label="Help and crisis support">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="icon-btn"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-lavender-soft text-lavender-deep font-semibold flex items-center justify-center"
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            {initial}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-64 card shadow-lg rounded-2xl p-4 z-50">
              <p className="text-sm font-medium text-ink">Notifications</p>
              <p className="text-sm text-ink-mute mt-1">No new notifications.</p>
            </div>
          )}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-60 card shadow-lg rounded-2xl p-2 z-50">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                <p className="text-xs text-ink-mute truncate">{user?.email}</p>
              </div>
              <NavLink to="/dashboard/settings" onClick={() => setMenuOpen(false)} className="menu-item">
                <Settings className="h-4 w-4" /> Settings
              </NavLink>
              <button type="button" className="menu-item w-full" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button
                type="button"
                className="menu-item w-full"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
