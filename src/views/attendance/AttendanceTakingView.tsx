import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { db } from '../../services/storage';
import { QRCodeDisplay } from '../../components/common/QRCodeDisplay';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Wifi,
  WifiOff,
  Users,
  ShieldAlert,
  Save,
  RotateCcw,
} from 'lucide-react';

export const AttendanceTakingView: React.FC = () => {
  const { dbState, currentUser, isOnline, showToast, openQRScanner } = useApp();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    dbState.sessions.find((s) => s.status === 'scheduled')?.id || dbState.sessions[0]?.id || ''
  );
  const [showSessionQRModal, setShowSessionQRModal] = useState(false);

  const session = dbState.sessions.find((s) => s.id === selectedSessionId);
  const offering = session ? dbState.offerings.find((o) => o.id === session.offeringId) : null;
  const enrollments = offering
    ? dbState.enrollments.filter((e) => e.offeringId === offering.id && e.status === 'registered')
    : [];

  // Local state for attendance records before batch save
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    if (session) {
      enrollments.forEach((e) => {
        const existing = dbState.attendanceRecords.find(
          (ar) => ar.sessionId === session.id && ar.memberId === e.memberId
        );
        map[e.memberId] = existing ? existing.status : 'present'; // Default to present as per ATT-01
      });
    }
    return map;
  });

  // When session selection changes
  const handleSessionChange = (sessId: string) => {
    setSelectedSessionId(sessId);
    const newSession = dbState.sessions.find((s) => s.id === sessId);
    if (newSession) {
      const newEnrollments = dbState.enrollments.filter(
        (e) => e.offeringId === newSession.offeringId && e.status === 'registered'
      );
      const newMap: Record<string, AttendanceStatus> = {};
      newEnrollments.forEach((e) => {
        const existing = dbState.attendanceRecords.find(
          (ar) => ar.sessionId === newSession.id && ar.memberId === e.memberId
        );
        newMap[e.memberId] = existing ? existing.status : 'present';
      });
      setAttendanceMap(newMap);
    }
  };

  // ATT-01: 1-click batch mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    enrollments.forEach((e) => {
      updated[e.memberId] = 'present';
    });
    setAttendanceMap(updated);
    showToast('تم تحديد جميع المتدربين كـ "حاضر". يرجى تعديل الاستثناءات وحفظ السجل.', 'info');
  };

  const setMemberStatus = (memberId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [memberId]: status,
    }));
  };

  // Save Attendance (ATT-03, ATT-05, UAT-06, UAT-07)
  const handleSaveAttendance = () => {
    if (!session) return;

    const records = enrollments.map((e) => ({
      memberId: e.memberId,
      status: attendanceMap[e.memberId] || 'present',
      method: 'manual' as const,
    }));

    try {
      db.recordBatchAttendance(
        session.id,
        records,
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-tr1', name: 'د. هشام محمود' },
        isOnline
      );

      // Check if any minors were absent
      const absentMinors = enrollments.filter((e) => {
        const member = dbState.members.find((m) => m.id === e.memberId);
        return member?.isMinor && attendanceMap[e.memberId] === 'absent';
      });

      if (isOnline) {
        showToast(
          `تم حفظ رصد الحضور بنجاح لـ ${records.length} متدرباً.${
            absentMinors.length > 0 ? ` تم إرسال تنبيه فوري لأولياء أمور ${absentMinors.length} قاصرين غائبين (UAT-06).` : ''
          }`,
          'success'
        );
      } else {
        showToast(
          `تم حفظ الرصد محلياً بنجاح (وضع عدم الاتصال UAT-07). سيتم إرسال التنبيهات والمزامنة تلقائياً عند عودة الاتصال.`,
          'warning'
        );
      }
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء حفظ الحضور', 'error');
    }
  };

  // QR Scanning attendance (ATT-02)
  const handleOpenScanner = () => {
    openQRScanner((code) => {
      const member = dbState.members.find((m) => m.membershipNo === code || m.id === code);
      if (member && session) {
        setMemberStatus(member.id, 'present');
        showToast(`تم رصد حضور العضو (${member.name}) بالباركود بنجاح!`, 'success');
      } else {
        showToast(`الرمز المسحوب (${code}) غير مرتبط بعضو مسجل في هذه الجلسة.`, 'warning');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Connection Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">رصد الحضور والغياب الذكي</h1>
          <p className="text-xs text-slate-500 mt-1">
            رصد بضغطة واحدة، مسح الباركود، إشعارات فورية لأولياء أمور القاصرين (UAT-06)، والعمل دون اتصال (UAT-07).
          </p>
        </div>

        {/* Offline / Online state indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>متصل بالخادم المحلي</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>وضع محلي (Offline) · الحفظ مؤمن</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Selection & Controls */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">اختر الجلسة المراد رصدها:</label>
            <select
              value={selectedSessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] min-w-[280px]"
            >
              {dbState.sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.date} - {s.startTime})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions (1-Click All Present, Scan QR, Show Session QR) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#1E4E8C] hover:bg-blue-100 text-xs font-bold transition shadow-2xs"
              title="تحديد الكل كحاضرين لتعديل الاستثناءات بسرعة في أقل من 30 ثانية (ATT-01)"
            >
              الكل حاضر ✓
            </button>
            <button
              onClick={handleOpenScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition"
            >
              <QrCode className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span>مسح بطاقات المتدربين</span>
            </button>
            <button
              onClick={() => setShowSessionQRModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition"
            >
              <QrCode className="w-3.5 h-3.5 text-[#1A9E9A]" />
              <span>عرض رمز الجلسة للمسح</span>
            </button>
          </div>
        </div>

        {session && (
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100 flex-wrap">
            <span>الدورة: <strong className="text-slate-800">{session.courseTitle}</strong></span>
            <span>·</span>
            <span>المكان: <strong className="text-slate-800">{session.venue}</strong></span>
            <span>·</span>
            <span>المتدربون المسجلون: <strong className="text-[#1E4E8C] tabular-nums">{enrollments.length}</strong></span>
          </div>
        )}
      </div>

      {/* Trainees Roster with Large Touch Buttons (Section 14.3) */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">قائمة المتدربين في هذه الجلسة</h3>
          <span className="text-[11px] text-slate-400">
            أزرار لمس كبيرة بألوان ممتلئة للتمييز الفوري (Section 14.3)
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {enrollments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">لا يوجد متدربون مسجلون في هذه الدورة</div>
          ) : (
            enrollments.map((enr) => {
              const member = dbState.members.find((m) => m.id === enr.memberId);
              const currentStatus = attendanceMap[enr.memberId] || 'present';

              return (
                <div
                  key={enr.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  {/* Trainee Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E4E8C] flex items-center justify-center font-bold text-sm shrink-0">
                      {enr.memberName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {enr.memberName}
                        </span>
                        {member?.isMinor && (
                          <span className="text-[9px] px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 font-bold">
                            قاصر (ولي أمره يصله إشعار الغياب فوراً)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {member?.membershipNo} · نسبة الحضور السابقة: {enr.attendanceRate}%
                      </span>
                    </div>
                  </div>

                  {/* 4 Large Status Buttons (Section 14.2 & 14.3) */}
                  <div className="grid grid-cols-4 gap-1.5 w-full sm:w-auto">
                    {/* حاضر (Present - Green #2E9E5B) */}
                    <button
                      type="button"
                      onClick={() => setMemberStatus(enr.memberId, 'present')}
                      className={`h-11 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 ${
                        currentStatus === 'present'
                          ? 'bg-[#2E9E5B] text-white shadow-xs ring-2 ring-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <span>حاضر</span>
                    </button>

                    {/* متأخر (Late - Orange #E69A2E) */}
                    <button
                      type="button"
                      onClick={() => setMemberStatus(enr.memberId, 'late')}
                      className={`h-11 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 ${
                        currentStatus === 'late'
                          ? 'bg-[#E69A2E] text-white shadow-xs ring-2 ring-orange-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-800'
                      }`}
                    >
                      <span>متأخر</span>
                    </button>

                    {/* غائب (Absent - Red #D64545) */}
                    <button
                      type="button"
                      onClick={() => setMemberStatus(enr.memberId, 'absent')}
                      className={`h-11 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 ${
                        currentStatus === 'absent'
                          ? 'bg-[#D64545] text-white shadow-xs ring-2 ring-red-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-800'
                      }`}
                    >
                      <span>غائب</span>
                    </button>

                    {/* بعذر (Excused - Muted Gray #9AA3AF) */}
                    <button
                      type="button"
                      onClick={() => setMemberStatus(enr.memberId, 'excused')}
                      className={`h-11 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 ${
                        currentStatus === 'excused'
                          ? 'bg-[#9AA3AF] text-white shadow-xs ring-2 ring-slate-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>بعذر</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            ملاحظة: نافذة التعديل متاحة لمدة 48 ساعة بعد انتهاء الجلسة (ATT-04).
          </div>
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] text-white font-bold text-xs shadow-md transition"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>حفظ واعتماد كشف الحضور</span>
          </button>
        </div>
      </div>

      {/* Session QR Display Modal (Trainer shows QR code for students) */}
      {showSessionQRModal && session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4 text-right">
            <h3 className="text-sm font-bold text-slate-900 text-center">رمز تسجيل حضور الجلسة المباشر</h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              يعرض المدرب هذا الرمز على الشاشة ليقوم المتدربون بمسحه من هواتفهم (ATT-02).
            </p>
            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <QRCodeDisplay value={session.qrCodeToken} size={180} showText />
            </div>
            <p className="text-[10px] text-amber-600 text-center font-bold">
              • الرمز مؤقت ومحمي لمنع التسجيل خارج وقت ومكان الجلسة
            </p>
            <button
              onClick={() => setShowSessionQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69]"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
