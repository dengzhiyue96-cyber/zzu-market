import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
  student_id?: string;
  school_email?: string;
  major?: string;
  grade?: string;
  campus?: string;
  dormitory?: string;
  phone?: string;
  verified: 0 | 1 | 2;
  role: 'user' | 'admin';
  stat?: {
    selling_count: number;
    sold_count: number;
    fav_count: number;
    unread_count: number;
  };
}

interface AppConfig {
  site_name: string;
  campus_list: string[];
  condition_list: string[];
  categories: { id: number; name: string; icon: string; sort: number }[];
}

interface AppState {
  token: string;
  user: User | null;
  config: AppConfig | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (u: Partial<User>) => void;
  setConfig: (c: AppConfig) => void;
}

const initialToken = localStorage.getItem('zzu_token') || '';
const initialUser = (() => {
  try { return JSON.parse(localStorage.getItem('zzu_user') || 'null'); }
  catch { return null; }
})();

export const useApp = create<AppState>((set) => ({
  token: initialToken,
  user: initialUser,
  config: null,
  login: (token, user) => {
    localStorage.setItem('zzu_token', token);
    localStorage.setItem('zzu_user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('zzu_token');
    localStorage.removeItem('zzu_user');
    set({ token: '', user: null });
  },
  setUser: (u) => set((s) => {
    const next = s.user ? { ...s.user, ...u } : (u as User);
    localStorage.setItem('zzu_user', JSON.stringify(next));
    return { user: next as User };
  }),
  setConfig: (c) => set({ config: c }),
}));
