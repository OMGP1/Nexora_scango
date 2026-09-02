import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerProps {
  onScan: (barcode: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const debounceRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [ Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.CODE_128 ],
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    );

    scanner.render((text) => {
      const now = Date.now();
      const lastScan = debounceRef.current[text] || 0;
      // 3 second debounce to prevent rapid-fire scanning of the same item
      if (now - lastScan > 3000) {
        debounceRef.current[text] = now;
        onScan(text);
      }
    }, (error) => {
      // Ignore routine frame read errors
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return (
    <div style={{ width: '100%', backgroundColor: '#000', display: 'flex', justifyContent: 'center' }}>
      <div id="reader" style={{ width: '100%', maxWidth: '600px' }}></div>
    </div>
  );
};
