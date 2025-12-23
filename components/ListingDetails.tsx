
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Listing, User, ListingStatus, ListingType, ChatMessage, NotificationType, NotificationPriority } from '../types';
import { Language, translations } from '../translations';
import ChatModal from './ChatModal';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../services/notificationService';

interface ListingDetailsProps {
  listings: Listing[];
  users: User[];
  lang: Language;
  currentUser: User | null;
  messages: ChatMessage[];
  onAction: (id: string, status: ListingStatus, extra?: Partial<Listing>) => void;
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onPurchase: (listingId: string) => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listings, users, lang, currentUser, messages, onAction, onSendMessage, onPurchase }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const listing = listings.find(l => l.id === listingId);
  const seller = users.find(u => u.id === listing?.sellerId);

  const [activeImage, setActiveImage] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  
  // Teklif State'leri
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [listingId]);

  const isSeller = currentUser?.id === listing?.sellerId;

  const interestedBuyers = useMemo(() => {
    if (!listing || !isSeller) return [];
    const buyerIds = new Set(messages
      .filter(m => m.listingId === listing.id)
      .map(m => m.senderId === currentUser.id ? m.receiverId : m.senderId)
    );
    return users.filter(u => buyerIds.has(u.id) && u.id !== currentUser.id);
  }, [messages, listing, isSeller, currentUser, users]);

  if (!listing) return null;

  const handleOpenChat = (partner: User) => {
    setChatPartner(partner);
    setIsChatOpen(true);
  };

  const handleAcceptOffer = async () => {
    if (!confirm(lang === 'TR' ? "Teklifi kabul etmek istediğine emin misin?" : "Are you sure you want to accept this offer?")) return;
    try {
      await onAction(listing.id, ListingStatus.SOLD);
      alert(lang === 'TR' ? "Teklif kabul edildi! Ürün satıldı." : "Offer accepted! Item sold.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMakeOffer = async () => {
    if (!currentUser || !seller) return;
    const amount = Number(offerAmount);
    
    if (!amount || amount <= 0) {
      alert(lang === 'TR' ? "Lütfen geçerli bir tutar girin." : "Please enter a valid amount.");
      return;
    }

    if (amount >= listing.price) {
      alert(lang === 'TR' ? "Teklifiniz ürün fiyatından düşük olmalıdır." : "Offer must be lower than the original price.");
      return;
    }

    if (amount < listing.price * 0.4) {
      alert(lang === 'TR' ? "Teklifiniz çok düşük! Lütfen daha makul bir rakam deneyin." : "Offer is too low! Try a more reasonable price.");
      return;
    }

    setIsSendingOffer(true);
    try {
      // 1. Sohbete otomatik teklif mesajı at
      await onSendMessage({
        senderId: currentUser.id,
        receiverId: seller.id,
        listingId: listing.id,
        text: lang === 'TR' ? `Merhaba! Bu ürün için $${amount} teklif ediyorum. Ne dersiniz?` : `Hi! I'm offering $${amount} for this item. What do you think?`
      });

      // 2. Satıcıya bildirim gönder
      await sendNotification({
        userId: seller.id,
        type: NotificationType.OFFER,
        priority: NotificationPriority.MEDIUM,
        title: lang === 'TR' ? 'Yeni Teklif Geldi! 🏷️' : 'New Offer Received! 🏷️',
        message: lang === 'TR' ? `${currentUser.name}, "${listing.title}" için $${amount} teklif etti.` : `${currentUser.name} offered $${amount} for "${listing.title}".`,
        sender: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatarUrl },
        relatedContent: { type: 'listing', id: listing.id, preview: `$${amount}` }
      });

      setIsOfferModalOpen(false);
      setOfferAmount('');
      alert(lang === 'TR' ? "Teklifiniz başarıyla iletildi!" : "Offer sent successfully!");
    } catch (err) {
      alert("Teklif gönderilirken bir hata oluştu.");
    } finally {
      setIsSendingOffer(false);
    }
  };

  const completePurchase = async () => {
    if (!currentUser) return;
    try {
      const { error: orderError } = await supabase.from('orders').insert([{
        listing_id: listing.id,
        buyer_id: currentUser.id,
        seller_id: listing.sellerId,
        price: listing.price,
        status: 'PREPARING',
        created_at: Date.now()
      }]);

      if (orderError) throw orderError;

      const { error: listingError } = await supabase.from('listings').update({
        status: ListingStatus.SOLD
      }).eq('id', listing.id);

      if (listingError) throw listingError;

      await sendNotification({
        userId: listing.sellerId,
        type: NotificationType.ORDER,
        priority: NotificationPriority.HIGH,
        title: 'Ürününüz Satıldı! 🎉',
        message: `"${listing.title}" adlı ürününüz ${currentUser.name} tarafından satın alındı. Lütfen kargo hazırlıklarına başlayın.`,
        sender: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatarUrl },
        relatedContent: { type: 'order', id: listing.id }
      });

      setCheckoutStep(3);
      onPurchase(listing.id);
    } catch (err: any) {
      alert(err.message || "Ödeme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Teklif Modalı */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-clay/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-brand-clay mb-2">{t.listingDetails.makeOffer}</h3>
            <p className="text-brand-clay/40 text-xs font-bold uppercase tracking-widest mb-6">{lang === 'TR' ? 'Fiyat Önerisi' : 'Suggest a Price'}</p>
            
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-brand-terracotta">$</span>
              <input 
                autoFocus
                type="number" 
                className="w-full pl-10 pr-4 py-4 bg-brand-cream rounded-2xl border border-brand-clay/5 outline-none font-black text-xl text-brand-clay focus:border-brand-terracotta transition-all"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOfferModalOpen(false)}
                className="flex-1 py-4 bg-brand-cream text-brand-clay font-bold rounded-2xl uppercase text-[10px] tracking-widest"
              >
                {t.profile.cancel}
              </button>
              <button 
                onClick={handleMakeOffer}
                disabled={isSendingOffer || !offerAmount}
                className="flex-1 py-4 bg-brand-terracotta text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-brand-terracotta/20 active:scale-95 disabled:opacity-50"
              >
                {isSendingOffer ? '...' : t.listingDetails.submitOffer}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modalı (Zaten Vardı) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-clay/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
            <header className="p-8 border-b border-brand-clay/5 flex justify-between items-center">
              <h3 className="text-xl font-black text-brand-clay uppercase">Güvenli Ödeme</h3>
              <button onClick={() => {setIsCheckoutOpen(false); setCheckoutStep(1);}} className="text-brand-clay/30 hover:text-brand-terracotta">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </header>
            <div className="p-8">
              {checkoutStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-brand-cream p-6 rounded-2xl border border-brand-clay/5">
                    <p className="text-[10px] font-black text-brand-clay/30 uppercase mb-4">Teslimat Adresi</p>
                    <div className="space-y-4">
                      <input type="text" placeholder="Ad Soyad" className="w-full p-4 bg-white rounded-xl border border-brand-clay/10 outline-none" />
                      <textarea placeholder="Açık Adres" className="w-full p-4 bg-white rounded-xl border border-brand-clay/10 outline-none h-24" />
                    </div>
                  </div>
                  <button onClick={() => setCheckoutStep(2)} className="w-full py-4 bg-brand-clay text-white rounded-2xl font-black text-xs uppercase tracking-widest">Ödeme Adımına Geç</button>
                </div>
              )}
              {checkoutStep === 2 && (
                <div className="space-y-6">
                   <div className="bg-brand-cream p-6 rounded-2xl border border-brand-clay/5">
                    <p className="text-[10px] font-black text-brand-clay/30 uppercase mb-4">Kart Bilgileri</p>
                    <div className="space-y-4">
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-4 bg-white rounded-xl border border-brand-clay/10 outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="AA / YY" className="p-4 bg-white rounded-xl border border-brand-clay/10 outline-none" />
                        <input type="text" placeholder="CVV" className="p-4 bg-white rounded-xl border border-brand-clay/10 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center"><span className="font-bold">Toplam:</span><span className="text-2xl font-black text-brand-terracotta">${listing.price}</span></div>
                  <button onClick={completePurchase} className="w-full py-4 bg-brand-terracotta text-white rounded-2xl font-black text-xs uppercase shadow-xl">Ödemeyi Tamamla</button>
                </div>
              )}
              {checkoutStep === 3 && (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-brand-sage/10 text-brand-sage rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h4 className="text-2xl font-black text-brand-clay">Sipariş Alındı!</h4>
                  <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-brand-clay text-white rounded-2xl font-black text-xs uppercase">Dashboard'a Git</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-4">
        {isChatOpen && chatPartner && currentUser && (
          <ChatModal 
            lang={lang} 
            partner={chatPartner} 
            listing={listing} 
            currentUser={currentUser} 
            messages={messages} 
            onSendMessage={onSendMessage} 
            onClose={() => {setIsChatOpen(false); setChatPartner(null);}} 
          />
        )}

        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-clay/40 font-bold text-xs uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            {t.listingDetails.back}
          </Link>
          {isSeller && (
            <div className="bg-brand-terracotta/10 px-4 py-2 rounded-xl border border-brand-terracotta/20 flex items-center gap-2">
               <div className="w-2 h-2 bg-brand-terracotta rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase text-brand-terracotta tracking-widest">{lang === 'TR' ? 'Sizin İlanınız' : 'Your Listing'}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-brand-cream/30 border border-brand-clay/5 relative">
              <img src={listing.imageUrls[activeImage]} alt="" className="w-full h-full object-cover" />
              {listing.status === ListingStatus.SOLD && (
                <div className="absolute inset-0 bg-brand-clay/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white text-brand-clay px-8 py-3 rounded-full font-black uppercase tracking-widest">{t.marketplace.outOfStock}</span>
                </div>
              )}
            </div>
            {listing.imageUrls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {listing.imageUrls.map((url, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 ${activeImage === idx ? 'border-brand-terracotta' : 'border-transparent opacity-60'}`}>
                    <img src={url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-5xl font-extrabold text-brand-clay tracking-tight leading-none">{listing.title}</h1>
              <div className="text-right">
                <p className="text-3xl font-black text-brand-terracotta">${listing.price}</p>
                <p className="text-[10px] font-bold text-brand-clay/30 uppercase tracking-widest mt-1">{(t.listingForm.conditions as any)[listing.condition] || listing.condition}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-brand-clay/5 p-8 mb-10 flex-1 shadow-sm">
              <p className="text-brand-clay/60 text-lg leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {isSeller ? (
              <div className="space-y-6">
                {listing.offerAmount && listing.status === ListingStatus.PENDING_REVIEW && (
                  <div className="bg-brand-sage/10 p-6 rounded-[2rem] border border-brand-sage/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-brand-sage uppercase tracking-widest mb-1">Platform Teklifi (Anında Nakit)</p>
                      <p className="text-2xl font-black text-brand-clay">${listing.offerAmount}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleAcceptOffer} className="px-6 py-3 bg-brand-sage text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-sage/20">Kabul Et</button>
                      <button className="px-6 py-3 bg-white text-brand-clay/40 rounded-xl font-black text-[10px] uppercase tracking-widest border border-brand-clay/5">Reddet</button>
                    </div>
                  </div>
                )}

                <div className="bg-brand-cream/50 p-6 rounded-[2rem] border border-brand-clay/5">
                  <h3 className="text-[10px] font-black text-brand-clay/40 uppercase tracking-widest mb-4">İlgilenen Alıcılar ({interestedBuyers.length})</h3>
                  {interestedBuyers.length === 0 ? (
                    <p className="text-xs font-medium text-brand-clay/30 italic">Henüz bu ürün için mesaj almadınız.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {interestedBuyers.map(buyer => (
                        <button 
                          key={buyer.id} 
                          onClick={() => handleOpenChat(buyer)}
                          className="flex items-center gap-3 bg-white p-2 pr-5 rounded-2xl border border-brand-clay/5 hover:border-brand-terracotta hover:shadow-md transition-all group"
                        >
                          <img src={buyer.avatarUrl || `https://ui-avatars.com/api/?name=${buyer.name}&background=C36B4F&color=fff`} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="text-left">
                            <p className="text-[10px] font-black text-brand-clay">{buyer.name}</p>
                            <p className="text-[8px] font-bold text-brand-terracotta group-hover:underline uppercase tracking-tighter">Sohbeti Aç</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button 
                  disabled={listing.status === ListingStatus.SOLD} 
                  onClick={() => setIsCheckoutOpen(true)} 
                  className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase transition-transform active:scale-95 ${listing.status === ListingStatus.SOLD ? 'bg-brand-clay/5 text-brand-clay/30' : 'bg-brand-terracotta text-white shadow-xl shadow-brand-terracotta/20'}`}
                >
                  {listing.status === ListingStatus.SOLD ? t.marketplace.outOfStock : t.listingDetails.buyNow}
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    disabled={listing.status === ListingStatus.SOLD}
                    onClick={() => setIsOfferModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-white border-2 border-brand-clay text-brand-clay py-5 rounded-[1.5rem] font-black text-sm uppercase transition-transform active:scale-95 hover:bg-brand-cream disabled:opacity-30"
                  >
                    {t.listingDetails.makeOffer}
                  </button>
                  <button 
                    onClick={() => seller && handleOpenChat(seller)} 
                    className="flex items-center justify-center gap-3 bg-brand-clay text-white py-5 rounded-[1.5rem] font-black text-sm uppercase transition-transform active:scale-95"
                  >
                    Mesaj Gönder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
