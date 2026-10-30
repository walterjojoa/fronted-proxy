import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

const POLL_INTERVAL_MS = 30_000;

/**
 * Loads the quota status and the 7-day history of the user.
 * `status.windowResetsAt` is the absolute time when the rate-limit window restarts.
 */
export function useQuota(userId, onError) {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const [nextStatus, nextHistory] = await Promise.all([api.getStatus(userId), api.getHistory(userId)]);
      setStatus({
        ...nextStatus,
        windowResetsAt: Date.now() + nextStatus.secondsUntilRateLimitReset * 1000,
      });
      setHistory(nextHistory);
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [userId, onError]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { status, history, loading, refresh };
}
