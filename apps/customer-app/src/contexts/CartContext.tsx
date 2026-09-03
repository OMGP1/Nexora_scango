import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';
import { useSession } from './SessionContext';

interface CartContextType {
  items: any[];
  billSummary: any;
  addItem: (barcode: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { sessionId } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [billSummary, setBillSummary] = useState<any>(null);

  const fetchCart = async () => {
    if (!sessionId) return;
    try {
      const response = await api.get(`/sessions/${sessionId}/bill`);
      const data = response.data.data;
      setItems(data.items || []);
      setBillSummary(data.bill_summary || null);
    } catch (e) {
      console.error('Failed to fetch cart', e);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

  const addItem = async (barcode: string) => {
    if (!sessionId) return;
    try {
      const response = await api.post(`/sessions/${sessionId}/items`, { barcode });
      console.log('addItem response:', response.data);
      // Handle both wrapped and unwrapped response formats
      const payload = response.data.data ? response.data.data : response.data;
      setItems(payload.items || []);
      setBillSummary(payload.bill_summary || null);
    } catch (err) {
      console.error('addItem failed:', err);
      throw err;
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (!sessionId) return;
    const response = await api.patch(`/sessions/${sessionId}/items/${itemId}`, { quantity });
    const payload = response.data.data ? response.data.data : response.data;
    setItems(payload.items || []);
    setBillSummary(payload.bill_summary || null);
  };

  const removeItem = async (itemId: string) => {
    if (!sessionId) return;
    const response = await api.delete(`/sessions/${sessionId}/items/${itemId}`);
    const payload = response.data.data ? response.data.data : response.data;
    setItems(payload.items || []);
    setBillSummary(payload.bill_summary || null);
  };

  return (
    <CartContext.Provider value={{ items, billSummary, addItem, updateItem, removeItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
