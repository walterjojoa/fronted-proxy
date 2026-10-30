import { Calculator } from 'lucide-react';
import { AVERAGE_COMPLETION_TOKENS, estimateTokens } from '../utils/tokens.js';
import { formatNumber } from '../utils/format.js';

export default function TokenEstimator({ prompt, tokensRemaining, maxLength }) {
  const promptTokens = estimateTokens(prompt);
  const total = promptTokens > 0 ? promptTokens + AVERAGE_COMPLETION_TOKENS : 0;
  const exceedsQuota = tokensRemaining !== null && total > tokensRemaining;

  return (
    <div className={`estimator ${exceedsQuota ? 'estimator--danger' : ''}`}>
      <Calculator size={15} />
      {total === 0 ? (
        <span>Type a prompt to estimate its cost</span>
      ) : (
        <span>
          ≈ <strong>{formatNumber(total)} tokens</strong>
          <span className="estimator-detail">
            {' '}
            ({formatNumber(promptTokens)} prompt + ~{AVERAGE_COMPLETION_TOKENS} answer)
          </span>
          {exceedsQuota && <span className="estimator-warning"> · exceeds your remaining quota</span>}
        </span>
      )}
      <span className="estimator-count">
        {prompt.length}/{maxLength}
      </span>
    </div>
  );
}
