import React, { useState } from 'react';
import { XCircleIcon, LockIcon, CheckCircleIcon } from '../Icons';
import { api } from '../../services/api';

export const ClientChangePasswordModal = ({ isOpen, onClose, onSuccessNotification }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password cannot be the same as the current password.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.changeClientPassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      });

      setSuccess(response.message || 'Password changed successfully! You can now log in using your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      if (onSuccessNotification) {
        onSuccessNotification(response.message || 'Password changed successfully!');
      }

      // Automatically close modal after brief delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-teal-subtle)',
              color: 'var(--accent-teal)',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LockIcon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Change Password</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Update your FITCORE member account password
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <XCircleIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={18} />
                <span>{success}</span>
              </div>
            )}

            <div className="form-group">
              <label>Current Password *</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                disabled={submitting || success}
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                disabled={submitting || success}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <input
                type="password"
                className="form-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={6}
                disabled={submitting || success}
                autoComplete="new-password"
              />
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
              🔒 Upon changing your password, your old password will immediately become invalid and can no longer be used for login.
            </p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || success}
            >
              {submitting ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

