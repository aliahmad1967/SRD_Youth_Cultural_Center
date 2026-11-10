import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  showText?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 180,
  className = '',
  showText = false,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#1E4E8C',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR Generation Error:', err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-lg text-xs text-slate-400 ${className}`}
        style={{ width: size, height: size }}
      >
        جاري إنشاء الرمز...
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <img
        src={dataUrl}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        className="rounded-lg border border-slate-200 p-1 bg-white shadow-xs"
      />
      {showText && (
        <span className="text-[11px] font-mono text-slate-500 tracking-wider text-center truncate max-w-full">
          {value}
        </span>
      )}
    </div>
  );
};
