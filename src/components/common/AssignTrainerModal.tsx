import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  X,
  GraduationCap,
  UserCheck,
  UserPlus,
  CheckCircle2,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AssignTrainerModal: React.FC = () => {
  const {
    isAssignTrainerOpen,
    assignTrainerData,
    closeAssignTrainer,
    dbState,
    currentUser,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'select' | 'new'>('select');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');

  // New trainer fields
  const [newTrainerName, setNewTrainerName] = useState('');
  const [newTrainerPhone, setNewTrainerPhone] = useState('');
  const [newTrainerEmail, setNewTrainerEmail] = useState('');
  const [newTrainerSpecialty, setNewTrainerSpecialty] = useState('مدرب معتمد في التنمية والقيادة');

  // Filter all registered trainers from users
  const trainers = dbState.users.filter((u) => u.roles.includes('trainer') && u.status === 'active');

  useEffect(() => {
    if (assignTrainerData) {
      setSelectedTrainerId(assignTrainerData.currentTrainerId || (trainers[0]?.id ?? ''));
    }
  }, [assignTrainerData, dbState.users]);

  if (!isAssignTrainerOpen || !assignTrainerData) return null;

  const handleAssignExisting = (e: React.FormEvent) => {
    e.preventDefault();
    const trainer = trainers.find((t) => t.id === selectedTrainerId);
    if (!trainer) {
      showToast('يرجى تحديد المحاضر المطلوب للدورة.', 'warning');
      return;
    }

    db.assignTrainerToOffering(
      assignTrainerData.offeringId,
      trainer.id,
      trainer.name,
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
    );

    showToast(`تم تعيين المحاضر (${trainer.name}) للدورة (${assignTrainerData.courseName}) بنجاح.`, 'success');
    closeAssignTrainer();
  };

  const handleCreateAndAssignNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName.trim()) {
      showToast('يرجى إدخال اسم المحاضر الجديد.', 'warning');
      return;
    }

    const createdTrainer = db.addNewTrainer(
      {
        name: newTrainerName.trim(),
        phone: newTrainerPhone.trim() || '07700000000',
        email: newTrainerEmail.trim() || `${newTrainerPhone.replace(/\D/g, '') || Date.now()}@rawad-trainer.iq`,
      },
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
    );

    // Now assign to offering
    db.assignTrainerToOffering(
      assignTrainerData.offeringId,
      createdTrainer.id,
      createdTrainer.name,
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
    );

    showToast(`تم تسجيل المحاضر الجديد (${createdTrainer.name}) وإسناد الدورة له بنجاح.`, 'success');
    closeAssignTrainer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 dark:border-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">تعيين وتغيير محاضر الدورة</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تحديد المحاضر والمدرب المسؤول عن تقديم جلسات الدفعة
              </p>
            </div>
          </div>
          <button
            onClick={closeAssignTrainer}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Info Banner */}
        <div className="px-6 py-3 bg-teal-50/50 dark:bg-teal-950/20 border-b border-teal-100 dark:border-teal-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-teal-900 dark:text-teal-200">الدورة:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{assignTrainerData.courseName}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            المحاضر الحالي: <span className="font-bold text-teal-700 dark:text-teal-300">{assignTrainerData.currentTrainerName}</span>
          </div>
        </div>

        {/* Tab switcher: Select Existing vs Add New */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/30 dark:bg-slate-900/30 gap-2 text-xs">
          <button
            onClick={() => setMode('select')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'select'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>اختيار من المحاضرين المعتمدين ({trainers.length})</span>
          </button>
          <button
            onClick={() => setMode('new')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
              mode === 'new'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إضافة محاضر جديد للمركز +</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-right">
          {mode === 'select' ? (
            <form onSubmit={handleAssignExisting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  اختر المحاضر من القائمة المعتمدة:
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {trainers.map((tr) => {
                    const isSelected = selectedTrainerId === tr.id;
                    const isCurrent = tr.name === assignTrainerData.currentTrainerName;

                    return (
                      <div
                        key={tr.id}
                        onClick={() => setSelectedTrainerId(tr.id)}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {tr.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{tr.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  الحالي
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {tr.phone} · {tr.email}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeAssignTrainer}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                >
                  تأكيد إسناد المحاضر
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateAndAssignNew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المحاضر الكامل واللقب العلمي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ.د. مصطفى العاني"
                  value={newTrainerName}
                  onChange={(e) => setNewTrainerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    placeholder="077XXXXXXXX"
                    value={newTrainerPhone}
                    onChange={(e) => setNewTrainerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    placeholder="trainer@domain.iq"
                    value={newTrainerEmail}
                    onChange={(e) => setNewTrainerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التخصص والمجال التدريبي
                </label>
                <input
                  type="text"
                  value={newTrainerSpecialty}
                  onChange={(e) => setNewTrainerSpecialty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeAssignTrainer}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تسجيل وإسناد الدورة فورياً</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
