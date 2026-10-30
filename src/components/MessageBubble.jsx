import { Bot, Clock, CreditCard, TriangleAlert } from 'lucide-react';
import { formatNumber, formatTime } from '../utils/format.js';

const SYSTEM_ICONS = {
  rate: Clock,
  quota: CreditCard,
  error: TriangleAlert,
};

const SYSTEM_TITLES = {
  rate: '429 · Too Many Requests',
  quota: '402 · Payment Required',
  error: 'Request failed',
};

export default function MessageBubble({ message }) {
  if (message.role === 'system') {
    const Icon = SYSTEM_ICONS[message.kind] ?? TriangleAlert;
    return (
      <div className={`system-message system-message--${message.kind}`}>
        <Icon size={16} />
        <div>
          <strong>{SYSTEM_TITLES[message.kind]}</strong>
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`message message--${message.role}`}>
      {!isUser && (
        <span className="message-avatar">
          <Bot size={16} />
        </span>
      )}
      <div className="message-body">
        <div className="bubble">{message.text}</div>
        <div className="message-meta">
          <span>{formatTime(message.at)}</span>
          {message.meta && (
            <>
              <span className="meta-pill">{formatNumber(message.meta.totalTokens)} tokens</span>
              <span className="meta-pill">
                {message.meta.promptTokens} in · {message.meta.completionTokens} out
              </span>
              <span className="meta-pill">{(message.meta.latencyMs / 1000).toFixed(1)} s</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
