import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, MemberStatus } from '../../types';
import { db } from '../../services/storage';
import { DigitalMembershipCard } from '../../components/common/DigitalMembershipCard';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Download,
  Calendar,
  Phone,
  MapPin,
  X,
  Shield,
  Award,
  UserPlus,
  Archive,
  RotateCcw,
} from 'lucide-react';

export const MembersManagementView: React.FC = () => {
  const { dbState, currentUser, showToast, openAddMember, openArchiveModal, archiveMember, restoreMember } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus | 'minor'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardMember, setCardMember] = useState<Member | null>(null);

  // Filter members (respecting archive state to prevent table clutter)
  const filteredMembers = dbState.members.filter((m) => {
    // Hide archived by default to eliminate clutter
    if (!showArchived && m.isArchived) return false;
    if (showArchived && !m.isArchived) return false;

    const matchesSearch =
      m.name.includes(searchTerm) ||
      m.membershipNo.includes(searchTerm) ||
      m.phone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'minor') return m.isMinor;
    return m.status === statusFilter;
  });

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'new_enrollee':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">ملتحق جديد (تأهيل)</span>;
      case 'active':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">منتسب نشط</span>;
      case 'graduated':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">خريج</span>;
      case 'suspended':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">موقوف</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">منسحب</span>;
    }
  };

  const handleToggleOnboarding = (itemId: string) => {
    db.toggleOnboardingItem(
      itemId,
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-coord', name: 'سارة الخطيب' }
    );
    showToast('تم تحديث بند التأهيل بنجاح', 'success');
  };

  const handlePromote = (memberId: string) => {
    db.promoteMemberToActive(
      memberId,
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-coord', name: 'سارة الخطيب' }
    );
    showToast('تهانينا! تمت ترقية العضو بنجاح إلى منتسب نشط.', 'success');
  };

  // Export to CSV (MEM-14)
  const handleExportCSV = () => {
    const headers = ['رقم العضوية', 'الاسم', 'الهاتف', 'الحالة', 'المنطقة', 'المؤهل', 'قاصر'];
    const rows = filteredMembers.map((m) => [
      m.membershipNo,
      m.name,
      m.phone,
      m.status,
      m.region,
      m.qualification,
      m.isMinor ? 'نعم' : 'لا',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `قائمة_منتسبي_المركز_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير ملف البيانات بنجاح (CSV).', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">إدارة المنتسبين والملتحقين الجدد</h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة قوائم التأهيل، بطاقات العضوية الرقمية (QR)، وإدارة حالات الاشتراك والحضور.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddMember}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ إضافة ملتحق جديد</span>
          </button>

          <button
            onClick={openArchiveModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition shadow-xs"
            title="فتح قسم الأرشيف واستعراض السجلات القديمة"
          >
            <Archive className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>قسم الأرشيف ({dbState.members.filter((m) => m.isArchived).length})</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>تصدير Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Segmented status filter + Archived Toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
              showArchived
                ? 'bg-purple-600 text-white shadow-xs'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'عرض السجلات النشطة فقط' : `عرض المؤرشفين (${dbState.members.filter((m) => m.isArchived).length})`}</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
              statusFilter === 'all' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({dbState.members.length})
          </button>
          <button
            onClick={() => setStatusFilter('new_enrollee')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
              statusFilter === 'new_enrollee' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تحت التأهيل ({dbState.members.filter((m) => m.status === 'new_enrollee').length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
              statusFilter === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نشط ({dbState.members.filter((m) => m.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('minor')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
              statusFilter === 'minor' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            قاصرون &lt;18 ({dbState.members.filter((m) => m.isMinor).length})
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
              statusFilter === 'suspended' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            موقوف ({dbState.members.filter((m) => m.status === 'suspended').length})
          </button>
        </div>
      </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو رقم العضوية أو الهاتف..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Main Members Table & Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Table (Left 2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">المنتسب</th>
                  <th className="p-3.5">رقم العضوية</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5">المنطقة</th>
                  <th className="p-3.5">ساعات الحضور</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const isSelected = selectedMember?.id === m.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E4E8C] flex items-center justify-center font-bold text-xs shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{m.name}</span>
                              {m.isMinor && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-semibold">
                                  قاصر
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{m.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 text-[11px] font-semibold">
                        {m.membershipNo}
                      </td>
                      <td className="p-3.5">{getStatusBadge(m.status)}</td>
                      <td className="p-3.5 text-slate-600">{m.region}</td>
                      <td className="p-3.5 font-bold text-slate-800 tabular-nums">
                        {m.totalHoursAttended || 0} ساعة
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardMember(m);
                              setShowCardModal(true);
                            }}
                            className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[#1E4E8C] text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>البطاقة</span>
                          </button>

                          {m.isArchived ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreMember(m.id);
                              }}
                              className="px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1"
                              title="استعادة من الأرشيف"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>استعادة</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveMember(m.id, 'أرشفة من جدول المنتسبين لتخفيف الازدحام');
                              }}
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-700 text-slate-500 text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1"
                              title="نقل السجل إلى قسم الأرشيف"
                            >
                              <Archive className="w-3 h-3" />
                              <span>أرشفة</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Member Details Panel (Right col) */}
        <div>
          {selectedMember ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-5 sticky top-24">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedMember.name}</h3>
                    {getStatusBadge(selectedMember.status)}
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1E4E8C]">
                    {selectedMember.membershipNo}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCardMember(selectedMember);
                    setShowCardModal(true);
                  }}
                  className="p-2 rounded-xl bg-blue-50 text-[#1E4E8C] hover:bg-blue-100 transition"
                  title="عرض بطاقة العضوية الرقمية"
                >
                  <CreditCard className="w-4 h-4" />
                </button>
              </div>

              {/* Minor Guardian Info if Applicable */}
              {selectedMember.isMinor && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>حساب ولي الأمر المرتبط (قاصر دون 18):</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    {dbState.guardians.find((g) => g.id === selectedMember.guardianId)?.name || 'مسجل معتمد'} · هاتف: {selectedMember.phone}
                  </p>
                </div>
              )}

              {/* Onboarding Checklist (UAT-04, MEM-06) */}
              {selectedMember.status === 'new_enrollee' && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <h4 className="font-bold text-slate-900 text-xs">قائمة التأهيل الإلزامية</h4>
                    </div>
                    {/* Completion rate */}
                    {(() => {
                      const items = dbState.onboardingItems.filter((i) => i.memberId === selectedMember.id);
                      const completed = items.filter((i) => i.completed).length;
                      const percent = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
                      return (
                        <span className="text-[11px] font-bold text-slate-700">
                          {percent}% ({completed}/{items.length})
                        </span>
                      );
                    })()}
                  </div>

                  <div className="space-y-2">
                    {dbState.onboardingItems
                      .filter((i) => i.memberId === selectedMember.id)
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleOnboarding(item.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between gap-2 transition ${
                            item.completed
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-[11px] leading-tight">{item.title}</span>
                          <span className="shrink-0">
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#2E9E5B]" />
                            ) : (
                              <div className="w-4 h-4 rounded-md border border-slate-300 bg-white" />
                            )}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Promote Button (BR-03) */}
                  {(() => {
                    const items = dbState.onboardingItems.filter((i) => i.memberId === selectedMember.id);
                    const allDone = items.length > 0 && items.every((i) => i.completed);
                    return (
                      <button
                        disabled={!allDone}
                        onClick={() => handlePromote(selectedMember.id)}
                        className={`w-full mt-2 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                          allDone
                            ? 'bg-[#2E9E5B] hover:bg-[#25824b] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>ترقية إلى منتسب نشط</span>
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* Enrolled Courses */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">الدورات المسجل بها:</h4>
                <div className="space-y-1.5">
                  {dbState.enrollments
                    .filter((e) => e.memberId === selectedMember.id)
                    .map((enr) => {
                      const off = dbState.offerings.find((o) => o.id === enr.offeringId);
                      return (
                        <div
                          key={enr.id}
                          className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 block truncate max-w-[150px]">
                              {off?.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              الحضور: {enr.attendanceRate}%
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              enr.status === 'registered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {enr.status === 'registered' ? 'مسجل مؤكد' : 'قائمة انتظار'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>اختر عضواً من الجدول لعرض بطاقته وقائمة تأهيله</span>
            </div>
          )}
        </div>
      </div>

      {/* Digital Membership Card Modal (MEM-09) */}
      {showCardModal && cardMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setShowCardModal(false)}
              className="no-print absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <DigitalMembershipCard
              member={cardMember}
              onClose={() => setShowCardModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
