import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus } from '../../types';
import { db } from '../../services/storage';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Check,
  Search,
} from 'lucide-react';

export const ApplicationsReviewView: React.FC = () => {
  const { dbState, currentUser, showToast, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'membership' | 'volunteer'>('membership');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = dbState.applications
    .filter((a) => a.type === activeTab)
    .filter((a) =>
      searchTerm
        ? a.applicantName.includes(searchTerm) || a.trackingNumber.includes(searchTerm) || a.phone.includes(searchTerm)
        : true
    );

  const pendingCount = dbState.applications.filter((a) => a.status === 'submitted').length;

  const handleApprove = (app: Application) => {
    try {
      db.reviewApplication(
        app.id,
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-coord', name: 'سارة الخطيب' },
        'approved',
        reviewerNotes || 'تم استيفاء الشروط والموافقة على الطلب'
      );
      showToast(`تم قبول الطلب بنجاح وتوليد حساب ورقم عضوية لـ ${app.applicantName}`, 'success');
      setSelectedApp(null);
      setReviewerNotes('');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء معالجة الطلب', 'error');
    }
  };

  const handleReject = () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      showToast('يرجى توضيح سبب الرفض المسجل.', 'warning');
      return;
    }

    db.reviewApplication(
      selectedApp.id,
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-coord', name: 'سارة الخطيب' },
      'rejected',
      reviewerNotes,
      rejectionReason
    );
    showToast(`تم رفض طلب ${selectedApp.applicantName} وإرسال إشعار بالسبب.`, 'info');
    setShowRejectModal(false);
    setSelectedApp(null);
    setRejectionReason('');
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">قيد المراجعة</span>;
      case 'interview':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">مقابلة مجدولة</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">تم القبول</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">مرفوض</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">مراجعة طلبات الالتحاق والتطوع</h1>
          <p className="text-xs text-slate-500 mt-1">
            فحص بيانات المتقدمين، اشتراط موافقة ولي أمر القاصر (BR-01)، وتوليد الحسابات وقوائم التأهيل آلياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('public_apply_member')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <UserCheck className="w-4 h-4 text-[#1E4E8C]" />
            <span>فتح نموذج التقديم العام</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Interactive Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl w-fit">
          <button
            onClick={() => {
              setActiveTab('membership');
              setSelectedApp(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'membership'
                ? 'bg-white text-[#1E4E8C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            طلبات الانتساب والعضوية ({dbState.applications.filter((a) => a.type === 'membership').length})
          </button>
          <button
            onClick={() => {
              setActiveTab('volunteer');
              setSelectedApp(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'volunteer'
                ? 'bg-white text-[#1E4E8C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            طلبات التطوع ({dbState.applications.filter((a) => a.type === 'volunteer').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو رقم المتابعة أو الهاتف..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Applications Grid / Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Applications (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredApps.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 border border-slate-200 text-center text-slate-400 text-xs">
              لا توجد طلبات مطابقة لخيارات البحث
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#1E4E8C] ring-2 ring-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E4E8C] flex items-center justify-center font-bold text-xs shrink-0">
                        {app.applicantName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {app.applicantName}
                          </h3>
                          {app.isMinor && (
                            <span className="text-[10px] px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 font-bold">
                              قاصر (&lt;18)
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{app.trackingNumber}</span>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 truncate">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono">{app.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{app.region}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{app.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Application Details & Decision Panel (Right col) */}
        <div>
          {selectedApp ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 sticky top-24">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">
                  {selectedApp.trackingNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedApp.applicantName}</h3>
                <span className="text-xs text-[#1A9E9A] font-semibold">
                  {selectedApp.type === 'membership' ? 'طلب انتساب وعضوية' : 'طلب تطوع ومبادرة'}
                </span>
              </div>

              {/* Application Details */}
              <div className="space-y-2.5 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">تاريخ الميلاد والمؤهل:</span>
                  <span className="font-medium text-slate-900">
                    {selectedApp.birthDate} · {selectedApp.qualification}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">مجالات الاهتمام:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedApp.interests.map((int, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedApp.skills && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">المهارات والخبرات:</span>
                    <p className="font-medium text-slate-900 mt-0.5">
                      {selectedApp.skills.join('، ')}
                    </p>
                  </div>
                )}

                {/* Minor Guardian & Consent Box (BR-01, UAT-02) */}
                {selectedApp.isMinor ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>بيانات وموافقة ولي الأمر (إلزامية للقاصر):</span>
                    </div>
                    <div className="text-[11px] text-amber-800 space-y-0.5 font-medium">
                      <p>الاسم: {selectedApp.guardianName || 'غير مسجل'}</p>
                      <p>الهاتف: {selectedApp.guardianPhone || 'غير مسجل'}</p>
                      <p className="text-emerald-700 font-bold">
                        ✓ الموافقة الإلكترونية على الميثاق مسجلة في النظام
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>تمت الموافقة الإلكترونية على ميثاق المركز وسياسة الخصوصية.</span>
                  </div>
                )}

                {/* Reviewer Notes Field */}
                {selectedApp.status === 'submitted' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ملاحظات المنسق / قرار اللجنة:
                    </label>
                    <textarea
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      rows={2}
                      placeholder="أدخل أي ملاحظات توجيهية للمتقدم..."
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedApp.status === 'submitted' ? (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(selectedApp)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold transition shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>قبول الطلب واعتماده</span>
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                  تم البت في هذا الطلب مسبقاً ({getStatusBadge(selectedApp.status)})
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>اختر طلباً من القائمة للاطلاع على تفاصيله واتخاذ القرار</span>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-900">تسجيل سبب رفض الطلب</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              وفقاً لقواعد الحوكمة (MEM-04)، يجب تسجيل سبب واضح لرفض الطلب لحفظه في سجل التدقيق وإشعار المتقدم به.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="مثال: العمر خارج الفئة المسموحة، أو عدم استيفاء الشروط..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
              >
                تأكيد الرفض المسجل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
