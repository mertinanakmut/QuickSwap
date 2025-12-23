
import * as React from 'react';
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Marketplace from './components/Marketplace';
import ListingForm from './components/ListingForm';
import ListingDetails from './components/ListingDetails';
import AdminPanel from './components/AdminPanel';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import UserDashboard from './components/UserDashboard';
import NotificationPanel from './components/NotificationPanel';
import { Listing, User, ListingStatus, ChatMessage, Order, Notification, NotificationType, NotificationPriority } from './types';
import { Language } from './translations';
import { supabase } from './lib/supabase';
import { sendNotification } from './services/notificationService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('TR');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: listingsData } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: messagesData } = await supabase.from('chat_messages').select('*').order('timestamp', { ascending: true });
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (listingsData) {
        setListings(listingsData.map((l: any) => ({
          ...l,
          imageUrls: l.image_urls || [],
          sellerId: l.seller_id,
          createdAt: Number(l.created_at),
          updatedAt: Number(l.updated_at),
          visualAnalysis: l.visual_analysis,
          subCategory: l.sub_category,
          brand: l.brand,
          boostedUntil: l.boosted_until,
          offerAmount: l.offer_amount
        })));
      }
      if (usersData) setUsers(usersData);
      if (messagesData) {
        setMessages(messagesData.map((m: any) => ({
          ...m,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          listingId: m.listing_id,
          timestamp: Number(m.timestamp)
        })));
      }
      if (ordersData) {
        setOrders(ordersData.map((o: any) => ({
          ...o,
          listingId: o.listing_id,
          buyerId: o.buyer_id,
          sellerId: o.seller_id,
          createdAt: Number(o.created_at)
        })));
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (data) {
      setNotifications(data.map((n: any) => ({
        ...n,
        userId: n.user_id,
        relatedContent: n.related_content,
        timestamp: Number(n.timestamp)
      })));
    }
  };

  useEffect(() => {
    fetchData().then(() => setLoading(false));

    const channel = supabase.channel('global_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const newMessage = payload.new as any;
        const formattedMsg = {
          id: newMessage.id,
          senderId: newMessage.sender_id,
          receiverId: newMessage.receiver_id,
          listingId: newMessage.listing_id,
          text: newMessage.text,
          timestamp: Number(newMessage.timestamp)
        };
        setMessages(prev => {
          if (prev.some(m => m.id === formattedMsg.id)) return prev;
          return [...prev, formattedMsg];
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as any;
        if (currentUser && n.user_id === currentUser.id) {
          setNotifications(prev => [{
            ...n,
            userId: n.user_id,
            relatedContent: n.related_content,
            timestamp: Number(n.timestamp)
          }, ...prev]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .subscribe();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserProfile(session.user.id);
      else setCurrentUser(null);
    });

    return () => {
      channel.unsubscribe();
      subscription.unsubscribe();
    };
  }, [currentUser?.id]);

  const fetchUserProfile = async (id: string) => {
    try {
      const { data } = await supabase.from('users').select('*').eq('id', id).single();
      if (data) {
        setCurrentUser(data);
        fetchNotifications(id);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  const handleMarkAllNotifRead = async () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id);
  };

  const handleDeleteNotif = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  };

  const handleUpdateListing = async (id: string, status: ListingStatus, extra?: Partial<Listing>) => {
    const updateData: any = { status, updated_at: Date.now() };
    if (extra?.offerAmount) updateData.offer_amount = extra.offerAmount;
    const { error } = await supabase.from('listings').update(updateData).eq('id', id);
    if (error) throw new Error(error.message);
  };

  const handleSendMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const { error } = await supabase.from('chat_messages').insert([{
      sender_id: msg.senderId,
      receiver_id: msg.receiverId,
      // Fix: Changed msg.listing_id to msg.listingId to match Omit<ChatMessage, 'id' | 'timestamp'>
      listing_id: msg.listingId,
      text: msg.text,
      timestamp: Date.now()
    }]);

    if (!error) {
      const listing = listings.find(l => l.id === msg.listingId);
      await sendNotification({
        userId: msg.receiverId,
        type: NotificationType.COMMENT,
        priority: NotificationPriority.MEDIUM,
        title: 'Yeni Mesaj',
        message: `${currentUser?.name} size "${listing?.title}" hakkında mesaj gönderdi.`,
        sender: { id: currentUser?.id || '', name: currentUser?.name || '', avatar: currentUser?.avatarUrl },
        relatedContent: { type: 'listing', id: msg.listingId, preview: msg.text }
      });
    } else {
      alert("Mesaj gönderilemedi.");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="w-12 h-12 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-brand-cream/20 flex flex-col">
        <nav className="sticky top-0 z-50 glass border-b border-brand-terracotta/10 px-4">
          <div className="max-w-7xl mx-auto h-20 flex justify-between items-center">
            <Link to="/" className="text-3xl font-extrabold text-brand-clay">Quick<span className="text-brand-terracotta">Swap</span></Link>
            <div className="flex items-center gap-6">
              {currentUser ? (
                <>
                  {currentUser.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="px-4 py-2 bg-brand-clay text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-clay/10 hover:bg-brand-terracotta transition-all animate-pulse hover:animate-none"
                    >
                      ADMIN
                    </Link>
                  )}
                  <div className="relative">
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="p-3 bg-white rounded-xl border border-brand-clay/5 text-brand-clay hover:text-brand-terracotta transition-all relative"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-brand-terracotta text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {isNotifOpen && (
                      <NotificationPanel 
                        notifications={notifications}
                        onMarkRead={handleMarkNotifRead}
                        onMarkAllRead={handleMarkAllNotifRead}
                        onDelete={handleDeleteNotif}
                        onClose={() => setIsNotifOpen(false)}
                      />
                    )}
                  </div>
                  <Link to="/dashboard" className="text-xs font-bold text-brand-clay hover:text-brand-terracotta transition-colors">Panelim</Link>
                  <Link to={`/profile/${currentUser.id}`} className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-brand-clay/5">
                    <img src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=C36B4F&color=fff`} className="w-8 h-8 rounded-xl object-cover" />
                    <span className="font-bold text-xs text-brand-clay">{currentUser.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-black uppercase text-rose-500">Çıkış</button>
                  <Link to="/sell" className="px-6 py-2.5 bg-brand-terracotta text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-brand-terracotta/20">Satış Yap</Link>
                </>
              ) : (
                <Link to="/auth" className="bg-brand-clay text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase">Giriş Yap</Link>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full">
          <Routes>
            <Route path="/" element={<Marketplace lang={lang} listings={listings} users={users} />} />
            <Route path="/listing/:listingId" element={<ListingDetails lang={lang} listings={listings} users={users} currentUser={currentUser} messages={messages} onAction={handleUpdateListing} onSendMessage={handleSendMessage} onPurchase={fetchData} />} />
            <Route path="/sell" element={<ListingForm lang={lang} user={currentUser!} onAdd={fetchData} />} />
            <Route path="/dashboard" element={<UserDashboard lang={lang} user={currentUser!} listings={listings} orders={orders} messages={messages} users={users} onUpdateOrderShipping={() => {}} />} />
            <Route path="/profile/:userId" element={<UserProfile users={users} listings={listings} lang={lang} currentUser={currentUser} onUpdateUser={(u) => fetchUserProfile(u.id)} onLogout={() => supabase.auth.signOut()} />} />
            <Route path="/admin" element={<AdminPanel listings={listings} users={users} onUpdate={handleUpdateListing} lang={lang} />} />
            <Route path="/auth" element={<Auth lang={lang} onAuth={() => {}} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
