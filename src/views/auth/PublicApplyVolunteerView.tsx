import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  HeartHandshake,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const PublicApplyVolunteerView: React.FC = () => {
  const { navigate, showToast } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('الجيزة - الدقي');
  const [qualification, setQualification] = useState('طالب جامعي');
  const [skills, setSkills] = useState('تنظيم ميداني، إسعافات أولية، تصميم');
  const [availabilityDays, setAvailabilityDays] = useState('الجمعة والسبت');
  const [availabilityHours, setAvailabilityHours] = useState('16:00 - 20:00');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !email || !consentAccepted) {
      showToast('يرجى استكمال الحقول المطلوبة والموافقة على ميثاق التطوع.', 'warning');
      return;
    }

    try {
      const app = db.submitVolunteerApplication({
        type: 'volunteer',
        applicantName: name,
        birthDate: '2003-04-12',
        gender: 'male',
        phone,
        email,
        region,
        qualification,
        interests: ['تطوع', 'خدمة مجتمعية'],
        skills: skills.split('،').map((s) => s.trim()),
        availabilityDays: availabilityDays.split('و').map((s) => s.trim()),
        availabilityHours,
        isMinor: false,
        consentAccepted: true,
      });

      setSubmittedApp(app);
      showToast('تم إرسال طلب التطوع بنجاح! سيتم التواصل لتحديد مقابلة.', 'success');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ', 'error');
    }
  };

  if (submittedApp) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">تم استلام طلب التطوع بنجاح!</h2>
            <p className="text-xs text-slate-500 mt-1">
              رقم متابعة الطلب: <strong className="font-mono text-[#1E4E8C]">{submittedApp.trackingNumber}</strong>
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            شكراً لرغبتك الصادقة في خدمة المجتمع والمشاركة في مبادرات مركز الرواد الشبابي.
          </p>
          <button
            onClick={() => navigate('dashboard')}
            className="px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold"
          >
            العودة للرئيسية
          </button>
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
        <span className="text-xs text-slate-400">انضم لفريق صناع الأثر</span>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-black text-slate-900">طلب الانضمام كمتطوع في المركز</h2>
          <p className="text-xs text-slate-500">
            اكتسب خبرات عملية، وثّق ساعات تطوعك، واحصل على شهادات رسمية وشارات تكريم.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">الاسم الكامل:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عمر سالم الشريف"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">الهاتف (واتساب):</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">البريد الإلكتروني:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="volunteer@example.com"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">المنطقة السكنية:</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              المهارات ومجالات التطوع المفضلة:
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="تنظيم، استقبال، صوتيات، ميديا، إسعافات..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">أيام التوفر المعتادة:</label>
              <input
                type="text"
                value={availabilityDays}
                onChange={(e) => setAvailabilityDays(e.target.value)}
                placeholder="الجمعة، السبت..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ساعات التوفر:</label>
              <input
                type="text"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                placeholder="16:00 - 20:00"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5 rounded text-[#1E4E8C]"
            />
            <span className="text-[11px] text-slate-700 leading-snug">
              أوافق على ميثاق التطوع بالمركز والالتزام بالمهام والورديات الموكلة إليّ بأمانة واحترافية.
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#E8A33D] hover:bg-[#d99430] text-slate-900 font-black text-xs shadow-md transition"
          >
            إرسال طلب التطوع
          </button>
        </form>
      </div>
    </div>
  );
};
