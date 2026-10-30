import { useEffect, useRef, useState } from 'react';
import { Clock, CreditCard, MessageSquare, Send, Trash2, LoaderCircle } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import ProxyChain from './ProxyChain.jsx';
import TokenEstimator from './TokenEstimator.jsx';
import { formatCountdown } from '../utils/format.js';

const MAX_PROMPT_LENGTH = 4000;

const SUGGESTIONS = [
  'Explain the Proxy design pattern',
  'What is rate limiting?',
  'How do token quotas work?',
  'Give me an example of lazy loading',
];

export default function ChatPanel({
  messages,
  sending,
  onSend,
  onClear,
  chainState,
  rateLimited,
  retryIn,
  tokensRemaining,
  quotaExhausted,
  onUpgrade,
}) {
  const [prompt, setPrompt] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const canSend = prompt.trim().length > 0 && !sending && !rateLimited;

  const submit = (text = prompt) => {
    const value = text.trim();
    if (!value || sending || rateLimited) return;
    onSend(value);
    setPrompt('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="card chat">
      <div className="chat-header">
        <div className="chat-title">
          <span className="card-icon card-icon--violet">
            <MessageSquare size={18} />
          </span>
          <div>
            <h2>AI Playground</h2>
            <p className="muted small">Simulated text generation service</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            <Trash2 size={15} /> Clear
          </button>
        )}
      </div>

      <ProxyChain state={chainState} />

      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-art">
              <MessageSquare size={30} />
            </div>
            <h3>Start a conversation</h3>
            <p className="muted">Send a prompt and watch it pass through the proxy chain.</p>
            <div className="suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="suggestion"
                  onClick={() => submit(suggestion)}
                  disabled={sending || rateLimited}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        {sending && (
          <div className="message message--assistant">
            <div className="bubble bubble--typing" aria-label="The AI is writing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {rateLimited && (
        <div className="banner banner--warning" role="status">
          <Clock size={18} />
          <div className="banner-text">
            <strong>Rate limit reached.</strong> You can send again in{' '}
            <span className="mono">{formatCountdown(retryIn)}</span>
          </div>
        </div>
      )}
      {quotaExhausted && !rateLimited && (
        <div className="banner banner--danger" role="status">
          <CreditCard size={18} />
          <div className="banner-text">
            <strong>Monthly quota exhausted.</strong> Upgrade your plan to keep generating.
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onUpgrade}>
            Upgrade
          </button>
        </div>
      )}

      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <textarea
          className="composer-input"
          placeholder="Write a prompt… (Enter to send, Shift + Enter for a new line)"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value.slice(0, MAX_PROMPT_LENGTH))}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        <div className="composer-footer">
          <TokenEstimator prompt={prompt} tokensRemaining={tokensRemaining} maxLength={MAX_PROMPT_LENGTH} />
          <button type="submit" className="btn btn-primary send-button" disabled={!canSend}>
            {sending ? (
              <>
                <LoaderCircle size={17} className="spin" /> Generating
              </>
            ) : rateLimited ? (
              <>
                <Clock size={17} /> <span className="mono">{formatCountdown(retryIn)}</span>
              </>
            ) : (
              <>
                Send <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
