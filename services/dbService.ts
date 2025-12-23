
import { Listing, User, ListingStatus } from '../types';

const KEYS = {
  LISTINGS: 'qs_listings',
  USERS: 'qs_users',
  CURRENT_USER: 'qs_current_session'
};

const get = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const set = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const dbService = {
  getListings: (): Listing[] => get(KEYS.LISTINGS, []),
  
  saveListing: (listing: Listing) => {
    const list = dbService.getListings();
    list.unshift(listing);
    set(KEYS.LISTINGS, list);
  },

  updateListing: (id: string, updates: Partial<Listing>) => {
    const list = dbService.getListings();
    const index = list.findIndex(l => l.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      set(KEYS.LISTINGS, list);
    }
  },

  getUsers: (): User[] => get(KEYS.USERS, []),

  getCurrentUser: (): User | null => get(KEYS.CURRENT_USER, null),

  setCurrentUser: (user: User | null) => set(KEYS.CURRENT_USER, user),

  register: (user: User) => {
    const users = dbService.getUsers();
    users.push(user);
    set(KEYS.USERS, users);
    dbService.setCurrentUser(user);
  },

  login: (email: string): User | null => {
    const users = dbService.getUsers();
    const user = users.find(u => u.email === email);
    if (user) dbService.setCurrentUser(user);
    return user || null;
  }
};
