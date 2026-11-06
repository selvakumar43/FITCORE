import React, { useState } from 'react';
import { XCircleIcon } from '../Icons';

export const ExtendMembershipModal = ({ isOpen, onClose, onExtend, membership }) => {
  const [extraDays, setExtraDays] = useState(15);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !membership) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!extraDays || parseInt(extraDays, 10) <= 0) {
      setError('Please enter a valid number of days to extend (e.g. 15, 30)');
      return;
    }

    try {
      onExtend(membership.id, {
        extraDays: parseInt(extraDays, 10),
        reason: reason.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Extension failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Extend Membership</h3>
          <button className="close-btn" onClick={onClose}>
            <XCircleIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div style={{ background: 'var(--bg-card-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Client:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{membership.clientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Current Expiry Date:</span>
                <span style={{ fontWeight: 700, color: 'var(--error)' }}>{membership.expiryDate}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Extend By (Days) *</label>
              <select
                className="form-select"
                value={extraDays}
                onChange={(e) => setExtraDays(parseInt(e.target.value, 10))}
              >
                <option value={7}>+7 Days (1 Week)</option>
                <option value={15}>+15 Days (Half Month)</option>
                <option value={30}>+30 Days (1 Month)</option>
                <option value={60}>+60 Days (2 Months)</option>
                <option value={90}>+90 Days (3 Months)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reason / Note (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Gym renovation holiday extension, medical freeze"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Extension
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

