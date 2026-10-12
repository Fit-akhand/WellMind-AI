export const DASHBOARD_TABS = {
  '/dashboard': 'home',
  '/dashboard/chat': 'chat',
  '/dashboard/mood': 'mood',
  '/dashboard/wellness': 'wellness',
  '/dashboard/progress': 'progress',
  '/dashboard/settings': 'settings',
} as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[keyof typeof DASHBOARD_TABS];

export function tabFromPath(pathname: string): DashboardTab {
  return DASHBOARD_TABS[pathname as keyof typeof DASHBOARD_TABS] || 'home';
}

export const TITLE_BY_TAB: Record<DashboardTab, { title: string; subtitle: string }> = {
  home: { title: 'Dashboard', subtitle: 'Your calm starting point' },
  chat: { title: 'AI Chat', subtitle: 'A supportive conversation space' },
  mood: { title: 'Mood Tracker', subtitle: 'Notice patterns over time' },
  wellness: { title: 'Wellness', subtitle: 'Short grounding practices' },
  progress: { title: 'Progress', subtitle: 'From your saved records' },
  settings: { title: 'Settings', subtitle: 'Account and data' },
};
