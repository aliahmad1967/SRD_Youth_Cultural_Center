import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import { User, UserRole, Member, Volunteer, Guardian } from '../../types';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  UserPlus,
  GraduationCap,
  HeartHandshake,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ChevronLeft,
  X,
  FileText,
  AlertCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';

type HRTab = 'all' | 'trainers' | 'volunteers' | 'members' | 'guardians' | 'staff';

export const HRManagementView: React.FC = () => {
  const {
    dbState,
    currentUser,
    activeRole,
    switchUser,
    openAddMember,
    navigate,
    showToast,
    formatMoney,
  } = useApp();

  const [activeTab, setActiveTab] = useState<HRTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'probation' | 'suspended'>('all');

  // Selected Personnel for Detailed Dossier Modal
  const [selectedPersonnel, setSelectedPersonnel] = useState<{
    user: User;
    member?: Member;
    volunteer?: Volunteer;
    guardian?: Guardian;
  } | null>(null);

  // New Volunteer modal state
  const [showAddVolunteerModal, setShowAddVolunteerModal] = useState(false);
  const [newVolName, setNewVolName] = useState('');
  const [newVolPhone, setNewVolPhone] = useState('');
  const [newVolEmail, setNewVolEmail] = useState('');
  const [newVolSkills, setNewVolSkills] = useState('تنظيم فعاليات، تصميم، تصوير');

  // New Trainer modal state
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [newTrName, setNewTrName] = useState('');
  const [newTrPhone, setNewTrPhone] = useState('');
  const [newTrEmail, setNewTrEmail] = useState('');

  // Stats calculation
  const totalUsers = dbState.users.length;
  const trainersCount = dbState.users.filter((u) => u.roles.includes('trainer')).length;
  const volunteersCount = dbState.volunteers.length;
  const membersCount = dbState.members.length;
  const guardiansCount = dbState.guardians.length;
  const staffCount = dbState.users.filter(
    (u) => u.roles.includes('director') || u.roles.includes('finance') || u.roles.includes('coordinator')
  ).length;

  // Filter users based on activeTab and search
  const filteredPersonnel = useMemo(() => {
    return dbState.users.filter((user) => {
      // Tab filter
      if (activeTab === 'trainers' && !user.roles.includes('trainer')) return false;
      if (activeTab === 'volunteers' && !user.roles.includes('volunteer')) return false;
      if (activeTab === 'members' && !user.roles.includes('member')) return false;
      if (activeTab === 'guardians' && !user.roles.includes('guardian')) return false;
      if (activeTab === 'staff') {
        const isStaff =
          user.roles.includes('director') ||
          user.roles.includes('finance') ||
          user.roles.includes('coordinator');
        if (!isStaff) return false;
      }

      // Status filter
      if (statusFilter === 'active' && user.status !== 'active') return false;
      if (statusFilter === 'suspended' && user.status !== 'suspended') return false;
      if (statusFilter === 'probation') {
        const member = dbState.members.find((m) => m.userId === user.id);
        const volunteer = dbState.volunteers.find((v) => v.userId === user.id);
        const isProbation = member?.status === 'new_enrollee' || volunteer?.status === 'trial';
        if (!isProbation) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(term);
        const matchesPhone = user.phone.includes(term);
        const matchesEmail = user.email.toLowerCase().includes(term);
        const member = dbState.members.find((m) => m.userId === user.id);
        const matchesMemNo = member ? member.membershipNo.toLowerCase().includes(term) : false;
        return matchesName || matchesPhone || matchesEmail || matchesMemNo;
      }

      return true;
    });
  }, [dbState.users, dbState.members, dbState.volunteers, activeTab, statusFilter, searchTerm]);

  // Handle status toggle (Suspend / Activate)
  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    db.updateUserStatus(
      user.id,
      nextStatus,
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
    );
    showToast(
      nextStatus === 'active'
        ? `تم تفعيل حساب (${user.name}) بنجاح.`
        : `تم إيقاف حساب (${user.name}) وتجميد صلاحياته مؤقتاً.`,
      nextStatus === 'active' ? 'success' : 'warning'
    );
  };

  // Impersonate / switch to user portal
  const handleOpenUserPortal = (user: User) => {
    const primaryRole = user.roles[0];
    switchUser(user.id, primaryRole);
    setSelectedPersonnel(null);
  };

  // Add Trainer
  const handleCreateTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrName.trim()) return;

    db.addNewTrainer(
      {
        name: newTrName.trim(),
        phone: newTrPhone.trim() || '07700000000',
        email: newTrEmail.trim() || `${Date.now()}@rawad-trainer.iq`,
      },
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
    );

    showToast(`تم إنشاء ملف المحاضر الجديد (${newTrName}) بنجاح.`, 'success');
    setShowAddTrainerModal(false);
    setNewTrName('');
    setNewTrPhone('');
    setNewTrEmail('');
  };

  // Add Volunteer
  const handleCreateVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVolName.trim()) return;

    db.addNewVolunteerDirectly(
      {
        name: newVolName.trim(),
        phone: newVolPhone.trim() || '07700000000',
        email: newVolEmail.trim() || `${Date.now()}@rawad-vol.iq`,
        skills: newVolSkills.split('،').map((s) => s.trim()).filter(Boolean),
      },
      currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
    );

    showToast(`تم إنشاء ملف المتطوع الجديد (${newVolName}) بنجاح.`, 'success');
    setShowAddVolunteerModal(false);
    setNewVolName('');
    setNewVolPhone('');
    setNewVolEmail('');
  };

  // Export HR directory to CSV
  const handleExportDirectory = () => {
    const headers = ['الرقم التعريفي', 'الاسم', 'الهاتف', 'البريد', 'الأدوار', 'الحالة'];
    const rows = filteredPersonnel.map((u) => [
      u.id,
      u.name,
      u.phone,
      u.email,
      u.roles.join(' - '),
      u.status === 'active' ? 'نشط' : 'موقوف',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `دليل_شؤون_الأفراد_HR_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير سجلات الموارد البشرية بنجاح.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1E4E8C]/10 dark:bg-blue-900/40 text-[#1E4E8C] dark:text-blue-300">
              نظام الموارد البشرية وإدارة الكوادر (HR Management)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            شؤون الأفراد والملفات الوظيفية والعضوية
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            منظومة متكاملة لملفات المحاضرين، المتطوعين، المنتسبين والملتحقين، وأولياء الأمور، مع تتبع الحضور والسجلات والأداء.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Member Direct */}
          <button
            onClick={openAddMember}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ ملتحق جديد</span>
          </button>

          {/* Add Trainer */}
          <button
            onClick={() => setShowAddTrainerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>+ محاضر جديد</span>
          </button>

          {/* Add Volunteer */}
          <button
            onClick={() => setShowAddVolunteerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>+ متطوع جديد</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExportDirectory}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="تصدير كملف Excel / CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition ${
            activeTab === 'all'
              ? 'border-[#1E4E8C] bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-[#1E4E8C]'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي الأفراد</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {totalUsers}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">ملف موثق في المركز</div>
        </div>

        <div
          onClick={() => setActiveTab('trainers')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition ${
            activeTab === 'trainers'
              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-1 ring-teal-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            <span>المحاضرون</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {trainersCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">مدربون معتمدون</div>
        </div>

        <div
          onClick={() => setActiveTab('volunteers')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition ${
            activeTab === 'volunteers'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-1 ring-amber-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3" />
            <span>المتطوعون</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {volunteersCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">فرق العمل والورديات</div>
        </div>

        <div
          onClick={() => setActiveTab('members')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition ${
            activeTab === 'members'
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>المنتسبون</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {membersCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">ملتحقون ونشطون</div>
        </div>

        <div
          onClick={() => setActiveTab('guardians')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition ${
            activeTab === 'guardians'
              ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 ring-1 ring-rose-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>أولياء الأمور</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {guardiansCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">أوصياء القاصرين</div>
        </div>

        <div
          onClick={() => setActiveTab('staff')}
          className={`cursor-pointer p-3.5 rounded-2xl border transition ${
            activeTab === 'staff'
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            <span>الكادر الإداري</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {staffCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">الإدارة والمالية</div>
        </div>
      </div>

      {/* Directory Tabs and Search Bar */}
      <div className="space-y-3">
        {/* Tab pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-[#1E4E8C] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            كافة الملفات ({totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('trainers')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
              activeTab === 'trainers'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            المحاضرون والمدربون ({trainersCount})
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
              activeTab === 'volunteers'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            المتطوعون ({volunteersCount})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
              activeTab === 'members'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            المنتسبون والملتحقون ({membersCount})
          </button>
          <button
            onClick={() => setActiveTab('guardians')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
              activeTab === 'guardians'
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            أولياء الأمور ({guardiansCount})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition shrink-0 ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الكادر الإداري ({staffCount})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="البحث بالاسم، رقم الهاتف، البريد، أو رقم العضوية والملف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#1E4E8C] outline-hidden shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              <option value="all">كافة الحالات (نشط + موقوف)</option>
              <option value="active">نشط فقط (Active)</option>
              <option value="probation">تحت التأهيل / التجربة (Probation)</option>
              <option value="suspended">موقوف مؤقتاً (Suspended)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personnel Records Table / Cards */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
              <tr>
                <th className="py-3.5 px-4">الفرد / صاحب الملف</th>
                <th className="py-3.5 px-4">الدور والتصنيف</th>
                <th className="py-3.5 px-4">بيانات الاتصال</th>
                <th className="py-3.5 px-4">مؤشرات النشاط والأداء</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات الملف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    لا توجد ملفات مطابقة لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredPersonnel.map((user) => {
                  const member = dbState.members.find((m) => m.userId === user.id);
                  const volunteer = dbState.volunteers.find((v) => v.userId === user.id);
                  const guardian = dbState.guardians.find((g) => g.userId === user.id);

                  // Linked courses if trainer
                  const coursesTaught = dbState.offerings.filter((o) => o.trainerId === user.id);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E4E8C] to-[#163a69] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {member?.isMinor && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                  قاصر
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {member ? member.membershipNo : user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r) => {
                            let badgeClass = 'bg-slate-100 text-slate-700';
                            let roleTitle: string = r;
                            if (r === 'director') {
                              badgeClass = 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300';
                              roleTitle = 'مدير عام';
                            } else if (r === 'finance') {
                              badgeClass = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
                              roleTitle = 'مسؤول مالي';
                            } else if (r === 'coordinator') {
                              badgeClass = 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
                              roleTitle = 'منسق أنشطة';
                            } else if (r === 'trainer') {
                              badgeClass = 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300';
                              roleTitle = 'محاضر';
                            } else if (r === 'volunteer') {
                              badgeClass = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300';
                              roleTitle = 'متطوع';
                            } else if (r === 'member') {
                              badgeClass = 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300';
                              roleTitle = member?.status === 'new_enrollee' ? 'ملتحق جديد' : 'منتسب نشط';
                            } else if (r === 'guardian') {
                              badgeClass = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300';
                              roleTitle = 'ولي أمر';
                            }

                            return (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}
                              >
                                {roleTitle}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div>{user.phone}</div>
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-[150px]">
                          {user.email}
                        </div>
                      </td>

                      {/* Role-specific Metrics */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {member && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              الحضور: {member.totalHoursAttended} ساعة
                            </span>
                            <div className="text-[10px] text-slate-400">
                              المنطقة: {member.region}
                            </div>
                          </div>
                        )}
                        {volunteer && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-amber-700 dark:text-amber-300">
                              {volunteer.approvedHours} ساعة معتمدة
                            </span>
                            <div className="text-[10px] text-slate-400">
                              مستوى: {volunteer.level === 'gold' ? 'ذهبي ⭐' : volunteer.level === 'silver' ? 'فضي' : 'برونزي'}
                            </div>
                          </div>
                        )}
                        {user.roles.includes('trainer') && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-teal-700 dark:text-teal-300">
                              {coursesTaught.length} دورات مسندة
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {coursesTaught.map((c) => c.name).join(' · ') || 'جاهز للإسناد'}
                            </div>
                          </div>
                        )}
                        {guardian && (
                          <div className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                            ولي أمر معتمد
                          </div>
                        )}
                        {!member && !volunteer && !user.roles.includes('trainer') && !guardian && (
                          <span className="text-slate-400 text-[10px]">كادر إداري وتنظيمي</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                            user.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {user.status === 'active' ? 'نشط' : 'موقوف'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Open Dossier */}
                          <button
                            onClick={() =>
                              setSelectedPersonnel({
                                user,
                                member,
                                volunteer,
                                guardian,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1E4E8C] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold transition flex items-center gap-1"
                            title="عرض الملف الوظيفي والشخصي الكامل"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>الملف</span>
                          </button>

                          {/* Quick Impersonate / Portal view */}
                          <button
                            onClick={() => handleOpenUserPortal(user)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="معاينة البوابة الشخصية كـ هذا المستخدم"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle status */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition ${
                              user.status === 'active'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={user.status === 'active' ? 'إيقاف الحساب مؤقتاً' : 'تفعيل الحساب'}
                          >
                            {user.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED PERSONNEL DOSSIER MODAL */}
      {selectedPersonnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 dark:border-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#1E4E8C] to-[#163a69] text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl font-bold border border-white/20 shadow-sm shrink-0">
                  {selectedPersonnel.user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black">{selectedPersonnel.user.name}</h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedPersonnel.user.status === 'active'
                          ? 'bg-emerald-400 text-slate-900'
                          : 'bg-rose-400 text-slate-900'
                      }`}
                    >
                      {selectedPersonnel.user.status === 'active' ? 'حساب نشط' : 'موقوف'}
                    </span>
                  </div>
                  <div className="text-xs text-blue-200 font-mono mt-0.5">
                    الرقم التعريفي: {selectedPersonnel.member?.membershipNo || selectedPersonnel.user.id}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedPersonnel.user.roles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-semibold"
                      >
                        {r === 'director'
                          ? 'مدير عام'
                          : r === 'finance'
                          ? 'مسؤول مالي'
                          : r === 'coordinator'
                          ? 'منسق أنشطة'
                          : r === 'trainer'
                          ? 'محاضر ومدرب'
                          : r === 'volunteer'
                          ? 'متطوع'
                          : r === 'member'
                          ? 'منتسب'
                          : 'ولي أمر'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPersonnel(null)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right text-xs">
              {/* Basic Personal & Contact Information */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">بيانات الاتصال والتسجيل</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">رقم الهاتف</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200" dir="ltr">
                        {selectedPersonnel.user.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">البريد الإلكتروني</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">
                        {selectedPersonnel.user.email}
                      </span>
                    </div>
                  </div>

                  {selectedPersonnel.member && (
                    <>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">المنطقة والسكن</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {selectedPersonnel.member.region}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">تاريخ الميلاد</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {selectedPersonnel.member.birthDate} ({selectedPersonnel.member.gender === 'male' ? 'ذكر' : 'أنثى'})
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Minor & Guardian Details if applicable */}
              {selectedPersonnel.member?.isMinor && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>ملف الوصاية القانونية وموافقة ولي الأمر (قاصر)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    هذا المنتسب مسجل تحت وصاية ولي الأمر القانوني وتم اعتماد موافقته الخطية/الشفهية عند القيد.
                  </p>
                </div>
              )}

              {/* Trainer courses if applicable */}
              {selectedPersonnel.user.roles.includes('trainer') && (
                <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold">
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    <span>الدورات المسندة لهذا المحاضر</span>
                  </div>
                  <div className="space-y-1.5">
                    {dbState.offerings
                      .filter((o) => o.trainerId === selectedPersonnel.user.id)
                      .map((off) => (
                        <div
                          key={off.id}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900 flex items-center justify-between"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">{off.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {off.enrolledCount} / {off.capacity} متدرب
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Volunteer Hours if applicable */}
              {selectedPersonnel.volunteer && (
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>سجل ساعات التطوع والخدمة المجتمعية</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900">
                      <span className="text-base font-black text-amber-700 dark:text-amber-300">
                        {selectedPersonnel.volunteer.approvedHours} ساعة
                      </span>
                      <span className="block text-[10px] text-slate-500">إجمالي الساعات المعتمدة</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900">
                      <span className="text-base font-black text-amber-700 dark:text-amber-300">
                        {selectedPersonnel.volunteer.level === 'gold' ? 'ذهبي ⭐⭐⭐' : selectedPersonnel.volunteer.level === 'silver' ? 'فضي ⭐⭐' : 'برونزي ⭐'}
                      </span>
                      <span className="block text-[10px] text-slate-500">مستوى وسام التطوع</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(selectedPersonnel.user)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedPersonnel.user.status === 'active'
                    ? 'border border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                {selectedPersonnel.user.status === 'active' ? (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>تجميد / إيقاف الحساب</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>إعادة تفعيل الحساب</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الملف</span>
                </button>
                <button
                  onClick={() => handleOpenUserPortal(selectedPersonnel.user)}
                  className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white hover:bg-[#163a69] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة البوابة كـ هذا المستخدم</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TRAINER MODAL */}
      {showAddTrainerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <span>إضافة محاضر جديد للمركز</span>
              </div>
              <button
                onClick={() => setShowAddTrainerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrainer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  اسم المحاضر الكامل واللقب العلمي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. صفاء الدين الكرخي"
                  value={newTrName}
                  onChange={(e) => setNewTrName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXXX"
                  value={newTrPhone}
                  onChange={(e) => setNewTrPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  placeholder="trainer@domain.iq"
                  value={newTrEmail}
                  onChange={(e) => setNewTrEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTrainerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
                >
                  حفظ المحاضر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VOLUNTEER MODAL */}
      {showAddVolunteerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
                <span>إضافة متطوع جديد للمركز</span>
              </div>
              <button
                onClick={() => setShowAddVolunteerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVolunteer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  اسم المتطوع الكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مريم عبد الله التميمي"
                  value={newVolName}
                  onChange={(e) => setNewVolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXXX"
                  value={newVolPhone}
                  onChange={(e) => setNewVolPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  المهارات ومجالات التطوع
                </label>
                <input
                  type="text"
                  placeholder="تنظيم، إعلام، علاقات عامة"
                  value={newVolSkills}
                  onChange={(e) => setNewVolSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddVolunteerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
                >
                  حفظ المتطوع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
