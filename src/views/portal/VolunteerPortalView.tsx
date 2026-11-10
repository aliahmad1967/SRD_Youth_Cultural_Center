import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  HeartHandshake,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  QrCode,
} from 'lucide-react';

export const VolunteerPortalView: React.FC = () => {
  const { dbState, currentUser, openQRScanner, showToast, navigate } = useApp();

  const volunteer =
    dbState.volunteers.find((v) => currentUser && v.userId === currentUser.id) ||
    dbState.volunteers[0];

  const myShifts = dbState.shifts.filter((s) => s.volunteerId === volunteer.id);
  const myCertificates = dbState.certificates.filter((c) => c.memberId === volunteer.memberId);

  // Next level progress
  const nextTarget = volunteer.level === 'bronze' ? 15 : volunteer.level === 'silver' ? 30 : 50;
  const progressPercent = Math.min(100, Math.round((volunteer.approvedHours / nextTarget) * 100));

  const handleClockInQR = () => {
    openQRScanner((code) => {
      // Simulating clock in
      db.clockVolunteerShift({
        opportunityId: 'opp-1',
        opportunityTitle: 'فريق تنظيم وإدارة الملتقى الشبابي الثقافي السنوي',
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        clockIn: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actualHours: 4.5,
        qrScanned: true,
        notes: `تسجيل وردية بمسح QR معتمد: ${code}`,
        date: new Date().toISOString().substring(0, 10),
      });
      showToast('تم تسجيل الوردية بالباركود بنجاح وأُرسلت للمنسق للاعتماد (UAT-11)!', 'success');
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-900">
              {volunteer.level === 'gold'
                ? 'المستوى الذهبي 🥇'
                : volunteer.level === 'silver'
                ? 'المستوى الفضي 🥈'
                : 'المستوى البرونزي 🥉'}
            </span>
            <span className="text-xs text-amber-200 font-mono">متطوع معتمد بالمركز</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            أهلاً بك، {volunteer.name}
          </h1>
          <p className="text-xs text-amber-100 max-w-xl leading-relaxed">
            عطاؤك يصنع الفارق! تتبع ساعاتك التطوعية المعتمدة، وسجل الدخول والخروج بالباركود في الفعاليات.
          </p>
        </div>

        <button
          onClick={handleClockInQR}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition shadow-md self-start sm:self-auto shrink-0"
        >
          <QrCode className="w-4 h-4 text-amber-600" />
          <span>تسجيل دخول وردية بالباركود (QR)</span>
        </button>
      </div>

      {/* Stats Card: Hours & Tier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold">ساعات التطوع المعتمدة:</span>
          <div className="text-3xl font-black text-[#1E4E8C] tabular-nums">
            {volunteer.approvedHours}{' '}
            <span className="text-xs font-normal text-slate-500">ساعة موثقة</span>
          </div>
          <p className="text-[10px] text-slate-400">تدخل في إصدار شهادات التطوع الرسمية</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">الترقية للمستوى التالي:</span>
            <span className="font-black text-amber-700 tabular-nums">
              {volunteer.approvedHours} / {nextTarget} ساعة ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            تمنح الشارة الذهبية عند إتمام 30 ساعة معتمدة مع لوحة شرف شهرية (VOL-09).
          </p>
        </div>
      </div>

      {/* Shifts & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logged Shifts (Left 2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">سجل مشاركاتي ووردياتي الميدانية</h3>
            <span className="text-[11px] text-slate-500">{myShifts.length} ورديات</span>
          </div>

          <div className="divide-y divide-slate-100">
            {myShifts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">لا توجد ورديات مسجلة بعد</div>
            ) : (
              myShifts.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{s.opportunityTitle}</h4>
                    <span className="text-[11px] text-slate-500">
                      {s.date} · {s.actualHours} ساعات
                    </span>
                    {s.notes && <p className="text-[10px] text-slate-400 mt-0.5">{s.notes}</p>}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      s.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.status === 'approved' ? 'معتمد ✓' : 'بانتظار الاعتماد'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Opportunities / Next Missions */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">مهام وفرص تطوعية مقترحة</h3>
            <div className="space-y-2">
              {dbState.opportunities.map((opp) => (
                <div key={opp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">{opp.title}</span>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{opp.location}</span>
                    <span className="font-bold text-[#1E4E8C]">{opp.estimatedHours} ساعات</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
