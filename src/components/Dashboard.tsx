import React, { useState } from 'react';
import type { LogEntry, CategoryEmissions } from '../utils/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Leaf, Award, Calendar, TrendingDown } from 'lucide-react';

/**
 * Properties for the Dashboard component
 */
interface DashboardProps {
  /** Historical list of log entries */
  logs: LogEntry[];
  /** Latest computed category emissions values */
  latestEmissions: CategoryEmissions;
  /** List of unlocked badge identifiers */
  unlockedBadges: string[];
  /** Callback to route to the multi-step calculator wizard */
  onStartCalculator: () => void;
}

/**
 * Environmental impact summary dashboard presenting visual statistics
 * @param props Dashboard properties
 * @returns React functional component
 */
export const Dashboard: React.FC<DashboardProps> = ({
  logs,
  latestEmissions,
  unlockedBadges,
  onStartCalculator,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const hasLogs = logs.length > 0;
  const totalTonnes = (latestEmissions.total / 1000).toFixed(1);

  // Constants for comparison
  const COMPARISONS = {
    usAverage: 16.0,
    globalAverage: 4.0,
    ipccTarget: 2.0,
  };

  // 1. Calculate Donut Chart Angles & Segments (Circumference = 2 * PI * r = 314.159 for r = 50)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  const categories = [
    { id: 'energy', label: 'Home Energy', value: latestEmissions.energy, color: 'var(--color-energy)' },
    { id: 'transport', label: 'Transport', value: latestEmissions.transport, color: 'var(--color-transport)' },
    { id: 'food', label: 'Diet & Food', value: latestEmissions.food, color: 'var(--color-food)' },
    { id: 'waste', label: 'Waste & Recycle', value: latestEmissions.waste, color: 'var(--color-waste)' },
  ];

  const totalEmissionsVal = latestEmissions.total || 1; // prevent divide by zero
  let currentOffset = 0;

  const donutSegments = categories.map(cat => {
    const percentage = cat.value / totalEmissionsVal;
    const strokeDash = percentage * circumference;
    const strokeOffset = circumference - currentOffset;
    currentOffset += strokeDash;

    return {
      ...cat,
      percentage: Math.round(percentage * 100),
      strokeDash: `${strokeDash} ${circumference - strokeDash}`,
      strokeOffset,
    };
  });

  // 2. Render Historical Bar Chart (Last 7 entries)
  const maxBarHeight = 120;
  const chartWidth = 450;
  const chartHeight = 150;
  const paddingX = 40;
  const paddingY = 20;

  const lastSevenLogs = logs.slice(-7);
  const maxEmissionsInLogs = Math.max(...lastSevenLogs.map(l => l.emissions.total), 1000);
  
  const barWidth = lastSevenLogs.length > 0 
    ? (chartWidth - paddingX * 2) / lastSevenLogs.length - 12 
    : 0;

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1>Environmental Impact Dashboard</h1>
          <p>Analyze your annualized carbon emissions, historic logs, and active progress.</p>
        </div>
        <Button onClick={onStartCalculator}>
          {hasLogs ? 'Update Footprint' : 'Calculate Footprint'}
        </Button>
      </div>

      {!hasLogs ? (
        <Card variant="glass" className="empty-dashboard-card animate-scale-up">
          <Leaf className="empty-icon animate-glow" size={64} />
          <h2>Begin Your Climate Journey</h2>
          <p>
            You haven't logged any footprint calculations yet. Set up your profile by entering your utility bills,
            commutes, diet, and trash habits to calculate your carbon score.
          </p>
          <Button size="lg" onClick={onStartCalculator} className="mt-4">
            Start Calculator Now
          </Button>
        </Card>
      ) : (
        <div className="dashboard-grid">
          {/* Main Stat Card */}
          <Card variant="glow" className="main-stat-card">
            <h3>Your Annual Carbon Footprint</h3>
            <div className="stat-value-large">
              <span className="value-num">{totalTonnes}</span>
              <span className="value-unit">Tonnes CO₂e / Year</span>
            </div>
            <p className="stat-helper">
              Estimated greenhouse gases emitted by your lifestyle. The global average sustainability target is{' '}
              <strong>{COMPARISONS.ipccTarget} tonnes</strong>.
            </p>

            {/* Comparison Visualizer */}
            <div className="comparison-meters">
              <div className="meter-label">How you compare:</div>
              
              <div className="meter-row">
                <span className="meter-name">IPCC Target</span>
                <div className="meter-bar-bg">
                  <div 
                    className="meter-bar-fill target" 
                    style={{ width: `${Math.min(100, (COMPARISONS.ipccTarget / 16) * 100)}%` }}
                  ></div>
                </div>
                <span className="meter-val">{COMPARISONS.ipccTarget}t</span>
              </div>

              <div className="meter-row">
                <span className="meter-name">Your Score</span>
                <div className="meter-bar-bg">
                  <div 
                    className="meter-bar-fill user" 
                    style={{ width: `${Math.min(100, (parseFloat(totalTonnes) / 16) * 100)}%` }}
                  ></div>
                </div>
                <span className="meter-val">{totalTonnes}t</span>
              </div>

              <div className="meter-row">
                <span className="meter-name">Global Avg</span>
                <div className="meter-bar-bg">
                  <div 
                    className="meter-bar-fill global" 
                    style={{ width: `${Math.min(100, (COMPARISONS.globalAverage / 16) * 100)}%` }}
                  ></div>
                </div>
                <span className="meter-val">{COMPARISONS.globalAverage}t</span>
              </div>

              <div className="meter-row">
                <span className="meter-name">US Average</span>
                <div className="meter-bar-bg">
                  <div 
                    className="meter-bar-fill us" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <span className="meter-val">{COMPARISONS.usAverage}t</span>
              </div>
            </div>
          </Card>

          {/* Donut Chart Card */}
          <Card variant="glass" className="donut-chart-card">
            <h3>Emissions Breakdown</h3>
            <div className="donut-chart-layout">
              <div className="donut-svg-wrapper">
                <svg width="160" height="160" viewBox="0 0 120 120" className="donut-svg" aria-label="Emissions Category Donut Chart">
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="var(--border-color)" strokeWidth="12" />
                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.id}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="14"
                      strokeDasharray={segment.strokeDash}
                      strokeDashoffset={segment.strokeOffset}
                      transform="rotate(-90 60 60)"
                      className="donut-segment"
                      onMouseEnter={() => setHoveredCategory(segment.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      tabIndex={0}
                      aria-label={`${segment.label}: ${segment.percentage}%`}
                    />
                  ))}
                  <g className="donut-text">
                    <text x="50%" y="46%" textAnchor="middle" className="donut-center-num">
                      {hoveredCategory 
                        ? `${donutSegments.find(s => s.id === hoveredCategory)?.percentage}%`
                        : `${totalTonnes}t`}
                    </text>
                    <text x="50%" y="65%" textAnchor="middle" className="donut-center-lbl">
                      {hoveredCategory 
                        ? donutSegments.find(s => s.id === hoveredCategory)?.label
                        : 'Total CO2e'}
                    </text>
                  </g>
                </svg>
              </div>

              <div className="donut-legend">
                {donutSegments.map((segment) => (
                  <div 
                    key={segment.id} 
                    className={`legend-item ${hoveredCategory === segment.id ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHoveredCategory(segment.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <span className="legend-bullet" style={{ backgroundColor: segment.color }}></span>
                    <span className="legend-label">{segment.label}</span>
                    <span className="legend-val">{(segment.value / 1000).toFixed(1)}t ({segment.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Historical Trends Card */}
          <Card variant="glass" className="trends-chart-card">
            <div className="card-header-with-icon">
              <h3>Carbon Trend History</h3>
              {logs.length >= 2 && logs[logs.length-1].emissions.total < logs[0].emissions.total && (
                <div className="trend-badge positive">
                  <TrendingDown size={14} />
                  <span>Emissions Decreasing!</span>
                </div>
              )}
            </div>
            
            {logs.length < 2 ? (
              <div className="empty-trends">
                <Calendar size={32} className="trends-placeholder-icon" />
                <p>Submit another footprint log later to generate a history trend chart.</p>
              </div>
            ) : (
              <div className="svg-bar-chart-container">
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="bar-chart-svg" aria-label="Historic Carbon Trends Bar Chart">
                  {/* Grid Lines */}
                  <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="var(--border-color)" strokeDasharray="3 3" />
                  <line x1={paddingX} y1={(chartHeight - paddingY * 2) / 2 + paddingY} x2={chartWidth - paddingX} y2={(chartHeight - paddingY * 2) / 2 + paddingY} stroke="var(--border-color)" strokeDasharray="3 3" />
                  <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="var(--text-muted)" strokeWidth="1" />

                  {/* Render Bars */}
                  {lastSevenLogs.map((log, index) => {
                    const barHeight = (log.emissions.total / maxEmissionsInLogs) * maxBarHeight;
                    const x = paddingX + index * ((chartWidth - paddingX * 2) / lastSevenLogs.length) + 6;
                    const y = chartHeight - paddingY - barHeight;

                    return (
                      <g key={log.id} className="bar-group">
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill="var(--color-primary)"
                          rx="4"
                          className="chart-bar"
                          aria-label={`Logged on ${log.date}: ${(log.emissions.total / 1000).toFixed(2)} tonnes`}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight - 4}
                          textAnchor="middle"
                          className="bar-label"
                        >
                          {log.date.substring(5)} {/* MM-DD */}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          className="bar-value-text"
                        >
                          {(log.emissions.total / 1000).toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </Card>

          {/* Badges Achievements Card */}
          <Card variant="glass" className="badges-card">
            <h3>Milestone Achievements</h3>
            {unlockedBadges.length === 0 ? (
              <div className="empty-badges">
                <Award size={32} className="badge-placeholder-icon" />
                <p>Complete challenges or reduce emissions to earn your first environment badges!</p>
              </div>
            ) : (
              <div className="badges-grid">
                {unlockedBadges.map((badge) => {
                  let badgeColor = 'var(--color-primary)';
                  let badgeDesc = '';
                  if (badge === 'First Step') {
                    badgeColor = 'var(--color-info)';
                    badgeDesc = 'Completed your first eco-challenge.';
                  } else if (badge === 'Eco Warrior') {
                    badgeColor = 'var(--color-secondary)';
                    badgeDesc = 'Earned 100 Eco XP.';
                  } else if (badge === 'Carbon Cutter') {
                    badgeColor = 'var(--color-primary)';
                    badgeDesc = 'Lowered footprint between logs.';
                  } else if (badge === 'Planner') {
                    badgeColor = 'var(--color-accent)';
                    badgeDesc = 'Adopted 3 action plan goals.';
                  } else if (badge === 'Green Champion') {
                    badgeColor = 'var(--color-waste)';
                    badgeDesc = 'Earned 200 Eco XP.';
                  }

                  return (
                    <div key={badge} className="badge-item animate-scale-up" style={{ '--badge-theme': badgeColor } as React.CSSProperties}>
                      <div className="badge-icon-wrapper">
                        <Award size={24} />
                      </div>
                      <div className="badge-info">
                        <strong>{badge}</strong>
                        <p>{badgeDesc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
