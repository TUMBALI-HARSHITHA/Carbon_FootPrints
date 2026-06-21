import React from 'react';
import type { Challenge } from '../utils/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, Zap } from 'lucide-react';

interface EcoChallengesProps {
  challenges: Challenge[];
  toggleChallenge: (id: string) => void;
  totalXp: number;
}

export const EcoChallenges: React.FC<EcoChallengesProps> = ({
  challenges,
  toggleChallenge,
  totalXp,
}) => {
  // Group challenges by category or completion
  const completedChallenges = challenges.filter(c => c.completed);
  const pendingChallenges = challenges.filter(c => !c.completed);

  return (
    <div className="challenges-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1>Daily Green Challenges</h1>
          <p>Adopt sustainable habits into your daily routine. Complete challenges to earn Eco XP!</p>
        </div>
        <Card variant="glow" className="xp-summary-card">
          <Zap className="xp-icon animate-glow" size={20} fill="var(--color-accent)" stroke="var(--color-accent)" />
          <div className="xp-text">
            <span className="xp-lbl">Total Score</span>
            <span className="xp-num">{totalXp} XP</span>
          </div>
        </Card>
      </div>

      <div className="challenges-layout">
        {/* Active Challenges */}
        <section className="challenges-section">
          <h2>Active Challenges</h2>
          {pendingChallenges.length === 0 ? (
            <Card variant="glass" className="all-completed-card">
              <CheckCircle size={48} className="success-icon" />
              <h3>All Challenges Completed!</h3>
              <p>You have completed all available daily challenges. Great job! Check back tomorrow for more tasks.</p>
            </Card>
          ) : (
            <div className="challenges-list">
              {pendingChallenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  variant="glass" 
                  className={`challenge-card border-${challenge.category}`}
                >
                  <div className="challenge-main">
                    <span className={`category-tag ${challenge.category}`}>
                      {challenge.category}
                    </span>
                    <h3>{challenge.title}</h3>
                    <p>{challenge.description}</p>
                  </div>
                  <div className="challenge-actions">
                    <div className="xp-badge">
                      <span>+{challenge.xp} XP</span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => toggleChallenge(challenge.id)}
                      aria-label={`Mark "${challenge.title}" as completed`}
                    >
                      Complete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Completed History */}
        <section className="challenges-section completed-section">
          <h2>Completed Today ({completedChallenges.length})</h2>
          {completedChallenges.length === 0 ? (
            <div className="empty-completed">
              <p>No challenges completed yet today. Start checking off active challenges above!</p>
            </div>
          ) : (
            <div className="challenges-list">
              {completedChallenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  variant="glass" 
                  className="challenge-card completed border-completed"
                >
                  <div className="challenge-main">
                    <span className="category-tag completed">
                      Completed
                    </span>
                    <h3>{challenge.title}</h3>
                    <p className="description-muted">{challenge.description}</p>
                  </div>
                  <div className="challenge-actions">
                    <div className="xp-badge completed">
                      <span>+{challenge.xp} XP</span>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={() => toggleChallenge(challenge.id)}
                      aria-label={`Undo completion of "${challenge.title}"`}
                    >
                      Undo
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
