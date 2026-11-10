import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  Edit3,
  CheckCircle,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const ExamGradingView: React.FC = () => {
  const { dbState, currentUser, selectedExamAttemptId, navigate, showToast } = useApp();

  const attempt = dbState.examAttempts.find((a) => a.id === selectedExamAttemptId) || dbState.examAttempts[1];
  const exam = attempt ? dbState.exams.find((e) => e.id === attempt.examId) : null;

  const [awardedPoints, setAwardedPoints] = useState<number>(18);
  const [trainerComment, setTrainerComment] = useState<string>(
    'سيناريو ممتاز ومتقن، ربط مشهد التشتت بالسهر يلامس الواقع ويوصل الرسالة بذكاء.'
  );

  if (!attempt || !exam) {
    return (
      <div className="text-center p-8 text-xs text-slate-400">
        لم يتم العثور على محاولة الاختبار المحددة
      </div>
    );
  }

  const handleGrade = () => {
    try {
      db.gradeEssayExam(
        attempt.id,
        awardedPoints,
        trainerComment,
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-tr1', name: 'د. هشام محمود' }
      );
      showToast(`تم اعتماد وتوثيق درجة الطالب (${attempt.memberName}) بنجاح (UAT-09).`, 'success');
      navigate('exams');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('exams')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#1E4E8C] hover:underline"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لطابور التصحيح</span>
        </button>
        <span className="text-xs font-mono text-slate-400">تصحيح يدوي للأستاذ المحاضر</span>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Candidate & Exam Metadata */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold">اسم المتدرب:</span>
            <h3 className="text-base font-bold text-slate-900">{attempt.memberName}</h3>
            <span className="text-xs text-[#1E4E8C] font-semibold">{exam.title}</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block">درجة الأسئلة الموضوعية:</span>
            <span className="text-lg font-black text-slate-900 tabular-nums">
              {attempt.score} <span className="text-xs font-normal text-slate-500">/ 30 درجة</span>
            </span>
          </div>
        </div>

        {/* Essay Question & Candidate Submission View */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              السؤال المقالي التطبيقي (رقم 4 - الدرجة القصوى: 20 درجة):
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#1E4E8C] font-bold">
              مطلوب تقييم المدرب
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 text-xs text-slate-700 leading-relaxed font-medium">
            اكتب سيناريو لفيديو ريلز (Reels) مدته 45 ثانية للتوعية بالاستخدام المتوازن للأجهزة الذكية بين طلاب المدارس، مع تحديد الوصف البصري والنص المنطوق.
          </div>

          {/* Candidate Written Answer */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">
              إجابة المتدرب ({attempt.memberName}):
            </label>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed font-serif whitespace-pre-wrap">
              {attempt.answers['q-24'] || 'لا توجد إجابة مسجلة لهذا السؤال.'}
            </div>
          </div>
        </div>

        {/* Trainer Scoring & Feedback Controls */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-950">
              الدرجة المستحقة للشق المقالي (من 0 إلى 20):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={awardedPoints}
                onChange={(e) => setAwardedPoints(Number(e.target.value))}
                className="w-20 rounded-xl border border-amber-300 bg-white px-3 py-2 text-center font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-900">/ 20</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              تعليق المدرب الإثرائي والتوجيهي:
            </label>
            <textarea
              value={trainerComment}
              onChange={(e) => setTrainerComment(e.target.value)}
              rows={3}
              placeholder="اكتب ملاحظاتك البناءة للمتدرب..."
              className="w-full rounded-xl border border-amber-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="text-[11px] text-amber-800 flex items-center justify-between font-bold pt-2 border-t border-amber-200">
            <span>الدرجة الإجمالية بعد الاعتماد:</span>
            <span className="font-black text-sm text-slate-900">
              {(attempt.score || 0) + awardedPoints} / {exam.totalMarks} درجة
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGrade}
          className="w-full py-3 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          <span>اعتماد الدرجة النهائية وإشعار المتدرب فوراً (UAT-09)</span>
        </button>
      </div>
    </div>
  );
};
