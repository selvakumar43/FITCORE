import React, { useState, useEffect } from 'react';
import { XCircleIcon, ShieldIcon, LockIcon, MailIcon, UserIcon } from '../Icons';

export const AdminProfileModal = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onChangeEmail,
  onChangePassword,
  forceChangePassword = false
}) => {
  const [activeTab, setActiveTab] = useState(forceChangePassword ? 'password' : 'info');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Email form
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setNewEmail('');
      setEmailPassword('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      if (forceChangePassword) {
        setActiveTab('password');
      }
    }
  }, [currentUser, isOpen, forceChangePassword]);

  if (!isOpen) return null;

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await onUpdateProfile({ name: name.trim(), phone: phone.trim() });
      setSuccess('Profile details updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEmail.trim()) {
      setError('New email address is required');
      return;
    }
    if (!emailPassword) {
      setError('Current password is required to verify email change');
      return;
    }
    setSubmitting(true);
    try {
      await onChangeEmail({ newEmail: newEmail.trim(), password: emailPassword });
      setSuccess('Email address changed successfully. Session refreshed.');
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await onChangePassword({ currentPassword, newPassword });
      setSuccess('Password updated successfully. Account is now secured.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--primary-navy)', color: '#fff', padding: '6px', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
              <ShieldIcon size={20} />
            </div>
            <div>
              <h3>Administrator Account Management</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Secure settings and credentials for FITCORE Admin
              </p>
            </div>
          </div>
          {!forceChangePassword && (
            <button className="close-btn" onClick={onClose} title="Close">
              <XCircleIcon size={20} />
            </button>
          )}
        </div>

        {forceChangePassword && (
          <div className="alert alert-warning" style={{ margin: '16px 24px 0 24px', fontSize: '0.9rem' }}>
            <strong>Action Required:</strong> You are currently using the temporary initial administrator password.
            Please set a new secure password to secure your gym account before continuing.
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 24px 0 24px', borderBottom: '1px solid #e2e8f0' }}>
          {!forceChangePassword && (
            <>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'info' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('info'); setError(''); setSuccess(''); }}
              >
                Profile Details
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'email' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setActiveTab('email'); setError(''); setSuccess(''); }}
              >
                Change Email
              </button>
            </>
          )}
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'password' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
          >
            Change Password
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

          {/* TAB 1: Profile Info */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateInfo}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Account Role:</span>
                  <span className="badge badge-success">ADMINISTRATOR</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Registered Email:</span>
                  <strong>{currentUser?.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Account Status:</span>
                  <span style={{ color: '#16a34a', fontWeight: 'bold' }}>ACTIVE</span>
                </div>
              </div>

              <div className="form-group">
                <label>Administrator Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Carter"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Change Email */}
          {activeTab === 'email' && (
            <form onSubmit={handleChangeEmail}>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
                Changing your administrator email will update your login credentials. You will need to use this new address on your next login.
              </p>

              <div className="form-group">
                <label>Current Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={currentUser?.email || ''}
                  disabled
                  style={{ background: '#f1f5f9', color: '#64748b' }}
                />
              </div>

              <div className="form-group">
                <label>New Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="owner@yourgym.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm With Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter current password to verify"
                  required
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Verifying & Updating...' : 'Update Email Address'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
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
                {!forceChangePassword && (
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

