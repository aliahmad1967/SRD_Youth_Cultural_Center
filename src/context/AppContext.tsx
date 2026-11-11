import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, DatabaseState } from '../services/storage';
import { User, UserRole, CurrencyCode, ThemeMode } from '../types';

export type AppView =
  | 'dashboard'
  | 'hr_management'
  | 'applications'
  | 'members'
  | 'volunteers'
  | 'courses'
  | 'course_detail'
  | 'attendance'
  | 'events'
  | 'exams'
  | 'exam_taker'
  | 'exam_grading'
  | 'evaluations'
  | 'certificates'
  | 'finance'
  | 'notifications'
  | 'announcements'
  | 'system_status'
  // Role-specific portals
  | 'portal_member'
  | 'portal_volunteer'
  | 'portal_guardian'
  | 'portal_trainer'
  // Public non-authenticated pages
  | 'public_apply_member'
  | 'public_apply_volunteer'
  | 'public_verify_cert';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface AssignTrainerData {
  offeringId: string;
  courseName: string;
  currentTrainerId: string;
  currentTrainerName: string;
}

interface AppContextType {
  dbState: DatabaseState;
  currentUser: User | null;
  activeRole: UserRole | 'guest';
  currentView: AppView;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toasts: ToastMessage[];
  selectedCourseId: string | null;
  selectedSessionId: string | null;
  selectedMemberId: string | null;
  selectedExamId: string | null;
  selectedExamAttemptId: string | null;
  selectedCertCode: string | null;
  isQRScannerOpen: boolean;
  qrScannerCallback: ((scannedText: string) => void) | null;

  // Currency & Theme
  currency: CurrencyCode;
  theme: ThemeMode;
  formatMoney: (amount: number) => string;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setCurrency: (currency: CurrencyCode) => void;

  // Modals
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  isAddMemberOpen: boolean;
  openAddMember: () => void;
  closeAddMember: () => void;

  isAssignTrainerOpen: boolean;
  assignTrainerData: AssignTrainerData | null;
  openAssignTrainer: (data: AssignTrainerData) => void;
  closeAssignTrainer: () => void;

  isBackupModalOpen: boolean;
  openBackupModal: () => void;
  closeBackupModal: () => void;

  // Archive Manager
  isArchiveModalOpen: boolean;
  openArchiveModal: () => void;
  closeArchiveModal: () => void;
  archiveMember: (memberId: string, reason?: string) => void;
  restoreMember: (memberId: string) => void;
  archiveOffering: (offeringId: string, reason?: string) => void;
  restoreOffering: (offeringId: string) => void;
  archiveCourse: (courseId: string, reason?: string) => void;
  restoreCourse: (courseId: string) => void;
  batchArchiveCompletedCourses: () => void;
  batchArchiveGraduatedMembers: () => void;

  // User Guide Modal (دليل المستخدم)
  isUserGuideOpen: boolean;
  openUserGuide: () => void;
  closeUserGuide: () => void;

