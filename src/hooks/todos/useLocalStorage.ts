import { useState, useEffect, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Use ref to store initial value to prevent re-renders
  const initialValueRef = useRef(initialValue);
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Only initialize with initialValue on first render
    return initialValueRef.current;
  });

  // Load value from localStorage on client side only once
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          let parsed;
          try {
            parsed = JSON.parse(item);
          } catch (parseError) {
            // If JSON.parse fails, treat the item as a string value
            // This handles cases where localStorage contains plain strings like "light"
            parsed = item;
          }
          
          // Validate that if initialValue is an array, parsed value is also an array
          if (Array.isArray(initialValueRef.current) && !Array.isArray(parsed)) {
            setStoredValue(initialValueRef.current);
          } else {
            setStoredValue(parsed);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValueRef.current);
    }
  }, [key]); // Only depend on key

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}