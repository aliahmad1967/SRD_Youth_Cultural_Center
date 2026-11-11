import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  Server,
  Database,
  ShieldCheck,
  Download,
  RotateCcw,
  Clock,
  HardDrive,
  Search,
} from 'lucide-react';

export const SystemStatusView: React.FC = () => {
  const { dbState, showToast, openBackupModal } = useApp();
  const [auditSearch, setAuditSearch] = useState('');

  const filteredLogs = dbState.auditLogs.filter(
    (l) =>
      l.action.includes(auditSearch) ||
      l.userName.includes(auditSearch) ||
      l.details.includes(auditSearch) ||
      l.entity.includes(auditSearch)
  );

  // Trigger Backup Download (DB-13, DB-14)
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `نسخة_احتياطية_مركز_الرواد_${new Date().toISOString().substring(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('تم تصدير النسخة الاحتياطية الكاملة للخادم المحلي بنجاح (JSON Backup).', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('هل تريد استعادة البيانات التجريبية الأولية؟')) {
      db.resetToDefault();
      showToast('تمت استعادة البيانات التجريبية الأولية بنجاح.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            حالة الخادم المحلي وقاعدة البيانات (On-Premise)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            القسم 17: قاعدة بيانات محلية داخل المركز لضمان خصوصية القاصرين، النسخ الاحتياطي، وسجل التدقيق للإضافة فقط.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openBackupModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            <span>إدارة النسخ الاحتياطي والاستيراد (JSON)</span>
          </button>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#163a69] transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>تحميل فوري (DB-13)</span>
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>إعادة ضبط</span>
          </button>
        </div>
      </div>

      {/* Hardware & Continuity Spec Grid (Section 17.2, DB-03, DB-07) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-[#1E4E8C] font-bold text-xs">
            <Server className="w-4 h-4" />
            <span>نمط الاستضافة المعتمد:</span>
          </div>
          <div className="text-sm font-bold text-slate-900">خادم محلي داخل المركز (أ)</div>
          <p className="text-[10px] text-emerald-700 font-semibold">✓ سيطرة تامة دون تخزين سحابي خارجي</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
            <HardDrive className="w-4 h-4" />
            <span>القرص والتخزين الاحتياطي:</span>
          </div>
          <div className="text-sm font-bold text-slate-900">RAID 1 متطابق + SSD 500GB</div>
          <p className="text-[10px] text-slate-500">نسخة يومية داخلية وأسبوعية مشفرة</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
            <Clock className="w-4 h-4" />
            <span>أهداف الاستمرارية (DB-07):</span>
          </div>
          <div className="text-sm font-bold text-slate-900">RPO: &lt; 1 ساعة · RTO: &lt; 4 س</div>
          <p className="text-[10px] text-slate-500">حماية من انقطاع الكهرباء عبر UPS</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>سلامة وحماية السجلات:</span>
          </div>
          <div className="text-sm font-bold text-slate-900">إضافة فقط (Append-Only)</div>
          <p className="text-[10px] text-slate-500">جداول التدقيق والمالية محصنة من الحذف</p>
        </div>
      </div>

      {/* Audit Logs Table (DB-10) */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">سجل التدقيق والحوكمة المركزي (Audit Log)</h3>
            <span className="text-[11px] text-slate-500">
              يسجل كل حركة مالية، اعتماد عضوية، تغيير حالة حضور، أو رصد ساعات تطوع
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="بحث في سجل العمليات..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs text-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
              <tr>
                <th className="p-3.5">التاريخ والوقت</th>
                <th className="p-3.5">المنفّذ</th>
                <th className="p-3.5">العملية</th>
                <th className="p-3.5">الكيان</th>
                <th className="p-3.5">التفاصيل المسجلة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="p-3.5 font-semibold text-[#1E4E8C] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                    {log.entity}
                  </td>
                  <td className="p-3.5 text-slate-700 max-w-md leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
