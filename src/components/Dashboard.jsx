import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { useNow } from '../hooks/useNow.js';
import { useQuota } from '../hooks/useQuota.js';
import Header from './Header.jsx';
import ChatPanel from './ChatPanel.jsx';
import QuotaCard from './QuotaCard.jsx';
import RateLimitCard from './RateLimitCard.jsx';
import UsageChart from './UsageChart.jsx';
import PlanCard from './PlanCard.jsx';
import UpgradeModal from './UpgradeModal.jsx';
import { ToastStack, useToasts } from './Toasts.jsx';

// Small delay so the backend scheduler (second 0) has already cleared the counters
const WINDOW_REFRESH_MARGIN_MS = 800;

export default function Dashboard({ userId, onLogout }) {
  const now = useNow();
  const { toasts, pushToast, dismissToast } = useToasts();

  const handleError = useCallback(
    (error) => pushToast({ type: 'error', title: 'Connection problem', message: error.message }),
    [pushToast],
  );
  const { status, history, loading, refresh } = useQuota(userId, handleError);

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [chainState, setChainState] = useState('idle');
  const [upgrade, setUpgrade] = useState({ open: false, reason: 'manual' });
  const nextMessageId = useRef(0);

  // Reload the status right after the rate-limit window restarts
  const windowResetsAt = status?.windowResetsAt;
  useEffect(() => {
    if (!windowResetsAt) return undefined;
    const delay = Math.max(0, windowResetsAt - Date.now()) + WINDOW_REFRESH_MARGIN_MS;
    const id = setTimeout(refresh, delay);
    return () => clearTimeout(id);
  }, [windowResetsAt, refresh]);

  const secondsToWindowReset = status ? Math.max(0, (status.windowResetsAt - now) / 1000) : 0;
  const serverBlockSeconds = Math.max(0, (blockedUntil - now) / 1000);
  const requestLimit = status?.requestsPerMinuteLimit ?? null;
  const localLimitReached =
    requestLimit !== null && status.requestsThisMinute >= requestLimit && secondsToWindowReset > 0;
  const rateLimited = serverBlockSeconds > 0 || localLimitReached;
  const retryIn = serverBlockSeconds > 0 ? serverBlockSeconds : secondsToWindowReset;
  const quotaExhausted = status?.tokensRemaining === 0;

  const addMessage = (message) => {
    nextMessageId.current += 1;
    setMessages((current) => [...current, { id: nextMessageId.current, at: new Date(), ...message }]);
  };

  const openUpgrade = (reason = 'manual') => setUpgrade({ open: true, reason });

  const handleSend = async (prompt) => {
    addMessage({ role: 'user', text: prompt });
    setSending(true);
    setChainState('pending');

    try {
      const response = await api.generate(userId, prompt);
      addMessage({
        role: 'assistant',
        text: response.text,
        meta: {
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          totalTokens: response.totalTokens,
          latencyMs: response.latencyMs,
        },
      });
      setChainState('success');
    } catch (error) {
      if (error.status === 429) {
        const seconds = error.retryAfter || 60;
        setBlockedUntil(Date.now() + seconds * 1000);
        setChainState('rate-limited');
        addMessage({ role: 'system', kind: 'rate', text: error.message });
      } else if (error.status === 402) {
        setChainState('quota-exceeded');
        addMessage({ role: 'system', kind: 'quota', text: error.message });
        openUpgrade('quota');
      } else {
        setChainState('error');
        addMessage({ role: 'system', kind: 'error', text: error.message });
      }
    } finally {
      setSending(false);
      refresh();
    }
  };

  const handleUpgraded = (newStatus) => {
    setBlockedUntil(0);
    setChainState('idle');
    refresh();
    pushToast({
      type: 'success',
      title: `Welcome to ${newStatus.plan}!`,
      message: 'Your new limits are already active.',
    });
  };

  const plan = status?.plan ?? 'FREE';

  return (
    <div className="app">
      <Header userId={userId} plan={status?.plan} connected={Boolean(status)} onLogout={onLogout} />

      <main className="layout">
        <section className="chat-column">
          <ChatPanel
            messages={messages}
            sending={sending}
            onSend={handleSend}
            onClear={() => {
              setMessages([]);
              setChainState('idle');
            }}
            chainState={chainState}
            rateLimited={rateLimited}
            retryIn={retryIn}
            tokensRemaining={status?.tokensRemaining ?? null}
            quotaExhausted={quotaExhausted}
            onUpgrade={() => openUpgrade('quota')}
          />
        </section>

        <aside className="sidebar">
          <QuotaCard status={status} loading={loading} />
          <RateLimitCard status={status} loading={loading} secondsToReset={secondsToWindowReset} rateLimited={rateLimited} />
          <UsageChart history={history} loading={loading} />
          <PlanCard plan={plan} onUpgrade={() => openUpgrade('manual')} />
        </aside>
      </main>

      {upgrade.open && (
        <UpgradeModal
          reason={upgrade.reason}
          currentPlan={plan}
          userId={userId}
          onClose={() => setUpgrade((current) => ({ ...current, open: false }))}
          onUpgraded={handleUpgraded}
        />
      )}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
