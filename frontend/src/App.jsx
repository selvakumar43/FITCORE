import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import LandingPage from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminProfileModal } from './components/modals/AdminProfileModal';
import { ClientChangePasswordModal } from './components/modals/ClientChangePasswordModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fitcore_current_user') || localStorage.getItem('gym360_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login'
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [forceChangePassword, setForceChangePassword] = useState(false);
  const [showClientPasswordModal, setShowClientPasswordModal] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (currentUser.role === 'ADMIN') {
        const data = await api.getAdminDashboard();
        setDashboardData(data);
      } else {
        const data = await api.getClientDashboard();
        setDashboardData(data);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('fitcore_current_user', JSON.stringify(res.user));
    localStorage.setItem('fitcore_auth_token', res.token);
    localStorage.setItem('gym360_current_user', JSON.stringify(res.user));
    localStorage.setItem('gym360_auth_token', res.token);
    setCurrentUser(res.user);
    showNotification(`Welcome back, ${res.user.name}!`);

    if (res.user.role === 'ADMIN' && res.user.mustChangePassword) {
      setForceChangePassword(true);
      setShowProfileModal(true);
    }
  };

  const handleRegisterSuccess = (res) => {
    if (res.user && res.token) {
      localStorage.setItem('fitcore_current_user', JSON.stringify(res.user));
      localStorage.setItem('fitcore_auth_token', res.token);
      localStorage.setItem('gym360_current_user', JSON.stringify(res.user));
      localStorage.setItem('gym360_auth_token', res.token);
      setCurrentUser(res.user);
      showNotification(`Welcome to FITCORE! "${res.user.gymName || 'Your gym'}" has been successfully registered.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fitcore_current_user');
    localStorage.removeItem('fitcore_auth_token');
    localStorage.removeItem('gym360_current_user');
    localStorage.removeItem('gym360_auth_token');
    setCurrentUser(null);
    setDashboardData(null);
    setShowProfileModal(false);
    setForceChangePassword(false);
    setCurrentView('landing');
  };

  // Admin Profile Handlers
  const handleUpdateAdminProfile = async (profileData) => {
    const updated = await api.updateAdminProfile(profileData);
    const updatedUser = { ...currentUser, name: updated.name, phone: updated.phone };
    setCurrentUser(updatedUser);
    localStorage.setItem('fitcore_current_user', JSON.stringify(updatedUser));
    localStorage.setItem('gym360_current_user', JSON.stringify(updatedUser));
    showNotification('Admin profile updated successfully.');
  };

  const handleChangeAdminEmail = async (emailData) => {
    const res = await api.changeAdminEmail(emailData);
    localStorage.setItem('fitcore_auth_token', res.token);
    localStorage.setItem('fitcore_current_user', JSON.stringify(res.user));
    localStorage.setItem('gym360_auth_token', res.token);
    localStorage.setItem('gym360_current_user', JSON.stringify(res.user));
    setCurrentUser(res.user);
    showNotification('Admin email updated and session refreshed.');
  };

  const handleChangeAdminPassword = async (passwordData) => {
    await api.changeAdminPassword(passwordData);
    const updatedUser = { ...currentUser, mustChangePassword: false };
    setCurrentUser(updatedUser);
    localStorage.setItem('fitcore_current_user', JSON.stringify(updatedUser));
    localStorage.setItem('gym360_current_user', JSON.stringify(updatedUser));
    setForceChangePassword(false);
    showNotification('Password updated successfully. Account is now secured.');
  };

  // Client Management Handlers
  const handleAddClient = async (clientData) => {
    try {
      await api.addClient(clientData);
      showNotification('Client profile and login account created successfully.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleUpdateClient = async (id, clientData) => {
    try {
      await api.updateClient(id, clientData);
      showNotification('Member profile updated successfully.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleToggleClientStatus = async (id) => {
    try {
      const updated = await api.toggleClientStatus(id);
      showNotification(`Member marked as ${updated.status}.`);
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      await api.deleteClient(id);
      showNotification('Member deleted successfully.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  // Plan Management Handlers
  const handleAddPlan = async (planData) => {
    try {
      await api.addPlan(planData);
      showNotification(`Membership plan "${planData.name}" created.`);
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleUpdatePlan = async (id, planData) => {
    try {
      await api.updatePlan(id, planData);
      showNotification('Membership plan updated successfully.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await api.deletePlan(id);
      showNotification('Membership plan deleted successfully.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  // Membership Assignment, Renewal, Extension, Cancellation
  const handleAssignOrRenewMembership = async (data) => {
    try {
      await api.assignOrRenewMembership(data);
      showNotification(
        data.isRenewal ? 'Membership successfully renewed!' : 'Membership plan assigned successfully!'
      );
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleCancelMembership = async (id) => {
    try {
      await api.cancelMembership(id);
      showNotification('Membership successfully cancelled.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleExtendMembership = async (id, data) => {
    try {
      await api.extendMembership(id, data);
      showNotification('Membership expiry extended successfully.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  // Payment Handlers
  const handleUpdatePayment = async (membershipId, paymentData) => {
    try {
      await api.updatePayment(membershipId, paymentData);
      showNotification('Payment details and balance updated.');
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  const handleAddPaymentTransaction = async (membershipId, txData) => {
    try {
      await api.addPaymentTransaction(membershipId, txData);
      showNotification(
        txData.type === 'REFUND'
          ? `Refund of $${Number(txData.amount).toFixed(2)} processed.`
          : `Payment of $${Number(txData.amount).toFixed(2)} recorded successfully.`
      );
      loadData();
    } catch (err) {
      showNotification(err.message, 'danger');
    }
  };

  // Unauthenticated Visitors: Public Landing Page or Login View
  if (!currentUser) {
    if (currentView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onBackToLanding={() => setCurrentView('landing')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
    return (
      <LandingPage
        onOpenLogin={() => setCurrentView('login')}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  // Authenticated Dashboard: Gym Owner (ADMIN) or Member (CLIENT)
  return (
    <div className="app-container">
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenChangePassword={() => setShowClientPasswordModal(true)}
      />

      {notification && (
        <div style={{ maxWidth: '1200px', margin: '16px auto 0', padding: '0 24px', width: '100%' }}>
          <div className={`alert alert-${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {loading && !dashboardData ? (
        <div className="main-content" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading FITCORE records...</p>
        </div>
      ) : currentUser.role === 'ADMIN' ? (
        dashboardData && (
          <AdminDashboard
            dashboardData={dashboardData}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onToggleClientStatus={handleToggleClientStatus}
            onDeleteClient={handleDeleteClient}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
            onAssignOrRenewMembership={handleAssignOrRenewMembership}
            onCancelMembership={handleCancelMembership}
            onExtendMembership={handleExtendMembership}
            onUpdatePayment={handleUpdatePayment}
            onAddPaymentTransaction={handleAddPaymentTransaction}
          />
        )
      ) : (
        dashboardData && (
          <ClientDashboard
            data={dashboardData}
            onOpenChangePassword={() => setShowClientPasswordModal(true)}
          />
        )
      )}

      {currentUser.role === 'ADMIN' && (
        <AdminProfileModal
          isOpen={showProfileModal}
          onClose={() => {
            if (!forceChangePassword) setShowProfileModal(false);
          }}
          currentUser={currentUser}
          onUpdateProfile={handleUpdateAdminProfile}
          onChangeEmail={handleChangeAdminEmail}
          onChangePassword={handleChangeAdminPassword}
          forceChangePassword={forceChangePassword}
        />
      )}

      {currentUser.role === 'CLIENT' && (
        <ClientChangePasswordModal
          isOpen={showClientPasswordModal}
          onClose={() => setShowClientPasswordModal(false)}
          onSuccessNotification={(msg) => showNotification(msg, 'success')}
        />
      )}
    </div>
  );
}
