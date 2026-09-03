import { useState, useEffect } from 'react';
import axios from 'axios';

interface EscrowStatus {
  points_pending: number;
  status: string;
  multiplier: number;
}

export const useHonestyEscrow = (sessionId: string | null) => {
  const [escrow, setEscrow] = useState<EscrowStatus>({
    points_pending: 0,
    status: 'unknown',
    multiplier: 1.0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchEscrow = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/escrow/status/${sessionId}`);
        if (isMounted) {
          setEscrow(res.data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to fetch escrow status');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEscrow();

    // Poll periodically to keep it fresh
    const interval = setInterval(fetchEscrow, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  return { ...escrow, loading, error };
};
