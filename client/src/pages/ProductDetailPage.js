import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, MapPin, Shield, Phone, Handshake, Flag, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import ProductCard from '../components/ProductCard';
import { campusColor, formatPrice, placeholder, timeAgo, verifiedBadge } from '../lib/utils';
export default function ProductDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const token = useApp((s) => s.token);
    const me = useApp((s) => s.user);
    const [p, setP] = useState(null);
    const [imgIdx, setImgIdx] = useState(0);
    const [toast, setToast] = useState('');
    useEffect(() => {
        if (!id)
            return;
        api(`/api/products/${id}`).then(r => r.code === 0 ? setP(r.data) : (setToast(r.msg), setTimeout(() => setToast(''), 2000)));
    }, [id]);
    if (!p) {
        return (_jsxs("div", { className: "max-w-xl mx-auto p-4", children: [_jsxs(Link, { to: "/", className: "text-sm text-zinc-500 flex items-center gap-1", children: [_jsx(ArrowLeft, { size: 16 }), "\u8FD4\u56DE\u9996\u9875"] }), _jsx("div", { className: "py-20 text-center text-zinc-400 text-sm animate-pulse", children: "\u5546\u54C1\u52A0\u8F7D\u4E2D..." })] }));
    }
    const imgs = p.images ? JSON.parse(p.images) : [];
    const allImgs = [p.cover, ...imgs].filter(Boolean);
    if (!allImgs.length)
        allImgs.push(placeholder(p.id + 'p', 600, 600, p.category_icon || '🛍'));
    const vb = verifiedBadge(p.seller_verified);
    async function fav() {
        if (!token)
            return nav('/login?from=' + encodeURIComponent(location.pathname));
        const r = await api(`/api/products/${p.id}/fav`, { method: 'POST' });
        if (r.code === 0) {
            setP({ ...p, favored: r.data.favored, fav_count: p.fav_count + (r.data.favored ? 1 : -1) });
            showToast(r.data.favored ? '❤ 收藏成功' : '已取消收藏');
        }
    }
    async function startChat() {
        if (!token)
            return nav('/login?from=' + encodeURIComponent(location.pathname));
        if (me?.id === p.seller_id)
            return showToast('这是你自己发布的商品～');
        const r = await api('/api/chats/start', { method: 'POST', data: { product_id: p.id } });
        if (r.code === 0)
            nav(`/chats/${r.data.chat_id}`);
        else
            showToast(r.msg);
    }
    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 1800);
    }
    const isOwner = me?.id === p.seller_id;
    return (_jsxs("div", { className: "max-w-xl mx-auto pb-24 bg-white min-h-screen", children: [_jsxs("div", { className: "relative bg-zinc-50", children: [_jsx("div", { className: "aspect-square overflow-hidden", children: _jsx("img", { src: allImgs[imgIdx], alt: p.title, className: "w-full h-full object-cover" }) }), _jsx("button", { onClick: () => nav(-1), className: "absolute top-3 left-3 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("div", { className: "absolute top-3 right-3 flex gap-2", children: [_jsx("button", { onClick: fav, className: "w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center", children: _jsx(Heart, { size: 18, fill: p.favored ? 'currentColor' : 'none', className: p.favored ? 'text-red-400' : '' }) }), _jsx("button", { className: "w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center", children: _jsx(Flag, { size: 18 }) })] }), allImgs.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length), className: "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-zinc-600 flex items-center justify-center", children: _jsx(ChevronLeft, { size: 18 }) }), _jsx("button", { onClick: () => setImgIdx(i => (i + 1) % allImgs.length), className: "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-zinc-600 flex items-center justify-center", children: _jsx(ChevronRight, { size: 18 }) }), _jsx("div", { className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1", children: allImgs.map((_, i) => (_jsx("button", { onClick: () => setImgIdx(i), className: `h-1.5 rounded-full transition-all ${imgIdx === i ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}` }, i))) })] }))] }), _jsxs("div", { className: "px-4 pt-4", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "text-3xl font-black text-red-500 leading-none", children: formatPrice(p.price) }), p.original_price && _jsx("span", { className: "text-sm text-zinc-400 line-through", children: formatPrice(p.original_price) }), p.original_price && _jsxs("span", { className: "chip !bg-red-100 !text-red-600 !py-0", children: [Math.round((1 - p.price / p.original_price) * 100), "% OFF"] })] }), _jsx("h1", { className: "mt-2.5 text-base font-semibold text-zinc-900 leading-snug", children: p.title }), _jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5 text-xs", children: [p.course_name && _jsxs("span", { className: "chip chip-brand", children: ["\uD83D\uDCDA \u5339\u914D\u8BFE\u7A0B\uFF1A", p.course_name] }), p.book_name && _jsxs("span", { className: "chip !bg-emerald-100 !text-emerald-700", children: ["\uD83D\uDCD6 ", p.book_name] }), _jsxs("span", { className: `chip ${campusColor(p.campus)}`, children: [_jsx(MapPin, { size: 10, className: "inline -mt-0.5" }), " ", p.campus] }), _jsx("span", { className: "chip", children: p.condition }), _jsx("span", { className: "chip text-zinc-500", children: timeAgo(p.created_at) })] }), _jsxs("div", { className: "mt-3 grid grid-cols-3 border-t border-zinc-100 pt-3 text-center", children: [_jsx(Stat, { label: "\u6D4F\u89C8", value: p.view_count }), _jsx(Stat, { label: "\u60F3\u6536", value: p.fav_count }), _jsx(Stat, { label: "\u54A8\u8BE2", value: p.chat_count || 0 })] })] }), p.contact && (_jsxs("div", { className: "mx-4 mt-4 rounded-xl bg-orange-50 border border-orange-200 p-3.5 flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center shrink-0", children: _jsx(Phone, { size: 18 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-xs text-orange-600 font-medium", children: "\u8054\u7CFB\u65B9\u5F0F" }), _jsx("div", { className: "text-sm font-bold text-zinc-800 mt-0.5 select-all", children: p.contact })] }), _jsx("button", { onClick: () => { navigator.clipboard?.writeText(p.contact); setToast('联系方式已复制'); setTimeout(() => setToast(''), 1500); }, className: "btn-outline h-8 px-3 text-xs shrink-0", children: "\u590D\u5236" })] })), _jsxs("div", { className: "mx-4 mt-3 rounded-xl bg-brand-soft grid grid-cols-3 text-xs", children: [_jsx(Guar, { icon: _jsx(Shield, { size: 14 }), text: "\u6821\u5185\u8BA4\u8BC1" }), _jsx(Guar, { icon: _jsx(Phone, { size: 14 }), text: "\u76F4\u63A5\u8054\u7CFB" }), _jsx(Guar, { icon: _jsx(Handshake, { size: 14 }), text: "\u540C\u5B66\u4EA4\u6613" })] }), _jsxs("section", { className: "px-4 pt-5", children: [_jsx("h2", { className: "text-sm font-bold mb-2", children: "\u5546\u54C1\u63CF\u8FF0" }), _jsx("p", { className: "text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap", children: p.description || '卖家没有填写详细描述，点右下角「聊聊」问问TA吧～' })] }), _jsx("section", { className: "mx-4 mt-5 card p-3.5", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gradient-to-br from-brand to-indigo-500 text-white flex items-center justify-center text-lg font-bold shrink-0", children: p.seller_name?.slice(-2) || '同' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "font-bold truncate", children: p.seller_name }), _jsx("span", { className: `chip ${vb.cls} !py-0 !px-2`, children: vb.text })] }), _jsxs("div", { className: "text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5", children: [_jsx(Star, { size: 11, className: "text-amber-500", fill: "currentColor" }), _jsxs("span", { children: ["\u5B88\u4FE1\u5356\u5BB6 \u00B7 ", p.seller_campus || '主校区'] })] })] }), _jsx(Link, { to: `/list?user_id=${p.seller_id}`, className: "btn-outline h-8 px-3 text-xs", children: "TA\u7684\u95F2\u7F6E" })] }) }), p.related?.length ? (_jsxs("section", { className: "px-4 pt-6", children: [_jsx("h2", { className: "text-base font-bold mb-3", children: "\u76F8\u5173\u63A8\u8350" }), _jsx("div", { className: "grid grid-cols-2 gap-2.5", children: p.related.map((r) => _jsx(ProductCard, { p: r }, r.id)) })] })) : null, _jsx("div", { className: "h-16" }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-100 bg-white", children: _jsxs("div", { className: "max-w-xl mx-auto grid grid-cols-[auto,1fr,1fr] gap-2 p-3", children: [_jsxs("button", { onClick: fav, className: "btn-outline h-12 w-16 flex-col !py-1", children: [_jsx(Heart, { size: 16, fill: p.favored ? '#ef4444' : 'none', className: p.favored ? 'text-red-500' : '' }), _jsx("span", { className: "text-[10px]", children: p.fav_count || 0 })] }), _jsxs("button", { onClick: startChat, className: "btn-outline h-12 text-sm", children: [_jsx(MessageCircle, { size: 16 }), " \u804A\u804A"] }), isOwner ? (_jsx("button", { className: "btn-primary h-12 text-sm", onClick: () => nav('/me/products'), children: "\u7BA1\u7406\u6211\u7684\u5546\u54C1" })) : (_jsxs("button", { onClick: startChat, className: "btn-primary h-12 text-sm font-bold", children: ["\uD83D\uDCB0", p.price < 100 ? '我想要' : '联系卖家'] }))] }) }), toast && (_jsx("div", { className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl animate-fade", children: toast }))] }));
}
function Stat({ label, value }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "text-base font-bold text-zinc-800", children: value }), _jsx("div", { className: "text-[11px] text-zinc-500", children: label })] }));
}
function Guar({ icon, text }) {
    return (_jsxs("div", { className: "flex items-center justify-center gap-1 py-2.5 text-brand font-medium", children: [icon, text] }));
}
