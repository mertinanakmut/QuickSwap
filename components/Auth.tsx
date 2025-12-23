
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Auth: React.FC<{ lang: any; onAuth: () => void }> = ({ onAuth }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            data: { full_name: name },
            emailRedirectTo: window.location.origin 
          }
        });
        
        if (error) throw error;

        // E-posta doğrulaması kapalıysa session hemen oluşur
        if (data.session) {
          navigate('/');
        } else {
          // E-posta doğrulaması açıksa ve hata almadıysak:
          alert("Kayıt başarılı! Lütfen e-postanı kontrol et (Doğrulama ayarı açıksa).");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let friendlyMessage = err.message;
      
      if (err.message.includes("confirmation email")) {
        friendlyMessage = "E-posta doğrulama servisi şu an meşgul. Lütfen Supabase panelinden 'Confirm Email' ayarını kapatın veya daha sonra deneyin.";
      } else if (err.message.includes("Invalid login credentials")) {
        friendlyMessage = "E-posta veya şifre hatalı.";
      }
      
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-xl border border-brand-clay/5 text-center animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-black text-brand-clay mb-2">{isLogin ? 'Hoş Geldin' : 'Bize Katıl'}</h2>
      <p className="text-brand-clay/40 font-medium mb-8 text-sm italic">Hızlı ve güvenli ticaretin adresi.</p>
      
      <form onSubmit={handleAction} className="space-y-4">
        {!isLogin && (
          <input required placeholder="Ad Soyad" className="w-full p-4 bg-brand-cream rounded-xl outline-none border border-transparent focus:border-brand-terracotta font-bold transition-all" value={name} onChange={e => setName(e.target.value)} />
        )}
        <input required type="email" placeholder="E-posta" className="w-full p-4 bg-brand-cream rounded-xl outline-none border border-transparent focus:border-brand-terracotta font-bold transition-all" value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" placeholder="Şifre" className="w-full p-4 bg-brand-cream rounded-xl outline-none border border-transparent focus:border-brand-terracotta font-bold transition-all" value={password} onChange={e => setPassword(e.target.value)} />
        
        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 animate-in shake duration-300">
            {error}
          </div>
        )}

        <button disabled={loading} type="submit" className="w-full py-5 bg-brand-terracotta text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-terracotta/20 disabled:opacity-50 active:scale-95 transition-all">
          {loading ? (
            <div className="flex items-center justify-center gap-2">
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               <span>İşleniyor...</span>
            </div>
          ) : (isLogin ? 'Giriş Yap' : 'Hemen Kayıt Ol')}
        </button>
      </form>
      
      <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="mt-8 text-[10px] font-black text-brand-clay/30 uppercase tracking-widest hover:text-brand-terracotta transition-colors">
        {isLogin ? 'Hesabın yok mu? Yeni bir hesap oluştur' : 'Zaten bir hesabın var mı? Giriş yap'}
      </button>
    </div>
  );
};

export default Auth;
