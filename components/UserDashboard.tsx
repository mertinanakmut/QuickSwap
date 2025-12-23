
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Listing, User, Order, OrderStatus, ChatMessage, ListingStatus, ListingType } from '../types';
import { Language, translations } from '../translations';
import { supabase } from '../lib/supabase';

interface UserDashboardProps {
  user: User;
  listings: Listing[];
  orders: Order[];
  messages: ChatMessage[];
  users: User[];
  onUpdateOrderShipping: (orderId: string, carrier: string, trackingCode: string) => void;
  lang: Language;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, listings, orders, messages, users, onUpdateOrderShipping, lang }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'selling' | 'buying' | 'messages'>('messages');
  const [shippingInput, setShippingInput] = useState<{orderId: string, carrier: string, code: string} | null>(null);

  // Filtrelemeler
  const myListings = listings.filter(l => l.sellerId === user.id);
  const mySales = orders.filter(o => o.sellerId === user.id);
  const myPurchases = orders.filter(o => o.buyerId === user.id);

  // MESAJLARI ÜRÜN BAZLI GRUPLANDIRMA
  // Satıcı için: Ürün başına kaç farklı kişiyle konuşuluyor?
  // Alıcı için: Hangi ürünler için kiminle konuşuluyor?
  const conversations = useMemo(() => {
    const myMessages = messages.filter(m => m.senderId === user.id || m.receiverId === user.id);
    const groups: Record<string, {
      listing: Listing;
      otherUser: User;
      lastMessage: ChatMessage;
      unreadCount: number;
    }> = {};

    myMessages.forEach(msg => {
      const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const key = `${msg.listingId}_${otherUserId}`;
      
      const listing = listings.find(l => l.id === msg.listingId);
      const otherUser = users.find(u => u.id === otherUserId);

      if (listing && otherUser) {
        if (!groups[key] || msg.timestamp > groups[key].lastMessage.timestamp) {
          groups[key] = { 
            listing, 
            otherUser, 
            lastMessage: msg,
            unreadCount: 0 // Simüle edilmiş
          };
        }
      }
    });

    return Object.values(groups).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  }, [messages, user.id, listings, users]);

  const handleAcceptPlatformOffer = async (listingId: string) => {
    if (!confirm(lang === 'TR' ? "Platformun nakit teklifini kabul ediyorsunuz. Para bakiyenize eklenecektir. Onaylıyor musunuz?" : "You are accepting the platform's cash offer. Confirm?")) return;
    try {
      const { error } = await supabase.from('listings').update({ status: ListingStatus.SOLD }).eq('id', listingId);
      if (error) throw error;
      alert(lang === 'TR' ? "Teklif kabul edildi! Ürün platform tarafından satın alındı." : "Offer accepted!");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-brand-clay/5 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=C36B4F&color=fff`} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg" />
            <div className="absolute -bottom-2 -right-2 bg-brand-sage text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border-2 border-white">Aktif</div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-clay tracking-tight">{user.name}</h1>
            <p className="text-brand-clay/40 font-bold text-xs uppercase tracking-widest mt-1">Cüzdan Bakiyesi: <span className="text-brand-terracotta">${user.balance}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/sell" className="px-8 py-4 bg-brand-clay text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-clay/10 hover:scale-105 transition-all">Ürün Listele</Link>
        </div>
      </header>

      {/* Navigasyon Tabları */}
      <div className="flex p-2 bg-white rounded-[2rem] border border-brand-clay/5 shadow-sm">
        <button onClick={() => setActiveTab('messages')} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-brand-clay text-white shadow-lg' : 'text-brand-clay/40 hover:text-brand-clay'}`}>
          Mesajlar & Teklifler ({conversations.length})
        </button>
        <button onClick={() => setActiveTab('selling')} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'selling' ? 'bg-brand-clay text-white shadow-lg' : 'text-brand-clay/40 hover:text-brand-clay'}`}>
          Satışlarım ({myListings.length})
        </button>
        <button onClick={() => setActiveTab('buying')} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'buying' ? 'bg-brand-clay text-white shadow-lg' : 'text-brand-clay/40 hover:text-brand-clay'}`}>
          Aldıklarım ({myPurchases.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Mesajlar / Teklifler Paneli */}
        {activeTab === 'messages' && (
          <div className="grid gap-4">
            {conversations.map((conv, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-brand-clay/5 p-6 hover:shadow-xl transition-all flex flex-col md:flex-row items-center gap-6 group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-cream shrink-0 border border-brand-clay/5">
                  <img src={conv.listing.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${conv.listing.status === ListingStatus.ACTIVE ? 'bg-brand-sage' : 'bg-brand-clay/20'}`}></span>
                    <p className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest">{conv.listing.title}</p>
                  </div>
                  <h4 className="font-black text-brand-clay text-lg mb-1">{conv.otherUser.name} ile Sohbet</h4>
                  <p className="text-sm text-brand-clay/60 italic font-medium truncate max-w-md">
                    {conv.lastMessage.senderId === user.id ? 'Siz: ' : ''}{conv.lastMessage.text}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xl font-black text-brand-terracotta">${conv.listing.price}</p>
                    <p className="text-[9px] font-bold text-brand-clay/20 uppercase">{new Date(conv.lastMessage.timestamp).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/listing/${conv.listing.id}`} className="p-4 bg-brand-cream rounded-2xl text-brand-clay group-hover:bg-brand-terracotta group-hover:text-white transition-all shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </Link>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-brand-clay/10">
                <p className="text-brand-clay/20 font-black uppercase tracking-widest">Henüz bir görüşme veya teklif yok.</p>
              </div>
            )}
          </div>
        )}

        {/* Satış Yönetimi (Satıcı Paneli) */}
        {activeTab === 'selling' && (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map(item => (
                <div key={item.id} className="bg-white rounded-[2.5rem] border border-brand-clay/5 overflow-hidden shadow-sm flex flex-col group">
                  <div className="aspect-video relative">
                    <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg ${
                         item.status === ListingStatus.ACTIVE ? 'bg-brand-sage text-white' : 
                         item.status === ListingStatus.SOLD ? 'bg-brand-clay text-white' : 'bg-brand-terracotta text-white'
                       }`}>
                         {item.status}
                       </span>
                       {item.type === ListingType.EMERGENCY && (
                         <span className="bg-brand-terracotta text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">Nakit Alım</span>
                       )}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-black text-brand-clay text-lg mb-1 truncate">{item.title}</h3>
                    <p className="text-2xl font-black text-brand-terracotta mb-6">${item.price}</p>
                    
                    <div className="mt-auto space-y-3">
                      {/* Emergency Cash Teklif Butonu */}
                      {item.type === ListingType.EMERGENCY && item.status === ListingStatus.PENDING_REVIEW && item.offerAmount && (
                         <div className="bg-brand-sage/10 p-4 rounded-2xl border border-brand-sage/20 mb-4 animate-pulse">
                            <p className="text-[10px] font-black text-brand-sage uppercase tracking-widest mb-1">Platform Teklifi Hazır!</p>
                            <div className="flex justify-between items-center">
                               <span className="text-xl font-black text-brand-clay">${item.offerAmount}</span>
                               <button onClick={() => handleAcceptPlatformOffer(item.id)} className="bg-brand-sage text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Kabul Et</button>
                            </div>
                         </div>
                      )}
                      
                      <Link to={`/listing/${item.id}`} className="w-full py-3 border border-brand-clay/10 rounded-xl text-center text-[10px] font-black uppercase tracking-widest text-brand-clay/60 hover:bg-brand-clay hover:text-white transition-all block">İlanı Görüntüle</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {myListings.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-brand-clay/10">
                <p className="text-brand-clay/20 font-black uppercase tracking-widest">Henüz bir ürün listelemediniz.</p>
                <Link to="/sell" className="mt-4 inline-block text-brand-terracotta font-black text-xs uppercase underline">Hemen Satışa Başla</Link>
              </div>
            )}
          </div>
        )}

        {/* Alınan Ürünler (Alıcı Paneli) */}
        {activeTab === 'buying' && (
          <div className="grid gap-4">
            {myPurchases.map(order => {
              const item = listings.find(l => l.id === order.listingId);
              return (
                <div key={order.id} className="bg-white rounded-[2.5rem] border border-brand-clay/5 p-6 flex items-center gap-6 shadow-sm">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-cream border border-brand-clay/5">
                    <img src={item?.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                       <h3 className="font-black text-brand-clay text-lg">{item?.title || 'Bilinmeyen Ürün'}</h3>
                       <span className="text-[9px] font-black text-brand-sage bg-brand-sage/10 px-3 py-1 rounded-full uppercase tracking-widest">{order.status}</span>
                    </div>
                    <p className="text-brand-terracotta font-black">${order.price}</p>
                    <div className="mt-2 flex items-center gap-4">
                       <p className="text-[10px] font-bold text-brand-clay/30 uppercase tracking-widest">Sipariş No: #{order.id.slice(0,8)}</p>
                       {order.shippingInfo && <span className="text-[10px] font-bold text-brand-sage">Kargoda: {order.shippingInfo.carrier}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {myPurchases.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-brand-clay/10">
                <p className="text-brand-clay/20 font-black uppercase tracking-widest">Henüz bir ürün satın almadınız.</p>
                <Link to="/" className="mt-4 inline-block text-brand-terracotta font-black text-xs uppercase underline">Alışverişe Başla</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
