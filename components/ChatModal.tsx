
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Listing, ChatMessage } from '../types';
import { Language, translations } from '../translations';

interface ChatModalProps {
  lang: Language;
  partner: User;
  listing: Listing;
  currentUser: User;
  messages: ChatMessage[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ lang, partner, listing, currentUser, messages, onSendMessage, onClose }) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sadece bu ürüne ve bu partnerle olan mesajları filtrele
  const filteredMessages = useMemo(() => {
    return messages.filter(m => 
      m.listingId === listing.id && 
      ((m.senderId === currentUser.id && m.receiverId === partner.id) || 
       (m.senderId === partner.id && m.receiverId === currentUser.id))
    );
  }, [messages, listing.id, currentUser.id, partner.id]);

  // Yeni mesaj geldiğinde her zaman en alta kaydır
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [filteredMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      senderId: currentUser.id,
      receiverId: partner.id,
      listingId: listing.id,
      text: inputText.trim(),
    });
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-clay/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg h-[90vh] sm:h-[600px] flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden card-shadow animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <header className="bg-brand-clay p-6 text-white flex items-center justify-between shadow-lg relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={partner.avatarUrl || `https://ui-avatars.com/api/?name=${partner.name}&background=8DA082&color=fff&size=48`} 
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20" 
                alt="" 
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-brand-sage border-2 border-brand-clay rounded-full"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">{partner.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-sage">{t.chat.online}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </header>

        {/* Item Context Bar */}
        <div className="bg-brand-cream border-b border-brand-clay/5 p-4 flex items-center gap-4">
          <img src={listing.imageUrls[0]} className="w-10 h-10 rounded-lg object-cover" alt="" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest truncate">
              {listing.title}
            </p>
            <p className="font-black text-brand-terracotta text-sm">${listing.price}</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-cream/30 scrollbar-hide">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
              <p className="font-bold text-sm">{t.chat.noMessages}</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                    isMine 
                      ? 'bg-brand-clay text-white rounded-br-none shadow-lg' 
                      : 'bg-white text-brand-clay border border-brand-clay/5 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                    <div className={`text-[8px] font-black mt-1.5 uppercase tracking-tighter ${isMine ? 'text-white/40' : 'text-brand-clay/30'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-6 bg-white border-t border-brand-clay/5">
          <div className="flex gap-3 bg-brand-cream p-1.5 rounded-2xl border border-brand-clay/10 focus-within:border-brand-terracotta transition-colors shadow-inner">
            <input 
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chat.placeholder}
              className="flex-1 bg-transparent px-4 py-2.5 text-sm font-bold text-brand-clay outline-none"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="bg-brand-terracotta text-white p-3 rounded-xl hover:bg-brand-terracottaDark transition-all disabled:opacity-30 disabled:grayscale active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
