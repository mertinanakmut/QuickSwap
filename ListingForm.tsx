import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, ListingStatus, ListingType, User, VisualAnalysis } from '../types';
import { generateListingDescription, analyzeListingVisuals } from '../services/geminiService';
import { Language, translations } from '../translations';
import { compressImage } from '../lib/imageUtils';
import { uploadImageToStorage } from '../services/imageService';
import { supabase } from '../lib/supabase';

interface ListingImage {
  preview: string;
  blob: Blob;
}

type SubmissionState = 'idle' | 'compressing' | 'uploading' | 'saving' | 'error';

interface ListingFormProps {
  user: User;
  onAdd: (listing: Omit<Listing, 'id'>) => void;
  lang: Language;
}

const ListingForm: React.FC<ListingFormProps> = ({ user, onAdd, lang }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [subState, setSubState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visuals, setVisuals] = useState<VisualAnalysis | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Fashion',
    condition: 'used' as 'new' | 'like_new' | 'used' | 'worn',
    type: ListingType.REGULAR
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files) as File[];
      const remainingSlots = 5 - images.length;
      const allowedFiles = filesArray.slice(0, remainingSlots);

      setLoading(true);
      try {
        const processedImages = await Promise.all(
          allowedFiles.map(file => compressImage(file, 1200, 0.6))
        );
        
        const newImages = [...images, ...processedImages.map(p => ({ preview: p.dataUrl, blob: p.blob }))];
        setImages(newImages);

        if (images.length === 0 && processedImages.length > 0) {
          try {
            const result = await analyzeListingVisuals(processedImages[0].dataUrl, formData.title);
            setVisuals(result);
            if (result.detectedCondition) {
               setFormData(prev => ({ ...prev, condition: result.detectedCondition }));
            }
          } catch (aiErr) {
            console.warn("AI Analysis skipped:", aiErr);
          }
        }
      } catch (err) {
        console.error("Image processing error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setErrorMessage(lang === 'TR' ? "Oturumunuz kapalı. Lütfen tekrar giriş yapın." : "Session expired. Please login again.");
      return;
    }

    if (images.length === 0) {
      setErrorMessage(lang === 'TR' ? "En az bir fotoğraf eklemelisiniz." : "Please add at least one photo.");
      return;
    }

    setSubState('uploading');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImageToStorage(user.id, images[i].blob);
        uploadedUrls.push(url);
      }

      setSubState('saving');
      // Align keys with Postgres snake_case column names
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        type: formData.type,
        status: ListingStatus.PENDING_REVIEW,
        image_urls: uploadedUrls,
        seller_id: user.id,
        created_at: Date.now(),
        updated_at: Date.now(),
        visual_analysis: visuals || null
      };

      const { error } = await supabase.from('listings').insert([listingData]);
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Submission failed", err);
      setSubState('error');
      // Extract readable message or fallback to stringified object
      const msg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setErrorMessage(msg);
    }
  };

  const handleAIDescription = async () => {
    if (!formData.title) return;
    setLoading(true);
    try {
      const desc = await generateListingDescription(formData.title, formData.category);
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isPending = subState !== 'idle' && subState !== 'error';

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] border border-brand-clay/5 card-shadow">
      <h1 className="text-3xl font-extrabold text-brand-clay mb-2 tracking-tight">{t.listingForm.title}</h1>
      <p className="text-brand-clay/50 mb-10 font-medium">{t.listingForm.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-4 p-1.5 bg-brand-cream rounded-3xl border border-brand-clay/5">
          <button type="button" onClick={() => setFormData(p => ({ ...p, type: ListingType.REGULAR }))} className={`py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.type === ListingType.REGULAR ? 'bg-white text-brand-terracotta shadow-sm' : 'text-brand-clay/40'}`}>
            {t.listingForm.sellNormal}
          </button>
          <button type="button" onClick={() => setFormData(p => ({ ...p, type: ListingType.EMERGENCY }))} className={`py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.type === ListingType.EMERGENCY ? 'bg-brand-terracotta text-white shadow-sm' : 'text-brand-clay/40'}`}>
            {t.listingForm.emergencyCash}
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-brand-clay/40 uppercase tracking-widest">{t.listingForm.photos} ({images.length}/5)</label>
          <div className="flex flex-wrap gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative w-32 h-40 rounded-2xl overflow-hidden border border-brand-clay/5 group">
                <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                {!isPending && (
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-2 right-2 bg-brand-clay text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                )}
              </div>
            ))}
            {images.length < 5 && !isPending && (
              <button 
                type="button" 
                disabled={loading}
                onClick={() => fileInputRef.current?.click()} 
                className="w-32 h-40 border-2 border-dashed border-brand-clay/10 rounded-2xl flex flex-col items-center justify-center text-brand-clay/20 hover:border-brand-terracotta hover:text-brand-terracotta transition-all disabled:opacity-50"
              >
                {loading ? (
                   <div className="w-6 h-6 border-2 border-brand-terracotta border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.listingForm.addPhoto}</span>
                )}
              </button>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-brand-clay/40 uppercase tracking-widest">{t.listingForm.whatSelling}</label>
          <input required disabled={isPending} type="text" className="w-full p-4 bg-brand-cream border border-brand-clay/5 rounded-2xl font-bold text-brand-clay outline-none focus:ring-2 focus:ring-brand-terracotta disabled:opacity-50" placeholder="Örn: iPhone 13 Pro" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-brand-clay/40 uppercase tracking-widest">{t.listingForm.category}</label>
            <select disabled={isPending} className="w-full p-4 bg-brand-cream border border-brand-clay/5 rounded-2xl font-bold text-brand-clay outline-none disabled:opacity-50" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
              {Object.keys(translations[lang].marketplace.categories).filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{(translations[lang].marketplace.categories as any)[cat]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-brand-clay/40 uppercase tracking-widest">{t.listingForm.condition}</label>
            <select disabled={isPending} className="w-full p-4 bg-brand-cream border border-brand-clay/5 rounded-2xl font-bold text-brand-clay outline-none disabled:opacity-50" value={formData.condition} onChange={e => setFormData(p => ({ ...p, condition: e.target.value as any }))}>
              <option value="new">{t.listingForm.conditions.new}</option>
              <option value="like_new">{t.listingForm.conditions.like_new}</option>
              <option value="used">{t.listingForm.conditions.used}</option>
              <option value="worn">{t.listingForm.conditions.worn}</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-brand-clay/40 uppercase tracking-widest">{t.listingForm.price}</label>
            <input required disabled={isPending} type="number" className="w-full p-4 bg-brand-cream border border-brand-clay/5 rounded-2xl font-bold text-brand-clay outline-none disabled:opacity-50" placeholder="0.00" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-brand-clay/40 uppercase tracking-widest">{t.listingForm.description}</label>
            <button type="button" onClick={handleAIDescription} disabled={loading || isPending} className="text-[10px] font-black text-brand-terracotta hover:opacity-70 uppercase tracking-widest disabled:opacity-30">
              {loading ? t.listingForm.writing : t.listingForm.aiGenerate}
            </button>
          </div>
          <textarea required disabled={isPending} rows={4} className="w-full p-4 bg-brand-cream border border-brand-clay/5 rounded-2xl font-bold text-brand-clay outline-none disabled:opacity-50" placeholder="..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in fade-in">
            {errorMessage}
          </div>
        )}

        <button disabled={isPending || loading} type="submit" className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isPending || loading ? 'opacity-50' : 'hover:scale-[0.98]'} ${formData.type === ListingType.EMERGENCY ? 'bg-brand-terracotta text-white shadow-xl shadow-brand-terracotta/20' : 'bg-brand-clay text-white'}`}>
          {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {subState === 'uploading' ? (lang === 'TR' ? 'GÖRSELLER YÜKLENİYOR...' : 'UPLOADING IMAGES...') : 
           subState === 'saving' ? (lang === 'TR' ? 'İLAN KAYDEDİLİYOR...' : 'SAVING LISTING...') : 
           t.listingForm.submit}
        </button>
      </form>
    </div>
  );
};

export default ListingForm;