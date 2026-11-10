import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import { MemberStatus, Member } from '../../types';
import {
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  QrCode,
  Printer,
  Copy,
} from 'lucide-react';

export const AddMemberModal: React.FC = () => {
  const { isAddMemberOpen, closeAddMember, currentUser, dbState, showToast, formatMoney } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('2007-05-15');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [region, setRegion] = useState('بغداد - الكرخ');
  const [qualification, setQualification] = useState('طالب جامعي');
  const [category, setCategory] = useState<'regular' | 'student' | 'honorary' | 'founder'>('student');
  const [status, setStatus] = useState<MemberStatus>('new_enrollee');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['قيادة وتأثير', 'ثقافة وفكر']);

  // Guardian details if minor
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'father' | 'mother' | 'guardian'>('father');
  const [guardianConsent, setGuardianConsent] = useState(true);

  // Optional direct course enrollment
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('');

  // Result state
  const [createdMember, setCreatedMember] = useState<Member | null>(null);

  if (!isAddMemberOpen) return null;

  // Calculate age
  const birthYear = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = isNaN(birthYear) ? 18 : currentYear - birthYear;
  const isMinor = age < 18;

  const availableTracks = [
    'قيادة وتأثير',
    'إعلام وصناعة محتوى',
    'ثقافة وفكر',
    'ريادة أعمال ومبادرات',
    'برمجة وتقنية',
    'تطوع ومسؤولية مجتمعية',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('يرجى إدخال اسم الملتحق الكامل.', 'warning');
      return;
    }
    if (!phone.trim()) {
      showToast('يرجى إدخال رقم هاتف الملتحق.', 'warning');
      return;
    }
    if (isMinor && (!guardianName.trim() || !guardianPhone.trim())) {
      showToast('الملتحق قاصر (أقل من 18 عاماً): يرجى تسجيل بيانات ولي الأمر ورقم هاتفه.', 'warning');
      return;
    }

    try {
      const newMember = db.addNewMemberDirectly(
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || `${phone.replace(/\D/g, '')}@rawad-member.iq`,
          birthDate,
          gender,
          region,
          qualification,
          interests: selectedInterests,
          category,
          status,
          isMinor,
          guardianName: isMinor ? guardianName.trim() : undefined,
          guardianPhone: isMinor ? guardianPhone.trim() : undefined,
          guardianRelation: isMinor ? guardianRelation : undefined,
        },
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-dir', name: 'المدير العام' }
      );

      // If course offering selected, enroll immediately
      if (selectedOfferingId) {
        try {
          db.enrollInCourse(selectedOfferingId, newMember.id);
        } catch (enrollErr: any) {
          console.warn('Direct course enrollment notice:', enrollErr);
        }
      }

      setCreatedMember(newMember);
      showToast(`تم تسجيل الملتحق بنجاح برقم العضوية: ${newMember.membershipNo}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء إضافة الملتحق', 'error');
    }
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setCreatedMember(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 dark:border-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E4E8C] to-[#163a69] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">إضافة ملتحق جديد مباشرة (صلاحية المدير العام)</h2>
              <p className="text-xs text-blue-100">
                تسجيل العضو في قاعدة البيانات وتوليد رقم العضوية وبطاقة الانتساب فورياً
              </p>
            </div>
          </div>
          <button
            onClick={closeAddMember}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {createdMember ? (
            /* SUCCESS VIEW WITH DIGITAL MEMBERSHIP CARD */
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-sm">تم تسجيل الملتحق الجديد بنجاح في النظام!</div>
                  <p className="mt-0.5">
                    تم إنشاء حسابه، وإنشاء قائمة التحقق الخاصة بفترة التأهيل (Onboarding Checklist)، وإرسال إشعار الترحيب.
                  </p>
                </div>
              </div>

              {/* Digital Card Preview */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-[#1E4E8C] via-[#163a69] to-[#0E2E5C] text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-300" />
                    <span className="font-bold text-xs tracking-wide">مركز الرواد الشبابي والثقافي</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                    {createdMember.status === 'new_enrollee' ? 'ملتحق جديد (تأهيل)' : 'منتسب معتمد'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 text-right">
                    <h3 className="text-lg font-black">{createdMember.name}</h3>
                    <div className="text-xs font-mono text-amber-300">
                      رقم العضوية: {createdMember.membershipNo}
                    </div>
                    <div className="text-[11px] text-slate-200 space-y-0.5">
                      <div>الهاتف: {createdMember.phone}</div>
                      <div>المنطقة: {createdMember.region}</div>
                      <div>المؤهل: {createdMember.qualification}</div>
                      {createdMember.isMinor && (
                        <div className="text-amber-200 text-[10px]">
                          قاصر (تحت إشراف ولي الأمر)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-2xl shadow-md shrink-0 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-slate-800" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 font-bold">
                      {createdMember.membershipNo}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
                  <span>تاريخ الانضمام: {createdMember.joinedAt}</span>
                  <span>انتهاء التأهيل: {createdMember.onboardingEndsAt}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة بطاقة العضوية</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2 rounded-xl bg-[#1E4E8C] text-white hover:bg-[#163a69] text-xs font-bold transition"
                >
                  إضافة ملتحق آخر +
                </button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الرباعي الكامل للملتحق *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: علي محمد حسن العبيدي"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف (واتساب) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0770XXXXXXX أو 0780XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Birthdate & Gender & Minor Check */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الميلاد (السن: {age} سنة) *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                  />
                  {isMinor && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
                      ⚠️ قاصر دون 18 عاماً: يتطلب تسجيل بيانات ولي الأمر.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجنس *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المحافظة / المنطقة السكنية
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="مثال: بغداد - الكرخ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                  />
                </div>
              </div>

              {/* Conditional Guardian Box if Minor */}
              {isMinor && (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      بيانات ولي الأمر وموافقة الوصاية (إلزامية وفق BR-02)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم ولي الأمر الثلاثي *
                      </label>
                      <input
                        type="text"
                        required={isMinor}
                        placeholder="مثال: محمد حسن العبيدي"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        هاتف ولي الأمر *
                      </label>
                      <input
                        type="tel"
                        required={isMinor}
                        placeholder="07XXXXXXXXX"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        صلة القرابة
                      </label>
                      <select
                        value={guardianRelation}
                        onChange={(e) => setGuardianRelation(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="father">الأب (الوالد)</option>
                        <option value="mother">الأم (الوالدة)</option>
                        <option value="guardian">وصي شرعي / ولي أمر</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={guardianConsent}
                      onChange={(e) => setGuardianConsent(e.target.checked)}
                      className="rounded text-[#1E4E8C] focus:ring-[#1E4E8C]"
                    />
                    <span className="text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                      تأكيد الحصول على موافقة ولي الأمر الشفهية أو الخطية للالتحاق ببرامج المركز
                    </span>
                  </label>
                </div>
              )}

              {/* Row 3: Qualification & Category & Initial Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المؤهل الدراسي / المرحلة
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                  >
                    <option value="طالب إعدادي">طالب مرحلة إعدادية / ثانوي</option>
                    <option value="طالب جامعي">طالب جامعي (بكالوريوس)</option>
                    <option value="خريج جامعي">خريج جامعي</option>
                    <option value="دراسات عليا">دراسات عليا / ماجستير</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    فئة العضوية
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                  >
                    <option value="student">طالب (خصم 50% على الأنشطة)</option>
                    <option value="regular">منتسب عادي</option>
                    <option value="honorary">عضو شرفي</option>
                    <option value="founder">مؤسس</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحالة الابتدائية (قرار المدير)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-[#1E4E8C] outline-hidden"
                  >
                    <option value="new_enrollee">ملتحق جديد (فترة تأهيل 60 يوماً - الموصى به)</option>
                    <option value="active">منتسب نشط مباشرة (تجاوز فترة التأهيل)</option>
                  </select>
                </div>
              </div>

              {/* Interests & Tracks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  المسارات التوعوية والاهتمامات:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTracks.map((trk) => {
                    const isSelected = selectedInterests.includes(trk);
                    return (
                      <button
                        type="button"
                        key={trk}
                        onClick={() => toggleInterest(trk)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[#1E4E8C] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {trk} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Course Enrollment (Optional) */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <label className="block text-xs font-bold text-[#1E4E8C] dark:text-blue-400 mb-1">
                  إلحاق فوري بدورة تدريبية (اختياري):
                </label>
                <select
                  value={selectedOfferingId}
                  onChange={(e) => setSelectedOfferingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- بدون إلحاق بدورة الآن (تسجيل عام في المركز) --</option>
                  {dbState.offerings.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} - المحاضر: {off.trainerName} ({off.enrolledCount}/{off.capacity} مقعد)
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeAddMember}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] hover:bg-[#163a69] text-white shadow-sm transition flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد إضافة الملتحق وإصدار العضوية</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
