import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { Home, Megaphone, Plus, MessageCircle, User } from 'lucide-react';
import { useApp } from '../store/app';
export default function NavBar() {
    const unread = useApp((s) => s.user?.stat?.unread_count || 0);
    const items = [
        { to: '/', icon: Home, label: '首页' },
        { to: '/wanted', icon: Megaphone, label: '求购' },
        { to: '/publish', icon: Plus, label: '发布', primary: true },
        { to: '/chats', icon: MessageCircle, label: '消息', badge: unread },
        { to: '/me', icon: User, label: '我的' },
    ];
    return (_jsx("nav", { className: "fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-100 bg-white/95 backdrop-blur", children: _jsx("ul", { className: "max-w-xl mx-auto grid grid-cols-5", children: items.map((it) => (_jsx("li", { children: _jsxs(NavLink, { to: it.to, end: it.to === '/', className: ({ isActive }) => `
                relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition
                ${it.primary
                        ? `-mt-4 mx-auto w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-brand/30 ${isActive ? 'bg-brand-dark' : ''}`
                        : isActive ? 'text-brand font-medium' : 'text-zinc-500'}
              `, children: [_jsx(it.icon, { size: it.primary ? 22 : 20, strokeWidth: 2.2 }), _jsx("span", { className: it.primary ? 'hidden' : '', children: it.label }), it.badge ? (_jsx("span", { className: "absolute top-1.5 right-[calc(50%-24px)] min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 text-white flex items-center justify-center font-bold", children: it.badge > 99 ? '99+' : it.badge })) : null] }) }, it.to))) }) }));
}
