
export type Language = 'EN' | 'TR';

export const CATEGORY_DATA = {
  Fashion: {
    subCategories: {
      Mens: ["Nike", "Adidas", "Zara", "Gucci", "Levi's", "Other"],
      Womens: ["Zara", "Mango", "H&M", "Prada", "Chanel", "Other"],
      Accessories: ["Ray-Ban", "Casio", "Rolex", "Pandora", "Other"]
    }
  },
  Electronics: {
    subCategories: {
      Phones: ["Apple", "Samsung", "Xiaomi", "Huawei", "Google", "Other"],
      Laptops: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Other"],
      Audio: ["Sony", "Bose", "JBL", "Sennheiser", "Other"]
    }
  },
  Home: {
    subCategories: {
      Furniture: ["IKEA", "Vivense", "Enza Home", "Other"],
      Kitchen: ["Philips", "Tefal", "Arçelik", "Other"],
      Decoration: ["H&M Home", "Zara Home", "Other"]
    }
  },
  Sports: {
    subCategories: {
      Fitness: ["Decathlon", "Bowflex", "Other"],
      Cycling: ["Giant", "Trek", "Specialized", "Other"]
    }
  }
};

export const translations = {
  EN: {
    nav: { marketplace: "Marketplace", dashboard: "Dashboard", sell: "Sell Item", admin: "Admin Access", login: "Login", register: "Register", logout: "Logout" },
    gender: { male: "Male", female: "Female", other: "Other", none: "Prefer not to say", label: "Gender" },
    profile: {
      userNotFound: "User not found",
      back: "Back to Marketplace",
      reputation: "Reputation",
      sales: "Sales",
      joined: "Joined",
      location: "Location",
      closet: "Storefront",
      emptyCloset: "No active listings from this user.",
      reviews: "Reviews",
      noReviews: "No reviews yet.",
      verified: "Verified Transaction",
      savedTreasures: "Saved Items",
      noSaved: "No saved items yet.",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      birthDate: "Birth Date",
      bio: "Biography",
      fullName: "Full Name",
      changePhoto: "Change Photo",
      logoutConfirm: "Are you sure you want to log out?",
      logoutBtn: "Log Out"
    },
    auth: { 
      loginTitle: "Welcome Back", 
      registerTitle: "Join the Marketplace", 
      forgotPassword: "Forgot Password?", 
      resetPassword: "Reset Password", 
      email: "Email Address", 
      password: "Password", 
      fullName: "Full Name", 
      username: "Username", 
      loginBtn: "Sign In", 
      registerBtn: "Create Account", 
      alreadyMember: "Already a member?", 
      notMember: "New here?", 
      sendReset: "Send Reset Link", 
      backToLogin: "Back to Login", 
      googleLogin: "Continue with Google", 
      or: "OR", 
      verification: {
        title: "Verify Your Email",
        sent: "A verification link has been sent to {email}.",
        instruction: "Please check your inbox (including spam) and click the activation link.",
        resend: "Resend Email",
        checkStatus: "Check Verification Status",
        success: "Email verified successfully! Welcome to QuickSwap.",
        pending: "Verification pending. Please check your email."
      },
      errors: { 
        invalidEmail: "Invalid email address.", 
        weakPassword: "Password should be at least 6 characters.", 
        wrongPassword: "Incorrect password.", 
        userNotFound: "User not found.", 
        invalidCredential: "Invalid email or password.",
        unverified: "Please verify your email address to access all features." 
      } 
    },
    marketplace: { 
      title: "Universal Finds", 
      subtitle: "Discover everything from tech to textiles from verified neighbors.", 
      noItems: "No items found in this category yet.", 
      viewItem: "View Item", 
      outOfStock: "Sold", 
      contactSeller: "Contact Seller", 
      brand: "Brand", 
      subCategory: "Sub-Category", 
      allBrands: "All Brands", 
      allSubCats: "All Sub-Categories", 
      categories: { All: "All", Fashion: "Fashion", Electronics: "Electronics", Home: "Home & Garden", Collectibles: "Collectibles", Sports: "Sports & Hobby", Kids: "Kids & Baby", Automotive: "Auto Parts" }, 
      subCatNames: { Mens: "Men's Wear", Womens: "Women's Wear", Accessories: "Accessories", Phones: "Smartphones", Laptops: "Laptops", Audio: "Audio & Headphones", Furniture: "Furniture", Kitchen: "Kitchenware", Decoration: "Decoration", Fitness: "Fitness Gear", Cycling: "Cycling" } 
    },
    listingDetails: { back: "Back to Marketplace", condition: "Condition", postedOn: "Posted on", sellerInfo: "About the Seller", contactBtn: "Contact Seller", emailSubject: "Interested in: ", emailBody: "Hi {name},\n\nI am interested in your listing: {title}.\n\nYou can find it here: {url}\n\nIs it still available?", buyNow: "Buy Now", makeOffer: "Make an Offer", offerPlaceholder: "Enter amount", submitOffer: "Send Offer", offerSent: "Offer Sent!", offerSuccessTitle: "Offer Successfully Placed", offerSuccessDetail: "Your offer has been sent.", mustLogin: "Login to make an offer", saveForLater: "Save for Later", saved: "Saved" },
    dashboard: { welcome: "Welcome", subtitle: "Manage your listings and profile.", editProfile: "Edit Profile", cancelEdit: "Cancel", save: "Save Changes", generating: "Generating...", aiBio: "Generate with AI", emergencyTitle: "Cash-Out Requests", noEmergency: "No cash-out requests yet.", standardTitle: "Marketplace Listings", noStandard: "No marketplace listings yet.", promote: "Promote", accept: "Accept", reject: "Reject", status: { PENDING_REVIEW: "Review", OFFER_MADE: "Offer Made", ACCEPTED: "Accepted", ACTIVE: "Live", SOLD: "Sold" }, pendingOffers: "Incoming Offers", noPendingOffers: "No pending offers right now.", actionRequired: "Action Required" },
    listingForm: { title: "List an Item", subtitle: "Sell directly to users or get an instant cash offer.", condition: "Condition", conditions: { new: "New", like_new: "Like New", used: "Used", worn: "Worn" }, submit: "Submit Listing", sellNormal: "Standard Sale", emergencyCash: "Instant Cash-Out", emergencyNote: "Instant Cash-Out: We buy your item directly.", standardNote: "Standard Sale: List your item for others.", photos: "Photos", selectImages: "Select Images", addPhoto: "Add Photo", whatSelling: "What are you selling?", category: "Category", subCategory: "Sub-Category", brand: "Brand", price: "Price", description: "Description", writing: "Writing...", aiGenerate: "Generate with AI" },
    admin: { title: "Admin Hub", subtitle: "Manage activity.", userManagement: "Users", approve: "Approve", reject: "Reject", remove: "Remove", stats: "Stats", pending: "Pending", active: "Active", acquisitions: "Buyouts", queue: "Review Queue", empty: "Empty.", addPhoto: "Add Photo", photos: "Review Photos", analyzing: "Analyzing...", aiPrice: "AI Value", sendOffer: "Send Offer" },
    trust: { verified: "Verified Seller", socialProof: "{count} people viewed this today", accuracy: "Accuracy", communication: "Communication", shipping: "Shipping", badges: { fast: "Fast Shipper", accurate: "Top Accuracy", kind: "Communicator" } },
    chat: { title: "Chat", placeholder: "Type a message...", send: "Send", noMessages: "Start a conversation!", online: "Online", aboutItem: "Inquiry about: {title}" },
    aiVision: { scanning: "AI Scanning...", brandDetected: "Detected", authenticityLabel: "Verification", redFlags: "Issues", matchSuccess: "Confirmed", matchFail: "Mismatch", conditionAuto: "Suggested Condition" },
    boost: { title: "Boost Your Listing", subtitle: "Get 10x more visibility.", feeLabel: "Fee", usdApprox: "approx. ${amount} USD", rateNote: "Based on rate: 1 USD = {rate} TRY", luxuryMarkup: "Luxury Premium (+15%)", emergencyDiscount: "Discount (-20%)", features: "Features", duration: "Duration", days: "{count} days", cta: "Activate Boost", success: "Activated!", featured: "Featured" },
    hero: { title: "Declutter your life", accent: "Instantly.", subtitle: "The universal marketplace that buys your items when you need liquidity.", ctaPrimary: "Get Emergency Cash", ctaSecondary: "Browse Marketplace", trusted: "Trusted by 50k+ users" },
    landing: { 
      cta: { title: "Declutter your life Instantly.", subtitle: "The world's first universal marketplace that buys your items when you need liquidity.", btn: "Get Emergency Cash" }, 
      howItWorks: { title: "Cash Out in 3 Steps", subtitle: "A seamless process designed for speed.", step1: { title: "Upload Photos", desc: "Snap 5 clear photos." } } 
    }
  },
  TR: {
    nav: { marketplace: "Pazaryeri", dashboard: "Panelim", sell: "Ürün Sat", admin: "Yönetici", login: "Giriş Yap", register: "Kayıt Ol", logout: "Çıkış Yap" },
    gender: { male: "Erkek", female: "Kadın", other: "Diğer", none: "Belirtmek İstemiyorum", label: "Cinsiyet" },
    profile: {
      userNotFound: "Kullanıcı bulunamadı",
      back: "Pazaryerine Dön",
      reputation: "İtibar",
      sales: "Satış",
      joined: "Katılım",
      location: "Konum",
      closet: "Storefront",
      emptyCloset: "Bu kullanıcının henüz aktif ilanı yok.",
      reviews: "Değerlendirmeler",
      noReviews: "Henüz değerlendirme yok.",
      verified: "Onaylı İşlem",
      savedTreasures: "Kaydedilen Ürünler",
      noSaved: "Henüz kaydedilen bir ürün yok.",
      editProfile: "Profili Düzenle",
      saveChanges: "Değişiklikleri Kaydet",
      cancel: "İptal",
      birthDate: "Doğum Tarihi",
      bio: "Biyografi",
      fullName: "Ad Soyad",
      changePhoto: "Fotoğrafı Değiştir",
      logoutConfirm: "Çıkış yapmak istediğinize emin misiniz?",
      logoutBtn: "Çıkış Yap"
    },
    auth: { 
      loginTitle: "Tekrar Hoş Geldiniz", 
      registerTitle: "Pazaryerine Katılın", 
      forgotPassword: "Şifremi Unuttum", 
      resetPassword: "Şifre Yenile", 
      email: "E-posta Adresi", 
      password: "Şifre", 
      fullName: "Ad Soyad", 
      username: "Kullanıcı Adı", 
      loginBtn: "Giriş Yap", 
      registerBtn: "Hesap Oluştur", 
      alreadyMember: "Zaten üye misiniz?", 
      notMember: "Henüz üye değil misiniz?", 
      sendReset: "Sıfırlama Bağlantısı Gönder", 
      backToLogin: "Girişe Dön", 
      googleLogin: "Google ile Devam Et", 
      or: "VEYA", 
      verification: {
        title: "E-postanı Doğrula",
        sent: "Doğrulama bağlantısı {email} adresine gönderildi.",
        instruction: "Lütfen gelen kutunuzu (ve gereksiz kutusunu) kontrol edin ve aktivasyon linkine tıklayın.",
        resend: "Tekrar Gönder",
        checkStatus: "Doğrulama Durumunu Kontrol Et",
        success: "E-posta başarıyla doğrulandı! QuickSwap'a hoş geldiniz.",
        pending: "Doğrulama bekleniyor. Lütfen e-postanızı kontrol edin."
      },
      errors: { 
        invalidEmail: "Geçersiz e-posta adresi.", 
        weakPassword: "Şifre en az 6 karakter olmalıdır.", 
        wrongPassword: "Hatalı şifre.", 
        userNotFound: "Kullanıcı bulunamadı.", 
        invalidCredential: "Hatalı e-posta veya şifre.",
        unverified: "Tüm özelliklere erişmek için lütfen e-posta adresinizi doğrulayın." 
      } 
    },
    marketplace: { 
      title: "Her Şey Burada", 
      subtitle: "Teknolojiden tekstile kadar her şeyi doğrulanmış komşularınızdan keşfedin.", 
      noItems: "Bu kategoride henüz ürün bulunamadı.", 
      viewItem: "Ürünü İncele", 
      outOfStock: "Satıldı", 
      contactSeller: "Satıcıyla İletişim", 
      brand: "Marka", 
      subCategory: "Alt Kategori", 
      allBrands: "Tüm Markalar", 
      allSubCats: "Tüm Alt Kategoriler", 
      categories: { All: "Hepsi", Fashion: "Moda", Electronics: "Elektronik", Home: "Ev & Bahçe", Collectibles: "Koleksiyon", Sports: "Spor & Hobi", Kids: "Bebek & Çocuk", Automotive: "Oto Parça" }, 
      subCatNames: { Mens: "Erkek Giyim", Womens: "Kadın Giyim", Accessories: "Aksesuar", Phones: "Akıllı Telefon", Laptops: "Dizüstü Bilgisayar", Audio: "Ses & Kulaklık", Furniture: "Mobilya", Kitchen: "Mutfak Gereçleri", Decoration: "Dekorasyon", Fitness: "Fitness Ekipmanı", Cycling: "Bisiklet" } 
    },
    listingDetails: { back: "Pazaryerine Dön", condition: "Durum", postedOn: "Yayınlanma", sellerInfo: "Satıcı Hakkında", contactBtn: "Satıcıyla İletişim", emailSubject: "İlanınızla ilgileniyorum: ", emailBody: "Merhaba {name},\n\nŞu ilanınızla ilgileniyorum: {title}.", buyNow: "Hemen Al", makeOffer: "Teklif Yap", offerPlaceholder: "Tutar girin", submitOffer: "Teklif Gönder", offerSent: "Teklif Gönderildi!", offerSuccessTitle: "Teklif Başarıyla İletildi", offerSuccessDetail: "Teklifiniz iletildi.", mustLogin: "Teklif yapmak için giriş yapın", saveForLater: "Daha Sonra Sakla", saved: "Kaydedildi" },
    dashboard: { welcome: "Hoş geldiniz", subtitle: "İlanlarınızı ve profilinizi yönetin.", editProfile: "Profili Düzenle", cancelEdit: "İptal", save: "Değişiklikleri Kaydet", generating: "Oluşturuluyor...", aiBio: "YZ ile Oluştur", emergencyTitle: "Nakit Alım Talepleri", noEmergency: "Henüz alım talebiniz yok.", standardTitle: "Pazaryeri İlanlarım", noStandard: "Henüz ilanınız yok.", promote: "Öne Çıkar", accept: "Kabul Et", reject: "Reddet", status: { PENDING_REVIEW: "İncelemede", OFFER_MADE: "Teklif Yapıldı", ACCEPTED: "Kabul Edildi", ACTIVE: "Yayında", SOLD: "Satıldı" }, pendingOffers: "Gelen Teklifler", noPendingOffers: "Şu an bekleyen teklifiniz yok.", actionRequired: "Aksiyon Gerekiyor" },
    listingForm: { title: "Ürün Listele", subtitle: "Kullanıcılara doğrudan satın veya anında nakit teklifi alın.", condition: "Durum", conditions: { new: "Yeni", like_new: "Yeni Gibi", used: "İkinci El", worn: "Yıpranmış" }, submit: "İlanı Yayınla", sellNormal: "Standart Satış", emergencyCash: "Anında Nakit", emergencyNote: "Anında Nakit: Ürününüz doğrudan tarafımızca satın alınır.", standardNote: "Standart Satış: Ürününüzü diğer kullanıcılar için listeleyin.", photos: "Fotoğraflar", selectImages: "Görsel Seç", addPhoto: "Fotoğraf Ekle", whatSelling: "Ne satıyorsunuz?", category: "Kategori", subCategory: "Alt Kategori", brand: "Marka", price: "Fiyat", description: "Açıklama", writing: "Yazılıyor...", aiGenerate: "YZ ile Açıklama Oluştur" },
    admin: { title: "Yönetim Merkezi", subtitle: "Platform hareketliliğini yönetin.", userManagement: "Kullanıcılar", approve: "Onayla", reject: "Reddet", remove: "Kaldır", stats: "İstatistikler", pending: "Bekleyen", active: "Aktif", acquisitions: "Satın Alımlar", queue: "İnceleme Kuyruğu", empty: "Kuyruk boş.", addPhoto: "Fotoğraf Ekle", photos: "İnceleme Fotoğrafları", analyzing: "Analiz ediliyor...", aiPrice: "YZ Değeri", sendOffer: "Teklif Gönder" },
    trust: { verified: "Onaylı Satıcı", socialProof: "Bu ürün bugün {count} kişi tarafından incelendi", accuracy: "Uygunluk", communication: "İletişim", shipping: "Kargo", badges: { fast: "Hızlı Gönderici", accurate: "Güvenilir", kind: "İletişim Ustası" } },
    chat: { title: "Sohbet", placeholder: "Mesajınızı yazın...", send: "Gönder", noMessages: "Bir konuşma başlatın!", online: "Çevrimiçi", aboutItem: "Şu ürün hakkında: {title}" },
    aiVision: { scanning: "YZ Taraması...", brandDetected: "Marka Tespit Edildi", authenticityLabel: "Doğrulama", redFlags: "Sorunlar", matchSuccess: "Doğrulandı", matchFail: "Uyumsuz", conditionAuto: "Önerilen Durum" },
    boost: { title: "İlanını Öne Çıkar", subtitle: "10 kata kadar daha fazla görünürlük.", feeLabel: "Ücret", usdApprox: "yaklaşık ${amount} USD", rateNote: "Kur: 1 USD = {rate} TRY", luxuryMarkup: "Lüks Primi (+%15)", emergencyDiscount: "İndirim (-%20)", features: "Özellikler", duration: "Süre", days: "{count} gün", cta: "Öne Çıkarmayı Aktifleştir", success: "Aktif edildi!", featured: "Öne Çıkan" },
    hero: { title: "Her Şeyi Nakite Çevir", accent: "Anında.", subtitle: "İhtiyacınız olduğunda ürününüzü anında satın alan evrensel pazaryeri.", ctaPrimary: "Anında Nakit Al", ctaSecondary: "Pazaryerine Göz At", trusted: "50 binden fazla kullanıcı" },
    landing: { 
      cta: { title: "Her Şeyi Nakite Çevir Anında.", subtitle: "Teknolojiden ev eşyasına, ihtiyacınız olduğunda ürününüzü satın alan pazaryeri.", btn: "Anında Nakit Al" }, 
      howItWorks: { title: "3 Adımda Nakit", subtitle: "Hız için tasarlanmış süreç.", step1: { title: "Fotoğrafları Yükle", desc: "5 net fotoğraf çekin." } } 
    }
  }
};
