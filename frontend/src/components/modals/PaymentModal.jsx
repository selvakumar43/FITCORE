import React, { useState, useEffect } from 'react';
import { XCircleIcon, DollarIcon, PlusIcon, RefreshIcon } from '../Icons';

export const PaymentModal = ({ isOpen, onClose, onSave, onAddTransaction, membership }) => {
  const [mode, setMode] = useState('transaction'); // 'transaction' | 'direct'
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState('');

  // Transaction form state
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('PAYMENT'); // 'PAYMENT' | 'REFUND'
  const [txReference, setTxReference] = useState('');
  const [txNotes, setTxNotes] = useState('');

  useEffect(() => {
    if (membership) {
      setAmountPaid(membership.amountPaid !== undefined ? String(membership.amountPaid) : '0');
      setTxAmount('');
      setTxType('PAYMENT');
      setTxReference('');
      setTxNotes('');
    }
    setError('');
  }, [membership, isOpen]);

  if (!isOpen || !membership) return null;

  const membershipPrice = parseFloat(membership.price) || 0;
  const currentPaid = parseFloat(membership.amountPaid) || 0;
  const remainingBalance = Math.max(0, membershipPrice - currentPaid);
  const customerCredit = Math.max(0, currentPaid - membershipPrice);

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(amountPaid);
    if (isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid amount paid (greater than or equal to 0)');
      return;
    }

    try {
      onSave(membership.id, {
        amountPaid: parsed,
        paymentStatus: parsed <= 0 ? 'UNPAID' : parsed < membershipPrice ? 'PARTIALLY_PAID' : parsed === membershipPrice ? 'PAID' : 'OVERPAID'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update payment');
    }
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(txAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Transaction amount must be strictly greater than 0');
      return;
    }

    if (txType === 'REFUND' && parsed > currentPaid) {
      setError(`Cannot refund $${parsed.toFixed(2)}: exceeds total amount paid ($${currentPaid.toFixed(2)})`);
      return;
    }

    try {
      onAddTransaction(membership.id, {
        amount: parsed,
        type: txType,
        transactionReference: txReference.trim() || undefined,
        notes: txNotes.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Transaction failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div>
            <h3>Payment & Transaction Management</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Record installment receipts or adjust client ledger balance
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <XCircleIcon size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Membership Financial Overview Box */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Client:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{membership.clientName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Plan:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{membership.planName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Agreed Membership Fee:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.1rem' }}>
                ${membershipPrice.toFixed(2)}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Amount Paid
                </span>
                <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem', marginTop: '2px' }}>
                  ${currentPaid.toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Remaining Balance
                </span>
                <div style={{ fontWeight: 700, color: remainingBalance > 0 ? 'var(--warning)' : 'var(--text-secondary)', fontSize: '1rem', marginTop: '2px' }}>
                  ${remainingBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Customer Credit
                </span>
                <div style={{ fontWeight: 700, color: customerCredit > 0 ? 'var(--info)' : 'var(--text-secondary)', fontSize: '1rem', marginTop: '2px' }}>
                  ${customerCredit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'transaction' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => { setMode('transaction'); setError(''); }}
            >
              + Record Payment / Refund
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'direct' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => { setMode('direct'); setError(''); }}
            >
              Set Total Amount Directly
            </button>
          </div>

          {mode === 'transaction' ? (
            <form onSubmit={handleTransactionSubmit}>
              <div className="form-group">
                <label>Transaction Type *</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    <input
                      type="radio"
                      name="txType"
                      value="PAYMENT"
                      checked={txType === 'PAYMENT'}
                      onChange={() => setTxType('PAYMENT')}
                    />
                    <span>Payment Received (+)</span>
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    <input
                      type="radio"
                      name="txType"
                      value="REFUND"
                      checked={txType === 'REFUND'}
                      onChange={() => setTxType('REFUND')}
                    />
                    <span>Refund Issued (-)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>{txType === 'PAYMENT' ? 'Payment Amount ($) *' : 'Refund Amount ($) *'}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="e.g. 50.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Transaction Reference ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={txReference}
                  onChange={(e) => setTxReference(e.target.value)}
                  placeholder="e.g. REC-10491"
                />
              </div>

              <div className="form-group">
                <label>Notes / Receipt details</label>
                <input
                  type="text"
                  className="form-input"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="e.g. Cash received at desk"
                />
              </div>

              <div className="modal-footer" style={{ padding: '12px 0 0', marginTop: '16px', background: 'transparent' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {txType === 'PAYMENT' ? 'Submit Payment' : 'Process Refund'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDirectSubmit}>
              <div className="form-group">
                <label>Total Amount Paid ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                />
                <p className="form-hint">
                  Status will be computed automatically: UNPAID, PARTIALLY_PAID, PAID, or OVERPAID.
                </p>
              </div>

              <div className="modal-footer" style={{ padding: '12px 0 0', marginTop: '16px', background: 'transparent' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Total Amount
                </button>
              </div>
            </form>
          )}

          {/* Transaction History Section */}
          {membership.transactions && membership.transactions.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Transaction History ({membership.transactions.length})
              </h4>
              <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Ref</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membership.transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.transactionDate ? t.transactionDate.substring(0, 10) : '-'}</td>
                        <td>
                          <span className={`badge ${t.type === 'REFUND' ? 'badge-danger' : 'badge-success'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: t.type === 'REFUND' ? 'var(--error)' : 'var(--success)' }}>
                          {t.type === 'REFUND' ? '-' : '+'}${Number(t.amount).toFixed(2)}
                        </td>
                        <td>{t.transactionReference || '-'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
