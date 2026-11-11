/**
 * Authoritative Local Database & Storage Engine for Youth Cultural & Awareness Center
 * نظام إدارة المركز الشبابي الثقافي والتوعوي
 * Implements On-Premise Local Storage, Offline Queue, Audit Logging, and Segregation of Duties.
 */

import {
  User,
  Member,
  MemberStatus,
  Guardian,
  OnboardingItem,
  Application,
  Volunteer,
  VolunteerOpportunity,
  VolunteerShift,
  Course,
  CourseOffering,
  Session,
  Enrollment,
  AttendanceRecord,
  CourseMaterial,
  CenterEvent,
  Question,
  Exam,
  ExamAttempt,
  CourseEvaluation,
  Certificate,
  CashAccount,
  FinCategory,
  MemberCharge,
  PaymentReceipt,
  Donor,
  Donation,
  ExpenseRequest,
  ActivityBudget,
  FinTransaction,
  CenterNotification,
  CenterAnnouncement,
  AuditLog,
  CenterSettings,
  AttendanceStatus,
} from '../types';

import {
  initialSettings,
  initialUsers,
  initialGuardians,
  initialMembers,
  initialOnboardingItems,
  initialVolunteers,
  initialOpportunities,
  initialShifts,
  initialCourses,
  initialOfferings,
  initialSessions,
  initialEnrollments,
  initialAttendanceRecords,
  initialMaterials,
  initialEvents,
  initialQuestions,
  initialExams,
  initialExamAttempts,
  initialEvaluations,
  initialCertificates,
  initialCashAccounts,
  initialFinCategories,
  initialMemberCharges,
  initialPaymentReceipts,
  initialDonors,
  initialDonations,
  initialExpenses,
  initialBudgets,
  initialTransactions,
  initialApplications,
  initialNotifications,
  initialAnnouncements,
  initialAuditLogs,
} from './seedData';

const STORAGE_KEY = 'rawad_center_database_v2';
const OFFLINE_QUEUE_KEY = 'rawad_offline_queue_v2';

export interface DatabaseState {
  settings: CenterSettings;
  users: User[];
  guardians: Guardian[];
  members: Member[];
  onboardingItems: OnboardingItem[];
  volunteers: Volunteer[];
  opportunities: VolunteerOpportunity[];
  shifts: VolunteerShift[];
  courses: Course[];
  offerings: CourseOffering[];
  sessions: Session[];
  enrollments: Enrollment[];
  attendanceRecords: AttendanceRecord[];
  materials: CourseMaterial[];
  events: CenterEvent[];
  questions: Question[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  evaluations: CourseEvaluation[];
  certificates: Certificate[];
  cashAccounts: CashAccount[];
  finCategories: FinCategory[];
  memberCharges: MemberCharge[];
  paymentReceipts: PaymentReceipt[];
  donors: Donor[];
  donations: Donation[];
  expenses: ExpenseRequest[];
  budgets: ActivityBudget[];
  transactions: FinTransaction[];
  applications: Application[];
  notifications: CenterNotification[];
  announcements: CenterAnnouncement[];
  auditLogs: AuditLog[];
  lastBackupAt?: string;
}

class LocalDatabase {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private getInitialState(): DatabaseState {
    return {
      settings: initialSettings,
      users: initialUsers,
      guardians: initialGuardians,
      members: initialMembers,
      onboardingItems: initialOnboardingItems,
      volunteers: initialVolunteers,
      opportunities: initialOpportunities,
      shifts: initialShifts,
      courses: initialCourses,
      offerings: initialOfferings,
      sessions: initialSessions,
      enrollments: initialEnrollments,
      attendanceRecords: initialAttendanceRecords,
      materials: initialMaterials,
      events: initialEvents,
      questions: initialQuestions,
      exams: initialExams,
      examAttempts: initialExamAttempts,
      evaluations: initialEvaluations,
      certificates: initialCertificates,
      cashAccounts: initialCashAccounts,
      finCategories: initialFinCategories,
      memberCharges: initialMemberCharges,
      paymentReceipts: initialPaymentReceipts,
      donors: initialDonors,
      donations: initialDonations,
      expenses: initialExpenses,
      budgets: initialBudgets,
      transactions: initialTransactions,
      applications: initialApplications,
      notifications: initialNotifications,
      announcements: initialAnnouncements,
      auditLogs: initialAuditLogs,
      lastBackupAt: new Date().toISOString(),
    };
  }

  private loadState(): DatabaseState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch (e) {
      console.warn('Failed to parse stored state, falling back to seed data', e);
    }
    const fresh = this.getInitialState();
    this.saveState(fresh);
    return fresh;
  }

