
import * as React from 'react';
import { Listing, ListingStatus, User, NotificationType, NotificationPriority } from '../types';
import { analyzeItemPrice, generateAdminNotification } from '../services/geminiService';
import { sendNotification } from '../services/notificationService';

interface AdminPanelProps {
  listings: Listing[];
  users: User[];
  onUpdate: (id: string, status: ListingStatus) => Promise<void>;
  lang: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ listings, users, onUpdate, lang }) => {
  const [analyzingId, setAnalyzingId] = React.useState<string | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'queue' | 'notifications' | 'sql'>('queue');
  const [statusFilter, setStatusFilter] = React.useState<ListingStatus | 'ALL'>(ListingStatus.PENDING_REVIEW);
  
  // Bildirim Formu State'leri
  const [notifTarget, setNotifTarget] = React.useState<'ALL' | string>('ALL');
  const [notifTitle, setNotifTitle] = React.useState('');
  const [notifMessage, setNotifMessage] = React.useState('');
  const [notifPriority, setNotifPriority] = React.useState<NotificationPriority>(NotificationPriority.LOW);
  const [notifType, setNotifType] = React.useState<NotificationType>(NotificationType.SYSTEM);
  const [isSending, setIsSending] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const filteredListings = React.useMemo(() => {
    if (statusFilter === 'ALL') return listings;
    return listings.filter(l => l.status === statusFilter);
  }, [listings, statusFilter]);

  const stats = {
    pending: listings.filter(l => l.status === ListingStatus.PENDING_REVIEW).length,
    active: listings.filter(l => l.status === ListingStatus.ACTIVE).length,
    rejected: listings.filter(l => l.status === ListingStatus.REJECTED).length,
  };

  const handleAIPrice = async (item: Listing) => {
    setAnalyzingId(item.id);
    try {
      const result = await analyzeItemPrice(item.title, item.description);
      alert(`YZ Önerisi: $${result.suggestedPrice}\nNeden: ${result.reasoning}`);
    } catch (err) { 
      console.error(err);
      alert("YZ analizi sırasında bir hata oluştu.");
    }
    setAnalyzingId(null);
  };

  const handleStatusChange = async (id: string, newStatus: ListingStatus) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await onUpdate(id, newStatus);
    } catch (err: any) {
      alert("İşlem başarısız:\n" + (err.message || "Bilinmeyen bir hata."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleAIDraft = async () => {
    if (!notifMessage && !notifTitle) {
      alert("Lütfen taslak için bir konu veya anahtar kelime yazın.");
      return;
    }
    setIsGenerating(true);
    try {
      const draft = await generateAdminNotification(notifMessage || notifTitle);
      setNotifTitle(draft.title);
      setNotifMessage(draft.message);
    } catch (err) {
      alert("Taslak oluşturulamadı.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notifTitle || !notifMessage) {
      alert("Başlık ve mesaj zorunludur.");
      return;
    }

    setIsSending(true);
    try {
      const targets = notifTarget === 'ALL' ? users.map(u => u.id) : [notifTarget];
      
      const promises = targets.map(uid => 
        sendNotification({
          userId: uid,
          type: notifType,
          priority: notifPriority,
          title: notifTitle,
          message: notifMessage,
          sender: { id: 'system', name: 'QuickSwap Team', avatar: 'https://ui-avatars.com/api/?name=QS&background=C36B4F&color=fff' }
        })
      );

      await Promise.all(promises);
      alert(`${targets.length} kişiye bildirim başarıyla gönderildi.`);
      setNotifTitle('');
      setNotifMessage('');
    } catch (err) {
      alert("Bildirim gönderilirken hata oluştu.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-brand-clay tracking-tight">Yönetim Paneli</h1>
          <p className="text-brand-clay/40 font-medium">Platformu, ilanları ve kullanıcıları yönetin.</p>
        </div>
        <div className="flex bg-brand-cream p-1.5 rounded-2xl border border-brand-clay/5 shadow-sm">
          <button 
            onClick={() => setActiveTab('queue')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'queue' ? 'bg-brand-clay text-white shadow-lg' : 'text-brand-clay/40 hover:text-brand-clay'}`}
          >
            İlanlar
          </button>
          <button 
            onClick={() => setActiveTab('notifications')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notifications' ? 'bg-brand-clay text-white shadow-lg' : 'text-brand-clay/40 hover:text-brand-clay'}`}
          >
            Bildirim Gönder
          </button>
          <button 
            onClick={() => setActiveTab('sql')} 
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sql' ? 'bg-brand-clay text-white shadow-lg' : 'text-brand-clay/40 hover:text-brand-clay'}`}
          >
            SQL Editor
          </button>
        </div>
      </header>

      {activeTab === 'queue' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setStatusFilter(ListingStatus.PENDING_REVIEW)} className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${statusFilter === ListingStatus.PENDING_REVIEW ? 'bg-brand-terracotta text-white border-brand-terracotta shadow-md' : 'bg-white text-brand-clay/40 border-brand-clay/5'}`}>
              Bekleyen ({stats.pending})
            </button>
            <button onClick={() => setStatusFilter(ListingStatus.ACTIVE)} className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${statusFilter === ListingStatus.ACTIVE ? 'bg-brand-sage text-white border-brand-sage shadow-md' : 'bg-white text-brand-clay/40 border-brand-clay/5'}`}>
              Yayında ({stats.active})
            </button>
            <button onClick={() => setStatusFilter('ALL')} className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${statusFilter === 'ALL' ? 'bg-brand-clay text-white border-brand-clay shadow-md' : 'bg-white text-brand-clay/40 border-brand-clay/5'}`}>
              Tümü ({listings.length})
            </button>
          </div>
          <div className="grid gap-6">
            {filteredListings.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-brand-clay/5 shadow-sm flex flex-col sm:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-cream shrink-0 relative">
                  <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-brand-clay">{item.title}</h3>
                  <p className="text-brand-terracotta font-black text-sm">${item.price} • {item.category}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAIPrice(item)} className="px-5 py-2.5 bg-brand-cream text-brand-clay font-bold text-[10px] rounded-xl uppercase tracking-widest">YZ Analiz</button>
                  <button onClick={() => handleStatusChange(item.id, ListingStatus.ACTIVE)} className="px-8 py-2.5 bg-brand-sage text-white font-bold text-[10px] rounded-xl uppercase tracking-widest shadow-lg">Onayla</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-[2.5rem] border border-brand-clay/5 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 border-b border-brand-clay/5 pb-6">
            <h2 className="text-2xl font-black text-brand-clay uppercase tracking-tight">Bildirim Merkezi</h2>
            <p className="text-brand-clay/40 text-sm font-medium mt-1">Kullanıcılara anlık mesaj ve sistem duyurusu gönderin.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-clay/40 uppercase tracking-widest ml-1">Alıcı Seçin</label>
              <select 
                className="w-full p-4 bg-brand-cream rounded-2xl border border-transparent focus:border-brand-terracotta outline-none font-bold text-brand-clay"
                value={notifTarget}
                onChange={(e) => setNotifTarget(e.target.value)}
              >
                <option value="ALL">Tüm Kullanıcılar (Broadcast)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-clay/40 uppercase tracking-widest ml-1">Kategori</label>
                <select className="w-full p-4 bg-brand-cream rounded-2xl font-bold text-brand-clay outline-none" value={notifType} onChange={e => setNotifType(e.target.value as any)}>
                  <option value={NotificationType.SYSTEM}>Sistem Duyurusu</option>
                  <option value={NotificationType.WARNING}>Uyarı</option>
                  <option value={NotificationType.OFFER}>Kampanya/Teklif</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-clay/40 uppercase tracking-widest ml-1">Öncelik</label>
                <select className="w-full p-4 bg-brand-cream rounded-2xl font-bold text-brand-clay outline-none" value={notifPriority} onChange={e => setNotifPriority(e.target.value as any)}>
                  <option value={NotificationPriority.LOW}>Düşük</option>
                  <option value={NotificationPriority.MEDIUM}>Orta</option>
                  <option value={NotificationPriority.HIGH}>Yüksek (Kritik)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-clay/40 uppercase tracking-widest ml-1">Başlık</label>
              <input 
                type="text"
                placeholder="Örn: Hafta Sonu Fırsatı!"
                className="w-full p-4 bg-brand-cream rounded-2xl font-bold text-brand-clay outline-none focus:border-brand-terracotta border border-transparent"
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-brand-clay/40 uppercase tracking-widest">Mesaj İçeriği</label>
                <button 
                  onClick={handleAIDraft}
                  disabled={isGenerating}
                  className="text-[10px] font-black text-brand-terracotta hover:underline uppercase flex items-center gap-2"
                >
                  {isGenerating ? 'Taslak Hazırlanıyor...' : 'YZ ile Taslak Oluştur'}
                </button>
              </div>
              <textarea 
                placeholder="Mesajınızı buraya yazın veya YZ'den yardım alın..."
                className="w-full p-4 bg-brand-cream rounded-2xl font-medium text-brand-clay outline-none focus:border-brand-terracotta border border-transparent h-32 resize-none"
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSendNotification}
              disabled={isSending}
              className={`w-full py-5 bg-brand-clay text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${isSending ? 'opacity-50' : 'hover:scale-[0.98] active:scale-95'}`}
            >
              {isSending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {notifTarget === 'ALL' ? 'Duyuruyu Herkese Yayınla' : 'Bildirimi Gönder'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'sql' && (
        <div className="space-y-6 animate-in fade-in">
           <div className="p-10 bg-slate-900 rounded-[2.5rem] border border-white/5">
              <pre className="text-brand-sage text-xs font-mono">-- SQL Editor is active</pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
