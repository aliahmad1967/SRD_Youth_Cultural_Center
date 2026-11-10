import React from 'react';
import { Member } from '../../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { BookOpen, ShieldCheck, Printer, Calendar, MapPin } from 'lucide-react';

interface DigitalMembershipCardProps {
  member: Member;
  onClose?: () => void;
}

export const DigitalMembershipCard: React.FC<DigitalMembershipCardProps> = ({ member, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: Member['status']) => {
    switch (status) {
      case 'new_enrollee':
        return { label: 'ملتحق جديد (تأهيل)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'active':
        return { label: 'عضوية نشطة', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'graduated':
        return { label: 'خريج المركز', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      default:
        return { label: 'موقوف', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const badge = getStatusBadge(member.status);

  return (
    <div className="flex flex-col items-center">
      {/* Printable Card Frame */}
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-[#1E4E8C] via-[#163a69] to-[#0E2E5C] text-white p-6 shadow-2xl relative overflow-hidden print-break-inside-avoid border-4 border-amber-400/30">
        {/* Subtle Background Pattern */}
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-amber-400/10 pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center border border-amber-400/40">
              <BookOpen className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-tight leading-tight">مركز الرواد الشبابي</h4>
              <span className="text-[9px] text-teal-200">بطاقة العضوية الرقمية المعتمدة</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {/* Member Profile */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-amber-400/60 p-0.5 flex items-center justify-center font-black text-xl text-amber-300 shadow-inner shrink-0">
            {member.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-white truncate">{member.name}</h3>
            <p className="text-xs font-mono font-bold text-amber-300 tracking-wider mt-0.5">
              {member.membershipNo}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-1">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-teal-300" />
                <span className="truncate">{member.region}</span>
              </span>
              <span>·</span>
              <span>{member.category === 'student' ? 'عضوية طلابية' : 'عضوية عادية'}</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-md">
          <QRCodeDisplay value={member.membershipNo} size={150} showText />
          <span className="text-[10px] text-slate-500 font-medium mt-1">
            امسح هذا الرمز لرصد الحضور وتأكيد الهوية
          </span>
        </div>

        {/* Dates Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-300 mt-4 pt-3 border-t border-white/15">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-teal-300" />
            <span>الانتساب: {member.joinedAt}</span>
          </div>
          <div>
            <span>تاريخ الصلاحية: {member.subscriptionEndsAt}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      <div className="no-print mt-5 flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة / حفظ كـ PDF</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition"
          >
            إغلاق
          </button>
        )}
      </div>
    </div>
  );
};
