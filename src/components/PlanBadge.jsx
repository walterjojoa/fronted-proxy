import { PLANS } from '../utils/plans.js';

export default function PlanBadge({ plan, size = 'md' }) {
  const config = PLANS[plan] ?? PLANS.FREE;
  const Icon = config.icon;

  return (
    // key: the badge is replaced as a whole when the plan changes
    <span key={config.id} className={`plan-badge plan-badge--${config.id.toLowerCase()} plan-badge--${size}`}>
      <Icon size={size === 'lg' ? 16 : 13} />
      <span>{config.id}</span>
    </span>
  );
}
