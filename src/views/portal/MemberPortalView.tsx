import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import { DigitalMembershipCard } from '../../components/common/DigitalMembershipCard';
import {
  User,
  CreditCard,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  X,
} from 'lucide-react';

export const MemberPortalView: React.FC = () => {
  const { dbState, currentUser, navigate, showToast } = useApp();
  const [showCardModal, setShowCardModal] = useState(false);

  // Current member record
  const member =
    dbState.members.find((m) => currentUser && m.userId === currentUser.id) ||
    dbState.members.find((m) => m.status === 'new_enrollee') ||
    dbState.members[0];

  const onboardingItems = dbState.onboardingItems.filter((i) => i.memberId === member.id);
  const completedOnboarding = onboardingItems.filter((i) => i.completed).length;
  const onboardingPercent =
    onboardingItems.length > 0 ? Math.round((completedOnboarding / onboardingItems.length) * 100) : 100;

  const myEnrollments = dbState.enrollments.filter((e) => e.memberId === member.id && e.status !== 'withdrawn');
  const myCertificates = dbState.certificates.filter((c) => c.memberId === member.id);
  const myCharges = dbState.memberCharges.filter((c) => c.memberId === member.id);
  const myAttempts = dbState.examAttempts.filter((a) => a.memberId === member.id);

  return (
    <div className="space-y-6">
      {/* Welcome & Card Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E4E8C] via-[#163a69] to-[#0E2E5C] text-white p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900">
              {member.status === 'new_enrollee' ? 'ملتحق جديد (فترة التأهيل)' : 'منتسب نشط'}
            </span>
            <span className="font-mono text-xs text-amber-300 font-bold">{member.membershipNo}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            أهلاً بك، {member.name}
          </h1>
          <p className="text-xs text-slate-200">
            بوابتك الرقمية الشاملة لمتابعة التأهيل، الدورات، الاختبارات، وبطاقة عضويتك الذكية.
          </p>
        </div>

        <button
          onClick={() => setShowCardModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E8A33D] hover:bg-[#d99430] text-slate-900 font-black text-xs transition shadow-md self-start sm:self-auto shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>فتح بطاقة العضوية الرقمية (QR)</span>
        </button>
      </div>

      {/* Onboarding Checklist for New Enrollees (UAT-04) */}
      {member.status === 'new_enrollee' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">قائمة التأهيل والانضمام للمركز</h3>
                <span className="text-xs text-slate-500">
                  إتمام هذه البنود يؤهلك تلقائياً للترقية إلى منتسب نشط
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#1E4E8C] tabular-nums">
              {onboardingPercent}% ({completedOnboarding}/{onboardingItems.length})
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1E4E8C] h-full rounded-full transition-all duration-500"
              style={{ width: `${onboardingPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {onboardingItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  item.completed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2E9E5B] shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className="leading-snug">{item.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {item.completed ? 'مكتمل ✓' : 'متبقي'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: My Courses & My Exams & Financial Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1E4E8C]" />
                <h3 className="text-sm font-bold text-slate-900">دوراتي وبرامجي التدريبية</h3>
              </div>
              <button
                onClick={() => navigate('courses')}
                className="text-xs font-bold text-[#1E4E8C] hover:underline"
              >
                تصفح الكتالوج والتسجيل
              </button>
            </div>

            <div className="space-y-3">
              {myEnrollments.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  لست مسجلاً في أي دورة بعد. اضغط تصفح الكتالوج للانضمام.
                </div>
              ) : (
                myEnrollments.map((enr) => {
                  const off = dbState.offerings.find((o) => o.id === enr.offeringId);
                  return (
                    <div
                      key={enr.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{off?.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              enr.status === 'registered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {enr.status === 'registered' ? 'مسجل مؤكد' : 'في قائمة الانتظار'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{off?.scheduleSummary}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            نسبة الحضور: {enr.attendanceRate}%
                          </span>
                          {enr.examScore !== undefined && (
                            <span className="block text-[11px] text-[#1E4E8C] font-bold">
                              درجة الاختبار: {enr.examScore}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* My Certificates */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E8A33D]" />
                <h3 className="text-sm font-bold text-slate-900">شهاداتي الرسمية المعتمدة</h3>
              </div>
              <button
                onClick={() => navigate('certificates')}
                className="text-xs font-bold text-[#1E4E8C] hover:underline"
              >
                عرض الكل
              </button>
            </div>

            <div className="space-y-2">
              {myCertificates.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">
                  ستظهر شهاداتك المعتمدة هنا فور تحقيق شروط الإكمال بنجاح.
                </p>
              ) : (
                myCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{cert.courseOrEventTitle}</h4>
                      <span className="font-mono text-[10px] text-slate-400">{cert.verificationCode}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">معتمدة سارية ✓</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Financial Status */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">حالتي المالية والرسوم</h3>
            </div>

            <div className="space-y-3">
              {myCharges.length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد مطالبات أو مستحقات مالية عليك.</p>
              ) : (
                myCharges.map((chg) => {
                  const rem = Math.max(0, chg.amount - chg.discount - chg.paidAmount);
                  return (
                    <div key={chg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <div className="font-bold text-slate-900">{chg.title}</div>
                      <div className="flex justify-between text-slate-500 pt-1">
                        <span>المستحق:</span>
                        <span className="font-bold text-slate-800">{chg.amount} ج.م</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>المدفوع:</span>
                        <span className="font-bold text-emerald-700">{chg.paidAmount} ج.م</span>
                      </div>
                      <div className="flex justify-between font-bold text-rose-700 pt-1 border-t border-slate-200">
                        <span>المتبقي:</span>
                        <span>{rem} ج.م</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Membership Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setShowCardModal(false)}
              className="no-print absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <DigitalMembershipCard member={member} onClose={() => setShowCardModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
