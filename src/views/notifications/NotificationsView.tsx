import React from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/storage';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Award,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { dbState, currentUser, showToast } = useApp();

  const userNotifications = dbState.notifications.filter(
    (n) => (currentUser && n.userId === currentUser.id) || n.userId === 'all'
  );

  const handleMarkAllRead = () => {
    userNotifications.forEach((n) => {
      db.markNotificationAsRead(n.id);
    });
    showToast('تم تحديد جميع الإشعارات كمقروءة.', 'info');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'financial':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'exam':
        return <Award className="w-4 h-4 text-[#1E4E8C]" />;
      case 'volunteer':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">مركز الإشعارات والتواصل</h1>
          <p className="text-xs text-slate-500 mt-1">
            سجل التنبيهات الفورية وإعلانات إدارة المركز (NTF-21 & NTF-22).
          </p>
        </div>

        {userNotifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* Announcements Banner */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700">الإعلانات العامة للمركز:</h3>
        {dbState.announcements.map((ann) => (
          <div
            key={ann.id}
            className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 space-y-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E4E8C]">{ann.title}</span>
              <span className="text-[10px] text-slate-400 font-mono">{ann.createdAt}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
            <span className="text-[10px] text-slate-500 block">بواسطة: {ann.authorName}</span>
          </div>
        ))}
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-700">التنبيهات الشخصية:</h3>
        {userNotifications.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-400 text-xs">
            لا توجد إشعارات جديدة في سجلك
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {userNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => db.markNotificationAsRead(n.id)}
                className={`p-4 flex items-start gap-3 transition cursor-pointer ${
                  !n.read ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{n.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
