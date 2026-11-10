import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate } from '../../types';
import { db } from '../../services/storage';
import { QRCodeDisplay } from '../../components/common/QRCodeDisplay';
import {
  Award,
  CheckCircle,
  XCircle,
  Printer,
  Search,
  ExternalLink,
  ShieldCheck,
  X,
  BookOpen,
} from 'lucide-react';

export const CertificatesView: React.FC = () => {
  const { dbState, currentUser, activeRole, navigate, showToast } = useApp();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const filteredCerts = dbState.certificates.filter(
    (c) =>
      c.recipientName.includes(searchTerm) ||
      c.certificateNo.includes(searchTerm) ||
      c.courseOrEventTitle.includes(searchTerm) ||
      c.verificationCode.includes(searchTerm)
  );

  const handleRevoke = () => {
    if (!selectedCert || !revokeReason.trim()) {
      showToast('يرجى ذكر سبب إبطال الشهادة.', 'warning');
      return;
    }

    try {
      db.revokeCertificate(
        selectedCert.id,
        revokeReason,
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'أحمد المنصور' }
      );
      showToast(`تم إبطال الشهادة (${selectedCert.certificateNo}) وتحديث حالة التحقق إلى ملغاة.`, 'info');
      setShowRevokeModal(false);
      setRevokeReason('');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">الشهادات الرسمية وبوابة التحقق</h1>
          <p className="text-xs text-slate-500 mt-1">
            إصدار شهادات إكمال الدورات وساعات التطوع، والتحقق الفوري بالباركود (CRT-03 & UAT-10).
          </p>
        </div>

        <button
          onClick={() => navigate('public_verify_cert')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4 text-[#1E4E8C]" />
          <span>فتح صفحة التحقق العامة للجمهور</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث بالاسم أو رقم الشهادة أو كود التحقق..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
      </div>

      {/* Certificates Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCerts.map((cert) => (
          <div
            key={cert.id}
            className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E4E8C]">
                  {cert.type === 'volunteer_hours' ? 'ساعات تطوعية' : 'إكمال دورة تدريبية'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cert.status === 'valid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {cert.status === 'valid' ? 'معتمدة وسارية ✓' : 'ملغاة ✗'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">الممنوحة له:</span>
                <h3 className="text-base font-bold text-slate-900">{cert.recipientName}</h3>
                <p className="text-xs text-[#1E4E8C] font-semibold mt-0.5">{cert.courseOrEventTitle}</p>
                <p className="text-[11px] text-slate-500 mt-1">{cert.hoursOrGrade}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">كود التحقق:</span>
                <span className="font-bold text-slate-800 tracking-wider">{cert.verificationCode}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setSelectedCert(cert)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>معاينة وطباعة الشهادة</span>
              </button>

              {activeRole === 'director' && cert.status === 'valid' && (
                <button
                  onClick={() => {
                    setSelectedCert(cert);
                    setShowRevokeModal(true);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                  title="إبطال الشهادة"
                >
                  إبطال
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Official Certificate Printable Modal (CRT-01, CRT-03) */}
      {selectedCert && !showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-10 shadow-2xl relative text-right my-8 border-8 border-double border-[#1E4E8C]">
            <button
              onClick={() => setSelectedCert(null)}
              className="no-print absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Certificate Frame */}
            <div className="text-center space-y-6 print-break-inside-avoid">
              {/* Emblem & Header */}
              <div className="flex flex-col items-center justify-center space-y-2 border-b-2 border-[#1E4E8C]/20 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1E4E8C] flex items-center justify-center text-white shadow-md">
                  <BookOpen className="w-8 h-8 text-amber-300" />
                </div>
                <h2 className="text-lg font-black text-[#1E4E8C] tracking-wide">
                  مركز الرواد الشبابي الثقافي والتوعوي
                </h2>
                <span className="text-xs text-[#1A9E9A] font-bold">
                  Youth Cultural & Awareness Center
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 pt-2 font-serif">
                  شـــهـــادة إتــمـــام واعــتــمـــاد
                </h1>
              </div>

              {/* Certificate Body Text */}
              <div className="space-y-4 px-4">
                <p className="text-xs text-slate-600">يشهد المركز الثقافي بأن المتدرب / المتطوع:</p>
                <div className="text-xl sm:text-2xl font-black text-[#1E4E8C] underline decoration-amber-400 decoration-4 underline-offset-8">
                  {selectedCert.recipientName}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto">
                  قد أتم بنجاح متطلبات <strong>{selectedCert.courseOrEventTitle}</strong> واجتاز كافة التقييمات المقررة بحضور واستحقاق ({selectedCert.hoursOrGrade}).
                </p>
              </div>

              {/* QR Code and Signatures Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 px-4">
                {/* Director Signature */}
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">مدير المركز</span>
                  <div className="font-serif font-black text-sm text-slate-800">أحمد المنصور</div>
                  <span className="text-[10px] text-emerald-700 font-bold">✓ توقيع إلكتروني معتمد</span>
                </div>

                {/* Verification QR */}
                <div className="flex flex-col items-center">
                  <QRCodeDisplay value={selectedCert.verificationCode} size={90} />
                  <span className="font-mono text-[9px] text-slate-400 mt-1">
                    {selectedCert.verificationCode}
                  </span>
                </div>

                {/* Coordinator Signature */}
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">منسق البرامج</span>
                  <div className="font-serif font-black text-sm text-slate-800">سارة الخطيب</div>
                  <span className="text-[10px] text-slate-400 block">تاريخ الإصدار: {selectedCert.issuedAt}</span>
                </div>
              </div>

              {selectedCert.status === 'revoked' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
                  تنبيه: تم إبطال هذه الشهادة رسمياً من إدارة المركز بسبب: {selectedCert.revocationReason}
                </div>
              )}
            </div>

            {/* Print Buttons (no-print) */}
            <div className="no-print mt-8 flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] shadow-md transition"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>طباعة الشهادة الرسمية (PDF)</span>
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revocation Modal (CRT-04) */}
      {showRevokeModal && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-900">إبطال الشهادة ({selectedCert.certificateNo})</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              وفقاً للقاعدة CRT-04، تظل الشهادة في السجل ولكن بعلامة "ملغاة"، وتظهر كملغاة عند مسح الباركود أو فحص صفحة التحقق.
            </p>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
              placeholder="اكتب سبب الإبطال الموثق..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleRevoke}
                className="px-4 py-2 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
              >
                تأكيد الإبطال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
