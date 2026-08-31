import { create } from 'zustand';
const initialToken = localStorage.getItem('zzu_token') || '';
const initialUser = (() => {
    try {
        return JSON.parse(localStorage.getItem('zzu_user') || 'null');
    }
    catch {
        return null;
    }
})();
export const useApp = create((set) => ({
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
        const next = s.user ? { ...s.user, ...u } : u;
        localStorage.setItem('zzu_user', JSON.stringify(next));
        return { user: next };
    }),
    setConfig: (c) => set({ config: c }),
}));
