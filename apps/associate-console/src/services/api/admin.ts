import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Session {
  id: string;
  store_id: string;
  customer_id: string;
  status: 'ACTIVE' | 'PAUSED' | 'CHECKOUT' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  item_count: number;
  total_value: number;
  verification_status: 'NOT_REQUIRED' | 'PENDING' | 'HELD' | 'CLEARED';
}

export interface InventoryItem {
  store_id: string;
  sku: string;
  available_qty: number;
  reserved_qty: number;
  last_updated: string;
}

export const adminApi = {
  fetchActiveSessions: async (storeId: string = 'STORE_001'): Promise<Session[]> => {
    const res = await api.get('/sessions', { params: { store_id: storeId } });
    return res.data.data || [];
  },

  fetchHeldSessions: async (storeId: string = 'STORE_001') => {
    const res = await api.get('/sessions', { params: { store_id: storeId, verification_status: 'HELD' } });
    return res.data.data || [];
  },

  pauseSession: async (id: string) => {
    const res = await api.post(`/sessions/${id}/pause`);
    return res.data;
  },

  resumeSession: async (id: string) => {
    const res = await api.post(`/sessions/${id}/resume`);
    return res.data;
  },

  fetchVerificationQueue: async (storeId: string = 'STORE_001'): Promise<Session[]> => {
    const res = await api.get('/sessions', { params: { store_id: storeId, verification_status: 'HELD' } });
    return res.data.data || [];
  },

  getSessionBill: async (sessionId: string) => {
    const res = await api.get(`/sessions/${sessionId}/bill`);
    return res.data.data;
  },

  clearSession: async (id: string, reason: string): Promise<boolean> => {
    await api.post(`/sessions/${id}/verification/clear`, { reason });
    return true;
  },

  // ── Counter Payment Verify ──────────────────
  verifyCounterPayment: async (sessionId: string, otp: string) => {
    const res = await api.post('/payment/counter/verify', { session_id: sessionId, otp });
    return res.data;
  },

  // ── Inventory ────────────────────────────────
  fetchInventory: async (storeId: string = 'STORE_001'): Promise<InventoryItem[]> => {
    const res = await api.get(`/inventory/${storeId}`);
    return res.data.data || [];
  },

  receiveStock: async (storeId: string, sku: string, quantity: number, receivedBy: string) => {
    const res = await api.post(`/inventory/${storeId}/receive`, { sku, quantity, received_by: receivedBy });
    return res.data.data;
  },

  // ── Exit Pass ────────────────────────────────
  validateExitPass: async (token: string) => {
    const res = await api.post('/payment/exit-pass/validate', { token });
    return res.data;
  },
};
