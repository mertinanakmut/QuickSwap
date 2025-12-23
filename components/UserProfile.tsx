
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Listing, ListingStatus, Gender } from '../types';
import { Language, translations } from '../translations';
import { compressImage } from '../lib/imageUtils';
import { generateUserBio } from '../services/geminiService';
import { uploadAvatarToStorage } from '../services/imageService';
import { supabase } from '../lib/supabase';

interface UserProfileProps {
  users: User[];
  listings: Listing[];
  lang: Language;
  currentUser: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ users, listings, lang, currentUser, onUpdateUser, onLogout }) => {
  const t = translations[lang];
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  
  const rawUser = users.find(u => u.id === userId);
  const user = rawUser ? {
    ...rawUser,
    avatarUrl: rawUser.avatarUrl || (rawUser as any).avatar_url,
    reviews: rawUser.reviews || [],
    totalSales: rawUser.totalSales || 0,
    followersCount: rawUser.followersCount || 0
  } : null;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        bio: user.bio,
        gender: user.gender || 'none',
        birthDate: user.birthDate || (user as any).birth_date || '',
        avatarUrl: user.avatarUrl
      });
    }
  }, [userId, isEditMode, user?.id]);

  if (!user) {
    return (
      <div className="text-center py-32">
        <h2 className="text-3xl font-extrabold text-brand-clay mb-4">{t.profile.userNotFound}</h2>
        <Link to="/" className="text-brand-terracotta font-bold hover:underline">{t.profile.back}</Link>
      </div>
    );
  }

  const isMyProfile = currentUser?.id === user.id;

  const handleSave = async () => {
    if (isMyProfile) {
      setLoading(true);
      setError(null);
      try {
        // KRİTİK: Sadece veritabanında var olan snake_case sütun isimlerini gönderiyoruz.
        // camelCase isimleri (avatarUrl, birthDate) göndermiyoruz çünkü DB'de yoklar.
        const updatePayload = {
          name: editData.name,
          bio: editData.bio,
          gender: editData.gender,
          avatar_url: editData.avatarUrl, // Sütun adı: avatar_url
          birth_date: editData.birthDate  // Sütun adı: birth_date
        };

        const { error: updateError } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', user.id);

        if (updateError) throw updateError;

        onUpdateUser({ ...user, ...editData } as User);
        setIsEditMode(false);
      } catch (err: any) {
        console.error("Save failed:", err);
        setError(lang === 'TR' ? "Değişiklikler kaydedilemedi: " + err.message : "Changes could not be saved: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      setLoading(true);
      setError(null);
      try {
        const { blob } = await compressImage(file, 400, 0.6);
        const storageUrl = await uploadAvatarToStorage(currentUser.id, blob);
        setEditData(prev => ({ ...prev, avatarUrl: storageUrl }));
      } catch (err: any) {
        console.error("Avatar upload failed", err);
        setError(err.message || (lang === 'TR' ? "Fotoğraf yüklenemedi." : "Photo upload failed."));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAIBio = async () => {
    setLoading(true);
    try {
      const bio = await generateUserBio(user.username || user.name, ['Moda', 'Elektronik', 'Yaşam Tarzı']);
      setEditData(prev => ({ ...prev, bio }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const userListings = listings.filter(l => l.sellerId === user.id && (l.status === ListingStatus.ACTIVE || l.status === ListingStatus.SOLD));
  
  const reviews = user.reviews || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : (lang === 'TR' ? 'Yeni' : 'New');

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {isLoggingOut && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-clay/40 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-brand-clay text-center mb-2">{t.nav.logout}</h3>
            <p className="text-brand-clay/40 text-center text-sm font-medium mb-8 leading-relaxed">{t.profile.logoutConfirm}</p>
            <div className="flex gap-4">
              <button onClick={() => setIsLoggingOut(false)} className="flex-1 py-4 bg-brand-cream text-brand-clay font-bold rounded-2xl">{t.profile.cancel}</button>
              <button onClick={() => { onLogout(); navigate('/'); }} className="flex-1 py-4 bg-rose-500 text-white font-black rounded-2xl">{t.profile.logoutBtn}</button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white rounded-[2.5rem] border border-brand-clay/5 p-8 sm:p-12 card-shadow overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
          <div className="relative group">
            <div className={`w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-brand-cream shadow-xl relative ${loading ? 'opacity-50' : ''}`}>
              <img 
                src={(isEditMode ? editData.avatarUrl : user.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=C36B4F&color=fff&size=160`} 
                alt={user.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=C36B4F&color=fff&size=160`;
                }}
              />
              {loading && <div className="absolute inset-0 flex items-center justify-center bg-brand-clay/20"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}
            </div>
            {isEditMode && !loading && (
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-brand-clay/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-black text-[9px] uppercase tracking-widest">{t.profile.changePhoto}</span>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {isEditMode ? (
                  <input type="text" className="text-4xl font-extrabold text-brand-clay tracking-tighter bg-brand-cream border-b-2 border-brand-terracotta outline-none px-2 py-1 w-full max-w-sm rounded-t-xl" value={editData.name || ''} onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))} />
                ) : (
                  <h1 className="text-4xl font-extrabold text-brand-clay tracking-tighter">{user.name}</h1>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="text-brand-clay/40 font-black tracking-widest uppercase text-[10px]">@{user.username || user.email?.split('@')[0]}</span>
                </div>
              </div>

              {isMyProfile && (
                <div className="flex gap-2">
                  {!isEditMode ? (
                    <>
                      <button onClick={() => setIsEditMode(true)} className="px-6 py-2.5 bg-brand-clay text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all">
                        {t.profile.editProfile}
                      </button>
                      <button onClick={() => setIsLoggingOut(true)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsEditMode(false)} className="px-6 py-2.5 bg-brand-cream text-brand-clay rounded-full font-bold text-xs uppercase tracking-widest">{t.profile.cancel}</button>
                      <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-brand-terracotta text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2">
                        {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {t.profile.saveChanges}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl animate-in fade-in">
                {error}
              </div>
            )}

            {isEditMode ? (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                 <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest">{t.profile.bio}</label>
                       <button onClick={handleAIBio} disabled={loading} className="text-[10px] font-black text-brand-terracotta hover:underline uppercase flex items-center gap-1">
                         {loading ? '...' : t.dashboard.aiBio}
                       </button>
                    </div>
                    <textarea className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-clay/10 text-brand-clay font-medium outline-none focus:border-brand-terracotta h-24 resize-none" value={editData.bio || ''} onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))} />
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest">{t.gender.label}</label>
                       <div className="grid grid-cols-2 gap-2">
                          {(['male', 'female', 'other', 'none'] as Gender[]).map((g) => (
                             <button key={g} type="button" onClick={() => setEditData(prev => ({ ...prev, gender: g }))} className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${editData.gender === g ? 'bg-brand-clay text-white border-brand-clay' : 'bg-brand-cream text-brand-clay/40 border-transparent'}`}>
                                {(t.gender as any)[g]}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest">{t.profile.birthDate}</label>
                       <input type="date" className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-clay/10 font-bold text-brand-clay outline-none focus:border-brand-terracotta" value={editData.birthDate || ''} onChange={e => setEditData(prev => ({ ...prev, birthDate: e.target.value }))} />
                    </div>
                 </div>
              </div>
            ) : (
              <p className="text-brand-clay/60 max-w-2xl text-lg font-medium italic">"{user.bio || (lang === 'TR' ? "Harika ürünler, güvenli ticaret." : "Passionate about trading great items safely.")}"</p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-brand-cream p-4 rounded-3xl border border-brand-clay/5 text-center min-w-[100px]">
                <p className="text-2xl font-black text-brand-clay">{avgRating} <span className="text-brand-terracotta text-sm">★</span></p>
                <p className="text-[9px] text-brand-clay/40 uppercase font-black tracking-widest mt-1">{t.profile.reputation}</p>
              </div>
              <div className="bg-brand-cream p-4 rounded-3xl border border-brand-clay/5 text-center min-w-[100px]">
                <p className="text-2xl font-black text-brand-clay">{user.totalSales}</p>
                <p className="text-[9px] text-brand-clay/40 uppercase font-black tracking-widest mt-1">{t.profile.sales}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8 animate-in fade-in duration-700 delay-300">
        <h2 className="text-3xl font-extrabold text-brand-clay tracking-tight flex items-center gap-4">
          {t.profile.closet}
          <span className="h-px flex-1 bg-brand-clay/5"></span>
        </h2>
        
        {userListings.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-brand-clay/5 p-20 text-center rounded-[3rem] shadow-inner">
            <p className="text-brand-clay/30 font-bold">{t.profile.emptyCloset}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
            {userListings.map(listing => (
              <Link to={`/listing/${listing.id}`} key={listing.id} className="group bg-white rounded-3xl overflow-hidden border border-brand-clay/5 hover:shadow-xl transition-all duration-500">
                <div className="aspect-[4/5] relative overflow-hidden bg-brand-cream/30">
                  <img src={listing.imageUrls[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-brand-clay text-sm truncate mb-1">{listing.title}</h4>
                  <span className="font-black text-brand-terracotta text-sm">${listing.price}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
