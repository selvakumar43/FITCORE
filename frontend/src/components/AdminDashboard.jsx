import React, { useState } from 'react';
import {
  UsersIcon,
  ShieldIcon,
  CalendarIcon,
  DollarIcon,
  PlusIcon,
  EditIcon,
  RefreshIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  SearchIcon,
  FilterIcon,
  TrendingUpIcon
} from './Icons';
import { ClientModal } from './modals/ClientModal';
import { PlanModal } from './modals/PlanModal';
import { AssignMembershipModal } from './modals/AssignMembershipModal';
import { PaymentModal } from './modals/PaymentModal';
import { ExtendMembershipModal } from './modals/ExtendMembershipModal';

export const AdminDashboard = ({
  dashboardData,
  onAddClient,
  onUpdateClient,
  onToggleClientStatus,
  onDeleteClient,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onAssignOrRenewMembership,
  onCancelMembership,
  onExtendMembership,
  onUpdatePayment,
  onAddPaymentTransaction
}) => {
  const [activeTab, setActiveTab] = useState('memberships'); // 'memberships' | 'clients' | 'plans'

  // Modals state
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignClientId, setAssignClientId] = useState(null);
  const [isRenewalMode, setIsRenewalMode] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [membershipForPayment, setMembershipForPayment] = useState(null);

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [membershipForExtend, setMembershipForExtend] = useState(null);

  // Search/Filter states
  const [clientSearch, setClientSearch] = useState('');
  const [membershipSearch, setMembershipSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { stats = {}, clients = [], plans = [], detailedMemberships = [], planStats = [] } = dashboardData;

  // Filter clients
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(clientSearch))
  );

  // Filter memberships
  const filteredMemberships = detailedMemberships.filter((m) => {
    const matchesSearch =
      m.clientName.toLowerCase().includes(membershipSearch.toLowerCase()) ||
      m.planName.toLowerCase().includes(membershipSearch.toLowerCase()) ||
      m.paymentStatus.toLowerCase().includes(membershipSearch.toLowerCase()) ||
      m.effectiveStatus.toLowerCase().includes(membershipSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || m.effectiveStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers for opening modals
  const handleOpenAddClient = () => {
    setClientToEdit(null);
    setClientModalOpen(true);
  };

  const handleOpenEditClient = (client) => {
    setClientToEdit(client);
    setClientModalOpen(true);
  };

  const handleOpenAddPlan = () => {
    setPlanToEdit(null);
    setPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setPlanToEdit(plan);
    setPlanModalOpen(true);
  };

  const handleOpenAssign = (clientId = null, isRenewal = false) => {
    setAssignClientId(clientId);
    setIsRenewalMode(isRenewal);
    setAssignModalOpen(true);
  };

  const handleOpenPayment = (membership) => {
    setMembershipForPayment(membership);
    setPaymentModalOpen(true);
  };

  const handleOpenExtend = (membership) => {
    setMembershipForExtend(membership);
    setExtendModalOpen(true);
  };

  const handleCancelMembership = (membershipId) => {
    if (window.confirm('Are you sure you want to cancel this membership? It will be marked CANCELLED and will no longer grant gym access.')) {
      onCancelMembership(membershipId);
    }
  };

  const handleDeleteClient = (client) => {
    if (window.confirm(`Are you sure you want to permanently delete client "${client.name}"? Note: Clients with active or past membership records must be deactivated instead to preserve historical records.`)) {
      onDeleteClient(client.id);
    }
  };

  const handleDeletePlan = (plan) => {
    if (window.confirm(`Are you sure you want to delete membership plan "${plan.name}"?`)) {
      onDeletePlan(plan.id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">Active</span>;
      case 'UPCOMING':
        return <span className="badge badge-info">Upcoming</span>;
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
      {/* Real Backend Metrics Overview Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper navy">
            <UsersIcon size={20} />
          </div>
          <div className="stat-info">
            <h4>Total Clients</h4>
            <div className="stat-value">{stats.totalClients || 0}</div>
            <div className="stat-desc" style={{ color: 'var(--success)' }}>
              {stats.activeClients || 0} active accounts
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper teal">
            <CheckCircleIcon size={20} />
          </div>
          <div className="stat-info">
            <h4>Active Memberships</h4>
            <div className="stat-value">{stats.activeMemberships || 0}</div>
            <div className="stat-desc" style={{ color: 'var(--accent-teal)' }}>
              +{stats.upcomingMemberships || 0} scheduled upcoming
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertCircleIcon size={20} />
          </div>
          <div className="stat-info">
            <h4>Expired / Cancelled</h4>
            <div className="stat-value">{stats.expiredMemberships || 0}</div>
            <div className="stat-desc">
              {stats.cancelledMemberships || 0} cancelled
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <DollarIcon size={20} />
          </div>
          <div className="stat-info">
            <h4>Revenue Collected</h4>
            <div className="stat-value">${Number(stats.totalRevenue || 0).toFixed(2)}</div>
            <div className="stat-desc" style={{ color: Number(stats.pendingPayments || 0) > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>
              ${Number(stats.pendingPayments || 0).toFixed(2)} pending balance
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'memberships' ? 'active' : ''}`}
          onClick={() => setActiveTab('memberships')}
        >
          <CalendarIcon size={16} />
          <span>Memberships & Payments ({detailedMemberships.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <UsersIcon size={16} />
          <span>Clients Directory ({clients.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <ShieldIcon size={16} />
          <span>Membership Plans ({plans.length})</span>
        </button>
      </div>

      {/* TAB 1: MEMBERSHIPS & PAYMENTS */}
      {activeTab === 'memberships' && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Client Memberships & Payments</h2>
              <p className="panel-description">
                Monitor membership lifecycles, renewal dates, payment reconciliations, and balance dues.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleOpenAssign(null, false)}
            >
              <PlusIcon size={16} />
              <span>Assign Membership</span>
            </button>
          </div>

          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon"><SearchIcon size={16} /></span>
              <input
                type="text"
                placeholder="Search by client, plan, or status..."
                className="form-input"
                value={membershipSearch}
                onChange={(e) => setMembershipSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterIcon size={15} style={{ color: 'var(--text-secondary)' }} />
              <select
                className="form-select"
                style={{ width: '150px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Valid Dates</th>
                  <th>Membership Status</th>
                  <th>Agreed Fee</th>
                  <th>Amount Paid</th>
                  <th>Balance / Credit</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberships.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      <h3>No membership records found</h3>
                      <p>Try adjusting your search criteria or assign a membership plan to a registered client.</p>
                    </td>
                  </tr>
                ) : (
                  filteredMemberships.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.clientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.clientEmail}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{m.planName}</span>
                      </td>
                      <td>{m.planDurationMonths} mo</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{m.startDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>to {m.expiryDate}</div>
                      </td>
                      <td>{getStatusBadge(m.effectiveStatus)}</td>
                      <td style={{ fontWeight: 600 }}>${Number(m.price).toFixed(2)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        ${Number(m.amountPaid).toFixed(2)}
                      </td>
                      <td>
                        {m.customerCredit > 0 ? (
                          <span style={{ color: 'var(--info)', fontWeight: 600 }}>
                            +${Number(m.customerCredit).toFixed(2)} (Credit)
                          </span>
                        ) : m.remainingBalance > 0 ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                            ${Number(m.remainingBalance).toFixed(2)} Due
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>$0.00</span>
                        )}
                      </td>
                      <td>{getPaymentBadge(m.paymentStatus)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Update Payment or Record Transaction"
                            onClick={() => handleOpenPayment(m)}
                          >
                            <DollarIcon size={14} />
                            <span>Payment</span>
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Renew Membership"
                            onClick={() => handleOpenAssign(m.userId, true)}
                          >
                            <RefreshIcon size={14} />
                            <span>Renew</span>
                          </button>
                          {m.effectiveStatus !== 'CANCELLED' && (
                            <>
                              <button
                                className="btn btn-outline btn-sm"
                                title="Extend Expiry Date"
                                onClick={() => handleOpenExtend(m)}
                              >
                                <span>Extend</span>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                title="Cancel Membership"
                                onClick={() => handleCancelMembership(m.id)}
                              >
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENTS DIRECTORY */}
      {activeTab === 'clients' && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Clients Directory</h2>
              <p className="panel-description">
                Manage registered gym members, provision login credentials, and inspect membership status.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenAddClient}>
              <PlusIcon size={16} />
              <span>Add Client</span>
            </button>
          </div>

          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon"><SearchIcon size={16} /></span>
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                className="form-input"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Email (Login Identifier)</th>
                  <th>Phone Number</th>
                  <th>Account Status</th>
                  <th>Current Active Plan</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <h3>No clients found</h3>
                      <p>Click "Add Client" to provision a member profile and login account under your gym.</p>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const activeMem = detailedMemberships.find(
                      (m) => m.userId === client.id && (m.effectiveStatus === 'ACTIVE' || m.effectiveStatus === 'UPCOMING')
                    );

                    return (
                      <tr key={client.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID #{client.id}</div>
                        </td>
                        <td>{client.email}</td>
                        <td>{client.phone || '-'}</td>
                        <td>
                          <span className={`badge ${client.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {client.status}
                          </span>
                        </td>
                        <td>
                          {activeMem ? (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                              {activeMem.planName} ({activeMem.effectiveStatus}: {activeMem.expiryDate})
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              No active plan
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenAssign(client.id, Boolean(activeMem))}
                              title={activeMem ? 'Renew Membership' : 'Assign Membership'}
                            >
                              <CalendarIcon size={14} />
                              <span>{activeMem ? 'Renew' : 'Assign'}</span>
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleOpenEditClient(client)}
                              title="Edit Client Profile"
                            >
                              <EditIcon size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              className={`btn btn-sm ${client.status === 'ACTIVE' ? 'btn-outline' : 'btn-secondary'}`}
                              onClick={() => onToggleClientStatus(client.id)}
                              title={client.status === 'ACTIVE' ? 'Deactivate Client Account' : 'Activate Client Account'}
                            >
                              <span>{client.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteClient(client)}
                              title="Delete Client"
                            >
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERSHIP PLANS */}
      {activeTab === 'plans' && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Membership Plans & Pricing</h2>
              <p className="panel-description">
                Create and manage plan durations (Monthly, Quarterly, Yearly) for your facility.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenAddPlan}>
              <PlusIcon size={16} />
              <span>Create Plan</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {plans.map((plan) => {
              const stat = planStats.find((s) => s.planId === plan.id) || { membershipCount: 0, revenueGenerated: 0 };
              return (
                <div
                  key={plan.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {plan.name}
                      </h3>
                      <span className="badge badge-secondary">
                        {plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '4px' }}>
                      ${Number(plan.price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Full facility access for {plan.durationMonths} month(s)
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '38px' }}>
                      {plan.description || 'Standard facility access, fitness equipment, and locker access.'}
                    </p>

                    <div style={{
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      margin: '16px 0',
                      fontSize: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>Subscribers: <strong style={{ color: 'var(--primary-navy)' }}>{stat.membershipCount}</strong></span>
                      <span>Revenue: <strong style={{ color: 'var(--success)' }}>${Number(stat.revenueGenerated).toFixed(2)}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleOpenEditPlan(plan)}
                    >
                      <EditIcon size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePlan(plan)}
                      title="Delete Plan"
                    >
                      <span>Delete</span>
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleOpenAssign(null, false)}
                    >
                      <span>Assign</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSave={clientToEdit ? (data) => onUpdateClient(clientToEdit.id, data) : onAddClient}
        clientToEdit={clientToEdit}
      />

      <PlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSave={planToEdit ? (data) => onUpdatePlan(planToEdit.id, data) : onAddPlan}
        planToEdit={planToEdit}
      />

      <AssignMembershipModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={onAssignOrRenewMembership}
        clients={clients}
        plans={plans}
        initialClientId={assignClientId}
        isRenewal={isRenewalMode}
        existingMemberships={detailedMemberships}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={onUpdatePayment}
        onAddTransaction={onAddPaymentTransaction}
        membership={membershipForPayment}
      />

      <ExtendMembershipModal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        onExtend={onExtendMembership}
        membership={membershipForExtend}
      />
    </div>
  );
};
