import React from 'react';
import { LayoutDashboard, Calculator, Leaf, Award, Sun, Moon, Trash2 } from 'lucide-react';
import type { UserStats } from '../utils/types';

interface SidebarProps {
  activeTab: 'dashboard' | 'calculator' | 'insights' | 'challenges';
  setActiveTab: (tab: 'dashboard' | 'calculator' | 'insights' | 'challenges') => void;
  stats: UserStats;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  theme,
  toggleTheme,
  onReset,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'insights', label: 'Action Plan', icon: Leaf },
    { id: 'challenges', label: 'Challenges', icon: Award },
  ] as const;

  return (
    <aside className="sidebar" aria-label="Application Navigation">
      <div className="sidebar-brand">
        <Leaf className="brand-icon" size={28} />
        <h2>EcoTracker</h2>
      </div>

      <div className="sidebar-stats">
        <div className="xp-container">
          <span className="xp-label">ECO XP</span>
          <span className="xp-value">{stats.totalXp}</span>
        </div>
        <div className="badge-count">
          <span>{stats.unlockedBadges.length} Badges Unlocked</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-action-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <>
              <Moon size={18} />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun size={18} />
              <span>Light Mode</span>
            </>
          )}
        </button>

        <button
          className="sidebar-action-btn delete-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all your data? This will clear logs, XP, and badges.')) {
              onReset();
            }
          }}
          aria-label="Reset all application data"
          title="Reset Data"
        >
          <Trash2 size={18} />
          <span>Reset Data</span>
        </button>
      </div>
    </aside>
  );
};