  private saveState(newState?: DatabaseState): void {
    if (newState) {
      this.state = newState;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefault(): void {
    this.state = this.getInitialState();
    this.saveState();
  }

  // --- Audit Log ---
  public logAudit(user: { id: string; name: string }, action: string, entity: string, entityId: string, details: string): void {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    this.state.auditLogs = [entry, ...this.state.auditLogs];
    this.saveState();
  }

  // --- Notifications ---
  public addNotification(userId: string, title: string, message: string, type: CenterNotification['type'], link?: string): void {
    const ntf: CenterNotification = {
      id: `ntf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      link,
    };
    this.state.notifications = [ntf, ...this.state.notifications];
    this.saveState();
  }

  public markNotificationAsRead(id: string): void {
    this.state.notifications = this.state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveState();
  }

  // --- Applications (UAT-01, UAT-02, UAT-03) ---
  public submitMembershipApplication(appData: Omit<Application, 'id' | 'trackingNumber' | 'status' | 'createdAt'>): Application {
    // BR-01: Minor cannot submit without guardian consent
    if (appData.isMinor && (!appData.guardianName || !appData.guardianPhone || !appData.consentAccepted)) {
      throw new Error('لا يمكن تسجيل القاصر دون بيانات ولي الأمر وموافقته الإلكترونية المسجلة.');
    }

    const app: Application = {
      ...appData,
      id: `app-${Date.now()}`,
      trackingNumber: `APP-MEM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    this.state.applications = [app, ...this.state.applications];
    this.logAudit({ id: 'guest', name: app.applicantName }, 'تقديم طلب التحاق', 'Application', app.id, `تقديم طلب التحاق بالمركز: ${app.applicantName} - ${app.trackingNumber}`);
    
    // Notify Coordinator
    this.addNotification('u-coord', 'طلب التحاق جديد للمراجعة', `قدم ${app.applicantName} طلب التحاق جديد بالمركز برقم متابعة ${app.trackingNumber}`, 'system');

    this.saveState();
    return app;
  }

  public submitVolunteerApplication(appData: Omit<Application, 'id' | 'trackingNumber' | 'status' | 'createdAt'>): Application {
    const app: Application = {
      ...appData,
      id: `app-vol-${Date.now()}`,
      trackingNumber: `APP-VOL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    this.state.applications = [app, ...this.state.applications];
    this.logAudit({ id: 'guest', name: app.applicantName }, 'تقديم طلب تطوع', 'Application', app.id, `تقديم طلب تطوع بالمركز: ${app.applicantName}`);
    this.addNotification('u-coord', 'طلب تطوع جديد للمراجعة', `قدم ${app.applicantName} طلب تطوع جديد بالمركز برقم متابعة ${app.trackingNumber}`, 'volunteer');
    this.saveState();
    return app;
  }

  public reviewApplication(appId: string, reviewer: { id: string; name: string }, decision: 'approved' | 'rejected' | 'interview', notes?: string, rejectionReason?: string): void {
    const app = this.state.applications.find((a) => a.id === appId);
    if (!app) return;

    app.status = decision;
    app.reviewerNotes = notes;
    app.rejectionReason = rejectionReason;
    app.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // If approved membership application -> automatically create User, Member, Onboarding Items (BR-03, UAT-03)
    if (decision === 'approved' && app.type === 'membership') {
      const nextMemberNumber = this.state.members.length + 1;
      const membershipNo = `MEM-${new Date().getFullYear()}-${String(nextMemberNumber).padStart(4, '0')}`;
      const userId = `u-mem-${Date.now()}`;
      const memberId = `mem-${Date.now()}`;

      // Create User
      const newUser: User = {
        id: userId,
        name: app.applicantName,
        phone: app.phone,
        email: app.email,
        roles: ['member'],
        status: 'active',
      };
      this.state.users.push(newUser);

      let guardianId: string | undefined = undefined;
      if (app.isMinor && app.guardianName && app.guardianPhone) {
        const guardianUserId = `u-guard-${Date.now()}`;
        guardianId = `guard-${Date.now()}`;
        const newGuardian: Guardian = {
          id: guardianId,
          userId: guardianUserId,
          name: app.guardianName,
          phone: app.guardianPhone,
          email: `${app.guardianPhone}@rawad-guardian.org`,
          memberId,
          relationship: (app.guardianRelation as any) || 'father',
          consentAccepted: true,
          consentDate: new Date().toISOString().substring(0, 10),
        };
        this.state.guardians.push(newGuardian);
        this.state.users.push({
          id: guardianUserId,
          name: app.guardianName,
          phone: app.guardianPhone,
          email: `${app.guardianPhone}@rawad-guardian.org`,
          roles: ['guardian'],
          status: 'active',
        });
      }

      // Create Member
      const joinedDate = new Date();
      const onboardingEndDate = new Date();
      onboardingEndDate.setDate(joinedDate.getDate() + (this.state.settings.probationPeriodDays || 60));
      const subEndDate = new Date();
      subEndDate.setFullYear(joinedDate.getFullYear() + 1);

      const newMember: Member = {
        id: memberId,
        userId,
        membershipNo,
        name: app.applicantName,
        phone: app.phone,
        email: app.email,
        birthDate: app.birthDate,
        gender: app.gender,
        region: app.region,
        qualification: app.qualification,
        interests: app.interests,
        category: app.isMinor ? 'student' : 'regular',
        status: 'new_enrollee',
        joinedAt: joinedDate.toISOString().substring(0, 10),
        onboardingEndsAt: onboardingEndDate.toISOString().substring(0, 10),
        subscriptionEndsAt: subEndDate.toISOString().substring(0, 10),
        isMinor: app.isMinor,
        guardianId,
        totalHoursAttended: 0,
      };
      this.state.members.push(newMember);

      // Create default onboarding checklist items (Section 4.1)
      const defaultItems: Omit<OnboardingItem, 'id' | 'memberId'>[] = [
        { key: 'profile_completed', title: 'استكمال الملف الشخصي وبيانات التواصل', completed: true, completedAt: joinedDate.toISOString().substring(0, 10), autoOrManual: 'auto' },
        { key: 'orientation_attended', title: 'حضور اللقاء التعريفي بالمركز وأنشطته', completed: false, autoOrManual: 'auto' },
        { key: 'level_test_passed', title: 'أداء اختبار تحديد المستوى والتعارف', completed: false, autoOrManual: 'auto' },
        { key: 'charter_signed', title: 'الموافقة الإلكترونية على ميثاق المركز وسياسة الخصوصية', completed: true, completedAt: joinedDate.toISOString().substring(0, 10), autoOrManual: 'auto' },
        { key: 'fee_paid', title: 'سداد رسوم العضوية وتأكيد الاشتراك', completed: false, autoOrManual: 'auto' },
        { key: 'coordinator_interview', title: 'المقابلة التوجيهية وتحديد المسار مع المنسق', completed: false, autoOrManual: 'manual' },
      ];

      defaultItems.forEach((item, index) => {
        this.state.onboardingItems.push({
          id: `onb-${Date.now()}-${index}`,
          memberId,
          ...item,
        });
      });

      this.logAudit(reviewer, 'قبول طلب التحاق واعتماد العضوية', 'Member', memberId, `تم قبول ${app.applicantName} كملتحق جديد وتوليد رقم العضوية ${membershipNo}`);
      this.addNotification(userId, 'تهانينا! تم قبول طلب التحاقك بالمركز', `مرحباً بك في مركز الرواد، رقم عضويتك هو ${membershipNo}. يرجى متابعة قائمة التأهيل للبدء.`, 'system');
    }

    if (decision === 'approved' && app.type === 'volunteer') {
      const userId = `u-vol-${Date.now()}`;
      const volId = `vol-${Date.now()}`;
      this.state.users.push({
        id: userId,
        name: app.applicantName,
        phone: app.phone,
        email: app.email,
        roles: ['volunteer'],
        status: 'active',
      });

      const newVol: Volunteer = {
        id: volId,
        userId,
        name: app.applicantName,
        phone: app.phone,
        email: app.email,
        skills: app.skills || ['تنظيم ميداني'],
        availabilityDays: app.availabilityDays || ['الجمعة', 'السبت'],
        availabilityHours: app.availabilityHours || '16:00 - 20:00',
        status: 'trial',
        approvedHours: 0,
        level: 'bronze',
        joinedAt: new Date().toISOString().substring(0, 10),
      };
      this.state.volunteers.push(newVol);
      this.logAudit(reviewer, 'قبول طلب تطوع', 'Volunteer', volId, `تم قبول المتطوع ${app.applicantName} تحت التجربة`);
      this.addNotification(userId, 'تم قبول طلب تطوعك في المركز', 'أهلاً بك ضمن أسرة متطوعي المركز الشبابي، يمكنك الآن استعراض الفرص والمهام الميدانية.', 'volunteer');
    }

    this.saveState();
  }

  // --- Onboarding Checklist (UAT-04) ---
  public toggleOnboardingItem(itemId: string, reviewer?: { id: string; name: string }): void {
    const item = this.state.onboardingItems.find((i) => i.id === itemId);
    if (!item) return;

    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date().toISOString().substring(0, 10) : undefined;

    // Check if all items completed for this member
    const memberItems = this.state.onboardingItems.filter((i) => i.memberId === item.memberId);
    const allCompleted = memberItems.every((i) => i.completed);

    if (allCompleted) {
      const member = this.state.members.find((m) => m.id === item.memberId);
      if (member && member.status === 'new_enrollee') {
        this.addNotification('u-coord', 'اكتمال بنود التأهيل للملتحق', `أكمل الملتحق (${member.name}) جميع بنود قائمة التأهيل وأصبح جاهزاً للترقية إلى منتسب نشط.`, 'system');
      }
    }

    if (reviewer) {
      this.logAudit(reviewer, 'تعديل بند تأهيل', 'OnboardingItem', itemId, `تحديث حالة البند "${item.title}" إلى ${item.completed ? 'مكتمل' : 'غير مكتمل'}`);
    }

    this.saveState();
  }

  // Promote New Enrollee to Active Member (BR-03)
  public promoteMemberToActive(memberId: string, reviewer: { id: string; name: string }): void {
    const member = this.state.members.find((m) => m.id === memberId);
    if (!member) return;

    member.status = 'active';
    this.logAudit(reviewer, 'ترقية ملتحق إلى منتسب نشط', 'Member', memberId, `تم ترقية ${member.name} (${member.membershipNo}) إلى منتسب نشط بعد إتمام متطلبات التأهيل.`);
    this.addNotification(member.userId, 'تهانينا! أصبحت الآن منتسباً نشطاً', 'تمت ترقيتك بنجاح إلى منتسب نشط في المركز بعد استيفاء كامل بنود فترة التأهيل.', 'system');
    this.saveState();
  }

  // --- Course Enrollment & Waitlist (CRS-06, CRS-07, UAT-05) ---
  public enrollInCourse(offeringId: string, memberId: string): { status: 'registered' | 'waitlist'; enrollment: Enrollment } {
    const offering = this.state.offerings.find((o) => o.id === offeringId);
    const member = this.state.members.find((m) => m.id === memberId);
    if (!offering || !member) {
      throw new Error('الدورة أو المنتسب غير موجود.');
    }

    // BR-04: Suspended member cannot enroll
    if (member.status === 'suspended' || member.status === 'withdrawn') {
      throw new Error('لا يمكن للمنتسب الموقوف أو المنسحب التسجيل في دورات جديدة.');
    }

    // Check existing enrollment
    const existing = this.state.enrollments.find((e) => e.offeringId === offeringId && e.memberId === memberId);
    if (existing) {
      throw new Error('أنت مسجل بالفعل في هذه الدورة.');
    }

    let status: 'registered' | 'waitlist' = 'registered';
    if (offering.enrolledCount >= offering.capacity) {
      status = 'waitlist';
      offering.waitlistCount += 1;
    } else {
      offering.enrolledCount += 1;
    }

    const enrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      offeringId,
      memberId,
      memberName: member.name,
      status,
      attendanceRate: 0,
      certificateIssued: false,
      enrolledAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    this.state.enrollments.push(enrollment);

    if (status === 'waitlist') {
      this.addNotification(member.userId, 'أنت الآن في قائمة الانتظار', `تمت إضافتك إلى قائمة الانتظار لدورة (${offering.name})، وسيتم ترقيتك تلقائياً حال توفر مقعد.`, 'system');
    } else {
      this.addNotification(member.userId, 'تم تأكيد تسجيلك في الدورة', `تم تأكيد تسجيلك بنجاح في (${offering.name}). نتمنى لك رحلة تعليمية مثمرة!`, 'system');
    }

    this.logAudit({ id: member.userId, name: member.name }, 'طلب تسجيل في دورة', 'Enrollment', enrollment.id, `تسجيل في ${offering.name} بحالة: ${status === 'waitlist' ? 'قائمة انتظار' : 'مسجل مؤكد'}`);
    this.saveState();
    return { status, enrollment };
  }

  // Withdraw and promote from waitlist (CRS-07, UAT-05)
  public withdrawFromCourse(enrollmentId: string, performer: { id: string; name: string }): void {
    const enrollment = this.state.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;

    const offering = this.state.offerings.find((o) => o.id === enrollment.offeringId);
    enrollment.status = 'withdrawn';

    if (offering) {
      offering.enrolledCount = Math.max(0, offering.enrolledCount - 1);

      // Auto-promote first waitlisted member!
      const waitlisted = this.state.enrollments
        .filter((e) => e.offeringId === offering.id && e.status === 'waitlist')
        .sort((a, b) => a.enrolledAt.localeCompare(b.enrolledAt))[0];

      if (waitlisted) {
        waitlisted.status = 'registered';
        offering.waitlistCount = Math.max(0, offering.waitlistCount - 1);
        offering.enrolledCount += 1;

        const promotedMember = this.state.members.find((m) => m.id === waitlisted.memberId);
        if (promotedMember) {
          this.addNotification(promotedMember.userId, 'تمت ترقيتك من قائمة الانتظار!', `تهانينا! أصبح مقعدك متاحاً في (${offering.name}) وتم تأكيد تسجيلك رسمياً.`, 'system');
        }
      }
    }

    this.logAudit(performer, 'انسحاب من دورة', 'Enrollment', enrollmentId, `تم تسجيل انسحاب ${enrollment.memberName} وترقية أول المنتظرين.`);
    this.saveState();
  }

  // --- Attendance (ATT-01, ATT-02, ATT-03, ATT-05, UAT-06, UAT-07) ---
  public recordBatchAttendance(
    sessionId: string,
    records: Array<{ memberId: string; status: AttendanceStatus; method: 'manual' | 'qr_scan' }>,
    performer: { id: string; name: string },
    isOnline: boolean = true
  ): void {
    const session = this.state.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    records.forEach((rec) => {
      const member = this.state.members.find((m) => m.id === rec.memberId);
      if (!member) return;

      const existingIdx = this.state.attendanceRecords.findIndex(
        (r) => r.sessionId === sessionId && r.memberId === rec.memberId
      );

      const recordItem: AttendanceRecord = {
        id: existingIdx >= 0 ? this.state.attendanceRecords[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        sessionId,
        memberId: rec.memberId,
        memberName: member.name,
        status: rec.status,
        method: rec.method,
        markedAt: now,
        markedBy: performer.name,
        isSynced: isOnline,
      };

      if (existingIdx >= 0) {
        this.state.attendanceRecords[existingIdx] = recordItem;
      } else {
        this.state.attendanceRecords.push(recordItem);
      }

      // If minor is absent, immediately notify guardian! (ATT-05, UAT-06)
      if (member.isMinor && member.guardianId && rec.status === 'absent') {
        const guardian = this.state.guardians.find((g) => g.id === member.guardianId);
        if (guardian) {
          this.addNotification(
            guardian.userId,
            'تنبيه غياب منتسب قاصر فوري',
            `نحيطكم علماً بغياب ابنكم (${member.name}) عن جلسة "${session.title}" المنعقدة اليوم.`,
            'attendance'
          );
        }
      }
    });

    // Update enrollment attendance rates for the offering
    const offeringEnrollments = this.state.enrollments.filter((e) => e.offeringId === session.offeringId && e.status === 'registered');
    const offeringSessions = this.state.sessions.filter((s) => s.offeringId === session.offeringId);
    const completedSessionIds = new Set(this.state.sessions.filter((s) => s.offeringId === session.offeringId && s.status === 'completed').map((s) => s.id));
    completedSessionIds.add(sessionId);

    offeringEnrollments.forEach((enr) => {
      const memberAttRecords = this.state.attendanceRecords.filter(
        (ar) => completedSessionIds.has(ar.sessionId) && ar.memberId === enr.memberId
      );
      const attendedCount = memberAttRecords.filter((ar) => ar.status === 'present' || ar.status === 'late').length;
      const rate = completedSessionIds.size > 0 ? Math.round((attendedCount / completedSessionIds.size) * 100) : 100;
      enr.attendanceRate = rate;
    });

    session.status = 'completed';
    session.isRecorded = true;

    this.logAudit(performer, 'رصد حضور جلسة', 'Session', sessionId, `رصد حضور ${records.length} متدرباً في جلسة ${session.title} (الحالة: ${isOnline ? 'متصل ومزامن' : 'محفوظ محلياً دون اتصال'})`);
    this.saveState();
  }

  // --- Offline Sync (UAT-07, DB-11) ---
  public syncOfflineRecords(): number {
    let count = 0;
    this.state.attendanceRecords = this.state.attendanceRecords.map((r) => {
      if (!r.isSynced) {
        count++;
        return { ...r, isSynced: true };
      }
      return r;
    });
    if (count > 0) {
      this.saveState();
    }
    return count;
  }

  // --- Volunteer Shifts & Badges (UAT-11) ---
  public clockVolunteerShift(shiftData: Omit<VolunteerShift, 'id' | 'actualHours' | 'status'> & { actualHours: number }): VolunteerShift {
    const shift: VolunteerShift = {
      ...shiftData,
      id: `sh-${Date.now()}`,
      status: 'pending_approval',
    };
    this.state.shifts = [shift, ...this.state.shifts];
    this.addNotification('u-coord', 'ساعات تطوع بانتظار الاعتماد', `سجل المتطوع (${shift.volunteerName}) ${shift.actualHours} ساعات تطوعية في فرصة "${shift.opportunityTitle}".`, 'volunteer');
    this.saveState();
    return shift;
  }

  public approveVolunteerShift(shiftId: string, reviewer: { id: string; name: string }): void {
    const shift = this.state.shifts.find((s) => s.id === shiftId);
    if (!shift || shift.status === 'approved') return;

    shift.status = 'approved';
    shift.approvedBy = reviewer.name;

    const volunteer = this.state.volunteers.find((v) => v.id === shift.volunteerId);
    if (volunteer) {
      volunteer.approvedHours += shift.actualHours;

      // Update badge level (BR-12, VOL-09, UAT-11)
      let oldLevel = volunteer.level;
      if (volunteer.approvedHours >= 30) {
        volunteer.level = 'gold';
      } else if (volunteer.approvedHours >= 15) {
        volunteer.level = 'silver';
      } else {
        volunteer.level = 'bronze';
      }

      if (volunteer.status === 'trial' && volunteer.approvedHours >= 5) {
        volunteer.status = 'active';
      }

      if (volunteer.level !== oldLevel) {
        this.addNotification(
          volunteer.userId,
          `تهانينا! ارتقيت إلى المستوى ${volunteer.level === 'gold' ? 'الذهبي 🥇' : 'الفضي 🥈'}`,
          `بلغ رصيد ساعاتك التطوعية المعتمدة ${volunteer.approvedHours} ساعة. شكراً لعطائك المستمر!`,
          'volunteer'
        );
      }
    }

    this.logAudit(reviewer, 'اعتماد ساعات تطوع', 'VolunteerShift', shiftId, `اعتماد ${shift.actualHours} ساعة تطوعية للمتطوع ${shift.volunteerName}`);
    this.saveState();
  }

  // --- Exams & Grading (EXM-06, EXM-07, UAT-08, UAT-09) ---
  public submitExamAttempt(examId: string, memberId: string, answers: Record<string, any>): ExamAttempt {
    const exam = this.state.exams.find((e) => e.id === examId);
    const member = this.state.members.find((m) => m.id === memberId);
    if (!exam || !member) throw new Error('الاختبار أو المتدرب غير موجود.');

    // Calculate score for objective questions
    let totalScore = 0;
    let hasEssay = false;

    exam.questionIds.forEach((qId) => {
      const q = this.state.questions.find((quest) => quest.id === qId);
      if (!q) return;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        const studentAns = answers[qId];
        if (studentAns === q.correctAnswer) {
          totalScore += Math.round(exam.totalMarks / exam.questionIds.length);
        }
      } else if (q.type === 'essay' || q.type === 'short_answer') {
        hasEssay = true;
      }
    });

    const isGraded = !hasEssay || exam.isAutoGraded;

    const attempt: ExamAttempt = {
      id: `att-ex-${Date.now()}`,
      examId,
      examTitle: exam.title,
      memberId,
      memberName: member.name,
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      answers,
      score: totalScore,
      isGraded,
      status: isGraded ? 'graded' : 'submitted',
    };

    this.state.examAttempts.push(attempt);

    // Update enrollment if final course exam and fully graded
    if (isGraded) {
      const enrollment = this.state.enrollments.find((en) => en.memberId === memberId && en.offeringId === exam.offeringId);
      if (enrollment) {
        enrollment.examScore = totalScore;
      }
      this.addNotification(member.userId, 'نتيجة الاختبار ظهرت', `حصلت على ${totalScore} من ${exam.totalMarks} في اختبار "${exam.title}".`, 'exam');
    } else {
      // Notify trainer to grade subjective questions
      this.addNotification('u-tr1', 'اختبار بانتظار التصحيح اليدوي', `سلم المتدرب (${member.name}) إجاباته في اختبار "${exam.title}" ويتطلب تصحيح الأسئلة المقالية.`, 'exam');
    }

    this.logAudit({ id: member.userId, name: member.name }, 'تسليم إجابات اختبار', 'ExamAttempt', attempt.id, `تسليم اختبار ${exam.title} (الدرجة المبدئية: ${totalScore})`);
    this.saveState();
    return attempt;
  }

  // Trainer manually grades essay questions (UAT-09)
  public gradeEssayExam(attemptId: string, additionalPoints: number, trainerNotes: string, trainer: { id: string; name: string }): void {
    const attempt = this.state.examAttempts.find((a) => a.id === attemptId);
    if (!attempt) return;

    attempt.score = (attempt.score || 0) + additionalPoints;
    attempt.isGraded = true;
    attempt.status = 'graded';
    attempt.trainerNotes = trainerNotes;

    const exam = this.state.exams.find((e) => e.id === attempt.examId);
    if (exam) {
      const enrollment = this.state.enrollments.find((en) => en.memberId === attempt.memberId && en.offeringId === exam.offeringId);
      if (enrollment) {
        enrollment.examScore = attempt.score;
      }
    }

    const member = this.state.members.find((m) => m.id === attempt.memberId);
    if (member) {
      this.addNotification(member.userId, 'تم اعتماد نتيجة اختبارك', `قام المدرب بتصحيح الأسئلة المقالية، درجتك النهائية هي ${attempt.score}.`, 'exam');
    }

    this.logAudit(trainer, 'تصحيح اختبار يدوي', 'ExamAttempt', attemptId, `تصحيح يدوي للمتدرب ${attempt.memberName}: منح +${additionalPoints} نقطة (الدرجة النهائية: ${attempt.score})`);
    this.saveState();
  }

  // --- Certificates (CRT-01, CRT-03, CRT-04, UAT-10) ---
  public issueCertificate(certData: Omit<Certificate, 'id' | 'certificateNo' | 'issuedAt' | 'status' | 'verificationCode'>, issuer: { id: string; name: string }): Certificate {
    const certNum = `CRT-${new Date().getFullYear()}-${String(this.state.certificates.length + 101).padStart(6, '0')}`;
    const code = `RAWAD-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const cert: Certificate = {
      ...certData,
      id: `cert-${Date.now()}`,
      certificateNo: certNum,
      issuedAt: new Date().toISOString().substring(0, 10),
      status: 'valid',
      verificationCode: code,
    };

    this.state.certificates.push(cert);

    const member = this.state.members.find((m) => m.id === cert.memberId);
    if (member) {
      this.addNotification(member.userId, 'صدرت شهادتك الرسمية 🎓', `تم إصدار شهادة (${cert.courseOrEventTitle}) برقم تحقق ${code}. يمكنك الآن تحميلها وطباعتها.`, 'system');
    }

    this.logAudit(issuer, 'إصدار شهادة رسمية', 'Certificate', cert.id, `إصدار شهادة ${cert.certificateNo} لـ ${cert.recipientName} - ${cert.courseOrEventTitle}`);
    this.saveState();
    return cert;
  }

  public revokeCertificate(certId: string, reason: string, admin: { id: string; name: string }): void {
    const cert = this.state.certificates.find((c) => c.id === certId);
    if (!cert) return;

    cert.status = 'revoked';
    cert.revocationReason = reason;

    this.logAudit(admin, 'إبطال شهادة', 'Certificate', certId, `إبطال الشهادة ${cert.certificateNo} بسبب: ${reason}`);
    this.saveState();
  }

  // --- Financial: Segregation of Duties & Cash Workflow (BR-14, BR-15, BR-16, UAT-12, UAT-13, UAT-14) ---
  public collectPayment(
    payerName: string,
    amount: number,
    paymentMethod: 'cash' | 'bank_transfer' | 'e_wallet',
    cashAccountId: string,
    items: Array<{ title: string; amount: number }>,
    memberId?: string,
    chargeId?: string,
    cashier?: { id: string; name: string }
  ): PaymentReceipt {
    const account = this.state.cashAccounts.find((a) => a.id === cashAccountId);
    if (!account) throw new Error('حساب النقد غير موجود.');

    const receiptNum = `REC-${new Date().getFullYear()}-${String(this.state.paymentReceipts.length + 140).padStart(6, '0')}`;
    const token = `REC-RAWAD-${receiptNum}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Update Cash Account balance
    account.currentBalance += amount;

    // If linked to a Member Charge, update it
    let remainingAmount = 0;
    if (chargeId) {
      const charge = this.state.memberCharges.find((c) => c.id === chargeId);
      if (charge) {
        charge.paidAmount += amount;
        remainingAmount = Math.max(0, charge.amount - charge.discount - charge.paidAmount);
        charge.status = remainingAmount === 0 ? 'paid' : 'partial';
      }
    }

    const receipt: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      receiptNo: receiptNum,
      payerName,
      memberId,
      amount,
      paymentMethod,
      cashAccountId,
      cashAccountName: account.name,
      items,
      remainingAmount,
      status: 'active',
      issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      issuedBy: cashier?.name || 'طارق السيد (المسؤول المالي)',
      qrCodeToken: token,
    };

    this.state.paymentReceipts = [receipt, ...this.state.paymentReceipts];

    // Ledger Transaction
    const tx: FinTransaction = {
      id: `tx-${Date.now()}`,
      type: 'receipt',
      amount,
      cashAccountId,
      cashAccountName: account.name,
      referenceNo: receiptNum,
      description: `تحصيل سند قبض من ${payerName}: ${items.map((i) => i.title).join('، ')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: cashier?.name || 'طارق السيد',
    };
    this.state.transactions = [tx, ...this.state.transactions];

    if (memberId) {
      const member = this.state.members.find((m) => m.id === memberId);
      if (member) {
        this.addNotification(member.userId, 'سند قبض جديد', `تم إصدار سند القبض رقم ${receiptNum} بقيمة ${amount} ج.م، المتبقي: ${remainingAmount} ج.م.`, 'financial');
      }
    }

    this.logAudit(cashier || { id: 'u-fin', name: 'طارق السيد' }, 'تحصيل وإصدار سند قبض', 'PaymentReceipt', receipt.id, `إصدار سند قبض ${receiptNum} بقيمة ${amount} ج.م لـ ${payerName}`);
    this.saveState();
    return receipt;
  }

  // Expense Workflow: Step 1: Request Expense (Coordinator or Trainer)
  public requestExpense(reqData: Omit<ExpenseRequest, 'id' | 'status' | 'isBudgetOverrun' | 'date'>, requester: { id: string; name: string }): ExpenseRequest {
    // Check Budget Overrun (BR-11, UAT-14)
    let isBudgetOverrun = false;
    if (reqData.activityOrEventId) {
      const budget = this.state.budgets.find((b) => b.targetId === reqData.activityOrEventId);
      if (budget) {
        if (budget.spentAmount + reqData.amount > budget.allocatedAmount) {
          isBudgetOverrun = true;
        }
      }
    }

    const exp: ExpenseRequest = {
      ...reqData,
      id: `exp-${Date.now()}`,
      status: 'pending_approval',
      isBudgetOverrun,
      date: new Date().toISOString().substring(0, 10),
    };

    this.state.expenses = [exp, ...this.state.expenses];

    // Notify Director for approval
    const alertMsg = isBudgetOverrun
      ? `تنبيه: رفع ${requester.name} طلب مصروف يتجاوز الموازنة المعتمدة بقيمة ${reqData.amount} ج.م بانتظار اعتمادكم.`
      : `رفع ${requester.name} طلب مصروف بقيمة ${reqData.amount} ج.م لصالح (${reqData.beneficiary}) بانتظار الاعتماد.`;

    this.addNotification('u-dir', isBudgetOverrun ? 'طلب مصروف يتجاوز الموازنة!' : 'طلب مصروف جديد بانتظار الاعتماد', alertMsg, 'financial');

    this.logAudit(requester, 'طلب مصروف', 'ExpenseRequest', exp.id, `تقديم طلب مصروف: ${exp.title} - مبلغ ${exp.amount} ج.م ${isBudgetOverrun ? '(يتجاوز الموازنة)' : ''}`);
    this.saveState();
    return exp;
  }

  // Expense Workflow: Step 2: Approve Expense (Director - Strictly cannot be requester BR-14!)
  public approveExpense(expenseId: string, approver: { id: string; name: string; roles: string[] }): void {
    const exp = this.state.expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    // BR-14: Segregation of Duties - Requester cannot approve their own request!
    if (exp.requestedBy === approver.id) {
      throw new Error('قاعدة الرقابة المالية (BR-14): لا يجوز لمن يطلب المصروف أن يعتمده بنفسه!');
    }

    // Only Director can approve overruns or amounts above medium limit
    if (!approver.roles.includes('director')) {
      throw new Error('صلاحية اعتماد هذا المصروف محصورة بمدير المركز.');
    }

    exp.status = 'approved';
    exp.approvedBy = approver.id;
    exp.approvedByName = approver.name;
    if (exp.isBudgetOverrun) {
      exp.directorOverrideApproved = true;
    }

    // Notify Financial Officer for disbursement
    this.addNotification('u-fin', 'طلب مصروف معتمد وجاهز للصرف', `تم اعتماد طلب المصروف "${exp.title}" بقيمة ${exp.amount} ج.م من المدير، يرجى استكمال إجراءات الصرف.`, 'financial');

    this.logAudit(approver, 'اعتماد طلب مصروف', 'ExpenseRequest', expenseId, `اعتماد مصروف بقيمة ${exp.amount} ج.م لـ ${exp.beneficiary}`);
    this.saveState();
  }

  // Expense Workflow: Step 3: Disburse Expense (Financial Officer - Strictly cannot be approver BR-14!)
  public disburseExpense(expenseId: string, cashAccountId: string, disburser: { id: string; name: string; roles: string[] }): void {
    const exp = this.state.expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    if (exp.status !== 'approved') {
      throw new Error('لا يمكن صرف مصروف غير معتمد مسبقاً من الإدارة.');
    }

    // BR-14: Approver cannot disburse their own approved expense!
    if (exp.approvedBy === disburser.id) {
      throw new Error('قاعدة الرقابة المالية (BR-14): لا يجوز لمن يعتمد المصروف أن يصرفه بنفسه! يجب فصل المهام.');
    }

    const account = this.state.cashAccounts.find((a) => a.id === cashAccountId);
    if (!account) throw new Error('حساب النقد غير موجود.');

    if (account.currentBalance < exp.amount) {
      throw new Error(`الرصيد في (${account.name}) غير كافٍ. الرصيد الحالي: ${account.currentBalance} ج.م.`);
    }

    // Deduct from Cash Account
    account.currentBalance -= exp.amount;

    exp.status = 'disbursed';
    exp.disbursedBy = disburser.id;
    exp.disbursedByName = disburser.name;
    exp.cashAccountId = cashAccountId;
    exp.cashAccountName = account.name;

    // Update Activity Budget if applicable
    if (exp.activityOrEventId) {
      const budget = this.state.budgets.find((b) => b.targetId === exp.activityOrEventId);
      if (budget) {
        budget.spentAmount += exp.amount;
      }
    }

    // Create Ledger Transaction
    const tx: FinTransaction = {
      id: `tx-${Date.now()}`,
      type: 'disbursement',
      amount: exp.amount,
      cashAccountId,
      cashAccountName: account.name,
      categoryId: exp.categoryId,
      categoryName: exp.categoryName,
      referenceNo: `VCH-${exp.id}`,
      description: `صرف مصروف معتمد: ${exp.title} - لصالح ${exp.beneficiary}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: disburser.name,
    };
    this.state.transactions = [tx, ...this.state.transactions];

    this.logAudit(disburser, 'صرف نقد وإقفال مصروف', 'ExpenseRequest', expenseId, `صرف مبلغ ${exp.amount} ج.م من حساب ${account.name} لـ ${exp.beneficiary}`);
    this.saveState();
  }

  // --- Campaign Real-time Beneficiary Counter (EVT-05) ---
  public incrementCampaignBeneficiaryCount(eventId: string, incrementBy: number = 1, performer?: { id: string; name: string }): void {
    const evt = this.state.events.find((e) => e.id === eventId);
    if (!evt) return;

    evt.fieldBeneficiariesCount = (evt.fieldBeneficiariesCount || 0) + incrementBy;
    this.saveState();
  }

  // --- Anonymous Course Evaluation (EVL-01, BR-20, UAT-16) ---
  public submitCourseEvaluation(evalData: Omit<CourseEvaluation, 'id' | 'isAnonymous' | 'createdAt'>): CourseEvaluation {
    const evaluation: CourseEvaluation = {
      ...evalData,
      id: `ev-${Date.now()}`,
      isAnonymous: true,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    this.state.evaluations.push(evaluation);
    this.saveState();
    return evaluation;
  }

  // --- Settings Management (Currency, Night Mode, Center Info) ---
  public updateSettings(newSettings: Partial<CenterSettings>, performer?: { id: string; name: string }): CenterSettings {
    this.state.settings = { ...this.state.settings, ...newSettings };
    if (performer) {
      this.logAudit(performer, 'تحديث إعدادات النظام', 'Settings', 'global', `تحديث الإعدادات (العملة: ${this.state.settings.currency}، الثيم: ${this.state.settings.themeMode})`);
    }
    this.saveState();
    return this.state.settings;
  }

  // --- Director Direct Member Creation ---
  public addNewMemberDirectly(
    memberData: {
      name: string;
      phone: string;
      email: string;
      birthDate: string;
      gender: 'male' | 'female';
      region: string;
      qualification: string;
      interests: string[];
      category: 'regular' | 'student' | 'honorary' | 'founder';
      status: MemberStatus;
      isMinor: boolean;
      guardianName?: string;
      guardianPhone?: string;
      guardianRelation?: 'father' | 'mother' | 'guardian';
    },
    creator: { id: string; name: string }
  ): Member {
    const nextMemberNumber = this.state.members.length + 1;
    const membershipNo = `MEM-${new Date().getFullYear()}-${String(nextMemberNumber).padStart(4, '0')}`;
    const userId = `u-mem-${Date.now()}`;
    const memberId = `mem-${Date.now()}`;

    // Create User
    const newUser: User = {
      id: userId,
      name: memberData.name,
      phone: memberData.phone,
      email: memberData.email,
      roles: ['member'],
      status: 'active',
    };
    this.state.users.push(newUser);

    let guardianId: string | undefined = undefined;
    if (memberData.isMinor && memberData.guardianName && memberData.guardianPhone) {
      const guardianUserId = `u-guard-${Date.now()}`;
      guardianId = `guard-${Date.now()}`;
      const newGuardian: Guardian = {
        id: guardianId,
        userId: guardianUserId,
        name: memberData.guardianName,
        phone: memberData.guardianPhone,
        email: `${memberData.guardianPhone}@rawad-guardian.org`,
        memberId,
        relationship: memberData.guardianRelation || 'father',
        consentAccepted: true,
        consentDate: new Date().toISOString().substring(0, 10),
      };
      this.state.guardians.push(newGuardian);
      this.state.users.push({
        id: guardianUserId,
        name: memberData.guardianName,
        phone: memberData.guardianPhone,
        email: `${memberData.guardianPhone}@rawad-guardian.org`,
        roles: ['guardian'],
        status: 'active',
      });
    }

    const joinedDate = new Date();
    const onboardingEndDate = new Date();
    onboardingEndDate.setDate(joinedDate.getDate() + (this.state.settings.probationPeriodDays || 60));
    const subEndDate = new Date();
    subEndDate.setFullYear(joinedDate.getFullYear() + 1);

    const newMember: Member = {
      id: memberId,
      userId,
      membershipNo,
      name: memberData.name,
      phone: memberData.phone,
      email: memberData.email,
      birthDate: memberData.birthDate,
      gender: memberData.gender,
      region: memberData.region,
      qualification: memberData.qualification,
      interests: memberData.interests,
      category: memberData.category,
      status: memberData.status,
      joinedAt: joinedDate.toISOString().substring(0, 10),
      onboardingEndsAt: onboardingEndDate.toISOString().substring(0, 10),
      subscriptionEndsAt: subEndDate.toISOString().substring(0, 10),
      isMinor: memberData.isMinor,
      guardianId,
      totalHoursAttended: 0,
    };
    this.state.members.unshift(newMember);

    // Default onboarding checklist
    const defaultItems = [
      { key: 'profile_completed', title: 'استكمال الملف الشخصي وبيانات التواصل', completed: true, completedAt: joinedDate.toISOString().substring(0, 10), autoOrManual: 'auto' as const },
      { key: 'orientation_attended', title: 'حضور اللقاء التعريفي بالمركز وأنشطته', completed: false, autoOrManual: 'auto' as const },
      { key: 'level_test_passed', title: 'أداء اختبار تحديد المستوى والتعارف', completed: false, autoOrManual: 'auto' as const },
      { key: 'charter_signed', title: 'الموافقة الإلكترونية على ميثاق المركز وسياسة الخصوصية', completed: true, completedAt: joinedDate.toISOString().substring(0, 10), autoOrManual: 'auto' as const },
      { key: 'fee_paid', title: 'سداد رسوم العضوية وتأكيد الاشتراك', completed: false, autoOrManual: 'auto' as const },
      { key: 'coordinator_interview', title: 'المقابلة التوجيهية وتحديد المسار مع المنسق', completed: false, autoOrManual: 'manual' as const },
    ];

    defaultItems.forEach((item, index) => {
      this.state.onboardingItems.push({
        id: `onb-${Date.now()}-${index}`,
        memberId,
        ...item,
      });
    });

    this.logAudit(creator, 'إضافة ملتحق جديد من الإدارة', 'Member', memberId, `تم تسجيل ${memberData.name} برقم العضوية ${membershipNo} بحالة ${memberData.status}`);
    this.addNotification(userId, 'مرحباً بك في مركز الرواد', `تم تسجيل عضويتك رسمياً برقم ${membershipNo}.`, 'system');

    this.saveState();
    return newMember;
  }

  // --- Dynamic Trainers Management ---
  public assignTrainerToOffering(offeringId: string, trainerId: string, trainerName: string, performer: { id: string; name: string }): void {
    const offering = this.state.offerings.find((o) => o.id === offeringId);
    if (!offering) return;

    const oldTrainer = offering.trainerName;
    offering.trainerId = trainerId;
    offering.trainerName = trainerName;

    // Sessions remain linked via offeringId

    this.logAudit(performer, 'تعيين محاضر للدورة', 'CourseOffering', offeringId, `تغيير مدرب الدفعة ${offering.name} من ${oldTrainer} إلى ${trainerName}`);
    this.addNotification(trainerId, 'تم إسناد دورة جديدة لك', `تم إسناد دورة (${offering.name}) لك كمحاضر معتمد. تفقد جدول الجلسات في بوابتك.`, 'system');

    this.saveState();
  }

  public addNewTrainer(trainerData: { name: string; phone: string; email: string }, creator: { id: string; name: string }): User {
    const trainerUser: User = {
      id: `u-tr-${Date.now()}`,
      name: trainerData.name,
      phone: trainerData.phone,
      email: trainerData.email,
      roles: ['trainer'],
      status: 'active',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    this.state.users.push(trainerUser);
    this.logAudit(creator, 'إضافة مدرب جديد', 'User', trainerUser.id, `إضافة المحاضر الجديد ${trainerData.name} (${trainerData.email})`);
    this.saveState();
    return trainerUser;
  }

  // --- HR Management Support ---
  public updateUserStatus(userId: string, newStatus: 'active' | 'suspended', performer: { id: string; name: string }): void {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return;

    const oldStatus = user.status;
    user.status = newStatus;

    // Sync member/volunteer status if exists
    const member = this.state.members.find((m) => m.userId === userId);
    if (member) {
      if (newStatus === 'suspended') member.status = 'suspended';
      else if (member.status === 'suspended') member.status = 'active';
    }

    const volunteer = this.state.volunteers.find((v) => v.userId === userId);
    if (volunteer) {
      if (newStatus === 'suspended') volunteer.status = 'suspended';
      else if (volunteer.status === 'suspended') volunteer.status = 'active';
    }

    this.logAudit(performer, 'تحديث حالة الملف الوظيفي/العضوية', 'User', userId, `تغيير حالة حساب ${user.name} من ${oldStatus} إلى ${newStatus}`);
    this.saveState();
  }

  public addNewVolunteerDirectly(
    data: { name: string; phone: string; email: string; skills: string[]; availabilityHours?: string },
    creator: { id: string; name: string }
  ): Volunteer {
    const userId = `u-vol-${Date.now()}`;
    const volId = `vol-${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      roles: ['volunteer'],
      status: 'active',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    this.state.users.push(newUser);

    const newVolunteer: Volunteer = {
      id: volId,
      userId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      skills: data.skills.length > 0 ? data.skills : ['تنظيم فعاليات'],
      availabilityDays: ['الجمعة', 'السبت'],
      availabilityHours: data.availabilityHours || 'مسائي (4-8 م)',
      status: 'trial',
      approvedHours: 0,
      level: 'bronze',
      joinedAt: new Date().toISOString().substring(0, 10),
    };
    this.state.volunteers.unshift(newVolunteer);

    this.logAudit(creator, 'إضافة متطوع جديد من إدارة الـ HR', 'Volunteer', volId, `تسجيل المتطوع الجديد ${data.name}`);
    this.saveState();
    return newVolunteer;
  }

  // --- Archiving Engine (الأرشيف المركزي للمنتسبين والدورات المنتهية) ---
  public archiveMember(
    memberId: string,
    performer: { id: string; name: string },
    reason: string = 'أرشفة إدارية دورية'
  ): boolean {
    const member = this.state.members.find((m) => m.id === memberId);
    if (!member) return false;

    member.isArchived = true;
    member.archivedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    member.archiveReason = reason;

    this.logAudit(
      performer,
      'أرشفة سجل منتسب',
      'Member',
      memberId,
      `نقل المنتسب (${member.name} - ${member.membershipNo}) إلى الأرشيف. السبب: ${reason}`
    );
    this.saveState();
    return true;
  }

  public restoreMember(
    memberId: string,
    performer: { id: string; name: string }
  ): boolean {
    const member = this.state.members.find((m) => m.id === memberId);
    if (!member) return false;

    member.isArchived = false;
    const oldReason = member.archiveReason;
    member.archiveReason = undefined;

    this.logAudit(
      performer,
      'استعادة منتسب من الأرشيف',
      'Member',
      memberId,
      `استعادة المنتسب (${member.name} - ${member.membershipNo}) إلى الجداول النشطة (كان مؤرشفاً بسبب: ${oldReason || 'غير محدد'})`
    );
    this.saveState();
    return true;
  }

  public archiveOffering(
    offeringId: string,
    performer: { id: string; name: string },
    reason: string = 'انتهاء فترة الدورة واكتمال الدفعة'
  ): boolean {
    const offering = this.state.offerings.find((o) => o.id === offeringId);
    if (!offering) return false;

    offering.isArchived = true;
    offering.status = 'archived';
    offering.archivedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    offering.archiveReason = reason;

    this.logAudit(
      performer,
      'أرشفة دفعة دورة تدريبية',
      'CourseOffering',
      offeringId,
      `نقل دفعة الدورة (${offering.name}) إلى الأرشيف. السبب: ${reason}`
    );
    this.saveState();
    return true;
  }

  public restoreOffering(
    offeringId: string,
    performer: { id: string; name: string }
  ): boolean {
    const offering = this.state.offerings.find((o) => o.id === offeringId);
    if (!offering) return false;

    offering.isArchived = false;
    offering.status = 'completed';
    offering.archiveReason = undefined;

    this.logAudit(
      performer,
      'استعادة دفعة دورة من الأرشيف',
      'CourseOffering',
      offeringId,
      `استعادة دفعة الدورة (${offering.name}) إلى السجلات المكتملة النشطة.`
    );
    this.saveState();
    return true;
  }

  public archiveCourse(
    courseId: string,
    performer: { id: string; name: string },
    reason: string = 'أرشفة البرنامج التدريبي'
  ): boolean {
    const course = this.state.courses.find((c) => c.id === courseId);
    if (!course) return false;

    course.isArchived = true;
    course.archivedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    course.archiveReason = reason;

    // Also archive linked offerings
    this.state.offerings
      .filter((o) => o.courseId === courseId)
      .forEach((o) => {
        o.isArchived = true;
        o.status = 'archived';
        o.archivedAt = course.archivedAt;
        o.archiveReason = reason;
      });

    this.logAudit(
      performer,
      'أرشفة برنامج تدريبي ودفعاته',
      'Course',
      courseId,
      `أرشفة البرنامج التدريبي (${course.title}) وكافة دفعاته المرتبطة.`
    );
    this.saveState();
    return true;
  }

  public restoreCourse(
    courseId: string,
    performer: { id: string; name: string }
  ): boolean {
    const course = this.state.courses.find((c) => c.id === courseId);
    if (!course) return false;

    course.isArchived = false;
    course.archiveReason = undefined;

    this.state.offerings
      .filter((o) => o.courseId === courseId && o.isArchived)
      .forEach((o) => {
        o.isArchived = false;
        o.status = 'completed';
        o.archiveReason = undefined;
      });

    this.logAudit(
      performer,
      'استعادة برنامج تدريبي من الأرشيف',
      'Course',
      courseId,
      `استعادة البرنامج التدريبي (${course.title}) ودفعاته إلى الكتالوج النشط.`
    );
    this.saveState();
    return true;
  }

  public batchArchiveCompletedCourses(
    performer: { id: string; name: string }
  ): { count: number } {
    let count = 0;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.state.offerings.forEach((off) => {
      if ((off.status === 'completed' || off.status === 'closed') && !off.isArchived) {
        off.isArchived = true;
        off.status = 'archived';
        off.archivedAt = nowStr;
        off.archiveReason = 'أرشفة تلقائية للدفعات المنتهية';
        count++;
      }
    });

    if (count > 0) {
      this.logAudit(
        performer,
        'أرشفة جماعية للدورات المنتهية',
        'CourseOffering',
        'batch',
        `تمت أرشفة ${count} دورات ودفعات منتهية لتخفيف الازدحام في الجداول النشطة.`
      );
      this.saveState();
    }

    return { count };
  }

  public batchArchiveGraduatedMembers(
    performer: { id: string; name: string }
  ): { count: number } {
    let count = 0;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.state.members.forEach((mem) => {
      if ((mem.status === 'graduated' || mem.status === 'withdrawn') && !mem.isArchived) {
        mem.isArchived = true;
        mem.archivedAt = nowStr;
        mem.archiveReason = mem.status === 'graduated' ? 'أرشفة تلقائية للمنتسبين الخريجين' : 'أرشفة تلقائية للمنتسبين المنسحبين';
        count++;
      }
    });

    if (count > 0) {
      this.logAudit(
        performer,
        'أرشفة جماعية للمنتسبين القدامى',
        'Member',
        'batch',
        `تمت أرشفة ${count} منتسب من الخريجين والمنسحبين لتنظيم السجلات النشطة.`
      );
      this.saveState();
    }

    return { count };
  }

  // --- Database Backup & Restore (JSON Export / Import - Section 17) ---
  public exportDatabaseToJson(): string {
    this.state.lastBackupAt = new Date().toISOString();
    this.saveState();
    return JSON.stringify(this.state, null, 2);
  }

  public importDatabaseFromJson(
    jsonContent: string,
    performer: { id: string; name: string }
  ): { success: boolean; message: string; recordCounts?: Record<string, number> } {
    try {
      const parsed = JSON.parse(jsonContent);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('الملف ليس بتنسيق JSON صحيح أو فارغ.');
      }

      if (!Array.isArray(parsed.users) || !Array.isArray(parsed.members) || !Array.isArray(parsed.courses)) {
        throw new Error('الملف غير مطابق لهيكل قاعدة بيانات المركز (مجموعات المستخدمين، المنتسبين، أو الدورات غير موجودة).');
      }

      // Emergency snapshot before overwriting
      try {
        const emergencyKey = `rawad_emergency_backup_${Date.now()}`;
        localStorage.setItem(emergencyKey, JSON.stringify(this.state));
      } catch (backupErr) {
        console.warn('Could not save emergency snapshot to localStorage', backupErr);
      }

      const newState: DatabaseState = {
        settings: parsed.settings || this.state.settings,
        users: parsed.users,
        guardians: Array.isArray(parsed.guardians) ? parsed.guardians : [],
        members: parsed.members,
        onboardingItems: Array.isArray(parsed.onboardingItems) ? parsed.onboardingItems : [],
        volunteers: Array.isArray(parsed.volunteers) ? parsed.volunteers : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        shifts: Array.isArray(parsed.shifts) ? parsed.shifts : [],
        courses: parsed.courses,
        offerings: Array.isArray(parsed.offerings) ? parsed.offerings : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : [],
        attendanceRecords: Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : [],
        materials: Array.isArray(parsed.materials) ? parsed.materials : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        exams: Array.isArray(parsed.exams) ? parsed.exams : [],
        examAttempts: Array.isArray(parsed.examAttempts) ? parsed.examAttempts : [],
        evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : [],
        certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
        cashAccounts: Array.isArray(parsed.cashAccounts) ? parsed.cashAccounts : [],
        finCategories: Array.isArray(parsed.finCategories) ? parsed.finCategories : [],
        memberCharges: Array.isArray(parsed.memberCharges) ? parsed.memberCharges : [],
        paymentReceipts: Array.isArray(parsed.paymentReceipts) ? parsed.paymentReceipts : [],
        donors: Array.isArray(parsed.donors) ? parsed.donors : [],
        donations: Array.isArray(parsed.donations) ? parsed.donations : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        applications: Array.isArray(parsed.applications) ? parsed.applications : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        lastBackupAt: new Date().toISOString(),
      };

      this.state = newState;

      this.logAudit(
        performer,
        'استيراد واستعادة قاعدة البيانات',
        'Database',
        'global',
        `تم استيراد قاعدة بيانات كاملة تحتوي على ${newState.members.length} منتسب، ${newState.courses.length} دورة، و ${newState.volunteers.length} متطوع.`
      );

      this.saveState();

      return {
        success: true,
        message: 'تم استيراد واستعادة قاعدة البيانات المحلية بنجاح!',
        recordCounts: {
          users: newState.users.length,
          members: newState.members.length,
          volunteers: newState.volunteers.length,
          courses: newState.courses.length,
          offerings: newState.offerings.length,
          sessions: newState.sessions.length,
          expenses: newState.expenses.length,
          auditLogs: newState.auditLogs.length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'حدث خطأ أثناء معالجة ملف النسخة الاحتياطية.',
      };
    }
  }
}

export const db = new LocalDatabase();
