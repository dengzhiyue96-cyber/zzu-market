import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Megaphone, Eye, ShoppingBag } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { campusColor, timeAgo } from '../lib/utils';
import ProductCard from '../components/ProductCard';
export default function WantedDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const me = useApp((s) => s.user);
    const [w, setW] = useState(null);
    const [related, setRelated] = useState([]);
    const [toast, setToast] = useState('');
    useEffect(() => {
        api(`/api/wanted/${id}`).then(r => r.code === 0 && setW(r.data));
        // 尝试搜相关商品（用标题关键词）
        if (w?.title) {
            api(`/api/products?keyword=${encodeURIComponent(w.title)}&size=4`)
                .then(r => r.code === 0 && setRelated(r.data.list));
        }
    }, [id]); // eslint-disable-line
    useEffect(() => {
        if (w?.title) {
            api(`/api/products?keyword=${encodeURIComponent(w.title)}&size=4`)
                .then(r => r.code === 0 && setRelated(r.data.list));
        }
    }, [w?.title]); // eslint-disable-line
    if (!w)
        return (_jsx("div", { className: "max-w-xl mx-auto min-h-screen bg-white flex items-center justify-center", children: _jsx("span", { className: "text-sm text-zinc-400 animate-pulse", children: "\u52A0\u8F7D\u4E2D..." }) }));
    const isOwner = me?.id === w.buyer_id;
    return (_jsxs("div", { className: "max-w-xl mx-auto min-h-screen bg-white", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3", children: [_jsx(Link, { to: "/wanted", className: "text-zinc-500 shrink-0", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("h1", { className: "text-base font-bold flex-1 flex items-center gap-1.5", children: [_jsx(Megaphone, { size: 18, className: "text-orange-500" }), " \u6C42\u8D2D\u8BE6\u60C5"] })] }), _jsxs("div", { className: "px-4 pt-4", children: [_jsx("h1", { className: "text-lg font-bold text-zinc-900 leading-snug", children: w.title }), w.expect_price != null && (_jsxs("div", { className: "mt-2 flex items-baseline gap-1.5", children: [_jsxs("span", { className: "text-2xl font-black text-orange-500", children: ["\u2264 ", w.expect_price] }), _jsx("span", { className: "text-sm text-zinc-400", children: "\u5143" })] })), _jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5 text-xs", children: [w.campus && _jsxs("span", { className: `chip ${campusColor(w.campus)}`, children: [_jsx(MapPin, { size: 10, className: "inline -mt-0.5" }), " ", w.campus] }), w.category_name && _jsxs("span", { className: "chip", children: [w.category_icon, " ", w.category_name] }), _jsx("span", { className: "chip text-zinc-500", children: timeAgo(w.created_at) }), _jsxs("span", { className: "chip text-zinc-500", children: [_jsx(Eye, { size: 10, className: "inline -mt-0.5" }), " ", w.view_count || 0] })] })] }), w.contact && (_jsxs("div", { className: "mx-4 mt-4 rounded-xl bg-orange-50 border border-orange-200 p-3.5 flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center shrink-0", children: _jsx(Phone, { size: 18 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-xs text-orange-600 font-medium", children: isOwner ? '你发布的联系方式' : '买家联系方式' }), _jsx("div", { className: "text-sm font-bold text-zinc-800 mt-0.5 select-all", children: w.contact })] }), _jsx("button", { onClick: () => { navigator.clipboard?.writeText(w.contact); setToast('联系方式已复制'); setTimeout(() => setToast(''), 1500); }, className: "btn-outline h-8 px-3 text-xs shrink-0", children: "\u590D\u5236" })] })), w.description && (_jsxs("section", { className: "px-4 pt-5", children: [_jsx("h2", { className: "text-sm font-bold mb-2", children: "\u8BE6\u7EC6\u9700\u6C42" }), _jsx("p", { className: "text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap", children: w.description })] })), _jsx("section", { className: "mx-4 mt-5 card p-3.5", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-lg font-bold shrink-0", children: w.buyer_name?.slice(-2) || '同' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "font-bold truncate", children: w.buyer_name }), w.buyer_verified === 2 && _jsx("span", { className: "chip chip-brand !py-0 !px-2 !text-[10px]", children: "\u5DF2\u8BA4\u8BC1" })] }), _jsx("div", { className: "text-xs text-zinc-500 mt-0.5", children: w.buyer_campus || '主校区' })] })] }) }), related.length > 0 && (_jsxs("section", { className: "px-4 pt-6", children: [_jsxs("h2", { className: "text-base font-bold mb-3 flex items-center gap-1.5", children: [_jsx(ShoppingBag, { size: 16, className: "text-brand" }), " \u76F8\u5173\u5728\u552E\u5546\u54C1"] }), _jsx("div", { className: "grid grid-cols-2 gap-2.5", children: related.map(p => _jsx(ProductCard, { p: p }, p.id)) })] })), _jsx("div", { className: "h-16" }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-100 bg-white", children: _jsx("div", { className: "max-w-xl mx-auto grid grid-cols-2 gap-2 p-3", children: isOwner ? (_jsx("button", { className: "btn-primary h-12 text-sm col-span-2", onClick: () => nav('/wanted'), children: "\u8FD4\u56DE\u6C42\u8D2D\u5217\u8868" })) : (_jsx(_Fragment, { children: _jsxs("button", { onClick: () => { navigator.clipboard?.writeText(w.contact); setToast('联系方式已复制'); setTimeout(() => setToast(''), 1500); }, className: "btn-primary h-12 text-sm font-bold col-span-2", children: [_jsx(Phone, { size: 16 }), " \u590D\u5236\u8054\u7CFB\u65B9\u5F0F\u8054\u7CFB\u4E70\u5BB6"] }) })) }) }), toast && (_jsx("div", { className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl", children: toast }))] }));
}
