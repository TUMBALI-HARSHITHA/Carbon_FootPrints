import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../src/hooks/useLocalStorage';
import { useFootprint } from '../src/hooks/useFootprint';
import { DEFAULT_FOOTPRINT_DATA } from '../src/utils/formulas';

describe('React Custom Hooks', () => {
  describe('useLocalStorage Hook', () => {
    it('initializes with default value if storage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test_key', 'default_val'));
      expect(result.current[0]).toBe('default_val');
    });

    it('recovers with fallback if type mismatch occurs in loaded JSON', () => {
      // Simulate corrupted data of type mismatch (string loaded when object is expected)
      window.localStorage.setItem('mismatch_key', JSON.stringify('corrupted-string'));

      const { result } = renderHook(() => useLocalStorage('mismatch_key', { count: 1 }));
      
      // Expected to fallback to initial value { count: 1 } instead of string
      expect(result.current[0]).toEqual({ count: 1 });
    });

    it('sets and retrieves local storage items', () => {
      const { result } = renderHook(() => useLocalStorage('write_key', 'initial'));
      
      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(JSON.parse(window.localStorage.getItem('write_key') || '')).toBe('updated');
    });
  });

  describe('useFootprint state manager Hook', () => {
    it('initializes default stats and presets', () => {
      const { result } = renderHook(() => useFootprint());
      
      expect(result.current.stats.totalXp).toBe(0);
      expect(result.current.stats.unlockedBadges).toEqual([]);
      expect(result.current.challenges.length).toBeGreaterThan(0);
      expect(result.current.recommendations.length).toBeGreaterThan(0);
    });

    it('completes challenges and awards XP', () => {
      const { result } = renderHook(() => useFootprint());
      const firstChallenge = result.current.challenges[0];

      act(() => {
        result.current.toggleChallenge(firstChallenge.id);
      });

      // XP should increase by challenge value
      expect(result.current.stats.totalXp).toBe(firstChallenge.xp);
      // Badge 'First Step' should be unlocked
      expect(result.current.stats.unlockedBadges).toContain('First Step');
    });

    it('saving logs adds log entries and recalibrates emissions', () => {
      const { result } = renderHook(() => useFootprint());
      
      act(() => {
        result.current.saveFootprint(DEFAULT_FOOTPRINT_DATA);
      });

      expect(result.current.logs.length).toBe(1);
      expect(result.current.logs[0].emissions.total).toBeGreaterThan(0);
    });
  });
});
