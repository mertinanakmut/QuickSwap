
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Listing, ListingStatus, User } from '../types';
import { Language, translations, CATEGORY_DATA } from '../translations';

interface MarketplaceProps {
  listings: Listing[];
  users: User[];
  lang: Language;
}

const Marketplace: React.FC<MarketplaceProps> = ({ listings, users, lang }) => {
  const t = translations[lang];
  
  // States for Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [subFilter, setSubFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Recommendations Logic (Discovery)
  const recommendations = useMemo(() => {
    const activeCats = ['Fashion', 'Electronics']; 
    return listings
      .filter(l => activeCats.includes(l.category) && l.status === ListingStatus.ACTIVE)
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
  }, [listings]);

  const categoryKeys = Object.keys(t.marketplace.categories);

  const subCategories = useMemo(() => {
    if (filter === 'All' || !(filter in CATEGORY_DATA)) return [];
    return Object.keys((CATEGORY_DATA as any)[filter].subCategories);
  }, [filter]);

  const brands = useMemo(() => {
    if (filter === 'All' || subFilter === 'All' || !(filter in CATEGORY_DATA)) return [];
    const catData = (CATEGORY_DATA as any)[filter];
    return catData.subCategories[subFilter] || [];
  }, [filter, subFilter]);

  const handleCategoryChange = (cat: string) => {
    setFilter(cat);
    setSubFilter('All');
    setBrandFilter('All');
  };

  const toggleCondition = (cond: string) => {
    setConditionFilter(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const filtered = useMemo(() => {
    // SADECE ONAYLANMIŞ İLANLARI FİLTRELE
    let result = listings.filter(l => l.status === ListingStatus.ACTIVE);

    // Sıralama (Boosted olanlar en üstte)
    result = result.sort((a, b) => {
      const aBoosted = (a.boostedUntil && a.boostedUntil > Date.now()) ? 1 : 0;
      const bBoosted = (b.boostedUntil && b.boostedUntil > Date.now()) ? 1 : 0;
      if (aBoosted !== bBoosted) return bBoosted - aBoosted;
      return b.createdAt - a.createdAt;
    });

    // Arama Filtresi
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q) ||
        l.brand?.toLowerCase().includes(q)
      );
    }

    // Kategori Filtreleri
    if (filter !== 'All') result = result.filter(l => l.category === filter);
    if (subFilter !== 'All') result = result.filter(l => l.subCategory === subFilter);
    if (brandFilter !== 'All') result = result.filter(l => l.brand === brandFilter);

    // Fiyat Filtresi
    if (priceRange.min) result = result.filter(l => l.price >= Number(priceRange.min));
    if (priceRange.max) result = result.filter(l => l.price <= Number(priceRange.max));

    // Durum Filtresi
    if (conditionFilter.length > 0) {
      result = result.filter(l => conditionFilter.includes(l.condition));
    }

    return result;
  }, [listings, filter, subFilter, brandFilter, searchQuery, priceRange, conditionFilter]);

  return (
    <div className="space-y-12 pb-32">
      {/* Header & Filters */}
      <section className="sticky top-20 z-40 bg-brand-cream/80 backdrop-blur-md py-4 border-b border-brand-clay/5 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay/30 group-focus-within:text-brand-terracotta transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text"
              placeholder={lang === 'TR' ? "Ürün, marka veya kategori ara..." : "Search items, brands, categories..."}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-brand-clay/5 rounded-2xl font-bold text-brand-clay outline-none focus:ring-4 focus:ring-brand-terracotta/5 focus:border-brand-terracotta transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
              showFilters || conditionFilter.length > 0 || priceRange.min || priceRange.max
              ? 'bg-brand-clay text-white border-brand-clay shadow-lg' 
              : 'bg-white text-brand-clay/60 border-brand-clay/5 hover:border-brand-terracotta/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            {lang === 'TR' ? 'Filtrele' : 'Filters'}
            {(conditionFilter.length > 0 || priceRange.min || priceRange.max) && <span className="w-2 h-2 bg-brand-terracotta rounded-full animate-pulse ml-1"></span>}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-6 bg-white rounded-3xl border border-brand-clay/5 shadow-xl animate-in slide-in-from-top-4 duration-300 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest block">{lang === 'TR' ? 'Fiyat Aralığı' : 'Price Range'}</span>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full p-3 bg-brand-cream rounded-xl text-xs font-bold outline-none border border-transparent focus:border-brand-terracotta" value={priceRange.min} onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))} />
                <span className="text-brand-clay/20">—</span>
                <input type="number" placeholder="Max" className="w-full p-3 bg-brand-cream rounded-xl text-xs font-bold outline-none border border-transparent focus:border-brand-terracotta" value={priceRange.max} onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-brand-clay/30 uppercase tracking-widest block">{lang === 'TR' ? 'Ürün Durumu' : 'Condition'}</span>
              <div className="flex flex-wrap gap-2">
                {['new', 'like_new', 'used', 'worn'].map(cond => (
                  <button key={cond} onClick={() => toggleCondition(cond)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${conditionFilter.includes(cond) ? 'bg-brand-terracotta text-white border-brand-terracotta' : 'bg-brand-cream text-brand-clay/40 border-transparent hover:border-brand-clay/10'}`}>
                    {(t.listingForm.conditions as any)[cond]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end justify-end">
              <button onClick={() => {setPriceRange({ min: '', max: '' }); setConditionFilter([]); setSearchQuery(''); setFilter('All');}} className="text-[10px] font-black text-brand-terracotta uppercase tracking-widest hover:underline">
                {lang === 'TR' ? 'Filtreleri Temizle' : 'Clear All Filters'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Recommended Discovery */}
      {!searchQuery && filter === 'All' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-brand-clay tracking-tight">
              {lang === 'TR' ? 'Senin İçin Seçtiklerimiz' : 'Picked for You'}
            </h2>
            <Link to="/sell" className="text-[10px] font-black text-brand-terracotta uppercase tracking-widest hover:underline">
              {lang === 'TR' ? 'Hepsini Gör' : 'See Personalized Feed'} →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-0 sm:px-0">
            {recommendations.map(item => (
              <Link to={`/listing/${item.id}`} key={item.id} className="w-40 sm:w-48 flex-shrink-0 group bg-white rounded-2xl overflow-hidden border border-brand-clay/5 hover:shadow-lg transition-all">
                <div className="aspect-square relative overflow-hidden bg-brand-cream/30">
                  <img src={item.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black text-brand-clay">
                    ${item.price}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-[10px] font-bold text-brand-clay truncate leading-tight">{item.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid Content */}
      <div id="latest-finds" className="space-y-10 scroll-mt-24">
        <header className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-3xl font-extrabold text-brand-clay tracking-tight">
              {searchQuery ? (lang === 'TR' ? `"${searchQuery}" sonuçları` : `Results for "${searchQuery}"`) : t.marketplace.title}
            </h2>
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide px-2 md:px-0">
              {categoryKeys.map(cat => (
                <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${filter === cat ? 'bg-brand-clay text-white border-brand-clay shadow-md' : 'bg-white text-brand-clay/60 hover:border-brand-terracotta/30 border-brand-clay/5'}`}>
                  {(t.marketplace.categories as any)[cat]}
                </button>
              ))}
            </div>
          </div>

          {filter !== 'All' && subCategories.length > 0 && (
            <div className="flex flex-wrap gap-6 items-center bg-white p-5 rounded-3xl border border-brand-clay/5 shadow-sm animate-in fade-in">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-black text-brand-clay/30 uppercase tracking-widest ml-1">{t.marketplace.subCategory}</span>
                <div className="flex gap-2">
                  <button onClick={() => setSubFilter('All')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${subFilter === 'All' ? 'bg-brand-terracotta text-white' : 'bg-brand-cream text-brand-clay/60'}`}>{t.marketplace.allSubCats}</button>
                  {subCategories.map(sub => (
                    <button key={sub} onClick={() => setSubFilter(sub)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${subFilter === sub ? 'bg-brand-terracotta text-white' : 'bg-brand-cream text-brand-clay/60'}`}>{(t.marketplace.subCatNames as any)[sub] || sub}</button>
                  ))}
                </div>
              </div>
              {subFilter !== 'All' && brands.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-brand-clay/30 uppercase tracking-widest ml-1">{t.marketplace.brand}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setBrandFilter('All')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${brandFilter === 'All' ? 'bg-brand-terracotta text-white' : 'bg-brand-cream text-brand-clay/60'}`}>{t.marketplace.allBrands}</button>
                    {brands.map(brand => (
                      <button key={brand} onClick={() => setBrandFilter(brand)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${brandFilter === brand ? 'bg-brand-terracotta text-white' : 'bg-brand-cream text-brand-clay/60'}`}>{brand}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {filtered.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-brand-clay/5 shadow-inner">
            <div className="w-20 h-20 bg-brand-clay/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-brand-clay/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <p className="text-brand-clay/30 font-bold text-lg">{t.marketplace.noItems}</p>
            <button onClick={() => {setSearchQuery(''); setFilter('All');}} className="mt-4 text-brand-terracotta font-black text-[10px] uppercase tracking-widest">
              {lang === 'TR' ? 'Aramayı Temizle' : 'Reset Search'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
            {filtered.map(listing => (
              <Link to={`/listing/${listing.id}`} key={listing.id} className="group bg-white rounded-2xl overflow-hidden border border-brand-clay/5 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-brand-cream/30">
                  <img src={listing.imageUrls[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {listing.status === ListingStatus.SOLD && (
                    <div className="absolute inset-0 bg-brand-clay/30 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-white/90 text-brand-clay px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {t.marketplace.outOfStock}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {listing.boostedUntil && listing.boostedUntil > Date.now() && (
                      <span className="bg-brand-terracotta text-white px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter shadow-lg">
                        {t.boost.featured}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-brand-clay text-xs sm:text-sm group-hover:text-brand-terracotta transition-colors truncate mb-1">{listing.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-black text-brand-clay text-sm sm:text-base">${listing.price}</span>
                    <p className="text-[8px] sm:text-[9px] text-brand-clay/40 uppercase font-black tracking-tighter">
                      {(t.marketplace.subCatNames as any)[listing.subCategory || ''] || listing.brand || listing.category}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <section className="bg-brand-clay text-white rounded-[3rem] p-16 text-center space-y-8 shadow-2xl shadow-brand-clay/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight relative z-10">{t.landing.cta.title}</h2>
        <p className="text-white/60 text-lg font-medium max-w-xl mx-auto relative z-10">{t.landing.cta.subtitle}</p>
        <Link to="/sell" className="inline-block relative z-10 px-12 py-5 bg-brand-terracotta text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-terracotta/20">
          {t.landing.cta.btn}
        </Link>
      </section>
    </div>
  );
};

export default Marketplace;
