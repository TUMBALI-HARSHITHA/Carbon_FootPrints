import React, { useState, useMemo } from 'react';
import type { Recommendation, CategoryEmissions } from '../utils/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Leaf, Check, Plus, AlertCircle } from 'lucide-react';

interface ActionInsightsProps {
  recommendations: Recommendation[];
  latestEmissions: CategoryEmissions;
  toggleRecommendation: (id: string) => void;
}

export const ActionInsights: React.FC<ActionInsightsProps> = ({
  recommendations,
  latestEmissions,
  toggleRecommendation,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'energy' | 'transport' | 'food' | 'waste'>('all');
  const [sortCriteria, setSortCriteria] = useState<'savings' | 'difficulty'>('savings');

  // 1. Identify User's Highest Emission Category to offer custom warning
  const highestCategory = useMemo(() => {
    const categories = [
      { name: 'energy', value: latestEmissions.energy, label: 'Home Energy' },
      { name: 'transport', value: latestEmissions.transport, label: 'Transportation' },
      { name: 'food', value: latestEmissions.food, label: 'Diet & Groceries' },
      { name: 'waste', value: latestEmissions.waste, label: 'Landfill Waste' },
    ];
    categories.sort((a, b) => b.value - a.value);
    return categories[0].value > 0 ? categories[0] : null;
  }, [latestEmissions]);

  // 2. Compute current savings from implemented items
  const totalOffsetSavings = useMemo(() => {
    return recommendations
      .filter(r => r.implemented)
      .reduce((sum, r) => sum + r.potentialSavings, 0);
  }, [recommendations]);

  // 3. Filter and Sort Recommendations
  const filteredRecommendations = useMemo(() => {
    let result = [...recommendations];

    // Filter
    if (filterCategory !== 'all') {
      result = result.filter(r => r.category === filterCategory);
    }

    // Sort
    if (sortCriteria === 'savings') {
      result.sort((a, b) => b.potentialSavings - a.potentialSavings);
    } else if (sortCriteria === 'difficulty') {
      const difficultyWeights = { easy: 1, medium: 2, hard: 3 };
      result.sort((a, b) => difficultyWeights[a.difficulty] - difficultyWeights[b.difficulty]);
    }

    // Proactively sort highest emitting category suggestions to the top if 'all' is selected
    if (filterCategory === 'all' && highestCategory) {
      result.sort((a, b) => {
        if (a.category === highestCategory.name && b.category !== highestCategory.name) return -1;
        if (a.category !== highestCategory.name && b.category === highestCategory.name) return 1;
        return 0;
      });
    }

    return result;
  }, [recommendations, filterCategory, sortCriteria, highestCategory]);

  return (
    <div className="insights-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1>Green Action Planner</h1>
          <p>Commit to sustainable lifestyle choices and track your potential carbon offsets.</p>
        </div>
        <Card variant="glow" className="offset-summary-widget">
          <span className="offset-title">Planned Carbon Offset</span>
          <span className="offset-val">{(totalOffsetSavings / 1000).toFixed(2)} t CO₂e / yr</span>
        </Card>
      </div>

      {highestCategory && (
        <Card variant="glass" className="highest-emission-warning animate-scale-up">
          <AlertCircle className="warning-icon" size={24} />
          <div className="warning-text">
            <strong>High Carbon Alert: {highestCategory.label}</strong>
            <p>
              Your highest emissions source is <strong>{highestCategory.label}</strong> ({(highestCategory.value / 1000).toFixed(2)} tonnes/yr).
              We have prioritized recommendations below to help you reduce this impact first.
            </p>
          </div>
        </Card>
      )}

      {/* Filter and Sort bar */}
      <div className="filter-sort-bar">
        <div className="filter-buttons" role="group" aria-label="Filter recommendations by category">
          {(['all', 'energy', 'transport', 'food', 'waste'] as const).map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All Tips' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="sort-controls">
          <label htmlFor="sort-select">Sort By:</label>
          <select
            id="sort-select"
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value as 'savings' | 'difficulty')}
            aria-label="Sort recommendations criteria"
          >
            <option value="savings">CO₂ Savings (Highest)</option>
            <option value="difficulty">Difficulty (Easiest)</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="recommendations-grid">
        {filteredRecommendations.map((rec) => {
          const categoryClass = `rec-card-category border-${rec.category}`;
          return (
            <Card
              key={rec.id}
              variant={rec.implemented ? 'glow' : 'glass'}
              className={`recommendation-card ${rec.implemented ? 'implemented' : ''} ${categoryClass}`}
            >
              <div className="rec-header">
                <span className={`category-tag ${rec.category}`}>
                  {rec.category}
                </span>
                <span className={`difficulty-tag ${rec.difficulty}`}>
                  {rec.difficulty}
                </span>
              </div>
              
              <div className="rec-body">
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
              </div>

              <div className="rec-footer">
                <div className="savings-badge">
                  <Leaf size={14} className="savings-icon" />
                  <span>-{rec.potentialSavings} kg CO₂e / yr</span>
                </div>
                
                <Button
                  variant={rec.implemented ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleRecommendation(rec.id)}
                  aria-label={rec.implemented ? `Remove ${rec.title} from plan` : `Add ${rec.title} to plan`}
                >
                  {rec.implemented ? (
                    <>
                      <Check size={14} />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Add to Plan</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
