const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3000/api/v1';

export const createPaymentIntent = async (sessionId: string) => {
  const res = await fetch(`${PAYMENT_SERVICE_URL}/sessions/${sessionId}/payment/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to create payment intent');
  return res.json();
};

export const simulateWebhook = async (gatewayRef: string) => {
  const res = await fetch(`${PAYMENT_SERVICE_URL}/payment/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gateway_ref: gatewayRef, status: 'succeeded' })
  });
  if (!res.ok) throw new Error('Failed to simulate webhook');
  return res.json();
};

export const getReceipt = async (sessionId: string) => {
  const res = await fetch(`${PAYMENT_SERVICE_URL}/sessions/${sessionId}/receipt`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch receipt');
  return res.json();
};
