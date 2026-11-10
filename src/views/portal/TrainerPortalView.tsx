import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  Edit3,
  BookOpen,
  Users,
  FileText,
} from 'lucide-react';

export const TrainerPortalView: React.FC = () => {
  const { dbState, currentUser, navigate } = useApp();

  const trainerName = currentUser?.name || 'د. هشام محمود';
  const mySessions = dbState.sessions.filter(
    (s) => s.title.includes('الإلقاء') || dbState.offerings.find((o) => o.id === s.offeringId)?.trainerName === trainerName
  );
  const pendingGradings = dbState.examAttempts.filter((a) => !a.isGraded);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold mb-2">
          <GraduationCap className="w-4 h-4" />
          <span>بوابة المحاضر والمدرب المعتمد</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          أهلاً بك، {trainerName}
        </h1>
        <p className="text-xs text-teal-100 mt-1 max-w-xl leading-relaxed">
          إدارة جلساتك التدريبية، رصد الحضور الذكي بالباركود أو بضغطة واحدة، وتصحيح الأسئلة المقالية للمتدربين.
        </p>

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('attendance')}
            className="px-4 py-2 rounded-xl bg-[#E8A33D] hover:bg-[#d99430] text-slate-900 font-bold text-xs shadow-xs transition"
          >
            رصد حضور جلسة اليوم
          </button>
          <button
            onClick={() => navigate('exams')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
          >
            بنك الأسئلة والاختبارات
          </button>
        </div>
      </div>

      {/* Grid: Sessions & Pending Gradings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions (Left 2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">جدول الجلسات التدريبية وحالة الرصد</h3>
            <span className="text-xs text-slate-400">{mySessions.length} جلسات</span>
          </div>

          <div className="space-y-3">
            {mySessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{s.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-[#1E4E8C]'
                      }`}
                    >
                      {s.status === 'completed' ? 'مرصودة ومكتملة ✓' : 'مجدولة'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>التاريخ: {s.date}</span>
                    <span>·</span>
                    <span>الوقت: {s.startTime} - {s.endTime}</span>
                    <span>·</span>
                    <span>المكان: {s.venue}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('attendance')}
                  className="px-3.5 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs self-start sm:self-auto shrink-0"
                >
                  {s.status === 'completed' ? 'تعديل الرصد' : 'بدء الرصد الآن'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Gradings (Right col - UAT-09) */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">طابور التصحيح اليدوي</h3>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {pendingGradings.length} معلقة
              </span>
            </div>

            <div className="space-y-2">
              {pendingGradings.length === 0 ? (
                <p className="text-xs text-slate-400 p-3 text-center">لا توجد اختبارات معلقة</p>
              ) : (
                pendingGradings.map((att) => (
                  <div key={att.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-slate-900 block">{att.memberName}</span>
                      <span className="text-[10px] text-slate-500">{att.examTitle}</span>
                    </div>
                    <button
                      onClick={() => navigate('exam_grading', { attemptId: att.id })}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      تصحيح السؤال المقالي (UAT-09)
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
