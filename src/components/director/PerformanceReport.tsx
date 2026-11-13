import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Users,
  GraduationCap,
  CalendarRange,
  Download,
  LineChart as LineChartIcon,
} from 'lucide-react';

type TimeRangeOption = '6m' | '12m' | 'all';
type TrendFocusTab = 'overview' | 'members' | 'courses';

interface HistoricalTrendPoint {
  monthKey: string;
  monthLabel: string;
  newMembers: number;
  cumulativeMembers: number;
  launchedCourses: number;
  activeCourses: number;
  cumulativeCourses: number;
  courseEnrollmentsMonthly: number;
  cumulativeCourseEnrollments: number;
}

const ARABIC_MONTHS: Record<string, string> = {
  '01': 'يناير',
  '02': 'فبراير',
  '03': 'مارس',
  '04': 'أبريل',
  '05': 'مايو',
  '06': 'يونيو',
  '07': 'يوليو',
  '08': 'أغسطس',
  '09': 'سبتمبر',
  '10': 'أكتوبر',
  '11': 'نوفمبر',
  '12': 'ديسمبر',
};

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const mName = ARABIC_MONTHS[month] || month;
  return `${mName} ${year}`;
}

function addMonths(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function buildMonthSequence(startKey: string, endKey: string): string[] {
  const result: string[] = [];
  let cursor = startKey;
  let guard = 0;
  while (cursor <= endKey && guard < 48) {
    result.push(cursor);
    cursor = addMonths(cursor, 1);
    guard++;
  }
  return result;
}

export const PerformanceReport: React.FC = () => {
  const { dbState, theme } = useApp();

  const [timeRange, setTimeRange] = useState<TimeRangeOption>('12m');
  const [focusTab, setFocusTab] = useState<TrendFocusTab>('overview');
  const [visibleLines, setVisibleLines] = useState<{
    cumulativeMembers: boolean;
    newMembers: boolean;
    cumulativeCourseEnrollments: boolean;
    activeCourses: boolean;
  }>({
    cumulativeMembers: true,
    newMembers: true,
    cumulativeCourseEnrollments: true,
    activeCourses: true,
  });

  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#E2E8F0';
  const axisTickColor = isDark ? '#94A3B8' : '#64748B';

  // Aggregate genuine historical monthly trends from dbState (members, offerings, enrollments)
  const fullHistoricalSeries: HistoricalTrendPoint[] = useMemo(() => {
    const members = dbState.members;
    const offerings = dbState.offerings;

    const anchorEndMonth = '2026-11';
    const earliestMemberMonth = members
      .map((m) => m.joinedAt?.slice(0, 7))
      .filter(Boolean)
      .sort()[0];
    const earliestOfferingMonth = offerings
      .map((o) => o.startDate?.slice(0, 7))
      .filter(Boolean)
      .sort()[0];

    const earliest = [earliestMemberMonth, earliestOfferingMonth, '2025-06']
      .filter(Boolean)
      .sort()[0] as string;

    const startMonth = earliest < '2025-05' ? '2025-05' : earliest;
    const months = buildMonthSequence(startMonth, anchorEndMonth);

    return months.map((monthKey) => {
      const newMembers = members.filter((m) => m.joinedAt?.slice(0, 7) === monthKey).length;
      const cumulativeMembers = members.filter(
        (m) => m.joinedAt && m.joinedAt.slice(0, 7) <= monthKey
      ).length;

      const launchedCourses = offerings.filter(
        (o) => o.startDate && o.startDate.slice(0, 7) === monthKey
      ).length;

      const activeCourses = offerings.filter((o) => {
        const s = o.startDate?.slice(0, 7);
        const e = o.endDate?.slice(0, 7) || s;
        return Boolean(s && s <= monthKey && e >= monthKey);
      }).length;

      const cumulativeCourses = offerings.filter(
        (o) => o.startDate && o.startDate.slice(0, 7) <= monthKey
      ).length;

      const courseEnrollmentsMonthly = offerings
        .filter((o) => o.startDate && o.startDate.slice(0, 7) === monthKey)
        .reduce((sum, o) => sum + o.enrolledCount, 0);

      const cumulativeCourseEnrollments = offerings
        .filter((o) => o.startDate && o.startDate.slice(0, 7) <= monthKey)
        .reduce((sum, o) => sum + o.enrolledCount, 0);

      return {
        monthKey,
        monthLabel: formatMonthLabel(monthKey),
        newMembers,
        cumulativeMembers,
        launchedCourses,
        activeCourses,
        cumulativeCourses,
        courseEnrollmentsMonthly,
        cumulativeCourseEnrollments,
      };
    });
  }, [dbState.members, dbState.offerings]);

  const filteredSeries = useMemo(() => {
    if (timeRange === '6m') return fullHistoricalSeries.slice(-6);
    if (timeRange === '12m') return fullHistoricalSeries.slice(-12);
    return fullHistoricalSeries;
  }, [fullHistoricalSeries, timeRange]);

  const summaryStats = useMemo(() => {
    if (filteredSeries.length === 0) {
      return {
        startMembers: 0,
        endMembers: 0,
        memberGrowthPct: 0,
        avgMonthlyNewMembers: 0,
        peakMonthLabel: '—',
        peakNewMembers: 0,
        totalCourseSeats: 0,
        peakActiveCourses: 0,
      };
    }

    const first = filteredSeries[0];
    const last = filteredSeries[filteredSeries.length - 1];
    const totalNewInRange = filteredSeries.reduce((s, p) => s + p.newMembers, 0);
    const avgMonthlyNewMembers = Number((totalNewInRange / filteredSeries.length).toFixed(1));
    const memberGrowthPct =
      first.cumulativeMembers > 0
        ? Math.round(((last.cumulativeMembers - first.cumulativeMembers) / first.cumulativeMembers) * 100)
        : last.cumulativeMembers > 0
        ? 100
        : 0;

    const peakMemberMonth = filteredSeries.reduce(
      (best, cur) => (cur.newMembers >= best.newMembers ? cur : best),
      filteredSeries[0]
    );
    const peakActiveCourses = Math.max(...filteredSeries.map((p) => p.activeCourses), 0);

    return {
      startMembers: first.cumulativeMembers,
      endMembers: last.cumulativeMembers,
      memberGrowthPct,
      avgMonthlyNewMembers,
      peakMonthLabel: peakMemberMonth.monthLabel,
      peakNewMembers: peakMemberMonth.newMembers,
      totalCourseSeats: last.cumulativeCourseEnrollments,
      peakActiveCourses,
    };
  }, [filteredSeries]);

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one series remains visible in overview
      if (!next.cumulativeMembers && !next.newMembers && !next.cumulativeCourseEnrollments && !next.activeCourses) {
        return prev;
      }
      return next;
    });
  };

  const handleExportTrendCSV = () => {
    const headers = [
      'الشهر',
      'ملتحقون جدد',
      'إجمالي المنتسبين التراكمي',
      'الدورات النشطة',
      'إجمالي الدورات التراكمي',
      'مقاعد الدورات التراكمية',
    ];
    const rows = filteredSeries.map((row) => [
      row.monthLabel,
      row.newMembers,
      row.cumulativeMembers,
      row.activeCourses,
      row.cumulativeCourses,
      row.cumulativeCourseEnrollments,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `PerformanceReport_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = dbState.members.length > 0 || dbState.offerings.length > 0;

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#1A9E9A] dark:text-teal-400 flex items-center justify-center shrink-0">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              تقرير تحليل النمو والاتجاهات التاريخية (Performance Report)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              رصد زمني لنمو المنتسبين وتطور التسجيل في الدورات التدريبية عبر مسارات خطية تفاعلية
            </p>
          </div>
        </div>

        {/* Toolbar: Timeframe + CSV Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            <CalendarRange className="w-3.5 h-3.5 text-slate-400 mr-1.5 ml-0.5 shrink-0" />
            {(
              [
                { id: '6m', label: '6 أشهر' },
                { id: '12m', label: '12 شهراً' },
                { id: 'all', label: 'السجل الكامل' },
              ] as { id: TimeRangeOption; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeRange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  timeRange === opt.id
                    ? 'bg-white dark:bg-slate-900 text-[#1E4E8C] dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportTrendCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* Key Historical Metrics Strip (Hairline grid, no card sandwiches) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            معدل نمو قاعدة المنتسبين
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              +{summaryStats.memberGrowthPct}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              من {summaryStats.startMembers} إلى {summaryStats.endMembers}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            متوسط الاستقطاب الشهري
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {summaryStats.avgMonthlyNewMembers}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">منتسب / شهر</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            ذروة التسجيل الشهري
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1E4E8C] dark:text-blue-400 tabular-nums">
              {summaryStats.peakNewMembers}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              في {summaryStats.peakMonthLabel}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            إجمالي مقاعد الدورات المسجلة
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1A9E9A] tabular-nums">
              {summaryStats.totalCourseSeats}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              ذروة {summaryStats.peakActiveCourses} دورات متزامنة
            </span>
          </div>
        </div>
      </div>

      {/* Focus Tabs & Interactive Line Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 self-start">
          {(
            [
              { id: 'overview', label: 'النمو العام المدمج', icon: TrendingUp },
              { id: 'members', label: 'تحليل المنتسبين', icon: Users },
              { id: 'courses', label: 'تحليل الدورات', icon: GraduationCap },
            ] as { id: TrendFocusTab; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map((tab) => {
            const Icon = tab.icon;
            const active = focusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFocusTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-[#1E4E8C] dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {focusTab === 'overview' && (
          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                { key: 'cumulativeMembers', label: 'إجمالي المنتسبين', color: '#1E4E8C' },
                { key: 'cumulativeCourseEnrollments', label: 'مقاعد الدورات', color: '#1A9E9A' },
                { key: 'newMembers', label: 'ملتحقون جدد/شهر', color: '#E8A33D' },
                { key: 'activeCourses', label: 'دورات نشطة/شهر', color: '#6366F1' },
              ] as { key: keyof typeof visibleLines; label: string; color: string }[]
            ).map((item) => {
              const active = visibleLines[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggleLine(item.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    active
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-transparent text-slate-400 dark:text-slate-600 line-through'
                  }`}
                >
                  <span
                    className="w-2.5 h-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recharts Line Chart Container */}
      {!hasData || filteredSeries.length === 0 ? (
        <div className="h-72 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-500 dark:text-slate-400">
          لا توجد سجلات تاريخية كافية لعرض المنحنى الزمني حالياً
        </div>
      ) : (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {focusTab === 'overview' ? (
              <LineChart data={filteredSeries} margin={{ top: 12, right: 16, left: 4, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const row = payload[0].payload as HistoricalTrendPoint;
                    return (
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 shadow-md text-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                          {row.monthLabel}
                        </div>
                        <div className="text-[#1E4E8C] dark:text-blue-400 tabular-nums">
                          إجمالي المنتسبين التراكمي: <span className="font-extrabold">{row.cumulativeMembers}</span>
                        </div>
                        <div className="text-[#1A9E9A] tabular-nums">
                          مقاعد الدورات التراكمية: <span className="font-extrabold">{row.cumulativeCourseEnrollments}</span>
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 tabular-nums">
                          منضمون جدد بالشهر: <span className="font-extrabold">{row.newMembers}</span>
                        </div>
                        <div className="text-indigo-600 dark:text-indigo-400 tabular-nums">
                          دورات نشطة بالشهر: <span className="font-extrabold">{row.activeCourses}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                {visibleLines.cumulativeMembers && (
                  <Line
                    type="monotone"
                    dataKey="cumulativeMembers"
                    name="إجمالي المنتسبين"
                    stroke="#1E4E8C"
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: '#1E4E8C', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {visibleLines.cumulativeCourseEnrollments && (
                  <Line
                    type="monotone"
                    dataKey="cumulativeCourseEnrollments"
                    name="مقاعد الدورات التراكمية"
                    stroke="#1A9E9A"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#1A9E9A', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                )}
                {visibleLines.newMembers && (
                  <Line
                    type="monotone"
                    dataKey="newMembers"
                    name="ملتحقون جدد"
                    stroke="#E8A33D"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#E8A33D', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                )}
                {visibleLines.activeCourses && (
                  <Line
                    type="monotone"
                    dataKey="activeCourses"
                    name="الدورات النشطة"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            ) : focusTab === 'members' ? (
              <LineChart data={filteredSeries} margin={{ top: 12, right: 16, left: 4, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const row = payload[0].payload as HistoricalTrendPoint;
                    return (
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 shadow-md text-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">{row.monthLabel}</div>
                        <div className="text-[#1E4E8C] dark:text-blue-400 tabular-nums">
                          الرصيد التراكمي للمنتسبين: <span className="font-extrabold">{row.cumulativeMembers}</span>
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 tabular-nums">
                          انضمامات الشهر: <span className="font-extrabold">+{row.newMembers}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={summaryStats.avgMonthlyNewMembers}
                  stroke="#E8A33D"
                  strokeDasharray="3 3"
                  label={{
                    value: `متوسط الانضمام (${summaryStats.avgMonthlyNewMembers})`,
                    fill: axisTickColor,
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeMembers"
                  name="الرصيد التراكمي للمنتسبين"
                  stroke="#1E4E8C"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1E4E8C' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="newMembers"
                  name="المنضمون الجدد بالشهر"
                  stroke="#E8A33D"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#E8A33D' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <LineChart data={filteredSeries} margin={{ top: 12, right: 16, left: 4, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const row = payload[0].payload as HistoricalTrendPoint;
                    return (
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 shadow-md text-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">{row.monthLabel}</div>
                        <div className="text-[#1A9E9A] tabular-nums">
                          إجمالي مقاعد الدورات التراكمي: <span className="font-extrabold">{row.cumulativeCourseEnrollments}</span>
                        </div>
                        <div className="text-indigo-600 dark:text-indigo-400 tabular-nums">
                          مسجلون جدد بالشهر: <span className="font-extrabold">{row.courseEnrollmentsMonthly}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 tabular-nums">
                          الدورات النشطة: {row.activeCourses} · التراكمي: {row.cumulativeCourses}
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeCourseEnrollments"
                  name="مقاعد الدورات التراكمية"
                  stroke="#1A9E9A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1A9E9A' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="courseEnrollmentsMonthly"
                  name="التسجيل الشهري للدورات"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#6366F1' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="activeCourses"
                  name="الدورات النشطة شهرياً"
                  stroke="#E8A33D"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#E8A33D' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
