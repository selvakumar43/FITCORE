import React, { useState } from 'react';
import { api } from '../../services/api';
import { FitcoreLogo, XCircleIcon, BuildingIcon, LockIcon } from '../Icons';

export default function RegisterGymModal({ isOpen, onClose, onRegisterSuccess, onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    gymName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.registerGym(formData);
      if (response.token) {
        localStorage.setItem('fitcore_auth_token', response.token);
        localStorage.setItem('gym360_auth_token', response.token);
      }
      const callback = onRegisterSuccess || onSuccess;
      if (callback) callback(response);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register gym. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FitcoreLogo size={28} />
            <div>
              <h3>Register Your Gym on FITCORE</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Set up an isolated gym facility workspace and administrator account
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <XCircleIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>Gym Facility Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Athletics Club"
                value={formData.gymName}
                onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Owner Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Owner Email Address (Login Username) *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. owner@apexclub.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                disabled={loading}
              />
              <span className="form-hint">
                This email will serve as your gym administrator login identifier.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              Upon registration, your gym facility will be provisioned with standard initial plans (Monthly, Quarterly, Yearly) which can be customized at any time.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Gym Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
