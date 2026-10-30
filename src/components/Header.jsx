import { LogOut, Sparkles } from 'lucide-react';
import PlanBadge from './PlanBadge.jsx';

export default function Header({ userId, plan, connected, onLogout }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-logo">
          <Sparkles size={20} />
        </span>
        <div>
          <span className="brand-name">ProxyAI Gateway</span>
          <span className="brand-subtitle">Rate limiting &amp; quota proxies</span>
        </div>
      </div>

      <div className="header-actions">
        <span className={`connection ${connected ? 'connection--on' : ''}`}>
          <span className="connection-dot" />
          {connected ? 'API online' : 'Connecting…'}
        </span>
        {plan && <PlanBadge plan={plan} />}
        <div className="user-chip">
          <span className="avatar">{userId.charAt(0).toUpperCase()}</span>
          <span className="user-name">{userId}</span>
        </div>
        <button type="button" className="btn btn-ghost btn-icon" onClick={onLogout} title="Sign out" aria-label="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
