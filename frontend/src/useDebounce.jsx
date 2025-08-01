import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value by delay ms
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); 
  }, [value, delay]);

  return debouncedValue;
}