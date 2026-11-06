import React, { useState, useEffect } from 'react';
import { XCircleIcon } from '../Icons';

export const ClientModal = ({ isOpen, onClose, onSave, clientToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setEmail(clientToEdit.email || '');
      setPhone(clientToEdit.phone || '');
      setStatus(clientToEdit.status || 'ACTIVE');
      setPassword('');
      setConfirmPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setStatus('ACTIVE');
      setPassword('');
      setConfirmPassword('');
    }
    setError('');
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full Name and Email Address are required.');
      return;
    }

    if (!clientToEdit) {
      // Adding new client requires initial password
      if (!password) {
        setError('Initial Password is required for the client login account.');
        return;
      }
      if (password.length < 6) {
        setError('Initial Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Initial Password and Confirm Password do not match.');
        return;
      }
    } else {
      // Editing existing client - password is optional
      if (password) {
        if (password.length < 6) {
          setError('New Password must be at least 6 characters.');
          return;
        }
        if (password !== confirmPassword) {
          setError('New Password and Confirm Password do not match.');
          return;
        }
      }
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status
      };
      if (password) {
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }

      onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h3>{clientToEdit ? 'Edit Gym Member' : 'Add Client & Login Account'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {clientToEdit
                ? 'Update member profile details and optional password reset'
                : 'Create member profile and provision their login credentials'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <XCircleIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address (Login Username) *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                required
              />
              <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                This email will be used as the client's login username.
              </small>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </div>

            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              margin: '12px 0'
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                {clientToEdit ? 'Reset Client Password (Optional)' : 'Client Login Credentials'}
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.8rem' }}>
                  {clientToEdit ? 'New Password (leave blank to keep current)' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={clientToEdit ? 'Enter new password if resetting' : 'Min 6 characters'}
                  required={!clientToEdit}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem' }}>
                  {clientToEdit ? 'Confirm New Password' : 'Confirm Password *'}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required={!clientToEdit || password.length > 0}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                The client will use this email and initial password to log in. You can share these credentials offline via WhatsApp, SMS, or in person.
              </p>
            </div>

            {clientToEdit && (
              <div className="form-group">
                <label>Account Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive (Deactivated)</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {clientToEdit ? 'Update Client' : 'Create Client & Login Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
