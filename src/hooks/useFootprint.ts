import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { FootprintData, LogEntry, Recommendation, Challenge, UserStats, CategoryEmissions } from '../utils/types';
import { calculateEmissions, DEFAULT_FOOTPRINT_DATA } from '../utils/formulas';
import { RECOMMENDATIONS_PRESET, CHALLENGES_PRESET } from '../utils/presets';

export function useFootprint() {
  const [activeTab, setActiveTab] = useLocalStorage<'dashboard' | 'calculator' | 'insights' | 'challenges'>('cf_active_tab', 'dashboard');
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('cf_logs', []);
  const [currentInputs, setCurrentInputs] = useLocalStorage<FootprintData>('cf_inputs', DEFAULT_FOOTPRINT_DATA);
  const [recommendations, setRecommendations] = useLocalStorage<Recommendation[]>('cf_recommendations', RECOMMENDATIONS_PRESET);
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>('cf_challenges', CHALLENGES_PRESET);
  const [stats, setStats] = useLocalStorage<UserStats>('cf_stats', { totalXp: 0, unlockedBadges: [] });

  // 1. Calculate latest emissions
  const latestEmissions = useMemo<CategoryEmissions>(() => {
    return calculateEmissions(currentInputs);
  }, [currentInputs]);

  // Helper to check and award badges based on XP and actions
  const checkBadges = useCallback((xp: number, currentLogs: LogEntry[], currentRecommendations: Recommendation[]): string[] => {
    const badges: string[] = [];

    // Badge 1: First Step
    if (xp > 0) {
      badges.push('First Step');
    }

    // Badge 2: Eco Warrior (XP >= 100)
    if (xp >= 100) {
      badges.push('Eco Warrior');
    }

    // Badge 3: Carbon Cutter (Reduction in footprint between logs)
    if (currentLogs.length >= 2) {
      const firstTotal = currentLogs[0].emissions.total;
      const latestTotal = currentLogs[currentLogs.length - 1].emissions.total;
      if (latestTotal < firstTotal) {
        badges.push('Carbon Cutter');
      }
    }

    // Badge 4: Planner (implemented at least 3 recommendations)
    const implementedCount = currentRecommendations.filter(r => r.implemented).length;
    if (implementedCount >= 3) {
      badges.push('Planner');
    }

    // Badge 5: Green Champion (XP >= 200)
    if (xp >= 200) {
      badges.push('Green Champion');
    }

    return badges;
  }, []);

  // 2. Action: Save a new footprint log entry
  const saveFootprint = useCallback((data: FootprintData) => {
    const emissions = calculateEmissions(data);
    const today = new Date().toISOString().split('T')[0];

    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      date: today,
      inputs: data,
      emissions,
    };

    setCurrentInputs(data);
    
    setLogs(prev => {
      // Overwrite if entry for today already exists, otherwise append
      const existingIndex = prev.findIndex(entry => entry.date === today);
      let updatedLogs = [...prev];
      if (existingIndex >= 0) {
        updatedLogs[existingIndex] = newEntry;
      } else {
        updatedLogs.push(newEntry);
      }
      // Sort logs by date ascending
      updatedLogs.sort((a, b) => a.date.localeCompare(b.date));

      // Check badges after log updates
      setStats(currentStats => {
        const badges = checkBadges(currentStats.totalXp, updatedLogs, recommendations);
        return {
          ...currentStats,
          unlockedBadges: badges,
        };
      });

      return updatedLogs;
    });
  }, [setCurrentInputs, setLogs, setStats, checkBadges, recommendations]);

  // 3. Action: Toggle recommendation implementation state
  const toggleRecommendation = useCallback((id: string) => {
    setRecommendations(prev => {
      const updated = prev.map(rec => 
        rec.id === id ? { ...rec, implemented: !rec.implemented } : rec
      );
      
      // Update badges (e.g. Planner badge)
      setStats(currentStats => {
        const badges = checkBadges(currentStats.totalXp, logs, updated);
        return {
          ...currentStats,
          unlockedBadges: badges,
        };
      });

      return updated;
    });
  }, [setRecommendations, setStats, checkBadges, logs]);

  // 4. Action: Toggle challenge completion state
  const toggleChallenge = useCallback((id: string) => {
    setChallenges(prev => {
      return prev.map(ch => {
        if (ch.id === id) {
          const nextCompleted = !ch.completed;
          const xpDiff = nextCompleted ? ch.xp : -ch.xp;

          // Adjust total XP and verify badges
          setStats(currentStats => {
            const nextXp = Math.max(0, currentStats.totalXp + xpDiff);
            const badges = checkBadges(nextXp, logs, recommendations);
            return {
              totalXp: nextXp,
              unlockedBadges: badges,
            };
          });

          return {
            ...ch,
            completed: nextCompleted,
            dateCompleted: nextCompleted ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return ch;
      });
    });
  }, [setChallenges, setStats, checkBadges, logs, recommendations]);

  // 5. Action: Reset all application state
  const clearAllData = useCallback(() => {
    setCurrentInputs(DEFAULT_FOOTPRINT_DATA);
    setLogs([]);
    setRecommendations(RECOMMENDATIONS_PRESET);
    setChallenges(CHALLENGES_PRESET);
    setStats({ totalXp: 0, unlockedBadges: [] });
    setActiveTab('dashboard');
  }, [setCurrentInputs, setLogs, setRecommendations, setChallenges, setStats, setActiveTab]);

  return {
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
  };
}
