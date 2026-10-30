import { Coins, Infinity as InfinityIcon } from 'lucide-react';
import { formatLongDate, formatNumber } from '../utils/format.js';

function levelOf(percent) {
  if (percent >= 90) return 'danger';
  if (percent >= 70) return 'warning';
  return 'ok';
}

export default function QuotaCard({ status, loading }) {
  if (loading && !status) {
    return <div className="card skeleton-card" />;
  }
  if (!status) return null;

  const unlimited = status.tokenLimit === null;
  const percent = unlimited ? 0 : Math.min(100, (status.tokensUsed / status.tokenLimit) * 100);
  const level = levelOf(percent);

  return (
    <div className="card stat-card">
      <div className="card-header">
        <span className="card-icon card-icon--indigo">
          <Coins size={18} />
        </span>
        <div>
          <h3>Monthly tokens</h3>
          <p className="muted small">Resets on {formatLongDate(status.resetDate)}</p>
        </div>
        {!unlimited && <span className={`percent-chip percent-chip--${level}`}>{percent.toFixed(1)}%</span>}
      </div>

      {unlimited ? (
        <div className="unlimited">
          <InfinityIcon size={22} />
          <div>
            <strong>Unlimited tokens</strong>
            <p className="muted small">{formatNumber(status.tokensUsed)} used this month</p>
          </div>
        </div>
      ) : (
        <>
          <div className="big-number">
            {formatNumber(status.tokensUsed)}
            <span className="big-number-total"> / {formatNumber(status.tokenLimit)}</span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Monthly tokens used"
          >
            <div className={`progress-fill progress-fill--${level}`} style={{ width: `${Math.max(percent, 1)}%` }} />
          </div>
          <div className="stat-row">
            <div>
              <span className="stat-label">Used</span>
              <span className="stat-value">{formatNumber(status.tokensUsed)}</span>
            </div>
            <div>
              <span className="stat-label">Remaining</span>
              <span className={`stat-value stat-value--${level}`}>{formatNumber(status.tokensRemaining)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
