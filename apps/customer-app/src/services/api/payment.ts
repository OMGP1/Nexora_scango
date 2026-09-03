import api from '../api';

export const createPaymentIntent = async (sessionId: string, method: string = 'card', customerId?: string) => {
  const res = await api.post(`/sessions/${sessionId}/payment/intent`, { method, customer_id: customerId });
  return res.data;
};

export const simulateWebhook = async (gatewayRef: string) => {
  const res = await api.post(`/payment/webhook`, {
    gateway_ref: gatewayRef,
    status: 'succeeded'
  });
  return res.data;
};

export const getReceipt = async (sessionId: string) => {
  const res = await api.get(`/sessions/${sessionId}/receipt`);
  return res.data;
};

export const getCustomerReceiptById = async (customerId: string, receiptId: string) => {
  const res = await api.get(`/customers/${customerId}/receipts/${receiptId}`);
  return res.data;
};
