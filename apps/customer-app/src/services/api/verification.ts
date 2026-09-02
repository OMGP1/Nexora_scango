import axios from 'axios';

const VERIFICATION_SERVICE_URL = 'http://localhost:3006/api/v1';

export const computeVerificationTier = async (sessionId: string, customerId?: string) => {
  return axios.post(`${VERIFICATION_SERVICE_URL}/sessions/${sessionId}/verification/compute`, {
    customer_id: customerId || 'guest',
  });
};

export const getVerificationStatus = async (sessionId: string) => {
  return axios.get(`${VERIFICATION_SERVICE_URL}/sessions/${sessionId}/verification`);
};
