/**
 * Types & Data Model for Youth Cultural & Awareness Center Management System
 * نظام إدارة المركز الشبابي الثقافي والتوعوي
 */

export type UserRole = 
  | 'director'       // المدير / رئيس المركز
  | 'finance'        // المسؤول المالي / أمين الصندوق
  | 'coordinator'    // منسق الدورات والأنشطة
  | 'trainer'        // المحاضر / المدرب
  | 'volunteer'      // المتطوع
  | 'member'         // المنتسب (يشمل الملتحق الجديد)
  | 'guardian';      // ولي الأمر

export type MemberStatus = 
  | 'new_enrollee'   // ملتحق جديد (فترة التأهيل)
  | 'active'         // منتسب نشط
  | 'suspended'      // موقوف
  | 'withdrawn'      // منسحب
  | 'graduated';     // خريج

export type VolunteerStatus = 
  | 'trial'          // تحت التجربة
  | 'active'         // متطوع نشط
  | 'inactive'       // غير نشط
  | 'suspended'      // موقوف
  | 'ended';         // منته

export type VolunteerLevel = 'bronze' | 'silver' | 'gold';

export type ApplicationStatus = 
  | 'submitted'      // قيد المراجعة
  | 'interview'      // مقابلة
  | 'approved'       // مقبول
  | 'rejected'       // مرفوض
  | 'waitlist';      // قائمة انتظار

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue' | 'exempt';

export type ExpenseStatus = 
  | 'draft'               // مسودة
  | 'pending_approval'   // بانتظار الاعتماد
  | 'approved'           // معتمد
  | 'rejected'           // مرفوض
  | 'disbursed';         // مصروف

export type CertificateStatus = 'valid' | 'revoked';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  roles: UserRole[];
  status: 'active' | 'suspended';
  lastLogin?: string;
}

export interface Member {
  id: string;
  userId: string;
  membershipNo: string;
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
  joinedAt: string;
  onboardingEndsAt: string;
  subscriptionEndsAt: string;
  isMinor: boolean;
  guardianId?: string;
  photoUrl?: string;
  totalHoursAttended?: number;
}

export interface Guardian {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  memberId: string; // ID of minor member
  relationship: 'father' | 'mother' | 'guardian';
  consentAccepted: boolean;
  consentDate: string;
}

export interface OnboardingItem {
  id: string;
  memberId: string;
  key: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  autoOrManual: 'auto' | 'manual';
}

export interface Application {
  id: string;
  type: 'membership' | 'volunteer';
  applicantName: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  region: string;
  qualification: string;
  interests: string[];
  skills?: string[];
  availabilityDays?: string[];
  availabilityHours?: string;
  isMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  consentAccepted: boolean;
  trackingNumber: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  reviewerNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Volunteer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  skills: string[];
  availabilityDays: string[];
  availabilityHours: string;
  status: VolunteerStatus;
  approvedHours: number;
  level: VolunteerLevel;
  joinedAt: string;
  memberId?: string;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  slotsCount: number;
  filledSlotsCount: number;
  date: string;
  location: string;
  estimatedHours: number;
  responsiblePerson: string;
  eventId?: string;
  status: 'open' | 'full' | 'completed';
}

export interface VolunteerShift {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  volunteerId: string;
  volunteerName: string;
  clockIn?: string;
  clockOut?: string;
  actualHours: number;
  status: 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string;
  qrScanned: boolean;
  notes?: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  category: 'cultural' | 'awareness' | 'workshop' | 'leadership';
  description: string;
  objectives: string[];
  totalHours: number;
  ageGroup: string;
  prerequisites?: string;
  fee: number; // 0 for free
  completionCriteria: {
    minAttendancePercent: number;
    minExamScore: number;
  };
  image?: string;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  trainerId: string;
  trainerName: string;
  venueOrLink: string;
  capacity: number;
  enrolledCount: number;
  waitlistCount: number;
  status: 'draft' | 'open' | 'closed' | 'in_progress' | 'completed' | 'archived';
  scheduleSummary: string;
}

export interface Session {
  id: string;
  offeringId: string;
  courseTitle: string;
  offeringName: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  isRecorded: boolean;
  qrCodeToken: string;
  qrExpiresAt?: string;
}

export interface Enrollment {
  id: string;
  offeringId: string;
  memberId: string;
  memberName: string;
  status: 'registered' | 'waitlist' | 'completed' | 'withdrawn';
  attendanceRate: number;
  examScore?: number;
  certificateIssued: boolean;
  enrolledAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  memberId: string;
  memberName: string;
  status: AttendanceStatus;
  method: 'manual' | 'qr_scan';
  markedAt: string;
  markedBy: string;
  isSynced: boolean;
  notes?: string;
}