  // Actions
  switchUser: (userId: string, roleOverride?: UserRole) => void;
  switchRole: (role: UserRole) => void;
  navigate: (view: AppView, params?: { courseId?: string; sessionId?: string; memberId?: string; examId?: string; attemptId?: string; certCode?: string }) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  toggleSimulatedOffline: () => void;
  triggerManualSync: () => void;
  openQRScanner: (onScan: (scannedText: string) => void) => void;
  closeQRScanner: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState<DatabaseState>(db.getState());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Default to Director on first load for easy inspection
    return db.getState().users.find((u) => u.roles.includes('director')) || db.getState().users[0];
  });
  const [activeRole, setActiveRole] = useState<UserRole | 'guest'>('director');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [realOnline, setRealOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAssignTrainerOpen, setIsAssignTrainerOpen] = useState(false);
  const [assignTrainerData, setAssignTrainerData] = useState<AssignTrainerData | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  // Selection states
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExamAttemptId, setSelectedExamAttemptId] = useState<string | null>(null);
  const [selectedCertCode, setSelectedCertCode] = useState<string | null>(null);

  // QR Scanner modal state
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrScannerCallback, setQrScannerCallback] = useState<((scannedText: string) => void) | null>(null);

  // Initialize theme from settings or localStorage
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('rawad_theme') : null;
    return (saved as ThemeMode) || db.getState().settings.themeMode || 'light';
  });

  // Keep dark class synced with document element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('rawad_theme', theme);
    }
  }, [theme]);

  // Real browser online/offline listeners
  useEffect(() => {
    const handleOnline = () => setRealOnline(true);
    const handleOffline = () => setRealOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = db.subscribe(() => {
      const fresh = db.getState();
      setDbState({ ...fresh });
      if (fresh.settings.themeMode && fresh.settings.themeMode !== theme) {
        setThemeState(fresh.settings.themeMode);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [theme]);

  const effectiveOnline = realOnline && !isSimulatedOffline;

  // Currency & Money formatting
  const currentCurrency = dbState.settings.currency || 'IQD';
  const usdRate = dbState.settings.usdToIqdRate || 1310;

  const formatMoney = (amountInIQD: number): string => {
    if (currentCurrency === 'USD') {
      const inUSD = amountInIQD / usdRate;
      return `$${inUSD.toLocaleString('en-US', {
        minimumFractionDigits: inUSD % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })}`;
    }
    // Default Iraqi Dinar (IQD)
    return `${Math.round(amountInIQD).toLocaleString('ar-IQ')} د.ع`;
  };

  const setCurrency = (newCurrency: CurrencyCode) => {
    db.updateSettings(
      {
        currency: newCurrency,
        currencySymbol: newCurrency === 'USD' ? '$' : 'د.ع',
      },
      currentUser ? { id: currentUser.id, name: currentUser.name } : undefined
    );
    showToast(
      newCurrency === 'USD'
        ? 'تم تغيير العملة النقدية إلى الدولار الأمريكي ($ USD)'
        : 'تم تغيير العملة النقدية إلى الدينار العراقي (IQD د.ع)',
      'info'
    );
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    db.updateSettings(
      { themeMode: newTheme },
      currentUser ? { id: currentUser.id, name: currentUser.name } : undefined
    );
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(
      nextTheme === 'dark' ? 'تم تفعيل الوضع الليلي الداكن 🌙' : 'تم تفعيل الوضع النهاري الفاتح ☀️',
      'info'
    );
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (!next) {
        // Returned to online mode -> trigger sync!
        const syncedCount = db.syncOfflineRecords();
        showToast(`تمت استعادة الاتصال بنجاح. تمت مزامنة ${syncedCount} سجلات غير مرسلة.`, 'success');
      } else {
        showToast('تم تفعيل وضع عدم الاتصال (Offline Mode). سيتم حفظ العمليات محلياً.', 'warning');
      }
      return next;
    });
  };

  const triggerManualSync = () => {
    const syncedCount = db.syncOfflineRecords();
    showToast(`تمت مزامنة ${syncedCount} سجل بنجاح مع الخادم المحلي.`, 'success');
  };

  const switchUser = (userId: string, roleOverride?: UserRole) => {
    const user = dbState.users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      const chosenRole = roleOverride || user.roles[0];
      setActiveRole(chosenRole);

      // Auto route to appropriate view for the role (AUTH-02)
      if (chosenRole === 'director') setCurrentView('dashboard');
      else if (chosenRole === 'finance') setCurrentView('finance');
      else if (chosenRole === 'coordinator') setCurrentView('applications');
      else if (chosenRole === 'trainer') setCurrentView('portal_trainer');
      else if (chosenRole === 'volunteer') setCurrentView('portal_volunteer');
      else if (chosenRole === 'member') setCurrentView('portal_member');
      else if (chosenRole === 'guardian') setCurrentView('portal_guardian');

      showToast(`تم التبديل إلى حساب: ${user.name} (${getRoleTitle(chosenRole)})`, 'info');
    }
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'director') setCurrentView('dashboard');
    else if (role === 'finance') setCurrentView('finance');
    else if (role === 'coordinator') setCurrentView('members');
    else if (role === 'trainer') setCurrentView('portal_trainer');
    else if (role === 'volunteer') setCurrentView('portal_volunteer');
    else if (role === 'member') setCurrentView('portal_member');
    else if (role === 'guardian') setCurrentView('portal_guardian');
    showToast(`تم تغيير واجهة العمل إلى دور: ${getRoleTitle(role)}`, 'info');
  };

  const navigate = (
    view: AppView,
    params?: {
      courseId?: string;
      sessionId?: string;
      memberId?: string;
      examId?: string;
      attemptId?: string;
      certCode?: string;
    }
  ) => {
    if (params?.courseId) setSelectedCourseId(params.courseId);
    if (params?.sessionId) setSelectedSessionId(params.sessionId);
    if (params?.memberId) setSelectedMemberId(params.memberId);
    if (params?.examId) setSelectedExamId(params.examId);
    if (params?.attemptId) setSelectedExamAttemptId(params.attemptId);
    if (params?.certCode) setSelectedCertCode(params.certCode);

    // Permission Guard (UAT-15, BR-19)
    if (view === 'finance' && activeRole !== 'finance' && activeRole !== 'director') {
      db.logAudit(
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'guest', name: 'زائر' },
        'محاولة وصول غير مصرح بها',
        'FinancePanel',
        'unauthorized',
        `محاولة دخول واجهة المالية من دور غير مصرح: ${activeRole}`
      );
      showToast('غير مصرح لك بالوصول إلى وحدة الحسابات المالية (مقتصرة على المسؤول المالي والمدير).', 'error');
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQRScanner = (onScan: (scannedText: string) => void) => {
    setQrScannerCallback(() => onScan);
    setIsQRScannerOpen(true);
  };

  const closeQRScanner = () => {
    setIsQRScannerOpen(false);
    setQrScannerCallback(null);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const openAddMember = () => setIsAddMemberOpen(true);
  const closeAddMember = () => setIsAddMemberOpen(false);

  const openAssignTrainer = (data: AssignTrainerData) => {
    setAssignTrainerData(data);
    setIsAssignTrainerOpen(true);
  };

  const closeAssignTrainer = () => {
    setIsAssignTrainerOpen(false);
    setAssignTrainerData(null);
  };

  const openBackupModal = () => setIsBackupModalOpen(true);
  const closeBackupModal = () => setIsBackupModalOpen(false);

  const openArchiveModal = () => setIsArchiveModalOpen(true);
  const closeArchiveModal = () => setIsArchiveModalOpen(false);

  const archiveMember = (memberId: string, reason?: string) => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const success = db.archiveMember(memberId, performer, reason);
    if (success) {
      showToast('تم نقل سجل المنتسب إلى قسم الأرشيف بنجاح.', 'success');
    }
  };

  const restoreMember = (memberId: string) => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const success = db.restoreMember(memberId, performer);
    if (success) {
      showToast('تمت استعادة المنتسب من الأرشيف وإعادته إلى الجداول النشطة بنجاح.', 'success');
    }
  };

  const archiveOffering = (offeringId: string, reason?: string) => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const success = db.archiveOffering(offeringId, performer, reason);
    if (success) {
      showToast('تمت أرشفة دفعة الدورة بنجاح ونقلها من الجداول النشطة.', 'success');
    }
  };

  const restoreOffering = (offeringId: string) => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const success = db.restoreOffering(offeringId, performer);
    if (success) {
      showToast('تمت استعادة دفعة الدورة إلى الجداول النشطة بنجاح.', 'success');
    }
  };

  const archiveCourse = (courseId: string, reason?: string) => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const success = db.archiveCourse(courseId, performer, reason);
    if (success) {
      showToast('تمت أرشفة البرنامج التدريبي ودفعاته بنجاح.', 'success');
    }
  };

  const restoreCourse = (courseId: string) => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const success = db.restoreCourse(courseId, performer);
    if (success) {
      showToast('تمت استعادة البرنامج التدريبي إلى الكتالوج النشط بنجاح.', 'success');
    }
  };

  const batchArchiveCompletedCourses = () => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const res = db.batchArchiveCompletedCourses(performer);
    if (res.count > 0) {
      showToast(`تمت أرشفة ${res.count} دورات ودفعات منتهية بنجاح لتخفيف الازدحام.`, 'success');
    } else {
      showToast('لا توجد دورات منتهية جديدة بحاجة إلى أرشفة.', 'info');
    }
  };

  const batchArchiveGraduatedMembers = () => {
    const performer = currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'admin', name: 'المدير' };
    const res = db.batchArchiveGraduatedMembers(performer);
    if (res.count > 0) {
      showToast(`تمت أرشفة ${res.count} من المنتسبين الخريجين والمنسحبين لتنظيم السجلات.`, 'success');
    } else {
      showToast('لا توجد سجلات أعضاء خريجين أو منسحبين غير مؤرشفة حالياً.', 'info');
    }
  };

  const openUserGuide = () => setIsUserGuideOpen(true);
  const closeUserGuide = () => setIsUserGuideOpen(false);

  const logout = () => {
    setCurrentUser(null);
    setActiveRole('guest');
    setCurrentView('dashboard');
    showToast('تم تسجيل الخروج بنجاح.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        dbState,
        currentUser,
        activeRole,
        currentView,
        isOnline: effectiveOnline,
        isSimulatedOffline,
        toasts,
        selectedCourseId,
        selectedSessionId,
        selectedMemberId,
        selectedExamId,
        selectedExamAttemptId,
        selectedCertCode,
        isQRScannerOpen,
        qrScannerCallback,

        currency: currentCurrency,
        theme,
        formatMoney,
        toggleTheme,
        setTheme,
        setCurrency,

        isSettingsOpen,
        openSettings,
        closeSettings,

        isAddMemberOpen,
        openAddMember,
        closeAddMember,

        isAssignTrainerOpen,
        assignTrainerData,
        openAssignTrainer,
        closeAssignTrainer,

        isBackupModalOpen,
        openBackupModal,
        closeBackupModal,

        isArchiveModalOpen,
        openArchiveModal,
        closeArchiveModal,
        archiveMember,
        restoreMember,
        archiveOffering,
        restoreOffering,
        archiveCourse,
        restoreCourse,
        batchArchiveCompletedCourses,
        batchArchiveGraduatedMembers,

        isUserGuideOpen,
        openUserGuide,
        closeUserGuide,

        switchUser,
        switchRole,
        navigate,
        showToast,
        removeToast,
        toggleSimulatedOffline,
        triggerManualSync,
        openQRScanner,
        closeQRScanner,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export function getRoleTitle(role: UserRole | 'guest'): string {
  switch (role) {
    case 'director':
      return 'المدير العام';
    case 'finance':
      return 'المسؤول المالي';
    case 'coordinator':
      return 'منسق الأنشطة';
    case 'trainer':
      return 'محاضر / مدرب';
    case 'volunteer':
      return 'متطوع';
    case 'member':
      return 'منتسب / ملتحق';
    case 'guardian':
      return 'ولي أمر';
    default:
      return 'زائر';
  }
}
