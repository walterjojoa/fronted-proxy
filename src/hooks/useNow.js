import { useEffect, useState } from 'react';

/**
 * Current timestamp, refreshed every `intervalMs`. Drives every countdown of the UI.
 */
export function useNow(intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
