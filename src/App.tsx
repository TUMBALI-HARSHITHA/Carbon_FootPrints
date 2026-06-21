import React, { useState, useEffect, useRef } from 'react';
import type { FootprintData } from './utils/types';
import { useFootprint } from './hooks/useFootprint';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FootprintCalculator } from './components/FootprintCalculator';
import { ActionInsights } from './components/ActionInsights';
import { EcoChallenges } from './components/EcoChallenges';
import { Modal } from './components/ui/Modal';
import { Award, Menu, X } from 'lucide-react';
import { Button } from './components/ui/Button';

/**
 * Root component of the EcoTracker Application assembling page views
 * @returns React functional component
 */
export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    logs,
    currentInputs,
    latestEmissions,
    recommendations,
    challenges,
    stats,
    saveFootprint,
    toggleRecommendation,
    toggleChallenge,
    clearAllData,
  } = useFootprint();

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cf_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Badge celebration states
  const [celebrationBadge, setCelebrationBadge] = useState<string | null>(null);
  const prevBadgesRef = useRef<string[]>(stats.unlockedBadges);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cf_theme', theme);
  }, [theme]);

  // Check for newly unlocked badges to show celebration modal
  useEffect(() => {
    const prevBadges = prevBadgesRef.current;
    const currentBadges = stats.unlockedBadges;

    if (currentBadges.length > prevBadges.length) {
      // Find the newly added badge
      const newlyUnlocked = currentBadges.find((badge) => !prevBadges.includes(badge));
      if (newlyUnlocked) {
        setCelebrationBadge(newlyUnlocked);
      }
    }
    prevBadgesRef.current = currentBadges;
  }, [stats.unlockedBadges]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleStartCalculator = () => {
    setActiveTab('calculator');
  };

  const handleSaveFootprint = (data: FootprintData) => {
    saveFootprint(data);
    setActiveTab('dashboard');
  };

  const handleCancelCalculator = () => {
    setActiveTab('dashboard');
  };

  return (
    <div className="app-container">
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <h2>EcoTracker</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${mobileSidebarOpen ? 'show' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        role="presentation"
      >
        <div className="sidebar-wrapper" onClick={(e) => e.stopPropagation()}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileSidebarOpen(false);
            }}
            stats={stats}
            theme={theme}
            toggleTheme={toggleTheme}
            onReset={clearAllData}
          />
        </div>
      </div>

      {/* Standard Sidebar for Desktop */}
      <div className="desktop-sidebar-container">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          theme={theme}
          toggleTheme={toggleTheme}
          onReset={clearAllData}
        />
      </div>

      {/* Main Content Area */}
      <main className="main-content" id="main-content-area">
        {activeTab === 'dashboard' && (
          <Dashboard
            logs={logs}
            latestEmissions={latestEmissions}
            unlockedBadges={stats.unlockedBadges}
            onStartCalculator={handleStartCalculator}
          />
        )}

        {activeTab === 'calculator' && (
          <FootprintCalculator
            currentInputs={currentInputs}
            onSave={handleSaveFootprint}
            onCancel={handleCancelCalculator}
          />
        )}

        {activeTab === 'insights' && (
          <ActionInsights
            recommendations={recommendations}
            latestEmissions={latestEmissions}
            toggleRecommendation={toggleRecommendation}
          />
        )}

        {activeTab === 'challenges' && (
          <EcoChallenges
            challenges={challenges}
            toggleChallenge={toggleChallenge}
            totalXp={stats.totalXp}
          />
        )}
      </main>

      {/* Badge celebration modal */}
      <Modal
        isOpen={!!celebrationBadge}
        onClose={() => setCelebrationBadge(null)}
        title="Congratulations! 🎉"
      >
        <div className="celebration-content animate-scale-up">
          <div className="celebration-badge-icon">
            <Award size={48} className="animate-glow" />
          </div>
          <h2>Badge Unlocked: {celebrationBadge}</h2>
          <p className="celebration-desc">
            {celebrationBadge === 'First Step' && 'You have completed your very first daily eco-challenge! Keep up the good work.'}
            {celebrationBadge === 'Eco Warrior' && 'Amazing dedication! You earned 100 Eco XP by adopting multiple green habits.'}
            {celebrationBadge === 'Carbon Cutter' && 'Fantastic result! Your updated carbon footprint calculations are lower than your baseline. You are actively reducing your emissions!'}
            {celebrationBadge === 'Planner' && 'You have selected 3 or more recommendations to add to your green action planner. Planning is the key to offsets!'}
            {celebrationBadge === 'Green Champion' && 'Superb! You reached 200 Eco XP and have become a verified Green Champion. Share your footprint with others!'}
          </p>
          <Button onClick={() => setCelebrationBadge(null)} className="celebration-btn">
            Awesome!
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
