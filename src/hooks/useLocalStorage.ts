import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage with schema/type safety checks
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get initial value from localStorage or fallback
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Security & Type Safety Check: Ensure the loaded item matches the type of initialValue
        if (initialValue !== null && initialValue !== undefined) {
          const expectedType = typeof initialValue;
          const parsedType = typeof parsed;
          if (expectedType !== parsedType) {
            console.warn(`Type mismatch for localStorage key "${key}". Expected ${expectedType}, got ${parsedType}. Resetting.`);
            return initialValue;
          }
          if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
            console.warn(`Type mismatch (array expected) for localStorage key "${key}". Resetting.`);
            return initialValue;
          }
        }
        return parsed as T;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Keep localStorage in sync with state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
