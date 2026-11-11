import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, CourseOffering, Course } from '../../types';
import {
  Archive,
  RotateCcw,
  Search,
  Users,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  Filter,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const ArchiveCenterModal: React.FC = () => {
  const {
    dbState,
    isArchiveModalOpen,
    closeArchiveModal,
    restoreMember,
    archiveMember,
    restoreOffering,
    archiveOffering,
    batchArchiveCompletedCourses,
    batchArchiveGraduatedMembers,
    navigate,
    formatMoney,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'members' | 'courses' | 'manual'>('members');
  const [memberSearch, setMemberSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  // Manual Member Archive Form
  const [selectedMemberToArchive, setSelectedMemberToArchive] = useState('');
  const [memberArchiveReason, setMemberArchiveReason] = useState('إكمال متطلبات التخرج وانتقال لمرحلة متقدمة');

  // Manual Offering Archive Form
  const [selectedOfferingToArchive, setSelectedOfferingToArchive] = useState('');
  const [offeringArchiveReason, setOfferingArchiveReason] = useState('اكتمال كافة الجلسات وتوزيع الشهادات الرسمية');

  if (!isArchiveModalOpen) return null;

  // Archived items
  const archivedMembers = dbState.members.filter((m) => m.isArchived);
  const unarchivedMembers = dbState.members.filter((m) => !m.isArchived);

  const archivedOfferings = dbState.offerings.filter((o) => o.isArchived || o.status === 'archived');
  const eligibleOfferingsToArchive = dbState.offerings.filter(
    (o) => (o.status === 'completed' || o.status === 'closed') && !o.isArchived
  );

  // Filtered members list
  const filteredArchivedMembers = archivedMembers.filter(
    (m) =>
      m.name.includes(memberSearch) ||
      m.membershipNo.includes(memberSearch) ||
      m.phone.includes(memberSearch) ||
      (m.archiveReason && m.archiveReason.includes(memberSearch))
  );

  // Filtered offerings list
  const filteredArchivedOfferings = archivedOfferings.filter(
    (o) =>
      o.name.includes(courseSearch) ||
      o.trainerName.includes(courseSearch) ||
      (o.archiveReason && o.archiveReason.includes(courseSearch))
  );

  const handleManualMemberArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToArchive) return;
    archiveMember(selectedMemberToArchive, memberArchiveReason);
    setSelectedMemberToArchive('');
  };

  const handleManualOfferingArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferingToArchive) return;
    archiveOffering(selectedOfferingToArchive, offeringArchiveReason);
    setSelectedOfferingToArchive('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E4E8C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">الأرشيف المركزي للمركز (Archive Vault)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  حفظ دائم
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                نقل السجلات المنتهية والقديمة للأرشيف لتنظيم الجداول النشطة مع الحفاظ عليها للرجوع إليها واستعادتها.
              </p>
            </div>
          </div>

          <button
            onClick={closeArchiveModal}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-center shrink-0">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">المنتسبين المؤرشفين</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {archivedMembers.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">الدورات والدفعات المؤرشفة</span>
            <span className="text-lg font-black text-[#1E4E8C] dark:text-blue-400 tabular-nums">
              {archivedOfferings.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">الجداول النشطة الحالية</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {unarchivedMembers.length} منتسب نشط
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">دورات جاهزة للأرشفة</span>
            <span className="text-lg font-black text-slate-700 dark:text-slate-300 tabular-nums">
              {eligibleOfferingsToArchive.length}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'members'
                  ? 'border-[#1E4E8C] text-[#1E4E8C] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>أرشيف المنتسبين ({archivedMembers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'courses'
                  ? 'border-[#1E4E8C] text-[#1E4E8C] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>أرشيف الدورات المنتهية ({archivedOfferings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'manual'
                  ? 'border-[#1E4E8C] text-[#1E4E8C] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>إجراءات الأرشفة السريعة</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Archived Members */}
        {activeTab === 'members' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="بحث في أرشيف المنتسبين بالاسم أو رقم العضوية أو سبب الأرشفة..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>

              <button
                onClick={batchArchiveGraduatedMembers}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900 transition shrink-0"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>أرشفة الخريجين والمنسحبين تلقائياً</span>
              </button>
            </div>

            {filteredArchivedMembers.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 space-y-2">
                <Archive className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {memberSearch ? 'لا توجد نتائج تطابق بحثك في الأرشيف' : 'أرشيف المنتسبين فارغ حالياً'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  عند أرشفة أي منتسب خريج أو منتهية عضويته، سيظهر في هذا السجل مع حفظ كامل إنجازاته وإمكانية إعادته للجداول النشطة بنقرة زر واحدة.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {filteredArchivedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{member.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {member.membershipNo}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          مؤرشف
                        </span>
                        {member.isMinor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            قاصر
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>هاتف: {member.phone}</span>
                        <span>·</span>
                        <span>تاريخ الانضمام: {member.joinedAt}</span>
                        {member.archivedAt && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              تاريخ الأرشفة: {member.archivedAt}
                            </span>
                          </>
                        )}
                      </div>

                      {member.archiveReason && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg mt-1 inline-block">
                          <span className="font-bold text-slate-700 dark:text-slate-200">السبب: </span>
                          <span>{member.archiveReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => restoreMember(member.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                        title="إلغاء الأرشفة وإعادة المنتسب إلى الجداول النشطة"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استعادة للجداول النشطة</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Archived Courses & Batches */}
        {activeTab === 'courses' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="بحث في أرشيف الدورات بالاسم أو المحاضر أو سبب الأرشفة..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>

              <button
                onClick={batchArchiveCompletedCourses}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#1E4E8C] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition shrink-0"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>أرشفة كافة الدورات المنتهية دفعة واحدة</span>
              </button>
            </div>

            {filteredArchivedOfferings.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 space-y-2">
                <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {courseSearch ? 'لا توجد دورات تطابق بحثك في الأرشيف' : 'أرشيف الدورات المنتهية فارغ'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  يمكنك أرشفة أي دفعة دورة تدريبية انتهت واكتملت جلساتها لتخفيف الضغط على كتالوج البرامج النشط مع إمكانية استعادتها لاحقاً.
                </p>
                {eligibleOfferingsToArchive.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={batchArchiveCompletedCourses}
                      className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition"
                    >
                      أرشفة {eligibleOfferingsToArchive.length} دورات مكتملة الآن
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {filteredArchivedOfferings.map((offering) => (
                  <div
                    key={offering.id}
                    className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{offering.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          المحاضر: {offering.trainerName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          مكتملة ومؤرشفة
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>المسجلين: {offering.enrolledCount} مشارك</span>
                        <span>·</span>
                        <span>فترة الدورة: {offering.startDate} إلى {offering.endDate}</span>
                        {offering.archivedAt && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              تاريخ الأرشفة: {offering.archivedAt}
                            </span>
                          </>
                        )}
                      </div>

                      {offering.archiveReason && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg mt-1 inline-block">
                          <span className="font-bold text-slate-700 dark:text-slate-200">سبب الأرشفة: </span>
                          <span>{offering.archiveReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => restoreOffering(offering.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                        title="إلغاء أرشفة الدورة واستعادتها للسجلات النشطة"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استعادة للنشط</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Manual Archiving Forms & Quick Batch Actions */}
        {activeTab === 'manual' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form 1: Archive an Active Member */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Users className="w-4 h-4 text-[#1E4E8C]" />
                  <span>أرشفة منتسب محدد ونقله للأرشيف</span>
                </div>
                <p className="text-xs text-slate-500">
                  حدد المنتسب الذي ترغب في نقله من الجداول النشطة إلى الأرشيف لحفظ بياناته وتخفيف حجم الجداول.
                </p>

                <form onSubmit={handleManualMemberArchive} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اختر المنتسب من الجداول النشطة:
                    </label>
                    <select
                      value={selectedMemberToArchive}
                      onChange={(e) => setSelectedMemberToArchive(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">-- اختر المنتسب --</option>
                      {unarchivedMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.membershipNo}) - {m.status === 'graduated' ? 'خريج' : m.status === 'new_enrollee' ? 'ملتحق جديد' : 'نشط'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      سبب الأرشفة:
                    </label>
                    <input
                      type="text"
                      value={memberArchiveReason}
                      onChange={(e) => setMemberArchiveReason(e.target.value)}
                      required
                      placeholder="مثال: تخرج وانتهاء دورة التأهيل / توقف عن الحضور"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedMemberToArchive}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Archive className="w-4 h-4" />
                    <span>تأكيد نقل المنتسب إلى الأرشيف</span>
                  </button>
                </form>
              </div>

              {/* Form 2: Archive an Ended Course Offering */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>أرشفة دفعة دورة تدريبية منتهية</span>
                </div>
                <p className="text-xs text-slate-500">
                  إخفاء الدفعة من كتالوج البرامج الجارية ونقلها للأرشيف الدائم مع الاحتفاظ بسجل الحضور والشهادات.
                </p>

                <form onSubmit={handleManualOfferingArchive} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اختر الدورة المنتهية:
                    </label>
                    <select
                      value={selectedOfferingToArchive}
                      onChange={(e) => setSelectedOfferingToArchive(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">-- اختر الدورة / الدفعة --</option>
                      {dbState.offerings
                        .filter((o) => !o.isArchived)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} (المحاضر: {o.trainerName}) - الحالة: {o.status}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      سبب الأرشفة:
                    </label>
                    <input
                      type="text"
                      value={offeringArchiveReason}
                      onChange={(e) => setOfferingArchiveReason(e.target.value)}
                      required
                      placeholder="مثال: اكتمال جدول التدريب وإصدار الشهادات للمجتازين"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedOfferingToArchive}
                    className="w-full py-2.5 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] disabled:opacity-50 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Archive className="w-4 h-4" />
                    <span>تأكيد نقل الدورة إلى الأرشيف</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Batch Action Hero Card */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>الحوكمة المؤسسية وسلامة البيانات (Section 17)</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  عملية الأرشفة لا تقوم بحذف أي سجل على الإطلاق؛ يتم تسجيل حركة الأرشفة في سجل التدقيق المحصن (Audit Log) فورياً مع إمكانية استرجاع السجلات في أي لحظة.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={batchArchiveCompletedCourses}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                >
                  أرشفة الدورات المنتهية
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            مركز الرواد للشباب · نظام الأرشفة الآمن محلياً
          </div>
          <button
            onClick={closeArchiveModal}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            إغلاق نافذة الأرشيف
          </button>
        </div>
      </div>
    </div>
  );
};
