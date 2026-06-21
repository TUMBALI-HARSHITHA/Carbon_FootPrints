import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../src/components/Sidebar';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';

describe('React Core UI Components', () => {
  it('renders Sidebar with title and user XP indicators', () => {
    const setActiveTab = vi.fn();
    const toggleTheme = vi.fn();
    const onReset = vi.fn();
    
    const stats = {
      totalXp: 120,
      unlockedBadges: ['First Step', 'Eco Warrior'],
    };

    render(
      <Sidebar
        activeTab="dashboard"
        setActiveTab={setActiveTab}
        stats={stats}
        theme="dark"
        toggleTheme={toggleTheme}
        onReset={onReset}
      />
    );

    // Verify Brand title is rendered
    expect(screen.getByText('EcoTracker')).toBeInTheDocument();
    
    // Verify XP is displayed
    expect(screen.getByText('ECO XP')).toBeInTheDocument();
    expect(screen.getByText('120 XP')).toBeInTheDocument();
    expect(screen.getByText('2 Badges Unlocked')).toBeInTheDocument();

    // Click navigation button
    const calculatorBtn = screen.getByRole('button', { name: /Calculator/i });
    fireEvent.click(calculatorBtn);
    expect(setActiveTab).toHaveBeenCalledWith('calculator');
  });

  it('renders reusable UI Card with correct variants', () => {
    const { container } = render(
      <Card variant="glass" hoverEffect={true}>
        <div>Card Content</div>
      </Card>
    );

    const cardDiv = container.firstChild as HTMLDivElement;
    expect(cardDiv).toBeInTheDocument();
    expect(cardDiv.className).toContain('card-glass');
    expect(cardDiv.className).toContain('card-hover');
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders reusable UI Button and fires click events', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" size="lg" onClick={handleClick}>
        Test Button
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Test Button' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('btn-primary');
    expect(btn.className).toContain('btn-lg');
    
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
