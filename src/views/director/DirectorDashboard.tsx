import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Calendar,
  Sparkles,
  UserPlus,
  Settings,
  Coins,
  FolderKanban,
} from 'lucide-react';

export const DirectorDashboard: React.FC = () => {
  const {
    dbState,
    navigate,
    openAddMember,
    openSettings,
    openAssignTrainer,
    formatMoney,
  } = useApp();

  const totalMembers = dbState.members.length;
  const newEnrollees = dbState.members.filter((m) => m.status === 'new_enrollee').length;
  const activeMembers = dbState.members.filter((m) => m.status === 'active').length;
  const activeVolunteers = dbState.volunteers.filter((v) => v.status === 'active').length;
  const totalVolunteerHours = dbState.volunteers.reduce((sum, v) => sum + v.approvedHours, 0);

  // Financial overview
  const totalCashBalance = dbState.cashAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const pendingExpenses = dbState.expenses.filter((e) => e.status === 'pending_approval');
  const overrunExpenses = pendingExpenses.filter((e) => e.isBudgetOverrun);

  // Active courses
  const ongoingOfferings = dbState.offerings.filter((o) => o.status === 'in_progress' || o.status === 'open');

  // Average Course Rating
  const avgRating =
    dbState.evaluations.length > 0
      ? (
          dbState.evaluations.reduce(
            (sum, ev) => (sum + ev.ratings.content + ev.ratings.trainer + ev.ratings.organization + ev.ratings.benefit) / 4,
            0
          ) / dbState.evaluations.length
        ).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Page Title & Mission Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1E4E8C] via-[#163a69] to-[#0E2E5C] text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>نظام الحوكمة والرقابة الموحد · مركز الرواد للشباب</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            مرحباً بك، رئيس مجلس إدارة المركز
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed">
            متابعة شاملة لدورة حياة المنتسبين، إضافة ملتحقين جدد مباشرة، إسناد وتغيير المحاضرين للدورات، واعتماد المصروفات والحسابات.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            {/* Primary Action 1: Add New Enrollee directly */}
            <button
              onClick={openAddMember}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة ملتحق جديد مباشرة</span>
            </button>

            {/* Action: HR Management Directory */}
            <button
              onClick={() => navigate('hr_management')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-xs transition shadow-xs"
            >
              <FolderKanban className="w-4 h-4 text-teal-300" />
              <span>ملفات الأفراد (HR Management)</span>
            </button>

            {/* Action 2: Finance Review */}
            <button
              onClick={() => navigate('finance')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8A33D] hover:bg-[#d99430] text-slate-900 font-bold text-xs transition shadow-xs"
            >
              <Wallet className="w-4 h-4" />
              <span>مراجعة طلبات الصرف ({pendingExpenses.length})</span>
            </button>

            {/* Action 3: Review Applications */}
            <button
              onClick={() => navigate('applications')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-xs transition"
            >
              <FileText className="w-4 h-4" />
              <span>طلبات الالتحاق ({dbState.applications.filter((a) => a.status === 'submitted').length})</span>
            </button>

            {/* Action 4: Center Settings */}
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-xs transition"
            >
              <Settings className="w-4 h-4" />
              <span>إعدادات العملة والمظهر</span>
            </button>
          </div>
        </div>

        {/* Decorative corner shape */}
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Critical Alerts Banner (Budget Overrun / Approvals) */}
      {overrunExpenses.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 p-4 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-950 dark:text-amber-100 text-sm">
              تنبيه حوكمة مالي: يوجد {overrunExpenses.length} طلب مصروف يتجاوز الموازنة المعتمدة!
            </p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300 leading-relaxed">
              طلب المنسق مصروفاً بقيمة {formatMoney(overrunExpenses[0].amount)} لـ ({overrunExpenses[0].beneficiary}) يتطلب اعتمادكم الاستثنائي وفقاً للقاعدة BR-14 و UAT-14.
            </p>
          </div>
          <button
            onClick={() => navigate('finance')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shrink-0 transition"
          >
            فحص واعتماد
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Members with Direct Add button */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">إجمالي المنتسبين</span>
            <button
              onClick={openAddMember}
              className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1E4E8C] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
              title="إضافة ملتحق جديد"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {totalMembers}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span className="text-[#1A9E9A] font-bold">{activeMembers} نشط</span>
              <span>·</span>
              <span className="text-amber-600 font-bold">{newEnrollees} تحت التأهيل</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Volunteers */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ساعات التطوع الموثقة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#E8A33D] flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {totalVolunteerHours}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ساعة</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              أنجزها {activeVolunteers} متطوعين بمستويات مختلفة
            </div>
          </div>
        </div>

        {/* Metric 3: Cash Balance (Dynamic Currency) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">السيولة النقدية المتاحة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#2E9E5B] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {formatMoney(totalCashBalance)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              حساب الخزينة والمصرف (بالعملة المختارة)
            </div>
          </div>
        </div>

        {/* Metric 4: Ratings */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تقييم المستفيدين العام</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#1A9E9A] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {avgRating} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 5.0 ⭐</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              بناءً على {dbState.evaluations.length} تقييمات مجهولة معتمدة
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Offerings & Recent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Programs & Impact Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ongoing Offerings with Dynamic Trainer Assignment */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">الدورات والبرامج التثقيفية الجارية</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  معدلات الحضور والمحاضر المسؤول مع إمكانية إعادة التعيين
                </span>
              </div>
              <button
                onClick={() => navigate('courses')}
                className="text-xs font-bold text-[#1E4E8C] dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>كتالوج وإدارة الدورات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {ongoingOfferings.map((off) => {
                const percent = Math.round((off.enrolledCount / off.capacity) * 100);
                return (
                  <div
                    key={off.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{off.name}</span>
                        {/* Interactive Trainer Badge */}
                        <button
                          onClick={() =>
                            openAssignTrainer({
                              offeringId: off.id,
                              courseName: off.name,
                              currentTrainerId: off.trainerId,
                              currentTrainerName: off.trainerName,
                            })
                          }
                          className="flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold hover:bg-teal-200 dark:hover:bg-teal-900 transition"
                          title="انقر لتغيير المحاضر المسؤول عن هذه الدورة"
                        >
                          <GraduationCap className="w-3 h-3" />
                          <span>المحاضر: {off.trainerName} (تغيير ✎)</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{off.scheduleSummary}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                          {off.enrolledCount} / {off.capacity} مقعد
                        </span>
                        {off.waitlistCount > 0 && (
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            +{off.waitlistCount} في الانتظار
                          </span>
                        )}
                      </div>
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percent >= 100 ? 'bg-amber-500' : 'bg-[#1E4E8C]'}`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impact Report */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1A9E9A]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  تقرير الأثر التنموي (جاهز للجهات الداعمة)
                </h3>
              </div>
              <button
                onClick={() => window.print()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                طباعة التقرير الشامل
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-lg font-black text-[#1E4E8C] dark:text-blue-400 tabular-nums">1,240</span>
                <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">مستفيد مباشر</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-lg font-black text-[#1A9E9A] tabular-nums">188</span>
                <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">ساعة تدريب وتوعية</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-lg font-black text-[#E8A33D] tabular-nums">420</span>
                <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">مستفيد من الحملات</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatMoney(25000)}
                </span>
                <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">متوسط التكلفة/مستفيد</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Audit Log stream */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">سجل العمليات والرقابة (Audit Log)</h3>
              </div>
              <span className="text-[10px] text-slate-400">للقراءة فقط</span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {dbState.auditLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="pt-2 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">{log.timestamp.substring(11)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{log.details}</p>
                  <span className="text-[10px] text-[#1E4E8C] dark:text-blue-400 font-semibold block">
                    بواسطة: {log.userName}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => navigate('system_status')}
                className="text-xs text-[#1E4E8C] dark:text-blue-400 font-bold hover:underline"
              >
                عرض سجل التدقيق الكامل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
