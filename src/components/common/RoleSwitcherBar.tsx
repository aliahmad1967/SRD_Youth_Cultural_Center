import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CreditCard,
  ClipboardList,
  Users,
  Wifi,
  WifiOff,
  RotateCcw,
  QrCode,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  FileText,
} from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const {
    currentUser,
    activeRole,
    switchUser,
    isOnline,
    toggleSimulatedOffline,
    openQRScanner,
    navigate,
    showToast,
    dbState,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  // Core administrative personas only (Staff)
  const staffPersonas = [
    {
      role: 'director' as const,
      userId: 'u-dir',
      title: 'المدير العام',
      name: 'أحمد المنصور',
      icon: ShieldCheck,
      color: 'bg-indigo-600',
    },
    {
      role: 'finance' as const,
      userId: 'u-fin',
      title: 'المسؤول المالي',
      name: 'طارق السيد',
      icon: CreditCard,
      color: 'bg-emerald-600',
    },
    {
      role: 'coordinator' as const,
      userId: 'u-coord',
      title: 'منسق الأنشطة',
      name: 'سارة الخطيب',
      icon: ClipboardList,
      color: 'bg-[#1E4E8C]',
    },
  ];

  return (
    <div className="no-print sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between text-xs flex-wrap gap-2">
        {/* Left Side: Core Staff switcher + HR Directory link */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
            الكادر الإداري:
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {staffPersonas.map((p) => {
              const isActive = currentUser?.id === p.userId && activeRole === p.role;
              const Icon = p.icon;
              return (
                <button
                  key={p.userId}
                  onClick={() => switchUser(p.userId, p.role)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                    isActive
                      ? `${p.color} text-white shadow-xs ring-1 ring-white/30 font-bold`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={`${p.title} - ${p.name}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{p.title}</span>
                </button>
              );
            })}

            {/* Direct HR Management link for all other people */}
            <button
              onClick={() => navigate('hr_management')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-950/80 hover:bg-teal-900 border border-teal-700/60 text-teal-300 text-[11px] font-bold transition shrink-0"
              title="إدارة شؤون الأفراد والكوادر: ملفات المحاضرين، المتطوعين، المنتسبين، وأولياء الأمور"
            >
              <FolderKanban className="w-3.5 h-3.5 text-teal-400" />
              <span>ملفات الأفراد (HR Management)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-800 text-teal-200 text-[9px] font-mono">
                {dbState.users.length} فرد
              </span>
            </button>
          </div>
        </div>

        {/* Right Side: Tools & Offline simulation */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Offline Toggle */}
          <button
            onClick={toggleSimulatedOffline}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-700/50'
                : 'bg-amber-600 text-white animate-pulse'
            }`}
            title="تبديل محاكاة حالة الاتصال (اختبار الحضور دون إنترنت)"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>الشبكة متصلة</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-white" />
                <span>وضع عدم الاتصال (Offline)</span>
              </>
            )}
          </button>

          {/* Quick QR Scanner */}
          <button
            onClick={() =>
              openQRScanner((code) => {
                showToast(`تم التقاط الرمز: ${code}`, 'info');
              })
            }
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
            title="قارئ الباركود ومسح البطاقات"
          >
            <QrCode className="w-3 h-3 text-[#E8A33D]" />
            <span className="hidden md:inline">مسح QR</span>
          </button>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white"
            title="روابط سريعة عامة"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Quick Links for Public / Verification / Reset */}
      {isExpanded && (
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
            <span>صفحات الزوار العامة:</span>
            <button
              onClick={() => navigate('public_apply_member')}
              className="hover:text-white underline decoration-dotted"
            >
              نموذج طلب التحاق جديد
            </button>
            <span>·</span>
            <button
              onClick={() => navigate('public_apply_volunteer')}
              className="hover:text-white underline decoration-dotted"
            >
              نموذج طلب تطوع
            </button>
            <span>·</span>
            <button
              onClick={() => navigate('public_verify_cert')}
              className="hover:text-white underline decoration-dotted"
            >
              بوابة التحقق من الشهادات
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('system_status')}
              className="text-slate-300 hover:text-[#1A9E9A] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>حالة الخادم المحلي والنسخ الاحتياطي</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
