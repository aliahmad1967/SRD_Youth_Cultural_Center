import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Bell,
  LogOut,
  ChevronDown,
  Layers,
  FileText,
  UserCheck,
  Calendar,
  Award,
  Wallet,
  ShieldAlert,
  Server,
  BookOpen,
  Settings,
  Moon,
  Sun,
  Coins,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeRole,
    currentView,
    navigate,
    dbState,
    logout,
    switchRole,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    openSettings,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Unread notifications for this user
  const userNotifications = dbState.notifications.filter(
    (n) => (currentUser && n.userId === currentUser.id) || n.userId === 'all'
  );
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  // Nav links tailored to current role
  let navLinks: Array<{ label: string; view: AppView }> = [];

  if (activeRole === 'director') {
    navLinks = [
      { label: 'لوحة القيادة', view: 'dashboard' },
      { label: 'شؤون الأفراد والكوادر (HR)', view: 'hr_management' },
      { label: 'الدورات والأنشطة', view: 'courses' },
      { label: 'المالية والموازنات', view: 'finance' },
      { label: 'طلبات الالتحاق', view: 'applications' },
    ];
  } else if (activeRole === 'finance') {
    navLinks = [
      { label: 'الحسابات والمالية', view: 'finance' },
      { label: 'ملفات الأفراد والرسوم (HR)', view: 'hr_management' },
      { label: 'التقارير والموازنات', view: 'dashboard' },
    ];
  } else if (activeRole === 'coordinator') {
    navLinks = [
      { label: 'ملفات الأفراد (HR)', view: 'hr_management' },
      { label: 'طلبات الالتحاق', view: 'applications' },
      { label: 'الدورات والحضور', view: 'courses' },
      { label: 'الفعاليات والحملات', view: 'events' },
    ];
  } else if (activeRole === 'trainer') {
    navLinks = [
      { label: 'بوابتي التدريبية', view: 'portal_trainer' },
      { label: 'رصد الحضور', view: 'attendance' },
      { label: 'بنك الأسئلة والاختبارات', view: 'exams' },
      { label: 'الدورات والكتالوج', view: 'courses' },
    ];
  } else if (activeRole === 'volunteer') {
    navLinks = [
      { label: 'بوابة المتطوع', view: 'portal_volunteer' },
      { label: 'الفرص والورديات', view: 'events' },
      { label: 'ساعاتي وشاراتي', view: 'portal_volunteer' },
      { label: 'شهاداتي', view: 'certificates' },
    ];
  } else if (activeRole === 'member') {
    navLinks = [
      { label: 'بوابتي الشخصية', view: 'portal_member' },
      { label: 'دوراتي وجلساتي', view: 'courses' },
      { label: 'الاختبارات والتقييم', view: 'exams' },
      { label: 'شهاداتي الرسمية', view: 'certificates' },
    ];
  } else if (activeRole === 'guardian') {
    navLinks = [
      { label: 'بوابة ولي الأمر', view: 'portal_guardian' },
      { label: 'سجل حضور الأبناء', view: 'portal_guardian' },
      { label: 'الدورات والمستحقات', view: 'courses' },
    ];
  }

  return (
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-7 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark & Logo */}
        <div
          onClick={() => {
            if (activeRole === 'director') navigate('dashboard');
            else if (activeRole === 'finance') navigate('finance');
            else if (activeRole === 'coordinator') navigate('members');
            else if (activeRole === 'trainer') navigate('portal_trainer');
            else if (activeRole === 'volunteer') navigate('portal_volunteer');
            else if (activeRole === 'member') navigate('portal_member');
            else if (activeRole === 'guardian') navigate('portal_guardian');
            else navigate('dashboard');
          }}
          className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E4E8C] to-[#0E2E5C] flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-[#1E4E8C] dark:text-blue-400 tracking-tight whitespace-nowrap">
              {dbState.settings.name || 'مركز الرواد الشبابي'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              {dbState.settings.tagline || 'الثقافي والتوعوي'}
            </span>
          </div>
        </div>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.view)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#1E4E8C] dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Settings & Currency & Night Mode & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Currency Switcher Badge */}
          <button
            onClick={() => setCurrency(currency === 'IQD' ? 'USD' : 'IQD')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title={`العملة الحالية: ${currency === 'IQD' ? 'دينار عراقي (د.ع)' : 'دولار أمريكي ($)'} - اضغط للتبديل السريع`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{currency === 'IQD' ? 'د.ع (عراقي)' : '$ (USD)'}</span>
          </button>

          {/* Quick Theme Toggle (Night Mode) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={theme === 'dark' ? 'التحويل للوضع النهاري ☀️' : 'التحويل للوضع الليلي الداكن 🌙'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={openSettings}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="إعدادات التطبيق الشاملة (العملة، المود الليلي، بيانات المركز)"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          <PWAInstallButton compact />

          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              title="مركز الإشعارات والتنبيهات"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D64545] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification popover */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-right">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">مركز التنبيهات</span>
                  <span className="text-[10px] text-slate-400">{userNotifications.length} إشعار</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {userNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">لا توجد إشعارات جديدة</div>
                  ) : (
                    userNotifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs ${!n.read ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}`}>
                        <div className="font-semibold text-slate-900 dark:text-white mb-0.5">{n.title}</div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('notifications');
                    }}
                    className="text-[11px] font-medium text-[#1E4E8C] dark:text-blue-400 hover:underline"
                  >
                    عرض كل الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill / Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-right"
              >
                <div className="w-7 h-7 rounded-lg bg-[#1E4E8C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#1A9E9A] font-semibold">
                    {currentUser.roles.map((r) => (r === 'director' ? 'مدير' : r === 'finance' ? 'مالي' : r === 'coordinator' ? 'منسق' : r === 'trainer' ? 'مدرب' : r === 'volunteer' ? 'متطوع' : r === 'member' ? 'عضو' : 'ولي أمر')).join(' · ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-right">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{currentUser.phone}</p>
                  </div>

                  {currentUser.roles.length > 1 && (
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                        تبديل الواجهة لهذا المستخدم:
                      </span>
                      {currentUser.roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            switchRole(role);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-right px-2 py-1 text-xs rounded-md transition ${
                            activeRole === role
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1E4E8C] dark:text-blue-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          واجهة {role === 'volunteer' ? 'المتطوع' : role === 'member' ? 'المنتسب' : role}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openSettings();
                      }}
                      className="w-full text-right px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>إعدادات النظام والعملة</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('system_status');
                      }}
                      className="w-full text-right px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      <span>حالة الخادم المحلي والقاعدة</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-right px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('dashboard')}
              className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
