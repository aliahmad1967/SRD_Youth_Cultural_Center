import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseOffering } from '../../types';
import { db } from '../../services/storage';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Award,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  GraduationCap,
  UserCheck,
  Edit,
  Archive,
  RotateCcw,
} from 'lucide-react';

export const CoursesCatalogView: React.FC = () => {
  const {
    dbState,
    currentUser,
    activeRole,
    navigate,
    showToast,
    formatMoney,
    openAssignTrainer,
    openArchiveModal,
    archiveOffering,
    restoreOffering,
    batchArchiveCompletedCourses,
  } = useApp();

  const [showArchived, setShowArchived] = useState(false);

  const handleEnroll = (offeringId: string) => {
    // Current user must be a member
    const member = dbState.members.find((m) => currentUser && m.userId === currentUser.id);
    if (!member) {
      showToast('يجب تسجيل الدخول كمنتسب لإتمام التسجيل في الدورة.', 'warning');
      return;
    }

    try {
      const res = db.enrollInCourse(offeringId, member.id);
      if (res.status === 'waitlist') {
        showToast('اكتملت المقاعد المتاحة! تمت إضافتك إلى قائمة الانتظار وستُرقى تلقائياً حال توفر مقعد.', 'info');
      } else {
        showToast('تم تأكيد تسجيلك في الدورة بنجاح! تفقد جدول الجلسات في بوابتك.', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'تعذر التسجيل', 'error');
    }
  };

  const handleWithdraw = (offeringId: string) => {
    const member = dbState.members.find((m) => currentUser && m.userId === currentUser.id);
    if (!member) return;

    const enrollment = dbState.enrollments.find(
      (e) => e.offeringId === offeringId && e.memberId === member.id && e.status !== 'withdrawn'
    );
    if (!enrollment) return;

    try {
      db.withdrawFromCourse(
        enrollment.id,
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u', name: 'عضو' }
      );
      showToast('تم تسجيل انسحابك وترقية أول المسجلين في قائمة الانتظار تلقائياً (UAT-05).', 'info');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ', 'error');
    }
  };

  const canManageTrainers = activeRole === 'director' || activeRole === 'coordinator';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            كتالوج الدورات والبرامج التثقيفية
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            برامج معتمدة تركز على القيادة، المبادرات، التفكير النقدي، والتوعية، مع إمكانية تعيين وتغيير المحاضرين لكل دورة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              showArchived
                ? 'bg-purple-600 text-white shadow-xs'
                : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>
              {showArchived
                ? 'عرض الدورات النشطة'
                : `عرض المؤرشفة (${dbState.offerings.filter((o) => o.isArchived || o.status === 'archived').length})`}
            </span>
          </button>

          {(activeRole === 'director' || activeRole === 'coordinator') && (
            <button
              onClick={openArchiveModal}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              title="فتح قسم الأرشيف المركزي"
            >
              <Archive className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>قسم الأرشيف</span>
            </button>
          )}

          {(activeRole === 'director' || activeRole === 'coordinator' || activeRole === 'trainer') && (
            <button
              onClick={() => navigate('attendance')}
              className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs"
            >
              رصد حضور الجلسات
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dbState.courses.map((course) => {
          const offerings = dbState.offerings.filter((o) => {
            if (o.courseId !== course.id) return false;
            const isArch = o.isArchived || o.status === 'archived';
            return showArchived ? isArch : !isArch;
          });
          const currentMember = dbState.members.find((m) => currentUser && m.userId === currentUser.id);

          return (
            <div
              key={course.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              {/* Card Header with Color Splash */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/40 dark:to-blue-950/20 border-b border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1E4E8C]/10 dark:bg-blue-900/40 text-[#1E4E8C] dark:text-blue-300">
                    {course.category === 'leadership'
                      ? 'قيادة وتأثير'
                      : course.category === 'awareness'
                      ? 'توعية رقمية'
                      : course.category === 'cultural'
                      ? 'ثقافة وفكر'
                      : 'ورش عمل ومبادرات'}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    {course.fee === 0 ? 'مجانية بالكامل' : formatMoney(course.fee)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{course.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.totalHours} ساعة تدريبية</span>
                  </span>
                  <span>·</span>
                  <span>الفئة: {course.ageGroup}</span>
                </div>
              </div>

              {/* Offerings Section */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">الدفعات والمحاضرون:</h4>
                    {canManageTrainers && (
                      <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">
                        المحاضرون متغيرون وقابلون للإسناد
                      </span>
                    )}
                  </div>

                  {offerings.length === 0 ? (
                    <p className="text-xs text-slate-400">لا توجد دفعات مفتوحة حالياً</p>
                  ) : (
                    <div className="space-y-3">
                      {offerings.map((off) => {
                        const isFull = off.enrolledCount >= off.capacity;
                        const enrollment = currentMember
                          ? dbState.enrollments.find(
                              (e) => e.offeringId === off.id && e.memberId === currentMember.id && e.status !== 'withdrawn'
                            )
                          : null;

                        return (
                          <div
                            key={off.id}
                            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 dark:text-white">{off.name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isFull
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                }`}
                              >
                                {isFull ? 'المقاعد مكتملة (قائمة انتظار)' : 'مقاعد متاحة'}
                              </span>
                            </div>

                            {/* Dynamic Trainer Information & Reassign button */}
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
                                  {off.trainerName.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                    {off.trainerName}
                                  </div>
                                  <div className="text-[9px] text-slate-400">المحاضر المعتمد لهذه الدفعة</div>
                                </div>
                              </div>

                              {canManageTrainers && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openAssignTrainer({
                                        offeringId: off.id,
                                        courseName: `${course.title} - ${off.name}`,
                                        currentTrainerId: off.trainerId,
                                        currentTrainerName: off.trainerName,
                                      })
                                    }
                                    className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800 transition flex items-center gap-1"
                                    title="تغيير المحاضر المسؤول عن هذه الدورة"
                                  >
                                    <GraduationCap className="w-3 h-3" />
                                    <span>المحاضر</span>
                                  </button>

                                  {off.isArchived || off.status === 'archived' ? (
                                    <button
                                      type="button"
                                      onClick={() => restoreOffering(off.id)}
                                      className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1"
                                      title="استعادة الدورة للجداول النشطة"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>استعادة</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => archiveOffering(off.id, 'أرشفة الدفعة من كتالوج الدورات')}
                                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1"
                                      title="أرشفة هذه الدفعة المنتهية ونقلها للأرشيف"
                                    >
                                      <Archive className="w-3 h-3" />
                                      <span>أرشفة</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="text-[10px] text-slate-400">{off.scheduleSummary}</span>
                              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                                {off.enrolledCount} / {off.capacity} مقعد
                              </span>
                            </div>

                            {/* User Action Button */}
                            {currentMember && (
                              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                                {enrollment ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>
                                        {enrollment.status === 'registered' ? 'أنت مسجل مؤكد' : 'أنت في قائمة الانتظار'}
                                      </span>
                                    </span>
                                    <button
                                      onClick={() => handleWithdraw(off.id)}
                                      className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-bold"
                                    >
                                      انسحاب من الدورة
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleEnroll(off.id)}
                                    className={`w-full py-2 rounded-lg text-xs font-bold transition shadow-xs ${
                                      isFull
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                        : 'bg-[#1E4E8C] hover:bg-[#163a69] text-white'
                                    }`}
                                  >
                                    {isFull ? 'الانضمام لقائمة الانتظار (UAT-05)' : 'تأكيد التسجيل في الدورة'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Course Completion Criteria Footnote */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  شروط الشهادة: حضور لا يقل عن {course.completionCriteria.minAttendancePercent}% واجتياز الاختبار بنسبة {course.completionCriteria.minExamScore}%.
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
