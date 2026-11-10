import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate } from '../../types';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  QrCode,
  ArrowRight,
  Award,
  BookOpen,
} from 'lucide-react';

export const PublicVerifyCertView: React.FC = () => {
  const { dbState, selectedCertCode, openQRScanner, navigate, showToast } = useApp();
  const [searchCode, setSearchCode] = useState(selectedCertCode || 'RAWAD-CERT-ZN-9481');
  const [verifiedCert, setVerifiedCert] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (selectedCertCode) {
      setSearchCode(selectedCertCode);
      handleVerify(selectedCertCode);
    }
  }, [selectedCertCode]);

  const handleVerify = (codeToVerify?: string) => {
    const code = (codeToVerify || searchCode).trim();
    if (!code) return;

    setHasSearched(true);
    const found = dbState.certificates.find(
      (c) => c.verificationCode.toLowerCase() === code.toLowerCase() || c.certificateNo.toLowerCase() === code.toLowerCase()
    );
    setVerifiedCert(found || null);
  };

  const handleScanQR = () => {
    openQRScanner((scanned) => {
      setSearchCode(scanned);
      handleVerify(scanned);
      showToast(`تم مسح كود الشهادة: ${scanned}`, 'info');
    });
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#1E4E8C] hover:underline"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
        <span className="text-xs text-slate-400">بوابة التحقق الرسمية المعتمدة</span>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1E4E8C] mx-auto flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            التحقق من صحة شهادات مركز الرواد
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            أدخل كود التحقق أو امسح الباركود المطبوع على الشهادة للتأكد من صحتها واعتمادها (UAT-10).
          </p>
        </div>

        {/* Search Input & QR Scan button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="مثال: RAWAD-CERT-ZN-9481 أو CRT-..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify()}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-xs"
            >
              تحقق الآن
            </button>
            <button
              onClick={handleScanQR}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="مسح باركود الشهادة بالكاميرا"
            >
              <QrCode className="w-4 h-4 text-[#E8A33D]" />
            </button>
          </div>
        </div>

        {/* Verification Results Box */}
        {hasSearched && (
          <div className="pt-4 border-t border-slate-100 text-right animate-in fade-in">
            {verifiedCert ? (
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  verifiedCert.status === 'valid'
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-rose-50 border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {verifiedCert.status === 'valid' ? (
                      <CheckCircle className="w-5 h-5 text-[#2E9E5B]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span
                      className={`text-sm font-black ${
                        verifiedCert.status === 'valid' ? 'text-emerald-950' : 'text-rose-950'
                      }`}
                    >
                      {verifiedCert.status === 'valid'
                        ? 'شهادة رسمية صحيحة ومعتمدة ✓'
                        : 'شهادة ملغاة رسمياً ✗'}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {verifiedCert.certificateNo}
                  </span>
                </div>

                {/* Privacy Rule BR-22: Displays recipient name, course, date only */}
                <div className="space-y-2 text-xs bg-white/80 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">اسم صاحب الشهادة:</span>
                    <span className="font-bold text-slate-900">{verifiedCert.recipientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">البرنامج / الفعالية:</span>
                    <span className="font-bold text-[#1E4E8C]">{verifiedCert.courseOrEventTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">التقدير / الساعات:</span>
                    <span className="font-medium text-slate-800">{verifiedCert.hoursOrGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">تاريخ الإصدار:</span>
                    <span className="font-mono text-slate-700">{verifiedCert.issuedAt}</span>
                  </div>
                </div>

                {verifiedCert.status === 'revoked' && (
                  <p className="text-xs text-rose-800 font-bold bg-rose-100 p-3 rounded-lg border border-rose-300">
                    سبب الإلغاء المسجل: {verifiedCert.revocationReason}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <XCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">لم يتم العثور على شهادة بهذا الكود</h3>
                <p className="text-xs text-slate-500">
                  يرجى التأكد من كتابة الكود بدقة كما هو مدون على الوثيقة، أو مسح الباركود مباشرة.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
