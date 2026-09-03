import api from '../api';

export const computeVerificationTier = async (sessionId: string, customerId?: string) => {
  return api.post(`/sessions/${sessionId}/verification/compute`, {
    customer_id: customerId || 'guest',
  });
};

export const getVerificationStatus = async (sessionId: string) => {
  return api.get(`/sessions/${sessionId}/verification`);
};
