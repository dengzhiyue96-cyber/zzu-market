import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { formatPrice, timeAgo, campusColor } from '../lib/utils';
export default function FavoritesPage() {
    const token = useApp((s) => s.token);
    const nav = useNavigate();
    const [list, setList] = useState([]);
    const [toast, setToast] = useState('');
    useEffect(() => {
        if (!token)
            nav('/login?from=%2Ffavorites');
        reload();
    }, [token]); // eslint-disable-line
    async function reload() {
        const r = await api('/api/favorites?size=50');
        if (r.code === 0)
            setList(r.data.list || []);
    }
    async function unFav(id, fav_id) {
        const r = await api(`/api/products/${id}/fav`, { method: 'POST' });
        if (r.code === 0) {
            setList(l => l.filter(x => x.fav_id !== fav_id));
            showToast('已取消收藏');
        }
        else
            showToast(r.msg);
    }
    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 1500);
    }
    return (_jsxs("div", { className: "max-w-xl mx-auto pb-10 bg-white min-h-screen", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3", children: [_jsx(Link, { to: "/me", className: "text-zinc-500 shrink-0", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("h1", { className: "text-base font-bold flex-1 flex items-center gap-1.5", children: [_jsx(Heart, { size: 18, className: "text-red-500", fill: "currentColor" }), " \u6211\u7684\u6536\u85CF"] })] }), _jsxs("main", { className: "px-4 pt-3 space-y-2.5", children: [!list.length && (_jsxs("div", { className: "py-24 text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDC94" }), _jsx("div", { className: "text-sm text-zinc-500", children: "\u8FD8\u6CA1\u6709\u6536\u85CF\u7684\u5546\u54C1" }), _jsx(Link, { to: "/", className: "btn-primary mt-4 px-5 h-10 text-xs inline-flex", children: "\u53BB\u901B\u901B" })] })), list.map((p) => (_jsxs("div", { className: "card flex gap-3 p-3 active:bg-zinc-50", children: [_jsx(Link, { to: `/product/${p.product_id || p.id}`, className: "w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-50", children: _jsx("img", { src: p.cover || `https://dummyimage.com/200x200/eee/666&text=ZZU`, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0 flex flex-col justify-between", children: [_jsx(Link, { to: `/product/${p.product_id || p.id}`, children: _jsx("h3", { className: "text-sm font-medium text-zinc-800 line-clamp-2 leading-snug", children: p.title }) }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1.5 flex-wrap", children: [_jsx("span", { className: "text-red-500 font-bold text-sm", children: formatPrice(p.price) }), _jsx("span", { className: `chip ${campusColor(p.campus || p.seller_campus || '')} !text-[10px] !py-0`, children: p.campus || p.seller_campus || '主校区' })] }), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsxs("span", { className: "text-[11px] text-zinc-400", children: [timeAgo(p.fav_time || p.created_at), " \u6536\u85CF \u00B7 by ", p.seller_name || '同学'] }), _jsxs("button", { onClick: () => unFav(p.product_id || p.id, p.fav_id), className: "chip !text-[10px] !py-0.5 !bg-red-50 !text-red-500", children: [_jsx(Heart, { size: 10, className: "inline mr-0.5", fill: "currentColor" }), " \u53D6\u6D88"] })] })] })] }, p.fav_id)))] }), toast && (_jsx("div", { className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl", children: toast }))] }));
}
