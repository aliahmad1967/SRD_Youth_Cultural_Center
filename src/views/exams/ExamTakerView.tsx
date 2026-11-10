import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import { Question } from '../../types';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export const ExamTakerView: React.FC = () => {
  const { dbState, currentUser, selectedExamId, isOnline, navigate, showToast } = useApp();

  const exam = dbState.exams.find((e) => e.id === selectedExamId) || dbState.exams[0];
  const questions: Question[] = exam.questionIds
    .map((id) => dbState.questions.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    // Restore saved answers from localStorage if available (UAT-08)
    const saved = localStorage.getItem(`exam_answers_${exam.id}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(exam.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  // Timer effect
  useEffect(() => {
    if (submittedResult) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submittedResult]);

  // Real-time local persistence for resilience against disconnections (EXM-06, UAT-08)
  const handleSelectAnswer = (questionId: string, answer: any) => {
    const updated = { ...answers, [questionId]: answer };
    setAnswers(updated);
    try {
      localStorage.setItem(`exam_answers_${exam.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  };

  const handleSubmitAnswers = () => {
    setIsSubmitting(true);
    const member = dbState.members.find((m) => currentUser && m.userId === currentUser.id) || dbState.members[0];

    try {
      const attempt = db.submitExamAttempt(exam.id, member.id, answers);
      localStorage.removeItem(`exam_answers_${exam.id}`);
      setSubmittedResult(attempt);
      showToast('تم تسليم إجاباتك بنجاح!', 'success');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء التسليم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // If already submitted -> Show Result Card!
  if (submittedResult) {
    const isPassing = (submittedResult.score || 0) >= exam.passingScore;

    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xl text-center space-y-5">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              isPassing ? 'bg-emerald-100 text-[#2E9E5B]' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              {submittedResult.isGraded
                ? isPassing
                  ? 'تهانينا! لقد اجتزت الاختبار بنجاح'
                  : 'تم إنهاء الاختبار'
                : 'تم استلام الإجابات بنجاح!'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{exam.title}</p>
          </div>

          {/* Score Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs text-slate-600 block">
              {submittedResult.isGraded ? 'درجتك المعتمدة:' : 'الدرجة المبدئية للأسئلة الموضوعية:'}
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono tabular-nums">
              {submittedResult.score}{' '}
              <span className="text-sm font-normal text-slate-500">/ {exam.totalMarks} درجة</span>
            </div>

            {!submittedResult.isGraded && (
              <p className="text-[11px] text-amber-700 font-semibold pt-2 border-t border-slate-200">
                • يتضمن الاختبار سؤالاً مقالياً يقوم المدرب حالياً بتصحيحه يدوياً (UAT-09). ستعلن درجتك النهائية فور اعتماده.
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('exams')}
            className="w-full py-3 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs"
          >
            العودة لقائمة الاختبارات
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center p-8 text-xs text-slate-400">لا توجد أسئلة في هذا الاختبار</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top Fixed Header with Timer and Question Counter (Section 14.3) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4 sticky top-24 z-20">
        <div>
          <span className="text-[10px] text-slate-400 font-mono block mb-0.5">
            السؤال {currentIndex + 1} من {questions.length}
          </span>
          <h2 className="text-xs font-bold text-slate-900 truncate max-w-xs">{exam.title}</h2>
        </div>

        {/* Floating Timer Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black font-mono tabular-nums border ${
            timeLeftSeconds < 120
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-blue-50 text-[#1E4E8C] border-blue-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTimer(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#1E4E8C] h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Single Question Viewport (Section 14.3 Rules) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Topic & Text */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {currentQuestion.topic}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQuestion.text}
          </h3>
        </div>

        {/* Options / Input Form */}
        <div className="space-y-2.5 pt-2">
          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = answers[currentQuestion.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectAnswer(currentQuestion.id, oIdx)}
                    className={`w-full text-right p-4 rounded-2xl border text-xs font-medium transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#1E4E8C] bg-blue-50/70 text-[#1E4E8C] ring-2 ring-blue-100 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#1E4E8C] bg-[#1E4E8C]' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* True / False Options */}
          {currentQuestion.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectAnswer(currentQuestion.id, true)}
                className={`p-4 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-2 ${
                  answers[currentQuestion.id] === true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>صحيح (True) ✓</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectAnswer(currentQuestion.id, false)}
                className={`p-4 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center gap-2 ${
                  answers[currentQuestion.id] === false
                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>خطأ (False) ✗</span>
              </button>
            </div>
          )}

          {/* Essay / Short Answer Field */}
          {(currentQuestion.type === 'essay' || currentQuestion.type === 'short_answer') && (
            <div className="space-y-2">
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                rows={5}
                placeholder="اكتب إجابتك الوافية هنا، سيتم حفظها محلياً في هاتفك أولاً بأول..."
                className="w-full rounded-2xl border border-slate-300 p-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] leading-relaxed"
              />
              <span className="text-[10px] text-slate-400">
                • يتم حفظ الإجابات تلقائياً ويمكنك استئناف الكتابة حتى لو انقطع الاتصال بالإنترنت (UAT-08).
              </span>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السؤال السابق</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-xs"
            >
              <span>السؤال التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitAnswers}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold transition shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>تسليم الاختبار وإنهاء المحاولة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
