import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageCircle,
  BarChart3,
  Leaf,
  Settings,
  Heart,
  LogOut,
  Menu,
  X,
  HelpCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenHelp: () => void;
}

const NavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/chat', label: 'AI Chat', icon: MessageCircle },
  { to: '/dashboard/mood', label: 'Mood Tracker', icon: BarChart3 },
  { to: '/dashboard/wellness', label: 'Wellness', icon: Leaf },
  { to: '/dashboard/progress', label: 'Progress', icon: Sparkles },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const SidebarContent: React.FC<{
  collapsed: boolean;
  onNavigate: () => void;
  onOpenHelp: () => void;
}> = ({ collapsed, onNavigate, onOpenHelp }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-line shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender to-sage flex items-center justify-center text-white shadow-sm shrink-0">
          <Heart className="h-5 w-5" fill="currentColor" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-semibold text-[17px] leading-tight text-ink truncate">
              WellMind AI
            </p>
            <p className="text-[11px] text-ink-mute leading-tight">Mental wellness</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary">
        {NavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-fast ${
                isActive
                  ? 'bg-lavender-soft text-lavender-deep'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: help + profile */}
      <div className="px-3 py-3 border-t border-line space-y-1 shrink-0">
        <button
          onClick={onOpenHelp}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors duration-fast ${collapsed ? 'justify-center' : ''}`}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Help & support</span>}
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors duration-fast ${collapsed ? 'justify-center' : ''}`}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 rounded-full bg-mist-soft text-mist flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-ink truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-ink-mute truncate">{user?.email || ''}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-ink-mute shrink-0" />
              </>
            )}
          </button>

          {profileOpen && !collapsed && (
            <div
              className="absolute bottom-0 left-0 mb-2 w-56 card shadow-lg rounded-xl p-1.5 z-50"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-line mb-1">
                <p className="text-sm font-medium text-ink">{user?.name}</p>
                <p className="text-xs text-ink-mute">{user?.email}</p>
              </div>
              <Link
                to="/dashboard/settings"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-soft hover:bg-surface-2 rounded-lg"
                role="menuitem"
              >
                <Settings className="h-4 w-4" /> Account settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral hover:bg-coral-soft rounded-lg"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
  onOpenHelp,
}) => {
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-surface border-r border-line transition-[width] duration-slow ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
        aria-label="Sidebar"
      >
        <SidebarContent collapsed={collapsed} onNavigate={() => {}} onOpenHelp={onOpenHelp} />
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface border border-line items-center justify-center text-ink-mute hover:text-ink hover:bg-surface-2 shadow-sm transition-colors duration-fast"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-3.5 w-3.5" />
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
      <div className="lg:hidden fixed inset-0 z-40">
        <div
          className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          onClick={onCloseMobile}
          aria-hidden
        />
        <aside
          className="absolute inset-y-0 left-0 w-72 bg-surface border-r border-line shadow-xl"
          aria-label="Mobile navigation"
        >
          <button
            onClick={onCloseMobile}
            className="absolute right-2 top-3 z-10 p-2 text-ink-mute hover:text-ink rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent collapsed={false} onNavigate={onCloseMobile} onOpenHelp={onOpenHelp} />
        </aside>
      </div>
      )}
    </>
  );
};

export default Sidebar;
