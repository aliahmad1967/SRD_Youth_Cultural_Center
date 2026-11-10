import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  UserCheck,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const PublicApplyMemberView: React.FC = () => {
  const { navigate, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('2004-05-15');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('القاهرة - المعادي');
  const [qualification, setQualification] = useState('طالب جامعي');
  const [interests, setInterests] = useState<string[]>(['قيادة', 'ثقافة']);

  // Minor Guardian fields (BR-01, UAT-02)
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'father' | 'mother' | 'guardian'>('father');
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  // Check if applicant is minor (<18)
  const calculateAge = (bDate: string) => {
    const today = new Date();
    const birth = new Date(bDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = calculateAge(birthDate) < 18;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !email) {
      showToast('يرجى استكمال الحقول الإلزامية.', 'warning');
      return;
    }

    // BR-01 enforcement
    if (isMinor && (!guardianName.trim() || !guardianPhone.trim() || !consentAccepted)) {
      showToast('وفقاً للائحة المركز (BR-01 & UAT-02): لا يمكن قبول طلب القاصر دون بيانات ولي الأمر وموافقته الإلكترونية.', 'error');
      return;
    }

    try {
      const app = db.submitMembershipApplication({
        type: 'membership',
        applicantName: name,
        birthDate,
        gender,
        phone,
        email,
        region,
        qualification,
        interests,
        isMinor,
        guardianName: isMinor ? guardianName : undefined,
        guardianPhone: isMinor ? guardianPhone : undefined,
        guardianRelation: isMinor ? guardianRelation : undefined,
        consentAccepted: true,
      });

      setSubmittedApp(app);
      showToast('تم إرسال طلبك بنجاح! احتفظ برقم المتابعة.', 'success');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء التقديم', 'error');
    }
  };

  if (submittedApp) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#2E9E5B] mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">تم استلام طلب الالتحاق بنجاح!</h2>
            <p className="text-xs text-slate-500 mt-1">
              سيقوم منسق المركز بمراجعة طلبك خلال 3 أيام عمل وفقاً لمعيار G1.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400">رقم متابعة الطلب (Tracking Number):</span>
            <div className="text-xl font-black text-[#1E4E8C] font-mono tracking-wider">
              {submittedApp.trackingNumber}
            </div>
            <p className="text-[10px] text-slate-400">
              يرجى الاحتفاظ بهذا الرقم للاستعلام عن حالة قبولك.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('dashboard')}
              className="px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69]"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#1E4E8C] hover:underline"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
        <span className="text-xs text-slate-400">نموذج الالتحاق الموحد بالمركز الشبابي</span>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-black text-slate-900">طلب انتساب جديد لمركز الرواد</h2>
          <p className="text-xs text-slate-500">
            انضم إلى مجتمع الشباب الواعي وشارك في البرامج التثقيفية والمبادرات المجتمعية.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Step 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">الاسم رباعياً:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: يوسف أحمد عبد المنعم"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">تاريخ الميلاد:</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">رقم الهاتف المحمول (واتساب):</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">البريد الإلكتروني:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">المحافظة والمنطقة:</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">المؤهل أو المرحلة الدراسية:</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
          </div>

          {/* Conditional Minor Guardian Block (BR-01, UAT-02) */}
          {isMinor && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>إلزام ولي الأمر للقاصرين دون 18 سنة (قاعدة BR-01 & UAT-02):</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                عمر المتقدم أقل من 18 سنة، ولا يمكن قبول الطلب أو معالجته إلا بتسجيل بيانات ولي الأمر وموافقته الصريحة.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-0.5">اسم ولي الأمر:</label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="مثال: أحمد عبد المنعم"
                    className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-0.5">صلة القرابة:</label>
                  <select
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value as any)}
                    className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs"
                  >
                    <option value="father">الأب</option>
                    <option value="mother">الأم</option>
                    <option value="guardian">الوصي الشرعي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-0.5">هاتف ولي الأمر:</label>
                  <input
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-[#1E4E8C] focus:ring-[#1E4E8C]"
                />
                <span className="text-[11px] text-amber-950 font-bold leading-snug">
                  أقر أنا ولي أمر المتقدم بموافقتي الكاملة على انضمامه للمركز الثقافي والتزامه باللوائح وسياسة الخصوصية.
                </span>
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              بإرسال الطلب، توافق على شروط العضوية وميثاق المركز.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1E4E8C] hover:bg-[#163a69] text-white font-bold text-xs shadow-md transition"
            >
              إرسال طلب الالتحاق
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
