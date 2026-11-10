import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export const GuardianPortalView: React.FC = () => {
  const { dbState, currentUser } = useApp();

  // Find linked children
  const guardianRecords = dbState.guardians.filter(
    (g) => (currentUser && g.userId === currentUser.id) || g.name.includes('أبو ريان')
  );

  const minorIds = guardianRecords.map((g) => g.memberId);
  const children = dbState.members.filter((m) => minorIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>بوابة ولي الأمر المعتمدة · متابعة الأبناء القاصرين</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          مرحباً بك، ولي الأمر ({guardianRecords[0]?.name || 'إبراهيم الأحمد - أبو ريان'})
        </h1>
        <p className="text-xs text-rose-100 mt-1 max-w-2xl leading-relaxed">
          إشعار فوري عند تسجيل غياب الأبناء (ATT-05 & UAT-06)، متابعة انتظام الحضور، والاطلاع على المستحقات والتقييمات.
        </p>
      </div>

      {/* Children Cards */}
      <div className="space-y-6">
        {children.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-400 text-xs">
            لا توجد حسابات أبناء مرتبطة حالياً
          </div>
        ) : (
          children.map((child) => {
            const childEnrollments = dbState.enrollments.filter(
              (e) => e.memberId === child.id && e.status !== 'withdrawn'
            );
            const childAttendance = dbState.attendanceRecords.filter((ar) => ar.memberId === child.id);
            const childCharges = dbState.memberCharges.filter((c) => c.memberId === child.id);

            return (
              <div
                key={child.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5"
              >
                {/* Child Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center font-black text-lg">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{child.name}</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          قاصر (16 سنة)
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        رقم العضوية: {child.membershipNo} · الصف الدراسي: {child.qualification}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">حالة العضوية:</span>
                    <span className="font-bold text-[#1E4E8C]">
                      {child.status === 'new_enrollee' ? 'ملتحق جديد (تأهيل)' : 'عضوية نشطة'}
                    </span>
                  </div>
                </div>

                {/* Grid: Courses & Attendance Log & Financials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Courses */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#1E4E8C]" />
                      <span>الدورات التدريبية المسجل بها:</span>
                    </h4>
                    <div className="space-y-2">
                      {childEnrollments.map((enr) => {
                        const off = dbState.offerings.find((o) => o.id === enr.offeringId);
                        return (
                          <div key={enr.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                            <span className="font-bold text-slate-900 block">{off?.name}</span>
                            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                              نسبة الحضور التراكمية: {enr.attendanceRate}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attendance Records */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#2E9E5B]" />
                      <span>سجل الحضور الأخير:</span>
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {childAttendance.map((ar) => {
                        const sess = dbState.sessions.find((s) => s.id === ar.sessionId);
                        return (
                          <div key={ar.id} className="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                            <span className="truncate max-w-[140px] text-slate-700">{sess?.title || 'جلسة'}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ar.status === 'present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {ar.status === 'present' ? 'حاضر ✓' : 'غائب ✗'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dues & Fees */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>الرسوم والمستحقات:</span>
                    </h4>
                    <div className="space-y-2">
                      {childCharges.map((chg) => {
                        const rem = Math.max(0, chg.amount - chg.discount - chg.paidAmount);
                        return (
                          <div key={chg.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                            <span className="font-bold text-slate-900 block truncate">{chg.title}</span>
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>المسدد: {chg.paidAmount} ج.م</span>
                              <span className="font-bold text-rose-700">المتبقي: {rem} ج.م</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
