import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerProps {
  onScan: (barcode: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const debounceRef = useRef<Record<string, number>>({});
  const onScanRef = useRef(onScan);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let isComponentMounted = true;
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      },
      (text) => {
        const now = Date.now();
        const lastScan = debounceRef.current[text] || 0;
        if (now - lastScan > 3000) {
          debounceRef.current[text] = now;
          onScanRef.current(text);
        }
      },
      (_error) => {
        // ignore
      }
    ).then(() => {
      // If the component unmounted while the camera was starting up
      if (!isComponentMounted) {
        scanner.stop().then(() => scanner.clear()).catch(console.error);
      }
    }).catch(err => {
      console.error("Failed to start scanner", err);
    });

    return () => {
      isComponentMounted = false;
      if (scanner.isScanning) {
        scanner.stop().then(() => {
          try { scanner.clear(); } catch(e) {}
        }).catch(console.error);
      } else {
        try { scanner.clear(); } catch(e) {}
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '12px', overflow: 'hidden' }}>
      <style>
        {`
          #reader { width: 100%; border: none !important; background: #000; }
          #reader video { object-fit: cover; width: 100% !important; height: auto !important; }
        `}
      </style>
      <div id="reader" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}></div>
    </div>
  );
};
