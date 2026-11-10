import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { QRScannerModal } from './components/common/QRScannerModal';
import { ToastContainer } from './components/common/ToastContainer';
import { SettingsModal } from './components/common/SettingsModal';
import { AddMemberModal } from './components/common/AddMemberModal';
import { AssignTrainerModal } from './components/common/AssignTrainerModal';

// Views
import { DirectorDashboard } from './views/director/DirectorDashboard';
import { HRManagementView } from './views/hr/HRManagementView';
import { ApplicationsReviewView } from './views/coordinator/ApplicationsReviewView';
import { MembersManagementView } from './views/coordinator/MembersManagementView';
import { VolunteersManagementView } from './views/coordinator/VolunteersManagementView';
import { CoursesCatalogView } from './views/courses/CoursesCatalogView';
import { AttendanceTakingView } from './views/attendance/AttendanceTakingView';
import { EventsView } from './views/events/EventsView';
import { ExamsListView } from './views/exams/ExamsListView';
import { ExamTakerView } from './views/exams/ExamTakerView';
import { ExamGradingView } from './views/exams/ExamGradingView';
import { CertificatesView } from './views/certificates/CertificatesView';
import { FinanceView } from './views/finance/FinanceView';
import { NotificationsView } from './views/notifications/NotificationsView';
import { SystemStatusView } from './views/admin/SystemStatusView';
import { MemberPortalView } from './views/portal/MemberPortalView';
import { VolunteerPortalView } from './views/portal/VolunteerPortalView';
import { GuardianPortalView } from './views/portal/GuardianPortalView';
import { TrainerPortalView } from './views/portal/TrainerPortalView';
import { PublicApplyMemberView } from './views/auth/PublicApplyMemberView';
import { PublicApplyVolunteerView } from './views/auth/PublicApplyVolunteerView';
import { PublicVerifyCertView } from './views/auth/PublicVerifyCertView';

import { BookOpen, ShieldCheck, WifiOff, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, isOnline, navigate } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DirectorDashboard />;
      case 'hr_management':
        return <HRManagementView />;
      case 'applications':
        return <ApplicationsReviewView />;
      case 'members':
        return <MembersManagementView />;
      case 'volunteers':
        return <VolunteersManagementView />;
      case 'courses':
      case 'course_detail':
        return <CoursesCatalogView />;
      case 'attendance':
        return <AttendanceTakingView />;
      case 'events':
        return <EventsView />;
      case 'exams':
      case 'evaluations':
        return <ExamsListView />;
      case 'exam_taker':
        return <ExamTakerView />;
      case 'exam_grading':
        return <ExamGradingView />;
      case 'certificates':
        return <CertificatesView />;
      case 'finance':
        return <FinanceView />;
      case 'notifications':
      case 'announcements':
        return <NotificationsView />;
      case 'system_status':
        return <SystemStatusView />;
      case 'portal_member':
        return <MemberPortalView />;
      case 'portal_volunteer':
        return <VolunteerPortalView />;
      case 'portal_guardian':
        return <GuardianPortalView />;
      case 'portal_trainer':
        return <TrainerPortalView />;
      case 'public_apply_member':
        return <PublicApplyMemberView />;
      case 'public_apply_volunteer':
        return <PublicApplyVolunteerView />;
      case 'public_verify_cert':
        return <PublicVerifyCertView />;
      default:
        return <DirectorDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F8] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 font-['Cairo',sans-serif] transition-colors">
      {/* 1. Reviewer Demo Role Switcher Bar */}
      <RoleSwitcherBar />

      {/* 2. Top Navigation Bar (Top Bar Contract) */}
      <Navbar />

      {/* 3. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </main>

      {/* 4. Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1E4E8C] text-white flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              مركز الرواد الشبابي الثقافي والتوعوي · نظام الإدارة الموحد
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center">
            <button
              onClick={() => navigate('public_apply_member')}
              className="hover:text-[#1E4E8C] dark:hover:text-blue-400 transition"
            >
              طلب التحاق جديد
            </button>
            <span>·</span>
            <button
              onClick={() => navigate('public_apply_volunteer')}
              className="hover:text-[#1E4E8C] dark:hover:text-blue-400 transition"
            >
              طلب تطوع
            </button>
            <span>·</span>
            <button
              onClick={() => navigate('public_verify_cert')}
              className="hover:text-[#1E4E8C] dark:hover:text-blue-400 transition"
            >
              التحقق من الشهادات
            </button>
            <span>·</span>
            <button
              onClick={() => navigate('system_status')}
              className="hover:text-[#1E4E8C] dark:hover:text-blue-400 transition"
            >
              الخادم وقاعدة البيانات المحلية (Section 17)
            </button>
          </div>

          <div className="text-[10px] text-slate-400">
            تطبيق ويب تقدمي (PWA) يعمل محلياً دون أي خدمات سحابية خارجية
          </div>
        </div>
      </footer>

      {/* 5. Offline Banner when simulated or real offline */}
      {!isOnline && (
        <div className="no-print fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2 text-xs font-bold shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>وضع عدم الاتصال (Offline) · يتم حفظ الحضور وساعات التطوع محلياً للمزامنة لاحقاً</span>
        </div>
      )}

      {/* 6. Overlays & Modals */}
      <QRScannerModal />
      <SettingsModal />
      <AddMemberModal />
      <AssignTrainerModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
