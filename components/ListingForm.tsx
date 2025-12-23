import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingStatus, ListingType, User, VisualAnalysis } from '../types';
import { analyzeListingVisuals, generateListingDescription } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageUtils';
import { uploadImageToStorage } from '../services/imageService';
import { translations } from '../translations';

const ListingForm: React.FC<{ user: User; lang: any; onAdd: () => void }> = ({ user, lang, onAdd }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [visuals, setVisuals] = useState<VisualAnalysis | null>(null);
  const [images, setImages] = useState<{preview: string, blob: Blob}[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Fashion',
    condition: 'used' as any,
    type: ListingType.REGULAR
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const { dataUrl, blob } = await compressImage(file, 1200, 0.7);
        setImages([{ preview: dataUrl, blob }]);
        
        const aiResult = await analyzeListingVisuals(dataUrl, formData.title);
        setVisuals(aiResult);
        if (aiResult.detectedCondition) {
          setFormData(prev => ({ ...prev, condition: aiResult.detectedCondition }));
        }
      } catch (err) { 
        console.error("AI Analysis/Compression error:", err); 
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAIWrite = async () => {
    if (!formData.title) return;
    setLoading(true);
    const desc = await generateListingDescription(formData.title, formData.category);
    setFormData(p => ({ ...p, description: desc }));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || !user) return;
    setLoading(true);

    try {
      const imageUrl = await uploadImageToStorage(user.id, images[0].blob);
      
      const { error } = await supabase.from('listings').insert([{
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        type: formData.type,
        status: ListingStatus.PENDING_REVIEW,
        image_urls: [imageUrl],
        seller_id: user.id,
        created_at: Date.now(),
        updated_at: Date.now(),
        visual_analysis: visuals || null
      }]);

      if (error) throw error;
      onAdd();
      navigate('/');
    } catch (err: any) {
      alert(err.message || "İlan yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] border border-brand-clay/5 shadow-xl">
      <h2 className="text-3xl font-black text-brand-clay mb-2">Ürün Listele</h2>
      <p className="text-brand-clay/40 text-sm font-medium mb-8">Ürününüzü saniyeler içinde satışa çıkarın.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 p-1.5 bg-brand-cream rounded-2xl border border-brand-clay/5">
          <button type="button" onClick={() => setFormData(p => ({ ...p, type: ListingType.REGULAR }))} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${formData.type === ListingType.REGULAR ? 'bg-white text-brand-terracotta shadow-sm' : 'text-brand-clay/40'}`}>Standart Satış</button>
          <button type="button" onClick={() => setFormData(p => ({ ...p, type: ListingType.EMERGENCY }))} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${formData.type === ListingType.EMERGENCY ? 'bg-brand-terracotta text-white shadow-sm' : 'text-brand-clay/40'}`}>Anında Nakit</button>
        </div>

        <div className="w-full h-56 border-2 border-dashed border-brand-clay/10 rounded-[2rem] flex items-center justify-center relative overflow-hidden bg-brand-cream/30 group">
          {images[0] ? (
            <img src={images[0].preview} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-clay/5 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-clay/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <span className="text-brand-clay/30 font-bold text-xs uppercase tracking-widest">Fotoğraf Ekle</span>
            </div>
          )}
          <input type="file" onChange={handleFile} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        <div className="space-y-4">
          <input required placeholder="Ürün Adı" className="w-full p-4 bg-brand-cream rounded-xl outline-none border border-transparent focus:border-brand-terracotta font-bold text-brand-clay" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-brand-clay/40 tracking-widest">Açıklama</label>
              <button type="button" onClick={handleAIWrite} disabled={loading || !formData.title} className="text-[10px] font-black text-brand-terracotta uppercase hover:underline disabled:opacity-30">YZ ile Yaz</button>
            </div>
            <textarea required placeholder="..." className="w-full p-4 bg-brand-cream rounded-xl outline-none border border-transparent focus:border-brand-terracotta h-32 font-medium text-brand-clay" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-brand-clay/30 ml-2">Kategori</label>
              <select className="w-full p-4 bg-brand-cream rounded-xl outline-none font-bold text-brand-clay" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                {Object.keys(t.marketplace.categories).filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{(t.marketplace.categories as any)[cat]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-brand-clay/30 ml-2">Durum</label>
              <select className="w-full p-4 bg-brand-cream rounded-xl outline-none font-bold text-brand-clay" value={formData.condition} onChange={e => setFormData(p => ({ ...p, condition: e.target.value as any }))}>
                <option value="new">Yeni</option>
                <option value="like_new">Yeni Gibi</option>
                <option value="used">İkinci El</option>
                <option value="worn">Yıpranmış</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-brand-clay/30 ml-2">Fiyat ($)</label>
              <input required type="number" placeholder="0.00" className="w-full p-4 bg-brand-cream rounded-xl outline-none font-bold text-brand-clay" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} />
            </div>
          </div>
        </div>

        <button disabled={loading || images.length === 0} type="submit" className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-50' : 'hover:scale-[0.98]'} ${formData.type === ListingType.EMERGENCY ? 'bg-brand-terracotta text-white shadow-brand-terracotta/20' : 'bg-brand-clay text-white'}`}>
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {loading ? 'İşleniyor...' : 'İlanı Yayınla'}
        </button>
      </form>
    </div>
  );
};

export default ListingForm;