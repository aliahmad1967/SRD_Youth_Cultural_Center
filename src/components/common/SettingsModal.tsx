import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import { CurrencyCode, ThemeMode } from '../../types';
import {
  X,
  Settings,
  Coins,
  Moon,
  Sun,
  Building,
  Clock,
  Shield,
  RotateCcw,
  Check,
  DollarSign,
  Layers,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    dbState,
    theme,
    setTheme,
    currency,
    setCurrency,
    currentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'currency' | 'operations'>('currency');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(theme);
  const [usdRate, setUsdRate] = useState<number>(dbState.settings.usdToIqdRate || 1310);

  // Operations settings
  const [centerName, setCenterName] = useState(dbState.settings.name);
  const [tagline, setTagline] = useState(dbState.settings.tagline);
  const [probationDays, setProbationDays] = useState(dbState.settings.probationPeriodDays || 60);
  const [minVolHours, setMinVolHours] = useState(dbState.settings.minVolunteerHoursForCert || 20);
  const [editWindowHours, setEditWindowHours] = useState(dbState.settings.attendanceEditWindowHours || 48);

  useEffect(() => {
    setSelectedCurrency(currency);
    setSelectedTheme(theme);
    setUsdRate(dbState.settings.usdToIqdRate || 1310);
    setCenterName(dbState.settings.name);
    setTagline(dbState.settings.tagline);
    setProbationDays(dbState.settings.probationPeriodDays || 60);
    setMinVolHours(dbState.settings.minVolunteerHoursForCert || 20);
    setEditWindowHours(dbState.settings.attendanceEditWindowHours || 48);
  }, [isSettingsOpen, currency, theme, dbState.settings]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    // Apply theme
    setTheme(selectedTheme);
    // Apply currency
    setCurrency(selectedCurrency);

    // Save full settings
    db.updateSettings(
      {
        name: centerName,
        tagline: tagline,
        currency: selectedCurrency,
        currencySymbol: selectedCurrency === 'USD' ? '$' : 'د.ع',
        usdToIqdRate: Number(usdRate) || 1310,
        themeMode: selectedTheme,
        probationPeriodDays: Number(probationDays) || 60,
        minVolunteerHoursForCert: Number(minVolHours) || 20,
        attendanceEditWindowHours: Number(editWindowHours) || 48,
      },
      currentUser ? { id: currentUser.id, name: currentUser.name } : undefined
    );

    showToast('تم حفظ كافة إعدادات النظام وتحديث العملة والمظهر بنجاح.', 'success');
    closeSettings();
  };

  // Preview calculations
  const sampleIQD = 100000;
  const sampleUSD = sampleIQD / (Number(usdRate) || 1310);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 dark:border-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E4E8C] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">إعدادات النظام العامة</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تخصيص العملة النقدية، المظهر الليلي، ومعايير الحوكمة والتشغيل
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
          <button
            onClick={() => setActiveTab('currency')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'currency'
                ? 'border-[#1E4E8C] text-[#1E4E8C] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>العملة النقدية والمظهر</span>
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'operations'
                ? 'border-[#1E4E8C] text-[#1E4E8C] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>سياسات التأهيل والحضور</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'general'
                ? 'border-[#1E4E8C] text-[#1E4E8C] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>بيانات المركز</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {/* TAB 1: CURRENCY & THEME */}
          {activeTab === 'currency' && (
            <div className="space-y-6">
              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  العملة المالية المعتمدة في النظام:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Iraqi Dinar */}
                  <div
                    onClick={() => setSelectedCurrency('IQD')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition relative flex items-start gap-3 ${
                      selectedCurrency === 'IQD'
                        ? 'border-[#1E4E8C] bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E4E8C] to-[#163a69] text-white flex items-center justify-center font-black text-sm shrink-0">
                      د.ع
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          الدينار العراقي (IQD)
                        </span>
                        {selectedCurrency === 'IQD' && (
                          <span className="w-4 h-4 rounded-full bg-[#1E4E8C] text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        العملة الرسمية الأساسية للمركز (د.ع)
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#1E4E8C] dark:text-blue-300">
                        الرمز: د.ع (Iraqi Dinar)
                      </span>
                    </div>
                  </div>

                  {/* Option 2: US Dollar */}
                  <div
                    onClick={() => setSelectedCurrency('USD')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition relative flex items-start gap-3 ${
                      selectedCurrency === 'USD'
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-base shrink-0">
                      $
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          الدولار الأمريكي (USD)
                        </span>
                        {selectedCurrency === 'USD' && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        تسعير الدورات والرسوم والموازنات بالدولار
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        الرمز: $ USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-[#1E4E8C] dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      سعر الصرف والتحويل (1 دولار = دينار عراقي)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">معتمد في كافة الحسابات</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={usdRate}
                      onChange={(e) => setUsdRate(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold text-left"
                      dir="ltr"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                      IQD / 1 USD
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 min-w-[200px]">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">معاينة التحويل المباشر:</div>
                    <div className="font-mono text-xs">
                      {sampleIQD.toLocaleString('ar-IQ')} د.ع ≈ ${sampleUSD.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Night Mode / Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  مظهر التطبيق والمود الليلي (Dark Mode):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Light Mode */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('light')}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 text-right transition ${
                      selectedTheme === 'light'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-1 ring-amber-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">الوضع النهاري (فاتح)</div>
                      <div className="text-[10px] text-slate-500">خلفيات بيضاء مريحة للقراءة</div>
                    </div>
                  </button>

                  {/* Dark Mode */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('dark')}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 text-right transition ${
                      selectedTheme === 'dark'
                        ? 'border-indigo-500 bg-indigo-950/40 text-slate-900 dark:text-white font-bold ring-1 ring-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">المود الليلي (داكن)</div>
                      <div className="text-[10px] text-slate-500">تقليل إجهاد العين ليلاً</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLICIES & OPERATIONS */}
          {activeTab === 'operations' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  فترة تأهيل الملتحقين الجدد (بالأيام - BR-03):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={probationDays}
                    onChange={(e) => setProbationDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">يوماً</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  الفترة الزمنية الافتراضية قبل ترقية الملتحق الجديد إلى منتسب نشط بعد استيفاء بنود التهيئة.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الحد الأدنى لساعات التطوع لإصدار شهادة الخبرة (BR-09):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={minVolHours}
                    onChange={(e) => setMinVolHours(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">ساعة معتمدة</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  لا يمكن إصدار شهادة خبرة تطوعية للمتطوع إذا كان مجموع ساعاته المعتمدة أقل من هذا الحد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نافذة تعديل سجل الحضور للمدرب والمنسق (بالساعات - BR-06):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editWindowHours}
                    onChange={(e) => setEditWindowHours(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">ساعة بعد الجلسة</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  بعد انقضاء هذه النافذة يُقفل سجل الحضور ويقتصر تعديله الاستثنائي على المدير العام مع تسجيل تدقيق إلزامي.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CENTER INFORMATION */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المركز الرسمي:
                </label>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الشعار اللفظي للمركز (Tagline):
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-[#1E4E8C] dark:text-blue-400 block">
                  معلومات البيئة المحلية (On-Premise Deployment):
                </span>
                <p className="text-[11px] leading-relaxed">
                  النظام مهيأ ليعمل بشكل مستقل بالكامل داخل الشبكة المحلية للمركز (Section 17) مع حفظ البيانات ومزامنتها دورياً محلياً بدون أي اعتماد على خدمات سحابية خارجية.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>التغييرات تُحفظ مباشرة في قاعدة البيانات المحلية</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeSettings}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] hover:bg-[#163a69] text-white shadow-xs transition"
            >
              حفظ الإعدادات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
