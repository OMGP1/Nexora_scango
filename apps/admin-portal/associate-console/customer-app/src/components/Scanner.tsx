import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface ScannerProps {
  onScan: (barcode: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const debounceRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let controls: any;
    const codeReader = new BrowserMultiFormatReader();

    if (videoRef.current) {
      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result) {
          const text = result.getText();
          const now = Date.now();
          const lastScan = debounceRef.current[text] || 0;
          if (now - lastScan > 3000) {
            debounceRef.current[text] = now;
            onScan(text);
          }
        }
      }).then(c => controls = c).catch(console.error);
    }

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, [onScan]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#000', overflow: 'hidden' }}>
      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '100px',
        border: '2px solid rgba(255,255,255,0.5)',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
      }} />
    </div>
  );
};
