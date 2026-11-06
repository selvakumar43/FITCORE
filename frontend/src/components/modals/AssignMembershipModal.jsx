import React, { useState, useEffect } from 'react';
import { XCircleIcon, CalendarIcon } from '../Icons';
import { calculateExpiryDate } from '../../services/api';

export const AssignMembershipModal = ({
  isOpen,
  onClose,
  onAssign,
  clients = [],
  plans = [],
  initialClientId = null,
  isRenewal = false,
  existingMemberships = []
}) => {
  const [userId, setUserId] = useState('');
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  // Default start date to today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      const selectedUserId = initialClientId ? String(initialClientId) : (clients[0]?.id ? String(clients[0].id) : '');
      setUserId(selectedUserId);

      // Check if chosen client has an active membership
      const activeMem = existingMemberships.find(
        (m) => String(m.userId) === String(selectedUserId) && (m.effectiveStatus === 'ACTIVE' || m.effectiveStatus === 'UPCOMING')
      );

      let initialStart = todayStr;
      if (activeMem && isRenewal) {
        // Automatically start renewal day after current expiry so remaining days are preserved!
        const expParts = activeMem.expiryDate.split('-');
        if (expParts.length === 3) {
          const expDate = new Date(parseInt(expParts[0], 10), parseInt(expParts[1], 10) - 1, parseInt(expParts[2], 10) + 1);
          const y = expDate.getFullYear();
          const m = String(expDate.getMonth() + 1).padStart(2, '0');
          const d = String(expDate.getDate()).padStart(2, '0');
          initialStart = `${y}-${m}-${d}`;
        }
      }
      setStartDate(initialStart);

      const defaultPlan = plans[0] || null;
      if (defaultPlan) {
        setPlanId(String(defaultPlan.id));
        setPrice(defaultPlan.price);
        const computedExpiry = calculateExpiryDate(initialStart, defaultPlan.durationMonths);
        setExpiryDate(computedExpiry);
      } else {
        setPlanId('');
        setPrice('');
        setExpiryDate('');
      }

      setError('');
    }
  }, [isOpen, initialClientId, clients, plans]);

  // Recalculate expiry whenever plan or start date changes
  const handlePlanChange = (selectedPlanId) => {
    setPlanId(selectedPlanId);
    const plan = plans.find((p) => String(p.id) === String(selectedPlanId));
    if (plan) {
      setPrice(plan.price);
      if (startDate) {
        setExpiryDate(calculateExpiryDate(startDate, plan.durationMonths));
      }
    }
  };

  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    const plan = plans.find((p) => String(p.id) === String(planId));
    if (plan && newStartDate) {
      setExpiryDate(calculateExpiryDate(newStartDate, plan.durationMonths));
    }
  };

  if (!isOpen) return null;

  // Check if chosen client already has an active membership
  const clientHasActive = existingMemberships.some(
    (m) => String(m.userId) === String(userId) && m.status === 'ACTIVE'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Please select a client');
      return;
    }
    if (!planId) {
      setError('Please select a membership plan');
      return;
    }
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    if (price === '' || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setError('Please enter a valid agreed price');
      return;
    }

    try {
      onAssign({
        userId: Number(userId),
        planId: Number(planId),
        startDate,
        price: parseFloat(price),
        isRenewal: isRenewal || clientHasActive
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isRenewal ? 'Renew Client Membership' : 'Assign Membership Plan'}</h3>
          <button className="close-btn" onClick={onClose}>
            <XCircleIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {clientHasActive && !isRenewal && (
              <div className="alert alert-warning" style={{ fontSize: '0.8125rem' }}>
                Note: This client already has an active membership. Assigning a new plan will renew their membership and preserve the previous record.
              </div>
            )}

            <div className="form-group">
              <label>Select Client *</label>
              <select
                className="form-select"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={Boolean(initialClientId)}
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email}) - Status: {c.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Membership Plan *</label>
              <select
                className="form-select"
                value={planId}
                onChange={(e) => handlePlanChange(e.target.value)}
                required
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationMonths} month{p.durationMonths > 1 ? 's' : ''}) - Standard: ${p.price}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Automatic Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={expiryDate}
                  disabled
                  title="Calculated automatically based on plan duration"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Agreed Membership Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Agreed price"
                required
              />
              <p className="form-hint">Stored directly with this membership record.</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isRenewal ? 'Confirm Renewal' : 'Assign Membership'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

