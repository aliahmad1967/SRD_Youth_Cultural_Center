import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  X,
  BookOpen,
  CheckCircle2,
  Users,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Database,
  Archive,
  QrCode,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Download,
  Moon,
  Coins,
  FileText,
  Search,
} from 'lucide-react';

type GuideTab = 'quickstart' | 'director' | 'courses_trainers' | 'members' | 'volunteers_guardians' | 'offline_backup';

export const UserGuideModal: React.FC = () => {
  const {
    isUserGuideOpen,
    closeUserGuide,
    switchRole,
    navigate,
    openSettings,
    openAddMember,
    openBackupModal,
    openArchiveModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<GuideTab>('quickstart');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isUserGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1E4E8C] via-[#163a69] to-[#0E2E5C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">دليل المستخدم المبسط للمنظومة</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  خطوات سهلة
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                تعرف على كيفية استخدام مركز الرواد الشبابي الثقافي والتوعوي بخطوات عملية ومباشرة.
              </p>
            </div>
          </div>

          <button
            onClick={closeUserGuide}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'quickstart'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1. البدء السريع</span>
          </button>

          <button
            onClick={() => setActiveTab('director')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'director'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. دليل المدير العام</span>
          </button>

          <button
            onClick={() => setActiveTab('courses_trainers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'courses_trainers'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
            <span>3. الدورات ورصد الحضور</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'members'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>4. المنتسب والتأهيل</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteers_guardians')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'volunteers_guardians'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
            <span>5. المتطوع وأولياء الأمور</span>
          </button>

          <button
            onClick={() => setActiveTab('offline_backup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'offline_backup'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>6. النسخ الاحتياطي والأرشيف</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: Quickstart */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#1E4E8C] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-sm">مرحباً بك في مركز الرواد الشبابي الثقافي والتوعوي!</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    هذا التطبيق يعمل محلياً بالكامل على خادم المركز لضمان أمان وخصوصية بيانات الشباب والقاصرين. يمكنك تجربة كافة الميزات والأدوار دون الحاجة لأي إعدادات معقدة.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E4E8C] text-white flex items-center justify-center text-xs">1</span>
                  <span>الخطوة الأولى: التبديل السريع بين الأدوار للتجربة</span>
                </h3>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    من خلال الشريط العلوي (الأسود) يمكنك بنقرة زر واحدة التبديل بين شخصيات المركز المختلفة لمعاينة شاشاتهم:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <button
                      onClick={() => { switchRole('director'); closeUserGuide(); }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 font-bold transition"
                    >
                      👑 المدير العام
                    </button>
                    <button
                      onClick={() => { switchRole('coordinator'); closeUserGuide(); }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 font-bold transition"
                    >
                      📋 منسق الأنشطة
                    </button>
                    <button
                      onClick={() => { switchRole('trainer'); closeUserGuide(); }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 font-bold transition"
                    >
                      🎓 المحاضر / المدرب
                    </button>
                    <button
                      onClick={() => { switchRole('member'); closeUserGuide(); }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 font-bold transition"
                    >
                      👤 المنتسب / الملتحق
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E4E8C] text-white flex items-center justify-center text-xs">2</span>
                  <span>الخطوة الثانية: تخصيص العملة والمود الليلي (Dark Mode)</span>
                </h3>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    في الترويسة العلوية، يمكنك التبديل بضغطة واحدة بين:
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>
                      <strong className="text-slate-900 dark:text-white">العملة:</strong> التبديل بين الدينار العراقي (د.ع) والدولار الأمريكي ($) مع محول تلقائي للرسوم والموازنات.
                    </li>
                    <li>
                      <strong className="text-slate-900 dark:text-white">المود الليلي:</strong> التبديل بين الوضع الفاتح والداكن لراحة العين عبر أيقونة الشمس/القمر.
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={() => { closeUserGuide(); openSettings(); }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition inline-flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>فتح نافذة الإعدادات الشاملة</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E4E8C] text-white flex items-center justify-center text-xs">3</span>
                  <span>الخطوة الثالثة: استكشاف ملفات الأفراد (HR) والأرشيف</span>
                </h3>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  تم تنظيم كافة المحاضرين، المتطوعين، الأعضاء، وأولياء الأمور في قسم موحد هو <strong>شؤون الأفراد والكوادر (HR Management)</strong>، بالإضافة إلى <strong>قسم الأرشيف</strong> لحفظ السجلات القديمة دون تكديس الجداول.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Director Guide */}
          {activeTab === 'director' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-sm">مهام المدير العام ورئيس مجلس الإدارة (5 خطوات بسيطة)</h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    المدير يملك الرقابة التامة على الموازنات، إضافة الملتحقين، تقارير الأداء، وإدارة الأرشيف.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      1. إضافة ملتحق جديد مباشرة (Direct Enrollee Entry):
                    </span>
                    <button
                      onClick={() => { closeUserGuide(); openAddMember(); }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold"
                    >
                      + فتح النموذج
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    انقر على <strong>"+ إضافة ملتحق جديد مباشرة"</strong> في ترويسة لوحة القيادة. إذا كان العمر أقل من 18 عاماً، سيكشف النظام تلقائياً أنه قاصر ويطلب اسم ولي الأمر ورقم هاتفه وإقراره.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    2. تعيين وتغيير المحاضرين للدورات (Dynamic Trainers):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    من جدول <em>الدورات والبرامج التثقيفية الجارية</em>، انقر على شارة <strong>"المحاضر: فلان (تغيير ✎)"</strong> لاختيار مدرب آخر معتمد أو إضافة مدرب جديد فورياً دون تعطيل الدورة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    3. مراجعة تقارير الأداء الشهرية التلقائية (Recharts Charts):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    تعرض لوحة القيادة رسوماً بيانية تفاعلية للمنتسبين الجدد، الدورات المكتملة، وساعات التطوع الموثقة مع إمكانية طباعتها للجهات المانحة ومجلس الإدارة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    4. اعتماد المصروفات وفصل الصلاحيات (BR-14 / UAT-14):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    إذا طلب المنسق مصروفاً يتجاوز موازنة النشاط، سيظهر لك تنبيه برتقالي في الأعلى للاعتماد الاستثنائي قبل أن يتمكن أمين الصندوق من صرف المبلغ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      5. أرشفة السجلات المنتهية والنسخ الاحتياطي:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { closeUserGuide(); openArchiveModal(); }}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[11px] font-bold"
                      >
                        الأرشيف
                      </button>
                      <button
                        onClick={() => { closeUserGuide(); openBackupModal(); }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold"
                      >
                        النسخ (JSON)
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    استخدم زر <strong>"قسم الأرشيف"</strong> لنقل الدورات المنتهية والأعضاء الخريجين للأرشيف، وزر <strong>"نسخ احتياطي واستيراد (JSON)"</strong> لتنزيل نسخة محلية كاملة من قاعدة البيانات.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Courses & Attendance */}
          {activeTab === 'courses_trainers' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-100 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-sm">إدارة الدورات والجلسات ورصد الحضور (4 خطوات)</h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    كيفية رصد حضور الطلاب ومسح رموز الـ QR وإدارة قوائم الانتظار.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    1. تصفح الكتالوج وتسجيل المشاركين:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    من تبويب <em>"الدورات والأنشطة"</em>، يظهر كتالوج البرامج الثقافية والقيادية. عند اكتمال مقاعد الدفعة، يتم إدراج المسجل تلقائياً في <strong>قائمة الانتظار</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    2. الترقية التلقائية عند الانسحاب (Waitlist Promotion):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    حال قيام أي متدرب بالانسحاب، يقوم النظام بترقية أول مسجل في قائمة الانتظار آلياً لمقعد مؤكد وإرسال إشعار فوري له.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    3. رصد الحضور بمسح الـ QR ومسح الكاميرا:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    من شاشة <em>"رصد حضور الجلسات"</em>، يمكن للمدرب فتح الماسح الضوئي (QR Scanner) وتوجيهه نحو بطاقة العضو الرقمية لتسجيل حضوره في ثانية واحدة حتى دون اتصال بالإنترنت!
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    4. الاختبارات والشهادات الرقمية:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    عند إكمال نسبة الحضور المطلوبة واجتياز الاختبار، يتم توليد شهادة رقمية رسمية تحتوي على رمز تحقق فريد يمكن لأي جهة خارجية فحصه عبر بوابة التحقق العامة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Members & Enrollees */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100 flex items-start gap-3">
                <Users className="w-5 h-5 text-[#1E4E8C] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-sm">دليل المنتسب والملتحق الجديد (من التسجيل للتخرج)</h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    رحلة الشاب في المركز: بطاقة العضوية، قائمة مهام التأهيل، وحضور الورش.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    1. بطاقة العضوية الرقمية (Digital QR ID):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    لكل منتسب بطاقة عضوية رقمية أنيقة تحمل صورته، اسمه، رقم عضويته، ورمز الاستجابة السريعة (QR) المشفر لإثبات الهوية وتسجيل الدخول للجلسات.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    2. قائمة مهام التأهيل (Onboarding Checklist):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    يمر الملتحق الجديد بفترة تأهيل تظهر له في بوابته: (اللقاء الترحيبي، ميثاق السلوك، حضور أول ورشة، وتحديث بيانات الاهتمامات). يتم ترقيته لـ "منتسب نشط" تلقائياً فور إنجازها.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    3. الحساب المالي وسندات القبض:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    يمكن للمنتسب أو ولي أمره تفقد رسوم الاشتراك وسندات القبض المسددة مع إمكانية طباعة إيصال رسمي مختوم.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Volunteers & Guardians */}
          {activeTab === 'volunteers_guardians' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-sm">المتطوعون وأولياء الأمور (متابعة الساعات والوصاية)</h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    منظومة التطوع الاحترافية وبوابة المتابعة الآمنة لأولياء أمور القاصرين.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    للمتطوعين: تسجيل الورديات ومستويات الأوسمة:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    يسجل المتطوع في الفرص المتاحة (تنظيم فعاليات، تصميم، دعم تقني)، ويسجل دخوله وخروجه. عند اعتماد الساعات يرتقي تلقائياً بين مستويات الأوسمة: <strong>برونزي (10 ساعات)</strong>، <strong>فضي (30 ساعة)</strong>، و <strong>ذهبي (50+ ساعة)</strong> مع شهادة شكر رسمية.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    لأولياء الأمور: متابعة الأبناء القاصرين وحضورهم:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    بوابة ولي الأمر تتيح للأب أو الأم الاطلاع على جدول حضور أبنائهم، نسب الإنجاز، تفقد موافقة الوصاية، والمستحقات والشهادات المحققة في بيئة آمنة تماماً.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Offline & Backup */}
          {activeTab === 'offline_backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100 flex items-start gap-3">
                <Database className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-sm">العمل دون إنترنت، الأرشيف، والنسخ الاحتياطي (Section 17)</h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    استقلالية الخادم المحلي داخل المركز وتصدير واستيراد ملفات JSON للحماية القصوى.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    1. العمل التام في وضع عدم الاتصال (Offline-First):
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    إذا انقطع الإنترنت أو شبكة المركز، يستمر التطبيق بالعمل وتسجيل الحضور وساعات التطوع محلياً داخل جهازك، ثم يقوم بمزامنتها تلقائياً فور استعادة الاتصال دون ضياع أي حركة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      2. تصدير قاعدة البيانات لملف JSON:
                    </span>
                    <button
                      onClick={() => { closeUserGuide(); openBackupModal(); }}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold"
                    >
                      تصدير الآن
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    من لوحة القيادة انقر على <strong>"نسخ احتياطي واستيراد (JSON)"</strong> ثم <strong>"تصدير وتحميل النسخة الاحتياطية"</strong> للحصول على ملف مؤرخ يحتوي على كافة السجلات والعمليات.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      3. قسم الأرشيف واستعادة السجلات القديمة:
                    </span>
                    <button
                      onClick={() => { closeUserGuide(); openArchiveModal(); }}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[11px] font-bold"
                    >
                      فتح الأرشيف
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    يسمح بنقل الدورات المنتهية والأعضاء الخريجين إلى <strong>"قسم الأرشيف"</strong> لتخفيف ازدحام الجداول النشطة مع الحفاظ الكامل على البيانات وإمكانية استرجاعها بنقرة زر في أي وقت.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            مركز الرواد للشباب · دليل الاستخدام التفاعلي المبسط
          </div>
          <button
            onClick={closeUserGuide}
            className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs"
          >
            فهمت، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
