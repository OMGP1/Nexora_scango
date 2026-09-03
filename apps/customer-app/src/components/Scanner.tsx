import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerProps {
  onScan: (barcode: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const debounceRef = useRef<Record<string, number>>({});
  const onScanRef = useRef(onScan);
  // Unique ID per mount so StrictMode double-mount doesn't collide
  const readerId = useRef(`reader-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    // Small delay so the DOM element is guaranteed to be in the document
    const timer = setTimeout(() => {
      if (cancelled) return;
      const el = document.getElementById(readerId.current);
      if (!el) return;

      scanner = new Html5Qrcode(readerId.current);

      scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        },
        (text) => {
          const now = Date.now();
          const lastScan = debounceRef.current[text] || 0;
          if (now - lastScan > 3000) {
            debounceRef.current[text] = now;
            onScanRef.current(text);
          }
        },
        () => {
          // QR decode miss — ignore
        }
      ).catch((err: unknown) => {
        if (!cancelled) {
          console.error("Failed to start scanner", err);
        }
      });
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);

      if (scanner) {
        const s = scanner;
        // Attempt graceful stop — swallow every error
        (async () => {
          try {
            if (s.isScanning) await s.stop();
          } catch (_) {}
          try {
            s.clear();
          } catch (_) {}
        })();
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>
        {`
          [id^="reader-"] { width: 100%; border: none !important; background: #000; }
          [id^="reader-"] video { object-fit: cover; border-radius: 12px; width: 100% !important; height: auto !important; }
        `}
      </style>
      <div id={readerId.current} style={{ width: '100%', maxWidth: '100vw', padding: '16px', boxSizing: 'border-box' }}></div>
    </div>
  );
};
