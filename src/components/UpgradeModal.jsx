import { useEffect, useState } from 'react';
import { Check, CircleCheck, CreditCard, LoaderCircle, Lock, X } from 'lucide-react';
import { api } from '../api/client.js';
import { plansAbove } from '../utils/plans.js';
import { formatCompact } from '../utils/format.js';

const PROCESSING_TIME_MS = 1800;

// Test card prefilled on purpose: the payment is only a simulation
const TEST_CARD = { number: '4242 4242 4242 4242', expiry: '12/30', cvc: '123' };

function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function validateCard(card) {
  const errors = {};
  if (!card.name.trim()) errors.name = 'Enter the cardholder name';
  if (card.number.replace(/\D/g, '').length !== 16) errors.number = 'The card number must have 16 digits';
  const [month, year] = card.expiry.split('/').map(Number);
  if (!month || month > 12 || !year || card.expiry.length !== 5) errors.expiry = 'Use the MM/YY format';
  if (!/^\d{3}$/.test(card.cvc)) errors.cvc = '3 digits';
  return errors;
}

/**
 * Mounted only while open, so every opening starts a fresh wizard. The plan options are
 * captured on mount: after a successful payment the current plan changes, but the
 * success screen must stay visible.
 */
export default function UpgradeModal({ reason, currentPlan, userId, onClose, onUpgraded }) {
  const [options] = useState(() => plansAbove(currentPlan));
  const [step, setStep] = useState('select');
  const [selected, setSelected] = useState(() => options[0] ?? null);
  const [card, setCard] = useState({ name: userId, ...TEST_CARD });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape' && step !== 'processing') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, onClose]);

  const handlePay = async (event) => {
    event.preventDefault();
    const validation = validateCard(card);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStep('processing');
    setApiError('');
    try {
      const [status] = await Promise.all([
        api.upgrade(userId, selected.id),
        new Promise((resolve) => setTimeout(resolve, PROCESSING_TIME_MS)),
      ]);
      setStep('success');
      onUpgraded(status);
    } catch (error) {
      setApiError(error.message);
      setStep('pay');
    }
  };

  const updateCard = (field, value) => setCard((current) => ({ ...current, [field]: value }));

  return (
    <div className="modal-backdrop" onMouseDown={() => step !== 'processing' && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {step !== 'processing' && (
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        )}

        {step === 'select' && (
          <>
            <div className="modal-header">
              <span className={`modal-icon ${reason === 'quota' ? 'modal-icon--danger' : ''}`}>
                <CreditCard size={22} />
              </span>
              <h2 id="upgrade-title">{reason === 'quota' ? 'You ran out of tokens' : 'Upgrade your plan'}</h2>
              <p className="muted">
                {reason === 'quota'
                  ? 'Your monthly quota is exhausted. Choose a plan to keep using the AI service right now.'
                  : 'Get more requests per minute and a bigger monthly token quota.'}
              </p>
            </div>

            <div className="plan-options">
              {options.map((plan) => {
                const Icon = plan.icon;
                return (
                  <button
                    type="button"
                    key={plan.id}
                    className={`plan-option plan-option--${plan.id.toLowerCase()} ${selected?.id === plan.id ? 'is-selected' : ''}`}
                    onClick={() => setSelected(plan)}
                  >
                    <span className="plan-option-icon">
                      <Icon size={20} />
                    </span>
                    <span className="plan-option-name">{plan.name}</span>
                    <span className="plan-option-price">
                      ${plan.price}
                      <small>/month</small>
                    </span>
                    <span className="plan-option-tagline">{plan.tagline}</span>
                    <ul>
                      <li>
                        <Check size={14} />
                        {plan.requestsPerMinute ? `${plan.requestsPerMinute} req/min` : 'Unlimited requests'}
                      </li>
                      <li>
                        <Check size={14} />
                        {plan.monthlyTokens ? `${formatCompact(plan.monthlyTokens)} tokens/month` : 'Unlimited tokens'}
                      </li>
                    </ul>
                  </button>
                );
              })}
            </div>

            <button type="button" className="btn btn-primary btn-block" disabled={!selected} onClick={() => setStep('pay')}>
              <span>Continue with {selected?.name}</span>
            </button>
          </>
        )}

        {(step === 'pay' || step === 'processing') && selected && (
          <form onSubmit={handlePay} noValidate>
            <div className="modal-header">
              <h2 id="upgrade-title">Payment details</h2>
              <p className="muted">
                {selected.name} plan · <strong>${selected.price}/month</strong>
              </p>
            </div>

            <div className="simulation-note">
              <Lock size={14} /> Simulated payment: no charge is made. Do not enter real card data.
            </div>

            <fieldset className="card-form" disabled={step === 'processing'}>
              <label className="field-label" htmlFor="card-name">
                Cardholder name
              </label>
              <input
                id="card-name"
                className={`input ${errors.name ? 'input--error' : ''}`}
                value={card.name}
                onChange={(event) => updateCard('name', event.target.value)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}

              <label className="field-label" htmlFor="card-number">
                Card number
              </label>
              <input
                id="card-number"
                className={`input mono ${errors.number ? 'input--error' : ''}`}
                inputMode="numeric"
                value={card.number}
                onChange={(event) => updateCard('number', formatCardNumber(event.target.value))}
              />
              {errors.number && <p className="field-error">{errors.number}</p>}

              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="card-expiry">
                    Expiry
                  </label>
                  <input
                    id="card-expiry"
                    className={`input mono ${errors.expiry ? 'input--error' : ''}`}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    value={card.expiry}
                    onChange={(event) => updateCard('expiry', formatExpiry(event.target.value))}
                  />
                  {errors.expiry && <p className="field-error">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="field-label" htmlFor="card-cvc">
                    CVC
                  </label>
                  <input
                    id="card-cvc"
                    className={`input mono ${errors.cvc ? 'input--error' : ''}`}
                    inputMode="numeric"
                    value={card.cvc}
                    onChange={(event) => updateCard('cvc', event.target.value.replace(/\D/g, '').slice(0, 3))}
                  />
                  {errors.cvc && <p className="field-error">{errors.cvc}</p>}
                </div>
              </div>
            </fieldset>

            {apiError && <p className="field-error field-error--box">{apiError}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep('select')}
                disabled={step === 'processing'}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={step === 'processing'}>
                {step === 'processing' ? (
                  <span key="processing" className="btn-content">
                    <LoaderCircle size={17} className="spin" />
                    <span>Processing payment…</span>
                  </span>
                ) : (
                  <span key="pay" className="btn-content">
                    <Lock size={16} />
                    <span>Pay ${selected.price}</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && selected && (
          <div className="modal-success">
            <span className="success-icon">
              <CircleCheck size={44} />
            </span>
            <h2 id="upgrade-title">Payment approved!</h2>
            <p className="muted">
              You are now on the <strong>{selected.name}</strong> plan. Your new limits are active.
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
              Back to the playground
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
