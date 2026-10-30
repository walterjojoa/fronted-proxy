import { Bot, Coins, Gauge, User } from 'lucide-react';

const NODES = [
  { id: 'client', label: 'Client', icon: User },
  { id: 'rate', label: 'Rate Limit Proxy', icon: Gauge },
  { id: 'quota', label: 'Quota Proxy', icon: Coins },
  { id: 'ai', label: 'AI Service', icon: Bot },
];

// State of each node for every outcome of the last request
const NODE_STATES = {
  idle: {},
  pending: { client: 'ok', rate: 'active', quota: 'active', ai: 'active' },
  success: { client: 'ok', rate: 'ok', quota: 'ok', ai: 'ok' },
  'rate-limited': { client: 'ok', rate: 'blocked' },
  'quota-exceeded': { client: 'ok', rate: 'ok', quota: 'blocked' },
  error: { client: 'ok' },
};

const CAPTIONS = {
  idle: 'Every prompt goes through the proxy chain',
  pending: 'Request travelling through the chain…',
  success: 'Passed both proxies · answered by the AI service',
  'rate-limited': 'Stopped by RateLimitProxy · 429 Too Many Requests',
  'quota-exceeded': 'Stopped by QuotaProxy · 402 Payment Required',
  error: 'The request could not be completed',
};

export default function ProxyChain({ state }) {
  const nodeStates = NODE_STATES[state] ?? {};

  return (
    <div className={`proxy-chain proxy-chain--${state}`}>
      <ol className="proxy-chain-nodes">
        {NODES.map(({ id, label, icon: Icon }, index) => (
          <li key={id} className={`chain-node chain-node--${nodeStates[id] ?? 'idle'}`} style={{ '--i': index }}>
            <span className="chain-node-icon">
              <Icon size={15} />
            </span>
            <span className="chain-node-label">{label}</span>
          </li>
        ))}
      </ol>
      <p className="proxy-chain-caption">{CAPTIONS[state]}</p>
    </div>
  );
}