export interface CourseMaterial {
  id: string;
  offeringId: string;
  sessionId?: string;
  title: string;
  type: 'pdf' | 'slides' | 'video_link';
  fileUrl: string;
  isPublished: boolean;
}

export interface CenterEvent {
  id: string;
  title: string;
  type: 'seminar' | 'workshop' | 'orientation_meeting' | 'exhibition' | 'awareness_day' | 'campaign';
  date: string;
  location: string;
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  audience: 'public' | 'members_only';
  budget: number;
  spent: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  targetBeneficiariesCount?: number;
  fieldBeneficiariesCount?: number;
  description: string;
}

export interface Question {
  id: string;
  courseId: string;
  topic: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string | number | boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface Exam {
  id: string;
  offeringId: string;
  courseTitle: string;
  title: string;
  type: 'level_placement' | 'final_course' | 'quiz' | 'volunteer_qualification';
  durationMinutes: number;
  totalMarks: number;
  passingScore: number;
  opensAt: string;
  closesAt: string;
  isAutoGraded: boolean;
  randomizeQuestions: boolean;
  status: 'draft' | 'active' | 'closed';
  questionIds: string[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  memberId: string;
  memberName: string;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, any>;
  score?: number;
  isGraded: boolean;
  trainerNotes?: string;
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface CourseEvaluation {
  id: string;
  offeringId: string;
  courseTitle: string;
  ratings: {
    content: number;
    trainer: number;
    organization: number;
    benefit: number;
  };
  comment: string;
  isAnonymous: true;
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateNo: string;
  type: 'course_completion' | 'volunteer_hours' | 'event_participation' | 'appreciation';
  recipientName: string;
  memberId: string;
  courseOrEventTitle: string;
  hoursOrGrade: string;
  issuedAt: string;
  status: CertificateStatus;
  verificationCode: string;
  revocationReason?: string;
}

export interface CashAccount {
  id: string;
  name: string;
  type: 'cash_safe' | 'bank' | 'e_wallet' | 'petty_cash';
  openingBalance: number;
  currentBalance: number;
}

export interface FinCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  code: string;
}

export interface MemberCharge {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  period: string;
  amount: number;
  discount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAmount: number;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  payerName: string;
  memberId?: string;
  donorId?: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'e_wallet';
  cashAccountId: string;
  cashAccountName: string;
  items: Array<{ title: string; amount: number }>;
  remainingAmount: number;
  status: 'active' | 'voided';
  issuedAt: string;
  issuedBy: string;
  qrCodeToken: string;
}

export interface Donor {
  id: string;
  name: string;
  isAnonymous: boolean;
  type: 'individual' | 'organization';
  phone?: string;
  email?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  isRestricted: boolean;
  restrictedProject?: string;
  cashAccountId: string;
  receiptId: string;
  notes?: string;
  date: string;
}

export interface ExpenseRequest {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  activityOrEventId?: string;
  activityName?: string;
  amount: number;
  beneficiary: string;
  description: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
  status: ExpenseStatus;
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  disbursedBy?: string;
  disbursedByName?: string;
  cashAccountId?: string;
  cashAccountName?: string;
  isBudgetOverrun: boolean;
  directorOverrideApproved?: boolean;
  rejectionReason?: string;
  date: string;
}

export interface ActivityBudget {
  id: string;
  targetType: 'course' | 'event' | 'general';
  targetId: string;
  targetTitle: string;
  allocatedAmount: number;
  spentAmount: number;
  notes: string;
}

export interface FinTransaction {
  id: string;
  type: 'receipt' | 'disbursement' | 'transfer' | 'reversal';
  amount: number;
  cashAccountId: string;
  cashAccountName: string;
  categoryId?: string;
  categoryName?: string;
  referenceNo: string;
  description: string;
  date: string;
  createdBy: string;
}

export interface CenterNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'attendance' | 'financial' | 'exam' | 'volunteer';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface CenterAnnouncement {
  id: string;
  audience: 'all' | 'members' | 'volunteers' | 'trainers' | 'guardians';
  title: string;
  content: string;
  scheduledAt: string;
  createdAt: string;
  authorName: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export type CurrencyCode = 'IQD' | 'USD' | 'EGP';
export type ThemeMode = 'light' | 'dark';

export interface CenterSettings {
  name: string;
  tagline: string;
  logo: string;
  currency: CurrencyCode;
  currencySymbol: string;
  usdToIqdRate: number;
  themeMode: ThemeMode;
  defaultCurrency: string;
  probationPeriodDays: number;
  minVolunteerHoursForCert: number;
  smallApprovalLimit: number;
  mediumApprovalLimit: number;
  attendanceEditWindowHours: number;
}
