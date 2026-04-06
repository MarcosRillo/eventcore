'use client';

/**
 * QRCodeModal - Dumb Component
 *
 * Modal that displays a QR code for sharing event URLs.
 * Allows downloading the QR code as an image.
 */

import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventUrl: string;
  eventTitle: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  eventUrl,
  eventTitle,
}: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Convert SVG to canvas then to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 300, 300);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-${eventTitle.slice(0, 30).replace(/\s+/g, '-')}.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="qr-modal-title" className="text-lg font-semibold text-neutral-900">
            Compartir con QR
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div ref={qrRef} className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={eventUrl}
            size={200}
            level="H"
            includeMargin
          />
        </div>

        {/* Event title */}
        <p className="text-center text-sm text-neutral-600 mt-2 truncate">
          {eventTitle}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
