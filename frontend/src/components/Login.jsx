import React, { useState } from 'react';
import {
  FitcoreLogo,
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  BuildingIcon
} from './Icons';
import { ForgotPasswordModal } from './modals/ForgotPasswordModal';
import RegisterGymModal from './modals/RegisterGymModal';

export const Login = ({ onLogin, onBackToLanding, onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="nav-link-btn"
            style={{
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px'
            }}
          >
            ← Back to FITCORE Home
          </button>
        )}

        <div className="login-brand">
          <FitcoreLogo size={42} style={{ margin: '0 auto' }} />
          <h1>FITCORE</h1>
          <p>Sign in to your Gym Management Account</p>
        </div>

        {info && (
          <div className="alert alert-success">
            <span>{info}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                disabled={loading}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <MailIcon size={16} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-teal)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <LockIcon size={16} />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '10px', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            New gym owner? Register your facility
          </p>
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.8125rem' }}
          >
            <BuildingIcon size={15} />
            <span>Register Your Gym</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={(msg) => setInfo(msg)}
      />

      {/* Register Gym Modal */}
      <RegisterGymModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={(authData) => {
          setShowRegisterModal(false);
          if (onRegisterSuccess) onRegisterSuccess(authData);
        }}
      />
    </div>
  );
};
