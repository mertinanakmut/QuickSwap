
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Listing, CalculatedFee } from '../types';
import { Language, translations } from '../translations';
import { getExchangeRate, calculateBoostFee } from '../services/pricingService';

interface PromoteModalProps {
  listing: Listing;
  lang: Language;
  onClose: () => void;
  onPromote: (listingId: string, durationDays: number, tierId: string) => void;
}

const PromoteModal: React.FC<PromoteModalProps> = ({ listing, lang, onClose, onPromote }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState<CalculatedFee | null>(null);

  useEffect(() => {
    async function loadFee() {
      const rate = await getExchangeRate();
      const data = calculateBoostFee(listing.price, rate, listing.category, listing.type);
      setFeeData(data);
      setLoading(false);
    }
    loadFee();
  }, [listing]);

  if (loading || !feeData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-clay/40 backdrop-blur-sm">
        <div className="bg-white rounded-[2.5rem] p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-terracotta border-t-transparent animate-spin rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-clay/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden card-shadow animate-in zoom-in-95 duration-300">
        <header className="bg-brand-clay p-10 text-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="inline-flex items-center gap-2 bg-brand-terracotta px-4 py-1.5 rounded-full mb-4">
             <span className="text-[10px] font-black uppercase tracking-widest">{feeData.tier.name} Tier</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t.boost.title}</h2>
          <p className="text-brand-cream/60 mt-2 font-medium leading-relaxed">{t.boost.subtitle}</p>
        </header>

        <div className="p-10 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-brand-cream p-8 rounded-[2rem] border border-brand-clay/5">
             <div className="text-center md:text-left">
               <p className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest mb-1">{t.boost.feeLabel}</p>
               <h3 className="text-4xl font-black text-brand-terracotta">{feeData.feeTRY} <span className="text-lg">TL</span></h3>
               <p className="text-xs font-bold text-brand-clay/40 mt-1">{t.boost.usdApprox.replace('${amount}', feeData.feeUSD.toFixed(2))}</p>
             </div>
             <div className="h-px w-full md:w-px md:h-12 bg-brand-clay/10"></div>
             <div className="text-center md:text-right">
               <p className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest mb-1">{t.boost.duration}</p>
               <p className="text-2xl font-extrabold text-brand-clay">{t.boost.days.replace('{count}', feeData.tier.durationDays.toString())}</p>
             </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-brand-clay/40 uppercase tracking-widest">{t.boost.features}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feeData.tier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-brand-sage/5 p-4 rounded-2xl border border-brand-sage/10">
                  <svg className="w-4 h-4 text-brand-sage shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-xs font-bold text-brand-clay">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-brand-clay/5 space-y-4">
            <div className="flex flex-col gap-2">
               {feeData.isLuxury && <p className="text-[10px] font-bold text-brand-terracotta flex items-center gap-2"><span className="w-1 h-1 bg-brand-terracotta rounded-full"></span> {t.boost.luxuryMarkup}</p>}
               {feeData.isEmergency && <p className="text-[10px] font-bold text-brand-sage flex items-center gap-2"><span className="w-1 h-1 bg-brand-sage rounded-full"></span> {t.boost.emergencyDiscount}</p>}
            </div>
            <p className="text-[9px] text-brand-clay/30 font-bold uppercase tracking-widest text-center">
              {t.boost.rateNote.replace('{rate}', feeData.exchangeRate.toFixed(2))}
            </p>
            <button 
              onClick={() => onPromote(listing.id, feeData.tier.durationDays, feeData.tier.id)}
              className="w-full py-5 bg-brand-terracotta text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-terracotta/20 hover:bg-brand-terracottaDark transition-all active:scale-95"
            >
              {t.boost.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoteModal;
