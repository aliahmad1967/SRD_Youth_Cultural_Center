import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CenterEvent } from '../../types';
import { db } from '../../services/storage';
import {
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  Ticket,
  ChevronLeft,
  DollarSign,
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { dbState, currentUser, showToast } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>(dbState.events[0]?.id || '');

  const event = dbState.events.find((e) => e.id === selectedEventId) || dbState.events[0];

  const handleIncrementCounter = (eventId: string, amount: number) => {
    db.incrementCampaignBeneficiaryCount(
      eventId,
      amount,
      currentUser ? { id: currentUser.id, name: currentUser.name } : undefined
    );
    showToast(`تم تحديث العداد الميداني للمستفيدين (+${amount})`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">الفعاليات والحملات التوعوية</h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المبادرات المجتمعية، متابعة العداد الميداني اللحظي للمستفيدين (EVT-05)، وربط فرق المتطوعين.
          </p>
        </div>
      </div>

      {/* Events Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dbState.events.map((evt) => {
          const isSelected = selectedEventId === evt.id;
          const isCampaign = evt.type === 'campaign';
          const progressPercent = evt.targetBeneficiariesCount
            ? Math.round(((evt.fieldBeneficiariesCount || 0) / evt.targetBeneficiariesCount) * 100)
            : 0;

          return (
            <div
              key={evt.id}
              onClick={() => setSelectedEventId(evt.id)}
              className={`rounded-3xl bg-white border p-6 transition shadow-xs cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-[#1E4E8C] ring-2 ring-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isCampaign
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-[#1E4E8C]'
                    }`}
                  >
                    {isCampaign ? 'حملة توعوية ميدانية' : 'ملتقى سنوي وندوات'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{evt.date}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{evt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.location}</span>
                  </span>
                  <span>·</span>
                  <span>السعة: {evt.capacity} مشارك</span>
                </div>
              </div>

              {/* Special EVT-05 Real-time Field Counter for Awareness Campaigns */}
              {isCampaign && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>العداد الميداني المباشر للمستفيدين (EVT-05):</span>
                    </div>
                    <span className="text-xs font-black text-amber-950 tabular-nums">
                      {evt.fieldBeneficiariesCount} / {evt.targetBeneficiariesCount} ({progressPercent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-amber-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>

                  {/* Field Increment Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-amber-800 font-medium">تسجيل مستفيدين جدد فوراً:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncrementCounter(evt.id, 1);
                        }}
                        className="px-2.5 py-1 bg-white rounded-lg border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 shadow-2xs transition"
                      >
                        +1
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncrementCounter(evt.id, 5);
                        }}
                        className="px-2.5 py-1 bg-white rounded-lg border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 shadow-2xs transition"
                      >
                        +5
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncrementCounter(evt.id, 10);
                        }}
                        className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 shadow-2xs transition"
                      >
                        +10 دفعة
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial & Volunteer Status */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>الموازنة: <strong>{evt.budget.toLocaleString('ar-EG')} ج.م</strong></span>
                  <span className="text-slate-400 font-mono">(المصروف: {evt.spent.toLocaleString('ar-EG')})</span>
                </div>
                <span className="text-xs font-bold text-[#1E4E8C]">
                  {evt.registeredCount} مسجل
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
