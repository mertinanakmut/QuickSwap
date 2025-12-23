
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, NotificationType, NotificationPriority } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, onMarkRead, onMarkAllRead, onDelete, onClose 
}) => {
  const navigate = useNavigate();

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'az önce';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}sa önce`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getPriorityStyles = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH: return 'border-brand-terracotta bg-brand-terracotta/5';
      case NotificationPriority.MEDIUM: return 'border-orange-400 bg-orange-400/5';
      default: return 'border-brand-sage bg-brand-sage/5';
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    onMarkRead(notif.id);
    if (notif.relatedContent) {
      if (notif.relatedContent.type === 'listing') navigate(`/listing/${notif.relatedContent.id}`);
      else if (notif.relatedContent.type === 'order') navigate(`/dashboard`);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-16 w-[380px] bg-white rounded-[2rem] shadow-2xl border border-brand-clay/5 overflow-hidden animate-in slide-in-from-top-4 duration-300 z-[100]">
      <header className="p-6 border-b border-brand-clay/5 flex justify-between items-center bg-brand-cream/50">
        <div>
          <h3 className="font-black text-brand-clay text-sm uppercase tracking-widest">Bildirimler</h3>
          <p className="text-[10px] font-bold text-brand-clay/40 uppercase mt-0.5">
            {notifications.filter(n => !n.read).length} Yeni Mesaj
          </p>
        </div>
        <button 
          onClick={onMarkAllRead}
          className="text-[9px] font-black text-brand-terracotta uppercase hover:underline"
        >
          Hepsini Oku
        </button>
      </header>

      <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <p className="font-black text-xs uppercase tracking-widest">Henüz bildirim yok</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-clay/5">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 hover:bg-brand-cream transition-all cursor-pointer relative group border-l-4 ${getPriorityStyles(notif.priority)} ${!notif.read ? 'opacity-100' : 'opacity-60 grayscale-[0.5]'}`}
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-cream shrink-0 border border-brand-clay/5">
                    {notif.sender?.avatar ? (
                      <img src={notif.sender.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-clay/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-black text-brand-clay text-xs truncate pr-4">{notif.title}</h4>
                      <span className="text-[8px] font-bold text-brand-clay/30 uppercase whitespace-nowrap">{getTimeAgo(notif.timestamp)}</span>
                    </div>
                    <p className="text-[11px] font-medium text-brand-clay/60 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.relatedContent?.preview && (
                      <div className="mt-2 bg-white/50 p-2 rounded-lg border border-brand-clay/5 text-[9px] font-bold text-brand-clay/40 italic">
                         "{notif.relatedContent.preview}"
                      </div>
                    )}
                  </div>
                </div>
                {!notif.read && <div className="absolute top-5 right-4 w-2 h-2 bg-brand-terracotta rounded-full"></div>}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 text-brand-clay/20 hover:text-rose-500 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <footer className="p-4 bg-brand-cream/80 border-t border-brand-clay/5 text-center">
        <button onClick={onClose} className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest hover:text-brand-clay">Paneli Kapat</button>
      </footer>
    </div>
  );
};

export default NotificationPanel;
