import { useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

interface MotionData {
  window_start_ts: number;
  window_end_ts: number;
  motion_event_count: number;
  peak_acceleration: number;
}

export const useBehavioralTelemetry = (sessionId: string | null, isEnabled: boolean) => {
  const motionDataRef = useRef<{
    eventCount: number;
    peakAcc: number;
    windowStart: number;
  }>({
    eventCount: 0,
    peakAcc: 0,
    windowStart: Date.now(),
  });

  const lastScanTimeRef = useRef<number | null>(null);
  const throttleRef = useRef<number>(0);

  useEffect(() => {
    if (!isEnabled || !sessionId) return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();
      // Throttle to max 10 events per second
      if (now - throttleRef.current < 100) return;
      throttleRef.current = now;

      const accX = event.acceleration?.x || 0;
      const accY = event.acceleration?.y || 0;
      const accZ = event.acceleration?.z || 0;
      const currentAcc = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

      motionDataRef.current.eventCount += 1;
      if (currentAcc > motionDataRef.current.peakAcc) {
        motionDataRef.current.peakAcc = currentAcc;
      }
    };

    const handleDeviceOrientation = () => {
      const now = Date.now();
      if (now - throttleRef.current < 100) return;
      throttleRef.current = now;

      motionDataRef.current.eventCount += 1;
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    const intervalId = setInterval(async () => {
      const now = Date.now();
      const payload: MotionData = {
        window_start_ts: motionDataRef.current.windowStart,
        window_end_ts: now,
        motion_event_count: motionDataRef.current.eventCount,
        peak_acceleration: motionDataRef.current.peakAcc,
      };

      // Reset for next window
      motionDataRef.current = {
        eventCount: 0,
        peakAcc: 0,
        windowStart: now,
      };

      if (payload.motion_event_count > 0) {
        try {
          await api.post('/api/v1/telemetry/motion', {
            ...payload,
            sessionId,
          });
        } catch (error) {
          console.error('Failed to send motion telemetry:', error);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      clearInterval(intervalId);
    };
  }, [isEnabled, sessionId]);

  const markScanEvent = useCallback(
    async (barcode: string) => {
      if (!isEnabled || !sessionId) return;

      const now = Date.now();
      const timeSinceLastScan = lastScanTimeRef.current
        ? now - lastScanTimeRef.current
        : null;
      lastScanTimeRef.current = now;

      try {
        await api.post('/api/v1/telemetry/scan', {
          sessionId,
          barcode,
          client_ts: now,
          time_since_last_scan_ms: timeSinceLastScan,
        });
      } catch (error) {
        console.error('Failed to send scan telemetry:', error);
      }
    },
    [isEnabled, sessionId]
  );

  return { markScanEvent };
};
