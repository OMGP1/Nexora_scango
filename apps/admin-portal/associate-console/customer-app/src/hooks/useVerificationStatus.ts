import { useState, useEffect } from 'react';
import { getVerificationStatus } from '../services/api/verification';

export function useVerificationStatus(sessionId: string | null) {
  const [status, setStatus] = useState<'PENDING' | 'CLEARED' | 'HELD'>('PENDING');
  const [tier, setTier] = useState<'GREEN' | 'AMBER' | 'RED' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let intervalId: any = null;

    const poll = async () => {
      try {
        const res = await getVerificationStatus(sessionId);
        const data = res.data.data;
        
        if (data) {
          setTier(data.tier);
          setStatus(data.status);
          
          if (data.status === 'CLEARED' || data.status === 'HELD') {
            clearInterval(intervalId);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error('Failed to poll verification status', e);
      }
    };

    poll(); // Initial check
    intervalId = setInterval(poll, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [sessionId]);

  return { status, tier, loading };
}
