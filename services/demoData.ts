
import { ListingStatus, ListingType } from "../types";

const DEMO_USERS = [
  {
    id: "demo-user-1",
    name: "Elif Kaya",
    username: "elif_kaya",
    email: "elif@demo.com",
    role: "user",
    bio: "Sürdürülebilir moda ve teknoloji tutkunu. Dolabımda her zaman temiz ürünler bulabilirsiniz.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    location: "Istanbul, TR",
    joinDate: Date.now() - 2592000000,
    totalSales: 42,
    isVerified: true,
    followersCount: 1240,
    reviews: [
      {
        id: "r1",
        sellerId: "demo-user-1",
        buyerId: "u99",
        rating: 5,
        accuracy: 5,
        communication: 5,
        shipping: 5,
        comment: "Ürün tıpkı fotoğraflardaki gibiydi. Hızlı kargo için teşekkürler!",
        reviewerName: "Mert S.",
        timestamp: Date.now() - 864000000
      },
      {
        id: "r2",
        sellerId: "demo-user-1",
        buyerId: "u98",
        rating: 4,
        accuracy: 5,
        communication: 4,
        shipping: 4,
        comment: "Kargo biraz geç geldi ama ürün çok kaliteli.",
        reviewerName: "Selin Y.",
        timestamp: Date.now() - 432000000
      }
    ]
  },
  {
    id: "demo-user-2",
    name: "Can Demir",
    username: "candemir",
    email: "can@demo.com",
    role: "user",
    bio: "Teknoloji meraklısı. En son çıkan gadgetları burada bulabilirsiniz.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    location: "Ankara, TR",
    joinDate: Date.now() - 1592000000,
    totalSales: 15,
    isVerified: true,
    followersCount: 450,
    reviews: [
      {
        id: "r3",
        sellerId: "demo-user-2",
        buyerId: "u97",
        rating: 5,
        accuracy: 5,
        communication: 5,
        shipping: 5,
        comment: "Kusursuz işlem. Kesinlikle tavsiye ederim.",
        reviewerName: "Ahmet K.",
        timestamp: Date.now() - 172800000
      }
    ]
  }
];

const DEMO_LISTINGS = [
  {
    id: "l1",
    title: "Vintage 90s Leather Biker Jacket",
    description: "90'lardan kalma orijinal deri ceket. Kondisyonu harika, hiçbir yırtık veya deformasyon yok. Oversize kesim.",
    price: 185,
    category: "Fashion",
    subCategory: "Mens",
    brand: "Zara",
    condition: "like_new",
    type: ListingType.REGULAR,
    status: ListingStatus.ACTIVE,
    imageUrls: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800"],
    sellerId: "demo-user-1",
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    viewCount: 124
  },
  {
    id: "l2",
    title: "iPhone 13 Pro - 128GB - Graphite",
    description: "Kutulu, faturalı, garantisi yeni bitti. Pil sağlığı %92. Ekranda çizik dahi yok.",
    price: 750,
    category: "Electronics",
    subCategory: "Phones",
    brand: "Apple",
    condition: "used",
    type: ListingType.REGULAR,
    status: ListingStatus.ACTIVE,
    imageUrls: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800"],
    sellerId: "demo-user-2",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    viewCount: 342
  },
  {
    id: "l3",
    title: "Minimalist Oak Coffee Table",
    description: "Masif meşe ağacı, İskandinav tarzı. Çok az kullanıldı, taşınma nedeniyle satılık.",
    price: 120,
    category: "Home",
    subCategory: "Furniture",
    brand: "IKEA",
    condition: "new",
    type: ListingType.REGULAR,
    status: ListingStatus.ACTIVE,
    imageUrls: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"],
    sellerId: "demo-user-1",
    createdAt: Date.now() - 36400000,
    updatedAt: Date.now() - 36400000,
    viewCount: 56
  }
];

export async function seedDemoData() {
  localStorage.setItem('quickswap_users', JSON.stringify(DEMO_USERS));
  localStorage.setItem('quickswap_listings', JSON.stringify(DEMO_LISTINGS));
  return true;
}
