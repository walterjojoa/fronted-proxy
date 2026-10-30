import { PLANS } from '../utils/plans.js';

export default function PlanBadge({ plan, size = 'md' }) {
  const config = PLANS[plan] ?? PLANS.FREE;
  const Icon = config.icon;

  return (
    <span className={`plan-badge plan-badge--${config.id.toLowerCase()} plan-badge--${size}`}>
      <Icon size={size === 'lg' ? 16 : 13} />
      {config.id}
    </span>
  );
}
