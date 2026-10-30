import { Check, Crown } from 'lucide-react';
import { PLANS, plansAbove } from '../utils/plans.js';
import { formatCompact } from '../utils/format.js';
import PlanBadge from './PlanBadge.jsx';

export default function PlanCard({ plan, onUpgrade }) {
  const config = PLANS[plan] ?? PLANS.FREE;
  const canUpgrade = plansAbove(config.id).length > 0;

  const features = [
    config.requestsPerMinute ? `${config.requestsPerMinute} requests per minute` : 'Unlimited requests',
    config.monthlyTokens ? `${formatCompact(config.monthlyTokens)} tokens per month` : 'Unlimited tokens',
    'Usage history and live quota',
  ];

  return (
    <div className={`card plan-card plan-card--${config.id.toLowerCase()}`}>
      <div className="plan-card-top">
        <div>
          <span className="plan-card-label">Current plan</span>
          <h3>{config.name}</h3>
        </div>
        <PlanBadge plan={config.id} size="lg" />
      </div>

      <ul className="plan-features">
        {features.map((feature) => (
          <li key={feature}>
            <Check size={15} /> {feature}
          </li>
        ))}
      </ul>

      {canUpgrade ? (
        <button type="button" className="btn btn-light btn-block" onClick={onUpgrade}>
          <Crown size={17} /> Upgrade plan
        </button>
      ) : (
        <p className="plan-top">You are on the top plan 🎉</p>
      )}
    </div>
  );
}
