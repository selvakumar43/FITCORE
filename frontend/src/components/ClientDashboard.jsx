import React from 'react';
import {
  UserIcon,
  CalendarIcon,
  DollarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldIcon,
  LockIcon,
  BuildingIcon,
  CreditCardIcon
} from './Icons';

export const ClientDashboard = ({ data, onOpenChangePassword }) => {
  const { client, currentMembership, membershipHistory = [] } = data;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">Active Membership</span>;
      case 'UPCOMING':
        return <span className="badge badge-info">Upcoming Membership</span>;
      case 'EXPIRED':
        return <span className="badge badge-danger">Expired</span>;
      case 'CANCELLED':
        return <span className="badge badge-secondary">Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-success">Paid</span>;
      case 'PARTIALLY_PAID':
        return <span className="badge badge-warning">Partially Paid</span>;
      case 'OVERPAID':
        return <span className="badge badge-info">Overpaid / Credit</span>;
      case 'UNPAID':
      case 'NOT_PAID':
        return <span className="badge badge-danger">Unpaid</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="main-content">
      {/* Client Welcome & Profile Summary */}
      <div className="client-hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-teal)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              <BuildingIcon size={14} />
              <span>{client.gymName ? `${client.gymName} • Member Portal` : 'FITCORE Member Portal'}</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Welcome back, {client.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
              Inspect your current membership pass, validity period, and payment balance.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Status:</span>
              <span className={`badge ${client.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                {client.status}
              </span>
            </div>

            {onOpenChangePassword && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onOpenChangePassword}
                title="Change your account password"
              >
                <LockIcon size={14} />
                <span>Change Password</span>
              </button>
            )}
          </div>
        </div>

        {/* Member Profile Details */}
        <div className="client-details-grid">
          <div className="detail-item">
            <label>Full Name</label>
            <div className="value">{client.name}</div>
          </div>
          <div className="detail-item">
            <label>Email Address</label>
            <div className="value">{client.email}</div>
          </div>
          <div className="detail-item">
            <label>Phone Number</label>
            <div className="value">{client.phone || 'Not provided'}</div>
          </div>
          <div className="detail-item">
            <label>Member ID</label>
            <div className="value">#{client.id}</div>
          </div>
        </div>
      </div>

      {/* Current Membership Plan Card */}
      {currentMembership ? (
        <div className="panel" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <div className="panel-header">
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 700, textTransform: 'uppercase' }}>
                Current Membership Plan
              </span>
              <h2 className="panel-title" style={{ fontSize: '1.35rem', marginTop: '2px' }}>
                {currentMembership.planName}
              </h2>
            </div>
            {getStatusBadge(currentMembership.effectiveStatus)}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '18px' }}>
            {currentMembership.planDescription || 'Full gym facility access during regular open hours.'}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            background: 'var(--bg-card-subtle)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="detail-item">
              <label>Start Date</label>
              <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={15} style={{ color: 'var(--accent-teal)' }} />
                <span>{currentMembership.startDate}</span>
              </div>
            </div>

            <div className="detail-item">
              <label>Expiry Date</label>
              <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={15} style={{ color: 'var(--error)' }} />
                <span>{currentMembership.expiryDate}</span>
              </div>
            </div>

            <div className="detail-item">
              <label>Plan Duration</label>
              <div className="value">{currentMembership.planDurationMonths} Month(s)</div>
            </div>

            <div className="detail-item">
              <label>Membership Status</label>
              <div className="value">{currentMembership.effectiveStatus}</div>
            </div>
          </div>

          {/* Payment & Balance Details */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '12px' }}>
              Membership Payment & Balance Details
            </h3>

            <div className="payment-highlight-box">
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Agreed Fee
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '2px' }}>
                  ${Number(currentMembership.price).toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Amount Paid
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                  ${Number(currentMembership.amountPaid).toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {currentMembership.customerCredit > 0 ? 'Customer Credit' : 'Remaining Balance'}
                </span>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: currentMembership.customerCredit > 0 ? 'var(--info)' : currentMembership.remainingBalance > 0 ? 'var(--warning)' : 'var(--success)',
                    marginTop: '2px'
                  }}
                >
                  {currentMembership.customerCredit > 0
                    ? `+$${Number(currentMembership.customerCredit).toFixed(2)}`
                    : `$${Number(currentMembership.remainingBalance).toFixed(2)}`}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Payment Status
                </span>
                <div style={{ marginTop: '6px' }}>
                  {getPaymentBadge(currentMembership.paymentStatus)}
                </div>
              </div>
            </div>

            <p className="form-hint" style={{ marginTop: '8px' }}>
              Payments and renewal adjustments are recorded by your gym desk. Member portal provides read-only verification.
            </p>
          </div>

          {/* Payment Receipts & Transaction Ledger */}
          {currentMembership.transactions && currentMembership.transactions.length > 0 && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Payment Receipts ({currentMembership.transactions.length})
              </h4>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Reference</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMembership.transactions.map((t) => (
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
      ) : (
        <div className="panel empty-state">
          <h3>No Active Membership Assigned</h3>
          <p>You currently do not have an active membership plan assigned. Please contact your gym desk staff.</p>
        </div>
      )}

      {/* Historical Membership Records */}
      {membershipHistory.length > 1 && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Membership History</h3>
              <p className="panel-description">Historical records preserved from past renewals</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Valid Dates</th>
                  <th>Agreed Price</th>
                  <th>Amount Paid</th>
                  <th>Payment Status</th>
                  <th>Membership Status</th>
                </tr>
              </thead>
              <tbody>
                {membershipHistory.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.planName}</td>
                    <td>{m.startDate} to {m.expiryDate}</td>
                    <td>${Number(m.price).toFixed(2)}</td>
                    <td>${Number(m.amountPaid).toFixed(2)}</td>
                    <td>{getPaymentBadge(m.paymentStatus)}</td>
                    <td>{getStatusBadge(m.effectiveStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
