import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { Scale, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { Card, Spinner } from '@scango/ui';
import api from '../services/api';

type ScaleState = 'WAITING' | 'READING' | 'PASSED' | 'FAILED' | 'NO_SCALE';

export const ExitScalePage: React.FC = () => {
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const [scaleState, setScaleState] = useState<ScaleState>('WAITING');
  const [expectedWeight, setExpectedWeight] = useState<number>(0);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [discrepancy, setDiscrepancy] = useState<number>(0);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    // Fetch bill to get expected_total_weight_g
    const fetchSessionAndBill = async () => {
      try {
        const [billRes, sessionRes] = await Promise.all([
          api.get(`/sessions/${sessionId}/bill`),
          api.get(`/sessions/${sessionId}`)
        ]);
        
        setExpectedWeight(billRes.data.data?.expected_total_weight_g || 0);
        setSessionData(sessionRes.data.data);
      } catch (error) {
        console.error('Failed to fetch bill or session', error);
      }
    };

    fetchSessionAndBill();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!sessionId) return;

    let fallbackInterval: NodeJS.Timeout;
    
    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/v1/scale/ws/${sessionId}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Scale WS connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleScaleReading(data);
        } catch (e) {
          console.error('Failed to parse scale WS message', e);
        }
      };

      ws.onerror = (error) => {
        console.error('Scale WS error', error);
        startFallback();
      };

      ws.onclose = () => {
        console.log('Scale WS closed');
        startFallback();
      };
    };

    const startFallback = () => {
      if (!sessionData?.store_id || !sessionData?.lane_code) return;
      
      // Clear existing interval if any
      if (fallbackInterval) clearInterval(fallbackInterval);
      
      fallbackInterval = setInterval(async () => {
        try {
          const res = await api.get(`/scale/${sessionData.store_id}/${sessionData.lane_code}/latest`);
          handleScaleReading(res.data.data);
        } catch (e) {
          console.error('Scale fallback error', e);
          setScaleState('NO_SCALE');
        }
      }, 2000);
    };

    const handleScaleReading = (data: any) => {
      if (!data) return;
      
      const weight = data.weight_g || 0;
      setCurrentWeight(weight);
      
      if (data.status === 'VERIFIED' || data.status === 'PASSED') {
        setScaleState('PASSED');
      } else if (data.status === 'FAILED' || data.status === 'DISCREPANCY') {
        setScaleState('FAILED');
        setDiscrepancy(data.discrepancy_g || 0);
      } else if (data.status === 'READING' || weight > 0) {
        setScaleState('READING');
      } else {
        setScaleState('WAITING');
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [sessionId, sessionData]);

  useEffect(() => {
    if (scaleState === 'PASSED') {
      const timer = setTimeout(() => {
        navigate('/receipt');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [scaleState, navigate]);

  const progressPercentage = expectedWeight > 0 ? Math.min(100, (currentWeight / expectedWeight) * 100) : 0;
  let progressColor = 'var(--color-primary)';
  if (scaleState === 'PASSED') progressColor = 'var(--color-success)';
  if (scaleState === 'FAILED') progressColor = 'var(--color-danger)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: '24px',
      }}
    >
      <Card padding="lg" style={{ textAlign: 'center', maxWidth: '380px', width: '100%', animation: 'scango-scale-in 0.3s ease-out' }}>
        
        {scaleState === 'WAITING' && (
          <>
            <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <Scale size={56} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              Place your bags on the exit scale
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              Expected weight: {(expectedWeight / 1000).toFixed(2)} kg
            </p>
          </>
        )}

        {scaleState === 'READING' && (
          <>
            <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center' }}>
              <Spinner size={56} color="var(--color-primary)" />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              Verifying weight...
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              Current: {(currentWeight / 1000).toFixed(2)} kg / Expected: {(expectedWeight / 1000).toFixed(2)} kg
            </p>
          </>
        )}

        {scaleState === 'PASSED' && (
          <>
            <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center', color: 'var(--color-success)' }}>
              <CheckCircle size={56} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              All good! ✓
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              Weight matched perfectly. Proceeding to receipt...
            </p>
          </>
        )}

        {scaleState === 'FAILED' && (
          <>
            <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center', color: 'var(--color-warning)' }}>
              <AlertTriangle size={56} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              Please wait for associate assistance
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              Weight discrepancy detected ({(discrepancy / 1000).toFixed(2)} kg). An associate will verify your items.
            </p>
          </>
        )}

        {scaleState === 'NO_SCALE' && (
          <>
            <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              <HelpCircle size={56} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              Scale not available — associate will verify
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              Our exit scale is currently offline. Please wait for an associate to check your receipt.
            </p>
          </>
        )}

        {/* Progress bar */}
        {(scaleState === 'READING' || scaleState === 'WAITING' || scaleState === 'PASSED') && (
          <div style={{ marginTop: '24px', width: '100%', height: '8px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercentage}%`, 
                backgroundColor: progressColor,
                transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out' 
              }} 
            />
          </div>
        )}
      </Card>
    </div>
  );
};
