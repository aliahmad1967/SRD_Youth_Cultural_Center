import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  X,
  Database,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  FileJson,
  RotateCcw,
  Clock,
  Sparkles,
  Users,
  BookOpen,
  Wallet,
} from 'lucide-react';

export const BackupRestoreModal: React.FC = () => {
  const {
    isBackupModalOpen,
    closeBackupModal,
    dbState,
    currentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<{
    valid: boolean;
    error?: string;
    membersCount?: number;
    coursesCount?: number;
    volunteersCount?: number;
    usersCount?: number;
    lastBackupAt?: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    counts?: Record<string, number>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isBackupModalOpen) return null;

  // Handle Export
  const handleExport = () => {
    try {
      const jsonStr = db.exportDatabaseToJson();
      const dateStr = new Date().toISOString().substring(0, 10);
      const fileName = `نسخة_احتياطية_مركز_الرواد_${dateStr}.json`;

      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`تم تصدير وتحميل النسخة الاحتياطية بنجاح (${fileName}).`, 'success');
    } catch (err: any) {
      showToast(err.message || 'تعذر تصدير النسخة الاحتياطية', 'error');
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setFileContent(text);
        const parsed = JSON.parse(text);

        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.members) && Array.isArray(parsed.courses)) {
          setFilePreview({
            valid: true,
            membersCount: parsed.members.length,
            coursesCount: parsed.courses.length,
            volunteersCount: Array.isArray(parsed.volunteers) ? parsed.volunteers.length : 0,
            usersCount: parsed.users.length,
            lastBackupAt: parsed.lastBackupAt || 'غير محدد',
          });
        } else {
          setFilePreview({
            valid: false,
            error: 'الملف لا يتوافق مع هيكل قاعدة بيانات المركز (المجموعات الأساسية مفقودة).',
          });
        }
      } catch (err: any) {
        setFilePreview({
          valid: false,
          error: 'الملف ليس بتنسيق JSON صحيح أو تالف.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle Import
  const handleImport = () => {
    if (!fileContent || !filePreview?.valid) {
      showToast('يرجى اختيار ملف JSON صالح لقاعدة البيانات أولاً.', 'warning');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = db.importDatabaseFromJson(
        fileContent,
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
      );

      setIsProcessing(false);
      setImportResult({
        success: res.success,
        message: res.message,
        counts: res.recordCounts,
      });

      if (res.success) {
        showToast('تمت استعادة قاعدة بيانات المركز بنجاح وتحديث كافة السجلات!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    }, 400);
  };

  const handleResetInputs = () => {
    setSelectedFile(null);
    setFileContent(null);
    setFilePreview(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 dark:border-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E4E8C] to-[#0E2E5C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">إدارة النسخ الاحتياطي وحماية قاعدة البيانات</h2>
              <p className="text-xs text-blue-100">
                تصدير واستيراد قاعدة بيانات المركز المحلية (JSON) لضمان استمرارية الأعمال وحماية البيانات
              </p>
            </div>
          </div>
          <button
            onClick={closeBackupModal}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
          <button
            onClick={() => {
              setActiveTab('export');
              handleResetInputs();
            }}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'export'
                ? 'border-[#1E4E8C] text-[#1E4E8C] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (Export JSON)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import');
              handleResetInputs();
            }}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'import'
                ? 'border-[#1E4E8C] text-[#1E4E8C] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>استيراد واستعادة البيانات (Import JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Live Database Snapshot Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#1E4E8C] dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      محتويات قاعدة البيانات الحالية الجاهزة للتصدير:
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    آخر نسخ: {dbState.lastBackupAt ? dbState.lastBackupAt.substring(0, 10) : 'اليوم'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-lg font-black text-[#1E4E8C] dark:text-blue-400 tabular-nums">
                      {dbState.members.length}
                    </span>
                    <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      عضو وملتحق
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      {dbState.volunteers.length}
                    </span>
                    <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      متطوع معتمد
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-lg font-black text-teal-600 dark:text-teal-400 tabular-nums">
                      {dbState.courses.length}
                    </span>
                    <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      دورة وبرنامج
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {dbState.transactions.length}
                    </span>
                    <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      معاملة مالية
                    </span>
                  </div>
                </div>
              </div>

              {/* On-Premise Privacy Guarantee Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#1E4E8C] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="font-bold text-[#1E4E8C] dark:text-blue-300 mb-0.5">
                    سياسة الخصوصية والأمان المحلي (القسم 17):
                  </div>
                  يحتوي ملف النسخة الاحتياطية على كافة سجلات المركز، بما في ذلك بيانات المنتسبين، جداول الحضور، وسجلات الرقابة المالية، بصيغة JSON مهيكلة وقابلة للتخزين على وسائط تخزين خارجية (Flash Drive / Hard Drive) داخل المركز دون إرسالها لأي جهة خارجية.
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleExport}
                  className="px-6 py-3 rounded-2xl bg-[#1E4E8C] hover:bg-[#163a69] text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 mx-auto"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>تصدير وتحميل النسخة الاحتياطية الآن (JSON Backup)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {importResult ? (
                /* Success or Failure State */
                <div className="space-y-4 animate-in zoom-in-95">
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      importResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {importResult.success ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs">
                      <div className="font-bold text-sm mb-1">{importResult.message}</div>
                      {importResult.counts && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                          <div>المنتسبون: {importResult.counts.members}</div>
                          <div>الدورات: {importResult.counts.courses}</div>
                          <div>المتطوعون: {importResult.counts.volunteers}</div>
                          <div>المستخدمون: {importResult.counts.users}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={handleResetInputs}
                      className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
                    >
                      استيراد ملف آخر
                    </button>
                  </div>
                </div>
              ) : (
                /* File Upload Form */
                <div className="space-y-5">
                  {/* File Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1E4E8C] dark:hover:border-blue-500 rounded-3xl p-6 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/30 transition"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1E4E8C] dark:text-blue-300 flex items-center justify-center mx-auto shadow-xs">
                      <FileJson className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {selectedFile ? selectedFile.name : 'انقر هنا لاختيار ملف النسخة الاحتياطية (JSON)'}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        يقبل فقط ملفات JSON المصدرة رسمياً من نظام إدارة المركز
                      </p>
                    </div>
                  </div>

                  {/* File Preview Card */}
                  {filePreview && (
                    <div
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        filePreview.valid
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {filePreview.valid ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-900 dark:text-emerald-300">
                              تم فحص الملف: هيكل البيانات متوافق وصالح للاستعادة ✓
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span className="text-rose-900 dark:text-rose-300">{filePreview.error}</span>
                          </>
                        )}
                      </div>

                      {filePreview.valid && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                          <div>المنتسبون: <span className="font-bold">{filePreview.membersCount}</span></div>
                          <div>الدورات: <span className="font-bold">{filePreview.coursesCount}</span></div>
                          <div>المتطوعون: <span className="font-bold">{filePreview.volunteersCount}</span></div>
                          <div>المستخدمون: <span className="font-bold">{filePreview.usersCount}</span></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Safety Warning */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">إجراء حرج وإلزامي:</span>
                      سيتم استبدال البيانات الحالية بالكامل بالبيانات المستوردة من الملف. يقوم النظام تلقائياً بإنشاء نقطة استعادة طوارئ سابقة في المتصفح لضمان عدم فقدان أي سجل.
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={closeBackupModal}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={!filePreview?.valid || isProcessing}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 ${
                        filePreview?.valid && !isProcessing
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                          : 'bg-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      <span>{isProcessing ? 'جارٍ الاستعادة...' : 'تأكيد استيراد واستعادة قاعدة البيانات'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
