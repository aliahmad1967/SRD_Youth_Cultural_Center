import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Camera, X, Check, QrCode, Sparkles } from 'lucide-react';

export const QRScannerModal: React.FC = () => {
  const { isQRScannerOpen, closeQRScanner, qrScannerCallback, showToast, dbState } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isQRScannerOpen) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setCameraActive(true);
            setCameraError(null);
          }
        })
        .catch(() => {
          setCameraActive(false);
          setCameraError('لم نتمكن من الوصول لكاميرا الجهاز، يمكنك استخدام المحاكاة السريعة بالأسفل.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isQRScannerOpen]);

  if (!isQRScannerOpen) return null;

  const handleScanSuccess = (code: string) => {
    if (qrScannerCallback) {
      qrScannerCallback(code);
    }
    showToast(`تم مسح الرمز بنجاح: ${code}`, 'success');
    closeQRScanner();
  };

  // Sample tokens from the system for 1-click test evaluation
  const quickTestCodes = [
    { label: 'بطاقة عضوية: كنان إبراهيم (MEM-0001)', code: 'MEM-2026-0001' },
    { label: 'بطاقة عضوية: ريان إبراهيم (MEM-0006)', code: 'MEM-2026-0006' },
    { label: 'بطاقة عضوية: زيد النجار (MEM-0009)', code: 'MEM-2026-0009' },
    { label: 'رمز جلسة اليوم النشطة (دورة فن الإلقاء)', code: 'SESS-2026-1110-ACTIVE-TOKEN' },
    { label: 'سند قبض: REC-2026-000140 (200 ج.م)', code: 'REC-RAWAD-000140-VERIFIED' },
    { label: 'شهادة إكمال دورة: زيد النجار', code: 'RAWAD-CERT-ZN-9481' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-right flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#1E4E8C]" />
            <h3 className="font-bold text-slate-900 text-base">قارئ رمز الاستجابة السريعة (QR Code)</h3>
          </div>
          <button
            onClick={closeQRScanner}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Camera Viewport or Placeholder */}
          <div className="relative aspect-video w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-700">
            {cameraActive ? (
              <video ref={videoRef} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                <Camera className="w-10 h-10 mb-2 text-slate-500" />
                <p className="text-xs text-slate-400 max-w-xs">{cameraError || 'الكاميرا جاهزة للمسح أو اختر رمزاً من المحاكاة السريعة'}</p>
              </div>
            )}

            {/* Target Reticle */}
            <div className="absolute inset-8 border-2 border-[#1A9E9A]/80 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-[11px] text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                وجّه الكاميرا نحو الرمز
              </span>
            </div>
          </div>

          {/* Manual Input */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              أو أدخل رقم الرمز أو البطاقة يدوياً:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="مثال: MEM-2026-0001 أو SESS-..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              />
              <button
                disabled={!manualCode.trim()}
                onClick={() => handleScanSuccess(manualCode.trim())}
                className="flex items-center gap-1 rounded-lg bg-[#1E4E8C] px-3 py-2 text-xs font-medium text-white hover:bg-[#163a69] disabled:opacity-50 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>تأكيد</span>
              </button>
            </div>
          </div>

          {/* Quick Simulation Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span>محاكاة سريعة لاختبار النظام بضغطة واحدة:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickTestCodes.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScanSuccess(item.code)}
                  className="flex flex-col text-right p-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#1E4E8C] hover:bg-blue-50/40 transition text-xs group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-[#1E4E8C] truncate">
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 mt-0.5">{item.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={closeQRScanner}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
