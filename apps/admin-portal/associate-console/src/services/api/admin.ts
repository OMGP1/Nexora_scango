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

// Mocked Data
let mockSessions: Session[] = [
  {
    id: 'sess_1',
    store_id: 'store_1',
    customer_id: 'cust_a',
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    item_count: 3,
    total_value: 450,
    verification_status: 'NOT_REQUIRED'
  },
  {
    id: 'sess_2',
    store_id: 'store_1',
    customer_id: 'cust_b',
    status: 'CHECKOUT',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    item_count: 12,
    total_value: 3200,
    verification_status: 'HELD'
  },
  {
    id: 'sess_3',
    store_id: 'store_1',
    customer_id: 'cust_c',
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    item_count: 1,
    total_value: 50,
    verification_status: 'NOT_REQUIRED'
  }
];

export const adminApi = {
  fetchActiveSessions: async (): Promise<Session[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockSessions;
  },

  fetchVerificationQueue: async (): Promise<Session[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockSessions.filter(s => s.verification_status === 'HELD');
  },

  clearSession: async (id: string, reason: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const session = mockSessions.find(s => s.id === id);
    if (session) {
      session.verification_status = 'CLEARED';
      console.log(`Session ${id} cleared for reason: ${reason}`);
      return true;
    }
    return false;
  }
};
