import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronRight, Package, ShoppingCart } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { formatPrice, placeholder, timeAgo, campusColor } from '../lib/utils';
export default function ChatsPage() {
    const token = useApp((s) => s.token);
    const nav = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!token)
            nav('/login?from=%2Fchats');
    }, [token, nav]);
    async function reload() {
        setLoading(true);
        const r = await api('/api/chats');
        setLoading(false);
        if (r.code === 0)
            setList(r.data || []);
    }
    useEffect(() => { if (token)
        reload(); }, [token]);
    return (_jsxs("div", { className: "max-w-xl mx-auto pb-6", children: [_jsx("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3", children: _jsxs("h1", { className: "text-lg font-bold flex items-center gap-1.5", children: [_jsx(MessageCircle, { size: 20, className: "text-brand" }), "\u6D88\u606F", list.some(x => x.unread) && (_jsxs("span", { className: "chip !bg-red-100 !text-red-600 !py-0 ml-1", children: [list.reduce((s, x) => s + x.unread, 0), "\u6761\u672A\u8BFB"] }))] }) }), _jsxs("main", { className: "px-2 pt-2", children: [loading && (_jsx("div", { className: "py-20 text-center text-sm text-zinc-400 animate-pulse", children: "\u6D88\u606F\u52A0\u8F7D\u4E2D..." })), !loading && !list.length && (_jsxs("div", { className: "py-24 text-center", children: [_jsx("div", { className: "w-20 h-20 rounded-full bg-brand-soft mx-auto flex items-center justify-center", children: _jsx(MessageCircle, { size: 32, className: "text-brand/60" }) }), _jsx("div", { className: "mt-5 text-sm text-zinc-500", children: "\u8FD8\u6CA1\u6709\u804A\u5929\u6D88\u606F" }), _jsx("div", { className: "mt-1 text-xs text-zinc-400", children: "\u53BB\u6DD8\u4E00\u6DD8\u5FC3\u4EEA\u7684\u95F2\u7F6E\uFF0C\u8054\u7CFB\u5356\u5BB6\u5427\uFF5E" }), _jsx(Link, { to: "/", className: "btn-primary mt-5 px-5 h-10 text-xs inline-flex", children: "\u53BB\u901B\u95F2\u7F6E" })] })), _jsx("ul", { className: "space-y-0.5", children: list.map((c) => (_jsxs("li", { children: [_jsxs(Link, { to: `/chats/${c.id}`, className: "flex items-center gap-3 p-3 rounded-xl active:bg-zinc-50 transition", children: [_jsxs("div", { className: "relative shrink-0", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gradient-to-br from-brand to-indigo-400 text-white flex items-center justify-center font-bold", children: c.peer_name?.slice(-1) || '同' }), c.unread ? (_jsx("span", { className: "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center", children: c.unread > 99 ? '99+' : c.unread })) : null] }), _jsxs("div", { className: "flex-1 min-w-0 border-b border-zinc-50 pb-3 last:border-b-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: "font-bold text-sm truncate", children: c.peer_name }), _jsx("span", { className: "text-[11px] text-zinc-400 shrink-0", children: c.last_time ? timeAgo(c.last_time) : '' })] }), _jsx("div", { className: "mt-1 flex items-center justify-between gap-2", children: _jsx("span", { className: "text-xs text-zinc-500 truncate flex-1", children: c.last_message || '开始你们的第一次聊天吧 👋' }) })] }), _jsx(ChevronRight, { size: 16, className: "text-zinc-300 shrink-0" })] }), c.product_id && c.product_status !== 2 && (_jsxs(Link, { to: `/product/${c.product_id}`, className: "ml-[60px] mr-3 mb-3 mt-[-8px] rounded-lg bg-zinc-50 p-2 flex items-center gap-2 active:bg-zinc-100", children: [_jsx("div", { className: "w-10 h-10 rounded-md overflow-hidden bg-zinc-100 shrink-0", children: _jsx("img", { src: c.product_cover || placeholder(c.product_id, 80, 80, '🛍'), className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "text-xs text-zinc-700 truncate flex items-center gap-1.5", children: [_jsx(Package, { size: 11, className: "text-zinc-400 shrink-0" }), c.product_title] }), _jsxs("div", { className: "text-[11px] mt-0.5 flex items-center gap-2", children: [_jsx("span", { className: "text-red-500 font-bold", children: formatPrice(c.product_price) }), _jsx("span", { className: `chip ${campusColor(c.product_campus || '')} !text-[10px] !py-0`, children: c.product_campus || '' }), c.product_status === 2 && _jsx("span", { className: "chip !bg-zinc-200 !text-zinc-500 !text-[10px] !py-0", children: "\u5DF2\u552E\u51FA" })] })] }), _jsx(ShoppingCart, { size: 12, className: "text-zinc-400 shrink-0" })] }))] }, c.id))) })] })] }));
}
