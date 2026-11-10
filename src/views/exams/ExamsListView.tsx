import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamAttempt } from '../../types';
import { db } from '../../services/storage';
import {
  FileText,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Play,
  Edit3,
  Search,
  Sparkles,
} from 'lucide-react';

export const ExamsListView: React.FC = () => {
  const { dbState, currentUser, activeRole, navigate, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'exams' | 'grading_queue' | 'question_bank'>('exams');
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Pending manual grading attempts (UAT-09)
  const pendingGradingAttempts = dbState.examAttempts.filter((a) => !a.isGraded);

  const filteredQuestions = dbState.questions.filter((q) => {
    const matchesSearch = q.text.includes(questionSearch) || q.topic.includes(questionSearch);
    if (!matchesSearch) return false;
    if (selectedDifficulty === 'all') return true;
    return q.difficulty === selectedDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">الاختبارات وبنك الأسئلة والتقييم</h1>
          <p className="text-xs text-slate-500 mt-1">
            تصحيح آلي فوري للأسئلة الموضوعية (UAT-08)، وتصحيح يدوي للأسئلة المقالية (UAT-09)، مع بنك أسئلة يضم 60 سؤالاً مصنفاً.
          </p>
        </div>

        {/* If trainer/admin and pending essay gradings exist */}
        {(activeRole === 'trainer' || activeRole === 'director' || activeRole === 'coordinator') &&
          pendingGradingAttempts.length > 0 && (
            <button
              onClick={() => setActiveTab('grading_queue')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 transition"
            >
              <Edit3 className="w-4 h-4 text-amber-700" />
              <span>{pendingGradingAttempts.length} اختبارات بانتظار تصحيح الأسئلة المقالية</span>
            </button>
          )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'exams' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الاختبارات المتاحة ({dbState.exams.length})
        </button>
        {(activeRole === 'trainer' || activeRole === 'director' || activeRole === 'coordinator') && (
          <button
            onClick={() => setActiveTab('grading_queue')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'grading_queue'
                ? 'bg-white text-[#1E4E8C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            طابور التصحيح اليدوي ({pendingGradingAttempts.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('question_bank')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'question_bank'
              ? 'bg-white text-[#1E4E8C] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          بنك الأسئلة المركزي ({dbState.questions.length})
        </button>
      </div>

      {/* TAB 1: EXAMS LIST */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dbState.exams.map((exam) => {
            const myAttempt = currentUser
              ? dbState.examAttempts.find(
                  (a) => a.examId === exam.id && a.memberId === dbState.members.find((m) => m.userId === currentUser.id)?.id
                )
              : null;

            return (
              <div
                key={exam.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        exam.isAutoGraded
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-900'
                      }`}
                    >
                      {exam.isAutoGraded ? 'تصحيح آلي فوري (موضوعي)' : 'تصحيح مدرب (مقالي وتطبيقي)'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{exam.courseTitle}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.title}</h3>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="block text-slate-400 text-[10px]">المدة</span>
                      <span className="font-bold font-mono">{exam.durationMinutes} دقيقة</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="block text-slate-400 text-[10px]">الدرجة الكلية</span>
                      <span className="font-bold font-mono">{exam.totalMarks} درجة</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="block text-slate-400 text-[10px]">حد النجاح</span>
                      <span className="font-bold font-mono">{exam.passingScore} درجة</span>
                    </div>
                  </div>
                </div>

                {/* Attempt Status or Launch Button */}
                <div className="pt-3 border-t border-slate-100">
                  {myAttempt ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {myAttempt.isGraded
                            ? `الدرجة النهائية: ${myAttempt.score} / ${exam.totalMarks}`
                            : 'تم تسليم الإجابات (بانتظار تصحيح المدرب)'}
                        </span>
                        <span className="text-[10px] text-slate-400">سلمت في: {myAttempt.submittedAt}</span>
                      </div>
                      {myAttempt.isGraded && (
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            (myAttempt.score || 0) >= exam.passingScore
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {(myAttempt.score || 0) >= exam.passingScore ? 'ناجح ✓' : 'لم يجتز'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('exam_taker', { examId: exam.id })}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-xs"
                    >
                      <Play className="w-4 h-4 text-amber-300" />
                      <span>بدء أداء الاختبار على الهاتف / الشاشة</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: GRADING QUEUE (UAT-09) */}
      {activeTab === 'grading_queue' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">طابور تصحيح الأسئلة المقالية والتطبيقية</h3>
              <p className="text-[11px] text-slate-500">
                لا تعلن الدرجة النهائية للطالب إلا بعد اكتمال التصحيح اليدوي (BR-10 & UAT-09)
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              {pendingGradingAttempts.length} متدربين بانتظار التصحيح
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingGradingAttempts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد اختبارات معلقة! تم تصحيح جميع الإجابات المقالية.
              </div>
            ) : (
              pendingGradingAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{attempt.memberName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-[#1E4E8C] font-semibold">
                        {attempt.examTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      سلمت في: {attempt.submittedAt} · الدرجة المبدئية للأسئلة الموضوعية: {attempt.score} درجة
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('exam_grading', { attemptId: attempt.id })}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                    <span>فحص الإجابة ومنح الدرجة (UAT-09)</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUESTION BANK (60 QUESTIONS) */}
      {activeTab === 'question_bank' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="بحث في نصوص الأسئلة والمحاور..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">مستوى الصعوبة:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="all">جميع المستويات</option>
                <option value="easy">سهل</option>
                <option value="medium">متوسط</option>
                <option value="hard">متقدم / صعب</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-[#1E4E8C] bg-blue-50 px-2 py-0.5 rounded-md">
                    {q.topic}
                  </span>
                  <span className="font-mono">#{idx + 1} · {q.type === 'multiple_choice' ? 'اختيار من متعدد' : q.type === 'true_false' ? 'صح / خطأ' : 'مقالي / تعبيري'}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">{q.text}</p>
                {q.options && (
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside bg-slate-50 p-2 rounded-lg">
                    {q.options.map((opt, oIdx) => (
                      <li key={oIdx} className={oIdx === q.correctAnswer ? 'text-emerald-700 font-bold' : ''}>
                        {opt} {oIdx === q.correctAnswer && '✓ (الصحيحة)'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
