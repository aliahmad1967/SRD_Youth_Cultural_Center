import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Volunteer, VolunteerShift, VolunteerLevel } from '../../types';
import { db } from '../../services/storage';
import {
  HeartHandshake,
  Award,
  Clock,
  CheckCircle,
  Plus,
  ShieldCheck,
  Calendar,
  MapPin,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';

export const VolunteersManagementView: React.FC = () => {
  const { dbState, currentUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'volunteers' | 'shifts' | 'opportunities'>('shifts');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingShifts = dbState.shifts.filter((s) => s.status === 'pending_approval');

  const handleApproveShift = (shiftId: string) => {
    try {
      db.approveVolunteerShift(
        shiftId,
        currentUser ? { id: currentUser.id, name: currentUser.name } : { id: 'u-coord', name: 'سارة الخطيب' }
      );
      showToast('تم اعتماد ساعات التطوع وتحديث رصيد المتطوع وشاراته بنجاح', 'success');
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء اعتماد الساعات', 'error');
    }
  };

  const getLevelBadge = (level: VolunteerLevel) => {
    switch (level) {
      case 'gold':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <span>المستوى الذهبي 🥇</span>
          </span>
        );
      case 'silver':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
            <span>المستوى الفضي 🥈</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            <span>المستوى البرونزي 🥉</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">إدارة المتطوعين والورديات وساعات الأثر</h1>
          <p className="text-xs text-slate-500 mt-1">
            توثيق ساعات التطوع الميدانية، اعتماد الورديات، ومنح شارات التقدير (البرونزية، الفضية، الذهبية).
          </p>
        </div>

        {pendingShifts.length > 0 && (
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingShifts.length} ورديات بانتظار الاعتماد</span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'shifts' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          سجل الورديات والاعتماد ({dbState.shifts.length})
        </button>
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'volunteers' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          قائمة المتطوعين والشارات ({dbState.volunteers.length})
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'opportunities' ? 'bg-white text-[#1E4E8C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الفرص والمهام الميدانية ({dbState.opportunities.length})
        </button>
      </div>

      {/* TAB 1: SHIFTS & APPROVAL (UAT-11) */}
      {activeTab === 'shifts' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">سجل تسجيل الحضور والورديات للمتطوعين</h3>
            <span className="text-[11px] text-slate-500">
              اعتماد الساعات يحدّث رصيد المتطوع ويؤهله للشهادة الرسمية
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">المتطوع</th>
                  <th className="p-3.5">المهمة / الفعالية</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5">الساعات الفعلية</th>
                  <th className="p-3.5">وسيلة التسجيل</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dbState.shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{s.volunteerName}</td>
                    <td className="p-3.5 text-slate-700 max-w-xs truncate">{s.opportunityTitle}</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{s.date}</td>
                    <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                      {s.actualHours} ساعة
                    </td>
                    <td className="p-3.5">
                      {s.qrScanned ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                          مسح QR موثق
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          إدخال يدوي
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {s.status === 'approved' ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          معتمد ({s.approvedBy})
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                          بانتظار الاعتماد
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {s.status === 'pending_approval' ? (
                        <button
                          onClick={() => handleApproveShift(s.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>اعتماد الساعات</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">✓ تم التوثيق</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VOLUNTEERS ROSTER */}
      {activeTab === 'volunteers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dbState.volunteers.map((vol) => (
            <div
              key={vol.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm">
                    {vol.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{vol.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">{vol.phone}</span>
                  </div>
                </div>
                {getLevelBadge(vol.level)}
              </div>

              {/* Hours counter */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">الرصيد المعتمد:</span>
                <span className="text-base font-black text-[#1E4E8C] tabular-nums">
                  {vol.approvedHours} <span className="text-xs font-normal text-slate-500">ساعة</span>
                </span>
              </div>

              {/* Skills */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">المهارات:</span>
                <div className="flex flex-wrap gap-1">
                  {vol.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-blue-50 text-[#1E4E8C] px-2 py-0.5 rounded-md font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>التوفر: {vol.availabilityDays.join('، ')}</span>
                <span className="font-mono">{vol.availabilityHours}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dbState.opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                    {opp.estimatedHours} ساعات معتمدة
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      opp.status === 'full' ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  >
                    {opp.status === 'full' ? 'مكتمل العدد' : 'متاح للتسجيل'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{opp.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>الموقع: {opp.location}</span>
                  <span className="font-mono">{opp.date}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>المقاعد المشغولة:</span>
                  <span className="tabular-nums">
                    {opp.filledSlotsCount} / {opp.slotsCount} متطوع
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
