import { useState } from 'react';
import { ArrowRight, Gauge, ShieldCheck, Sparkles, Coins } from 'lucide-react';
import { PLANS, PLAN_ORDER } from '../utils/plans.js';
import { formatCompact } from '../utils/format.js';

const USER_ID_PATTERN = /^[a-z0-9._-]{3,30}$/;

const FEATURES = [
  { icon: Gauge, title: 'Rate limiting proxy', text: 'Controls how many requests you can make per minute.' },
  { icon: Coins, title: 'Quota proxy', text: 'Tracks and discounts the tokens of your monthly plan.' },
  { icon: ShieldCheck, title: 'Real-time status', text: 'Live quota, countdowns and 7-day usage history.' },
];

export default function LoginScreen({ onLogin }) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const normalized = value.trim().toLowerCase();
  const isValid = USER_ID_PATTERN.test(normalized);

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (isValid) {
      onLogin(normalized);
    }
  };

  return (
    <div className="login">
      <section className="login-hero">
        <div className="brand brand--light">
          <span className="brand-logo">
            <Sparkles size={20} />
          </span>
          <span className="brand-name">ProxyAI Gateway</span>
        </div>

        <h1>
          Consume AI with <span className="text-gradient">smart limits</span>
        </h1>
        <p className="login-lead">
          Every prompt travels through a chain of proxies before reaching the AI service. They protect the platform and
          keep your plan under control.
        </p>

        <ul className="feature-list">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="feature-icon">
                <Icon size={18} />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="login-plans">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            return (
              <div key={id} className={`mini-plan mini-plan--${id.toLowerCase()}`}>
                <span className="mini-plan-name">{plan.name}</span>
                <span className="mini-plan-detail">
                  {plan.requestsPerMinute ? `${plan.requestsPerMinute} req/min` : 'Unlimited req'}
                </span>
                <span className="mini-plan-detail">
                  {plan.monthlyTokens ? `${formatCompact(plan.monthlyTokens)} tokens` : 'Unlimited tokens'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <h2>Sign in</h2>
          <p className="muted">Enter a username. New users start on the Free plan.</p>

          <label htmlFor="userId" className="field-label">
            Username
          </label>
          <input
            id="userId"
            className={`input ${touched && !isValid ? 'input--error' : ''}`}
            placeholder="e.g. walter"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={() => setTouched(true)}
            autoComplete="username"
            autoFocus
            maxLength={30}
          />
          {touched && !isValid && (
            <p className="field-error">Use 3 to 30 characters: letters, numbers, dots, dashes or underscores.</p>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            Continue <ArrowRight size={18} />
          </button>

          <p className="login-footnote">Proxy Pattern workshop · Spring Boot + React</p>
        </form>
      </section>
    </div>
  );
}
