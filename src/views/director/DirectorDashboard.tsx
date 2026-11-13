import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Users,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Clock,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  UserPlus,
  Settings,
  FolderKanban,
  Database,
  Archive,
  HelpCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { MonthlyPerformanceReport } from '../../components/director/MonthlyPerformanceReport';

type AnalyticsTab = 'overview' | 'members' | 'courses' | 'finance';
type FinanceChartMode = 'accounts' | 'budgets' | 'cashflow';
type CourseFilterMode = 'active' | 'all';

export const DirectorDashboard: React.FC = () => {
  const {
    dbState,
    navigate,
    openAddMember,
    openSettings,
    openAssignTrainer,
    openBackupModal,
    openArchiveModal,
    openUserGuide,
    batchArchiveCompletedCourses,
    formatMoney,
    theme,
    currency,
  } = useApp();

  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('overview');
  const [financeMode, setFinanceMode] = useState<FinanceChartMode>('accounts');
  const [courseFilter, setCourseFilter] = useState<CourseFilterMode>('active');
  const [selectedMemberSlice, setSelectedMemberSlice] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#E2E8F0';
  const axisTickColor = isDark ? '#94A3B8' : '#64748B';
  const usdRate = dbState.settings.usdToIqdRate || 1310;

  const totalMembers = dbState.members.length;
  const archivedMembers = dbState.members.filter((m) => m.isArchived);
  const activeMembers = dbState.members.filter((m) => !m.isArchived && m.status === 'active').length;
  const newEnrollees = dbState.members.filter((m) => !m.isArchived && m.status === 'new_enrollee').length;
  const archivedOfferings = dbState.offerings.filter((o) => o.isArchived || o.status === 'archived');
  const totalArchivedCount = archivedMembers.length + archivedOfferings.length;
  const activeVolunteers = dbState.volunteers.filter((v) => v.status === 'active').length;
  const totalVolunteerHours = dbState.volunteers.reduce((sum, v) => sum + v.approvedHours, 0);

  // Financial overview
  const totalCashBalance = dbState.cashAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const pendingExpenses = dbState.expenses.filter((e) => e.status === 'pending_approval');
  const overrunExpenses = pendingExpenses.filter((e) => e.isBudgetOverrun);

  // Active courses
  const ongoingOfferings = dbState.offerings.filter(
    (o) => !o.isArchived && (o.status === 'in_progress' || o.status === 'open')
  );

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

  // --- Recharts Dataset 1: Member Statistics (إحصائيات المنتسبين) ---
  const memberStatusData = useMemo(() => {
    const active = dbState.members.filter((m) => !m.isArchived && m.status === 'active').length;
    const enrollee = dbState.members.filter((m) => !m.isArchived && m.status === 'new_enrollee').length;
    const graduated = dbState.members.filter((m) => !m.isArchived && m.status === 'graduated').length;
    const other = dbState.members.filter(
      (m) => m.isArchived || m.status === 'suspended' || m.status === 'withdrawn'
    ).length;

    return [
      { key: 'active', name: 'منتسب نشط', value: active, color: '#1E4E8C' },
      { key: 'new_enrollee', name: 'ملتحق جديد (تأهيل)', value: enrollee, color: '#E8A33D' },
      { key: 'graduated', name: 'خريج معتمد', value: graduated, color: '#1A9E9A' },
      { key: 'other', name: 'موقوف / مؤرشف', value: other, color: '#94A3B8' },
    ].filter((item) => item.value > 0);
  }, [dbState.members]);

  const memberDemographicsData = useMemo(() => {
    const adults = dbState.members.filter((m) => !m.isArchived && !m.isMinor).length;
    const minors = dbState.members.filter((m) => !m.isArchived && m.isMinor).length;
    const students = dbState.members.filter((m) => !m.isArchived && m.category === 'student').length;
    const regular = dbState.members.filter((m) => !m.isArchived && m.category === 'regular').length;
    return [
      { category: 'بالغون (+18)', count: adults },
      { category: 'قاصرون (<18)', count: minors },
      { category: 'فئة الطلاب', count: students },
      { category: 'عضوية عامة', count: regular },
    ];
  }, [dbState.members]);

  // --- Recharts Dataset 2: Active Courses Occupancy (الدورات النشطة) ---
  const coursesChartData = useMemo(() => {
    const source =
      courseFilter === 'active'
        ? dbState.offerings.filter((o) => !o.isArchived && (o.status === 'in_progress' || o.status === 'open'))
        : dbState.offerings.filter((o) => !o.isArchived);

    return source.map((off) => {
      const course = dbState.courses.find((c) => c.id === off.courseId);
      const shortTitle = course ? course.title.split(' ').slice(0, 3).join(' ') : off.name;
      const available = Math.max(0, off.capacity - off.enrolledCount);
      const occupancyRate = off.capacity > 0 ? Math.round((off.enrolledCount / off.capacity) * 100) : 0;
      return {
        id: off.id,
        name: shortTitle,
        fullName: `${course?.title || off.name} (${off.name})`,
        trainerName: off.trainerName,
        enrolled: off.enrolledCount,
        available,
        waitlist: off.waitlistCount,
        capacity: off.capacity,
        occupancyRate,
      };
    });
  }, [dbState.offerings, dbState.courses, courseFilter]);

  // --- Recharts Dataset 3: Financial Distribution (التوزيع المالي للمركز) ---
  const toDisplayNumeric = (amountInIQD: number) =>
    currency === 'USD' ? Number((amountInIQD / usdRate).toFixed(2)) : Math.round(amountInIQD);

  const financialAccountsData = useMemo(() => {
    const colors = ['#1E4E8C', '#1A9E9A', '#E8A33D', '#6366F1'];
    return dbState.cashAccounts.map((acc, idx) => ({
      id: acc.id,
      name: acc.name.split('(')[0].trim(),
      fullName: acc.name,
      rawAmount: acc.currentBalance,
      value: toDisplayNumeric(acc.currentBalance),
      color: colors[idx % colors.length],
    }));
  }, [dbState.cashAccounts, currency, usdRate]);

  const financialBudgetsData = useMemo(() => {
    return dbState.budgets.map((b) => ({
      name: b.targetTitle.split(' ').slice(0, 3).join(' '),
      fullName: b.targetTitle,
      allocated: toDisplayNumeric(b.allocatedAmount),
      spent: toDisplayNumeric(b.spentAmount),
      rawAllocated: b.allocatedAmount,
      rawSpent: b.spentAmount,
      utilization: b.allocatedAmount > 0 ? Math.round((b.spentAmount / b.allocatedAmount) * 100) : 0,
    }));
  }, [dbState.budgets, currency, usdRate]);

  const financialCashflowData = useMemo(() => {
    const totalReceipts = dbState.transactions
      .filter((t) => t.type === 'receipt')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDonations = dbState.donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDisbursed = dbState.transactions
      .filter((t) => t.type === 'disbursement')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingTotal = dbState.expenses
      .filter((e) => e.status === 'pending_approval' || e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);

    return [
      {
        name: 'الإيرادات والمقبوضات',
        value: toDisplayNumeric(totalReceipts),
        rawAmount: totalReceipts,
        color: '#2E9E5B',
      },
      {
        name: 'التبرعات والرعايات',
        value: toDisplayNumeric(totalDonations),
        rawAmount: totalDonations,
        color: '#1E4E8C',
      },
      {
        name: 'المصروفات المنفذة',
        value: toDisplayNumeric(totalDisbursed),
        rawAmount: totalDisbursed,
        color: '#E8A33D',
      },
      {
        name: 'التزامات بانتظار الصرف',
        value: toDisplayNumeric(pendingTotal),
        rawAmount: pendingTotal,
        color: '#D64545',
      },
    ];
  }, [dbState.transactions, dbState.donations, dbState.expenses, currency, usdRate]);

  const formatAxisCurrency = (val: number) => {
    if (currency === 'USD') {
      return val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`;
    }
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
    return `${val}`;
  };

  const selectedMemberInfo = memberStatusData.find((item) => item.key === selectedMemberSlice) || null;
  const totalNonArchivedMembers = dbState.members.filter((m) => !m.isArchived).length;

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

            {/* Action 5: Backup & Disaster Recovery (JSON) */}
            <button
              onClick={openBackupModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-bold text-xs backdrop-blur-xs transition shadow-xs"
              title="تصدير واستيراد قاعدة البيانات المحلية (JSON)"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>نسخ احتياطي واستيراد (JSON)</span>
            </button>

            {/* Action 6: Central Archive */}
            <button
              onClick={openArchiveModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 font-bold text-xs backdrop-blur-xs transition shadow-xs"
              title="قسم الأرشيف: حفظ واسترجاع سجلات المنتسبين والدورات المنتهية"
            >
              <Archive className="w-4 h-4 text-purple-300" />
              <span>قسم الأرشيف ({totalArchivedCount})</span>
            </button>

            {/* Action 7: Simple User Guide */}
            <button
              onClick={openUserGuide}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/40 font-bold text-xs backdrop-blur-xs transition shadow-xs"
              title="دليل المستخدم والمساعدة (خطوات مبسطة)"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>دليل الاستخدام المبسط 📖</span>
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

      {/* Interactive Recharts Analytics Dashboard (إحصائيات المنتسبين، الدورات النشطة، والتوزيع المالي) */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Section Header & Interactive View Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E4E8C] dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                لوحة التحليلات التفاعلية للقيادة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                إحصائيات المنتسبين · إشغال الدورات النشطة · التوزيع المالي ({currency === 'USD' ? 'بالدولار $' : 'بالدينار العراقي د.ع'})
              </p>
            </div>
          </div>

          {/* Interactive Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
            {(
              [
                { id: 'overview', label: 'النظرة الشاملة' },
                { id: 'members', label: 'إحصائيات المنتسبين' },
                { id: 'courses', label: 'الدورات النشطة' },
                { id: 'finance', label: 'التوزيع المالي' },
              ] as { id: AnalyticsTab; label: string }[]
            ).map((tab) => {
              const isActive = analyticsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAnalyticsTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-[#1E4E8C] dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Charts Grid */}
        <div
          className={`grid gap-6 ${
            analyticsTab === 'overview' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Panel 1: Member Statistics (إحصائيات المنتسبين) */}
          {(analyticsTab === 'overview' || analyticsTab === 'members') && (
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-950/40 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#1E4E8C] dark:text-blue-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      إحصائيات المنتسبين وتوزيع الحالات
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      اضغط على أي شريحة لعرض التفاصيل · الإجمالي النشط {totalNonArchivedMembers} من {totalMembers}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('hr_management')}
                  className="text-[11px] font-bold text-[#1E4E8C] dark:text-blue-400 hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <span>ملفات الأفراد</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {memberStatusData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  لا توجد بيانات منتسبين متاحة للعرض حالياً
                </div>
              ) : (
                <div
                  className={`grid gap-4 items-center ${
                    analyticsTab === 'members' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-5'
                  }`}
                >
                  {/* Donut Chart */}
                  <div className={analyticsTab === 'members' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 items-center' : 'sm:col-span-3'}>
                    <div className="h-60 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={memberStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={82}
                            paddingAngle={3}
                            onClick={(_, index) => {
                              const slice = memberStatusData[index];
                              if (slice) {
                                setSelectedMemberSlice((prev) => (prev === slice.key ? null : slice.key));
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {memberStatusData.map((entry) => {
                              const dimmed = selectedMemberSlice && selectedMemberSlice !== entry.key;
                              return (
                                <Cell
                                  key={entry.key}
                                  fill={entry.color}
                                  fillOpacity={dimmed ? 0.35 : 1}
                                  stroke={isDark ? '#0f172a' : '#ffffff'}
                                  strokeWidth={2}
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const item = payload[0].payload;
                              const pct = totalMembers > 0 ? Math.round((item.value / totalMembers) * 100) : 0;
                              return (
                                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 shadow-md text-xs">
                                  <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                                  <div className="text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums">
                                    العدد: <span className="font-extrabold">{item.value}</span> ({pct}%)
                                  </div>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Total Counter */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                          {selectedMemberInfo ? selectedMemberInfo.value : totalMembers}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {selectedMemberInfo ? selectedMemberInfo.name.split(' ')[0] : 'إجمالي'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Breakdown List */}
                    {analyticsTab === 'members' && (
                      <div className="space-y-2">
                        {memberStatusData.map((item) => {
                          const pct = totalMembers > 0 ? Math.round((item.value / totalMembers) * 100) : 0;
                          const isSelected = selectedMemberSlice === item.key;
                          return (
                            <button
                              key={item.key}
                              onClick={() => setSelectedMemberSlice((prev) => (prev === item.key ? null : item.key))}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                                isSelected
                                  ? 'bg-white dark:bg-slate-900 ring-1 ring-[#1E4E8C] dark:ring-blue-400'
                                  : 'bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                                {item.value}{' '}
                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                                  ({pct}%)
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Overview Compact Legend vs Expanded Demographics Chart */}
                  {analyticsTab === 'overview' ? (
                    <div className="sm:col-span-2 space-y-2">
                      {memberStatusData.map((item) => {
                        const pct = totalMembers > 0 ? Math.round((item.value / totalMembers) * 100) : 0;
                        const isSelected = selectedMemberSlice === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setSelectedMemberSlice((prev) => (prev === item.key ? null : item.key))}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                              isSelected
                                ? 'bg-white dark:bg-slate-900 ring-1 ring-[#1E4E8C] dark:ring-blue-400'
                                : 'bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white tabular-nums shrink-0 mr-2">
                              {item.value} ({pct}%)
                            </span>
                          </button>
                        );
                      })}
                      {selectedMemberInfo && (
                        <button
                          onClick={() => setSelectedMemberSlice(null)}
                          className="w-full text-[11px] font-bold text-[#1E4E8C] dark:text-blue-400 hover:underline pt-1"
                        >
                          إعادة ضبط التحديد ({selectedMemberInfo.name})
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        التركيبة الديموغرافية وفئات المنتسبين (غير المؤرشفين)
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={memberDemographicsData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                          <XAxis dataKey="category" tick={{ fill: axisTickColor, fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fill: axisTickColor, fontSize: 11 }} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const row = payload[0].payload;
                              return (
                                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 shadow-md text-xs">
                                  <div className="font-bold text-slate-900 dark:text-white">{row.category}</div>
                                  <div className="text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums">
                                    العدد: <span className="font-extrabold">{row.count}</span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar dataKey="count" name="عدد المنتسبين" fill="#1A9E9A" radius={[6, 6, 0, 0]} maxBarSize={44} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Panel 2: Financial Distribution (التوزيع المالي للمركز) */}
          {(analyticsTab === 'overview' || analyticsTab === 'finance') && (
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-950/40 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#2E9E5B]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      التوزيع المالي للمركز
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      السيولة المتاحة: <span className="font-bold tabular-nums">{formatMoney(totalCashBalance)}</span>
                    </p>
                  </div>
                </div>

                {/* Finance Mode Switch */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                  {(
                    [
                      { id: 'accounts', label: 'الحسابات' },
                      { id: 'budgets', label: 'الميزانيات' },
                      { id: 'cashflow', label: 'التدفق المالي' },
                    ] as { id: FinanceChartMode; label: string }[]
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setFinanceMode(mode.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                        financeMode === mode.id
                          ? 'bg-[#1E4E8C] text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {financeMode === 'accounts' && (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                  <div className="sm:col-span-3 h-60 w-full">
                    {financialAccountsData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        لا توجد حسابات نقدية مسجلة
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialAccountsData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={80}
                            paddingAngle={3}
                          >
                            {financialAccountsData.map((entry) => (
                              <Cell
                                key={entry.id}
                                fill={entry.color}
                                stroke={isDark ? '#0f172a' : '#ffffff'}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const row = payload[0].payload;
                              const pct =
                                totalCashBalance > 0 ? Math.round((row.rawAmount / totalCashBalance) * 100) : 0;
                              return (
                                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 shadow-md text-xs">
                                  <div className="font-bold text-slate-900 dark:text-white">{row.fullName}</div>
                                  <div className="text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5 tabular-nums">
                                    {formatMoney(row.rawAmount)} ({pct}%)
                                  </div>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    {financialAccountsData.map((acc) => {
                      const pct = totalCashBalance > 0 ? Math.round((acc.rawAmount / totalCashBalance) * 100) : 0;
                      return (
                        <div
                          key={acc.id}
                          className="px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-900/70 space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: acc.color }}
                              />
                              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {acc.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                              {pct}%
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums pr-4">
                            {formatMoney(acc.rawAmount)}
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => navigate('finance')}
                      className="w-full text-right text-[11px] font-bold text-[#1E4E8C] dark:text-blue-400 hover:underline pt-1 flex items-center justify-end gap-0.5"
                    >
                      <span>تفاصيل الحسابات والمالية</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {financeMode === 'budgets' && (
                <div className="h-64 w-full">
                  {financialBudgetsData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      لا توجد موازنات مسجلة حالياً
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialBudgetsData} margin={{ top: 10, right: 10, left: 4, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: axisTickColor, fontSize: 11 }} />
                        <YAxis tickFormatter={formatAxisCurrency} tick={{ fill: axisTickColor, fontSize: 11 }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const row = payload[0].payload;
                            return (
                              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 shadow-md text-xs space-y-1">
                                <div className="font-bold text-slate-900 dark:text-white">{row.fullName}</div>
                                <div className="text-blue-600 dark:text-blue-400 tabular-nums">
                                  المعتمد: <span className="font-bold">{formatMoney(row.rawAllocated)}</span>
                                </div>
                                <div className="text-amber-600 dark:text-amber-400 tabular-nums">
                                  المنصرف: <span className="font-bold">{formatMoney(row.rawSpent)}</span> ({row.utilization}%)
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="allocated" name="الميزانية المعتمدة" fill="#1E4E8C" radius={[6, 6, 0, 0]} maxBarSize={36} />
                        <Bar dataKey="spent" name="المنصرف الفعلي" fill="#E8A33D" radius={[6, 6, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}

              {financeMode === 'cashflow' && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialCashflowData} margin={{ top: 10, right: 10, left: 4, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: axisTickColor, fontSize: 10 }} />
                      <YAxis tickFormatter={formatAxisCurrency} tick={{ fill: axisTickColor, fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const row = payload[0].payload;
                          return (
                            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 shadow-md text-xs">
                              <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
                              <div className="font-extrabold mt-0.5 tabular-nums" style={{ color: row.color }}>
                                {formatMoney(row.rawAmount)}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="value" name="القيمة المالية" radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {financialCashflowData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Panel 3: Active Courses & Seat Capacity (الدورات النشطة) */}
          {(analyticsTab === 'overview' || analyticsTab === 'courses') && (
            <div
              className={`rounded-xl bg-slate-50/70 dark:bg-slate-950/40 p-4 sm:p-5 space-y-4 ${
                analyticsTab === 'overview' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#1A9E9A]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      الدورات النشطة ومعدلات إشغال المقاعد
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      مقارنة المسجلين فعلياً بالمقاعد المتبقية وقوائم الانتظار لكل دورة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setCourseFilter('active')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                        courseFilter === 'active'
                          ? 'bg-[#1A9E9A] text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      النشطة والمفتوحة
                    </button>
                    <button
                      onClick={() => setCourseFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                        courseFilter === 'all'
                          ? 'bg-[#1A9E9A] text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      كل الدورات ({dbState.offerings.filter((o) => !o.isArchived).length})
                    </button>
                  </div>

                  <button
                    onClick={() => navigate('courses')}
                    className="text-[11px] font-bold text-[#1E4E8C] dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>إدارة الدورات</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {coursesChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  لا توجد دورات مطابقة للتصفية الحالية
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coursesChartData} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: axisTickColor, fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: axisTickColor, fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const row = payload[0].payload;
                          return (
                            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 shadow-md text-xs space-y-1">
                              <div className="font-bold text-slate-900 dark:text-white">{row.fullName}</div>
                              <div className="text-slate-500 dark:text-slate-400">
                                المحاضر: <span className="font-semibold text-slate-700 dark:text-slate-200">{row.trainerName}</span>
                              </div>
                              <div className="pt-1 flex items-center gap-3 tabular-nums">
                                <span className="text-[#1E4E8C] dark:text-blue-400 font-bold">
                                  مسجل: {row.enrolled}/{row.capacity} ({row.occupancyRate}%)
                                </span>
                                <span className="text-teal-600 dark:text-teal-400">متاح: {row.available}</span>
                                {row.waitlist > 0 && (
                                  <span className="text-amber-600 dark:text-amber-400">انتظار: {row.waitlist}</span>
                                )}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar
                        dataKey="enrolled"
                        stackId="seats"
                        name="المسجلون حالياً"
                        fill="#1E4E8C"
                        radius={[0, 0, 0, 0]}
                        maxBarSize={46}
                      />
                      <Bar
                        dataKey="available"
                        stackId="seats"
                        name="مقاعد متبقية"
                        fill="#1A9E9A"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={46}
                      />
                      <Bar
                        dataKey="waitlist"
                        name="قائمة الانتظار"
                        fill="#E8A33D"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Visual Monthly Performance Report with Recharts */}
      <MonthlyPerformanceReport />

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

          {/* Archive Center Widget (Section for Archiving Members & Courses) */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#1E4E8C] text-white p-6 shadow-md border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>قسم الأرشيف المركزي (حفظ السجلات القديمة)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                      تنظيم الجداول النشطة
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    نقل سجلات المنتسبين والدورات التدريبية المنتهية للأرشيف لتقليل الازدحام مع الحفاظ عليها للرجوع إليها لاحقاً.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openArchiveModal}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>فتح قسم الأرشيف ({totalArchivedCount})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] text-slate-300 block">سجلات المنتسبين المؤرشفة:</span>
                <span className="text-lg font-black text-amber-300 tabular-nums">
                  {archivedMembers.length}{' '}
                  <span className="text-xs font-normal text-slate-300">سجل</span>
                </span>
                <p className="text-[10px] text-slate-300 mt-0.5">خريجون، منسحبون، أو مكتملو التأهيل</p>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] text-slate-300 block">الدورات والدفعات المؤرشفة:</span>
                <span className="text-lg font-black text-teal-300 tabular-nums">
                  {archivedOfferings.length}{' '}
                  <span className="text-xs font-normal text-slate-300">دفعة</span>
                </span>
                <p className="text-[10px] text-slate-300 mt-0.5">دورات انتهت جلساتها بنجاح</p>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-300 block">إجراء أرشفة سريع:</span>
                  <span className="text-xs font-bold text-emerald-300">حماية البيانات محلياً</span>
                </div>
                <button
                  onClick={batchArchiveCompletedCourses}
                  className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] transition text-center"
                >
                  أرشفة الدورات المنتهية الآن ⚡
                </button>
              </div>
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
