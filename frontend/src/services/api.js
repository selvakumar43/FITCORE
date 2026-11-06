import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create configured Axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitcore_auth_token') || localStorage.getItem('gym360_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to format clean error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else if (error.response.status === 403) {
        message = 'Access forbidden: You do not have permission to perform this action.';
      } else if (error.response.status === 401) {
        message = 'Session expired or invalid credentials. Please log in again.';
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// Helper: Calculate automatic expiry date given start date (YYYY-MM-DD) and duration in months
// Using local date components to avoid timezone offsets and off-by-one errors
export const calculateExpiryDate = (startDateStr, durationMonths) => {
  if (!startDateStr || !durationMonths) return '';
  const parts = startDateStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-based
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month + parseInt(durationMonths, 10), day);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Unified API Service connected to Spring Boot Backend
export const api = {
  // --- Auth & Multi-Tenant Onboarding ---
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  registerGym: async (gymData) => {
    const response = await apiClient.post('/auth/register-gym', gymData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // --- Admin Dashboard & Aggregated View ---
  getAdminDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // --- Clients Management ---
  getClients: async () => {
    const response = await apiClient.get('/admin/clients');
    return response.data;
  },

  addClient: async (clientData) => {
    const response = await apiClient.post('/admin/clients', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await apiClient.put(`/admin/clients/${id}`, clientData);
    return response.data;
  },

  toggleClientStatus: async (id) => {
    const response = await apiClient.patch(`/admin/clients/${id}/status`);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await apiClient.delete(`/admin/clients/${id}`);
    return response.data;
  },

  // --- Membership Plans ---
  getPlans: async () => {
    const response = await apiClient.get('/admin/plans');
    return response.data;
  },

  addPlan: async (planData) => {
    const response = await apiClient.post('/admin/plans', planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await apiClient.put(`/admin/plans/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await apiClient.delete(`/admin/plans/${id}`);
    return response.data;
  },

  // --- Memberships Assignment, Extension & Cancellation ---
  assignOrRenewMembership: async (data) => {
    const response = await apiClient.post('/admin/memberships/assign', data);
    return response.data;
  },

  cancelMembership: async (id) => {
    const response = await apiClient.post(`/admin/memberships/${id}/cancel`);
    return response.data;
  },

  extendMembership: async (id, data) => {
    const response = await apiClient.post(`/admin/memberships/${id}/extend`, data);
    return response.data;
  },

  // --- Payment Updates & Transactions ---
  updatePayment: async (membershipId, paymentData) => {
    const response = await apiClient.put(`/admin/payments/${membershipId}`, paymentData);
    return response.data;
  },

  addPaymentTransaction: async (membershipId, transactionData) => {
    const response = await apiClient.post(`/admin/payments/${membershipId}/transactions`, transactionData);
    return response.data;
  },

  // --- Client Dashboard & Password Management ---
  getClientDashboard: async () => {
    const response = await apiClient.get('/client/dashboard');
    return response.data;
  },

  changeClientPassword: async (data) => {
    const response = await apiClient.post('/client/change-password', data);
    return response.data;
  },

  // --- Admin Account Management ---
  getAdminProfile: async () => {
    const response = await apiClient.get('/admin/profile');
    return response.data;
  },

  updateAdminProfile: async (data) => {
    const response = await apiClient.put('/admin/profile', data);
    return response.data;
  },

  changeAdminEmail: async (data) => {
    const response = await apiClient.put('/admin/profile/email', data);
    return response.data;
  },

  changeAdminPassword: async (data) => {
    const response = await apiClient.post('/admin/profile/change-password', data);
    return response.data;
  },

  // --- Password Recovery ---
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  }
};
