import React, { useState } from 'react';
import { XCircleIcon, LockIcon, MailIcon } from '../Icons';
import { api } from '../../services/api';

export const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message);
      if (res.resetToken) {
        setToken(res.resetToken);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request recovery token');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPassword({ token: token.trim(), newPassword: newPassword.trim() });
      if (onSuccess) onSuccess(res.message || 'Password reset successful. Please log in.');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--primary-navy)', color: '#fff', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
              <LockIcon size={18} />
            </div>
            <div>
              <h3>Account Password Recovery</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Secure password reset for FITCORE
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose} title="Close">
            <XCircleIcon size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{error}</div>}
          {message && <div className="alert alert-info" style={{ marginBottom: '16px' }}>{message}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestToken}>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
                Enter your registered administrator or client email address to generate a 15-minute recovery token.
              </p>
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gym360.com"
                    required
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                    <MailIcon size={16} />
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Generating Token...' : 'Generate Recovery Token'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Recovery Token (15-min validity)</label>
                <input
                  type="text"
                  className="form-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste or enter reset token"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password (min 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating Password...' : 'Reset & Save Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
