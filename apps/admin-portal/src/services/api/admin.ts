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

export interface Product {
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  unit_price: number;
  tax_class: string;
  category_id?: string;
  image_url?: string;
  is_weight_based?: boolean;
  is_age_restricted?: boolean;
}

export interface InventoryItem {
  store_id: string;
  sku: string;
  available_qty: number;
  reserved_qty: number;
  last_updated: string;
}

export interface StoreConfig {
  id: string;
  name: string;
  self_scan_enabled: boolean;
  verification_threshold: number;
  operating_hours: string;
}

export const adminApi = {
  // ── Catalog ──────────────────────────────────
  fetchCatalog: async (): Promise<Product[]> => {
    const res = await api.get('/products');
    return res.data.data || [];
  },

  searchCatalog: async (query: string): Promise<Product[]> => {
    const res = await api.get('/products/search', { params: { q: query } });
    return res.data.data || [];
  },

  getProductBySku: async (sku: string): Promise<Product> => {
    const res = await api.get(`/products/${sku}`);
    return res.data.data;
  },

  lookupBarcode: async (barcode: string): Promise<Product> => {
    const res = await api.get('/products/lookup', { params: { barcode } });
    return res.data.data;
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await api.post('/products', product);
    return res.data.data;
  },

  updateProduct: async (sku: string, updates: Partial<Product>): Promise<Product> => {
    const res = await api.patch(`/products/${sku}`, updates);
    return res.data.data;
  },

  deleteProduct: async (sku: string): Promise<void> => {
    await api.delete(`/products/${sku}`);
  },

  updateProductPrice: async (sku: string, newPrice: number): Promise<boolean> => {
    await api.patch(`/products/${sku}`, { unit_price: newPrice });
    return true;
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

  adjustStock: async (storeId: string, sku: string, quantity: number, reason: string, adjustedBy: string) => {
    const res = await api.post(`/inventory/${storeId}/adjust`, { sku, quantity, reason, adjusted_by: adjustedBy });
    return res.data.data;
  },

  fetchLedger: async (storeId: string = 'STORE_001') => {
    const res = await api.get(`/inventory/${storeId}/ledger`);
    return res.data.data || [];
  },

  // ── Store Config ─────────────────────────────
  fetchStoreConfig: async (storeId: string): Promise<StoreConfig> => {
    // TODO: connect to identity-service when store config endpoints exist
    return {
      id: storeId,
      name: 'ScanGo Supermarket',
      self_scan_enabled: true,
      verification_threshold: 0.15,
      operating_hours: '08:00-22:00'
    };
  },

  updateStoreConfig: async (storeId: string, updates: Partial<StoreConfig>): Promise<StoreConfig> => {
    // TODO: connect to identity-service
    return { id: storeId, name: 'ScanGo Supermarket', self_scan_enabled: true, verification_threshold: 0.15, operating_hours: '08:00-22:00', ...updates };
  },

  // ── Sessions (live) ──────────────────────────
  fetchActiveSessions: async (storeId: string = 'STORE_001') => {
    const res = await api.get('/sessions', { params: { store_id: storeId } });
    return res.data.data || [];
  },

  // ── Counter Payment Verify ──────────────────
  verifyCounterPayment: async (sessionId: string, otp: string) => {
    const res = await api.post('/payment/counter/verify', { session_id: sessionId, otp });
    return res.data;
  },
};
