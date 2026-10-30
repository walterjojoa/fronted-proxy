import { Gauge, Infinity as InfinityIcon } from 'lucide-react';
import { formatCountdown } from '../utils/format.js';

const RING_RADIUS = 26;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const MAX_SEGMENTS = 20;

function CountdownRing({ seconds }) {
  const progress = Math.min(1, seconds / 60);
  return (
    <div className="ring">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="ring-track" cx="32" cy="32" r={RING_RADIUS} />
        <circle
          className="ring-progress"
          cx="32"
          cy="32"
          r={RING_RADIUS}
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - progress)}
        />
      </svg>
      <span className="ring-label mono">{formatCountdown(seconds)}</span>
    </div>
  );
}

export default function RateLimitCard({ status, loading, secondsToReset, rateLimited }) {
  if (loading && !status) {
    return <div className="card skeleton-card" />;
  }
  if (!status) return null;

  const limit = status.requestsPerMinuteLimit;
  const used = status.requestsThisMinute;
  const unlimited = limit === null;
  const percent = unlimited ? 0 : Math.min(100, (used / limit) * 100);

  return (
    <div className={`card stat-card ${rateLimited ? 'stat-card--alert' : ''}`}>
      <div className="card-header">
        <span className="card-icon card-icon--pink">
          <Gauge size={18} />
        </span>
        <div>
          <h3>Requests per minute</h3>
          <p className="muted small">{rateLimited ? 'Limit reached, sending is paused' : 'Window resets every minute'}</p>
        </div>
      </div>

      <div className="rate-body">
        <div className="rate-info">
          {unlimited ? (
            <div className="unlimited unlimited--compact">
              <InfinityIcon size={20} />
              <strong>{used} requests</strong>
            </div>
          ) : (
            <div className="big-number">
              {used}
              <span className="big-number-total"> / {limit}</span>
            </div>
          )}

          {!unlimited && limit <= MAX_SEGMENTS ? (
            <div className="segments" aria-label={`${used} of ${limit} requests used`}>
              {Array.from({ length: limit }, (_, index) => (
                <span key={index} className={`segment ${index < used ? 'segment--used' : ''} ${rateLimited ? 'segment--alert' : ''}`} />
              ))}
            </div>
          ) : (
            !unlimited && (
              <div className="progress progress--thin">
                <div
                  className={`progress-fill ${rateLimited ? 'progress-fill--danger' : 'progress-fill--pink'}`}
                  style={{ width: `${Math.max(percent, 1)}%` }}
                />
              </div>
            )
          )}
        </div>

        <div className="rate-countdown">
          <CountdownRing seconds={secondsToReset} />
          <span className="muted small">until reset</span>
        </div>
      </div>
    </div>
  );
}
