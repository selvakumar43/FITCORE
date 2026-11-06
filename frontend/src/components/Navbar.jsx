import React from 'react';
import {
  FitcoreLogo,
  LogOutIcon,
  ShieldIcon,
  UserIcon,
  LockIcon,
  BuildingIcon
} from './Icons';

export const Navbar = ({ user, onLogout, onOpenProfile, onOpenChangePassword, onGoHome }) => {
  return (
    <header className="navbar">
      <div
        className="navbar-brand"
        onClick={onGoHome}
        style={{ cursor: onGoHome ? 'pointer' : 'default' }}
      >
        <FitcoreLogo size={28} />
        <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.3px', color: '#FFFFFF' }}>
          FITCORE
        </span>
        <span className="brand-badge">
          SAAS
        </span>

        {user?.gymName && (
          <div className="gym-context-pill">
            <BuildingIcon size={13} style={{ color: '#5EEAD4' }} />
            <span>{user.gymName}</span>
          </div>
        )}
      </div>

      <div className="navbar-user">
        <div
          className="user-badge"
          style={{ cursor: 'pointer' }}
          onClick={user.role === 'ADMIN' ? onOpenProfile : onOpenChangePassword}
          title={user.role === 'ADMIN' ? 'Click to manage Admin Account' : 'Click to change password'}
        >
          <UserIcon size={15} />
          <span style={{ fontWeight: 500 }}>{user.name}</span>
          <span className={`role-tag ${user.role.toLowerCase()}`}>
            {user.role === 'ADMIN' ? 'Gym Owner' : 'Member'}
          </span>
        </div>

        {user.role === 'ADMIN' && onOpenProfile && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenProfile}
            title="Manage Admin Profile, Email & Password"
            style={{ color: 'var(--primary-navy)', background: '#FFFFFF' }}
          >
            <ShieldIcon size={14} />
            <span>Account</span>
          </button>
        )}

        {user.role === 'CLIENT' && onOpenChangePassword && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenChangePassword}
            title="Change Account Password"
            style={{ color: 'var(--primary-navy)', background: '#FFFFFF' }}
          >
            <LockIcon size={14} />
            <span>Password</span>
          </button>
        )}

        <button
          className="btn btn-outline btn-sm"
          onClick={onLogout}
          title="Logout"
          style={{ color: '#E2E8F0', borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <LogOutIcon size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
