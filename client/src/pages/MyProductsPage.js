import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Trash2, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { formatPrice, timeAgo, campusColor } from '../lib/utils';
export default function MyProductsPage() {
    const me = useApp((s) => s.user);
    const token = useApp((s) => s.token);
    const nav = useNavigate();
    const [tab, setTab] = useState('selling');
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [toast, setToast] = useState('');
    useEffect(() => {
        if (!token)
            return nav('/login?from=%2Fme%2Fproducts');
        reload();
    }, [token, tab]); // eslint-disable-line
    async function reload() {
        const statusMap = { selling: 1, sold: 2, offline: 3 };
        const r = await api(`/api/products?user_id=${me?.id}&size=50&_status=${tab}`);
        if (r.code === 0) {
            // 前端按status二次过滤（后端没有status查询参数时）
            const all = r.data.list || [];
            const s = statusMap[tab];
            const filtered = all.filter(x => x.status === undefined || x.status === s);
            setList(filtered);
            setTotal(r.data.total || 0);
        }
    }
    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 1800);
    }
    async function setStatus(id, status, msg) {
        if (!confirm(msg))
            return;
        const r = await api(`/api/products/${id}`, { method: 'PUT', data: { status } });
        if (r.code === 0) {
            reload();
            showToast('操作成功');
        }
        else
            showToast(r.msg);
    }
    const tabs = [
        { k: 'selling', label: '在售中', icon: Tag },
        { k: 'sold', label: '已卖出', icon: CheckCircle2 },
        { k: 'offline', label: '已下架', icon: Trash2 },
    ];
    return (_jsxs("div", { className: "max-w-xl mx-auto pb-10 bg-white min-h-screen", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3", children: [_jsx(Link, { to: "/me", className: "text-zinc-500 shrink-0", children: _jsx(ArrowLeft, { size: 20 }) }), _jsx("h1", { className: "text-base font-bold flex-1", children: "\u6211\u7684\u95F2\u7F6E" }), _jsx(Link, { to: "/publish", className: "btn-primary h-9 px-3 text-xs", children: "+ \u53D1\u5E03\u65B0\u5546\u54C1" })] }), _jsx("div", { className: "grid grid-cols-3 border-b border-zinc-100", children: tabs.map(t => (_jsxs("button", { onClick: () => setTab(t.k), className: `flex items-center justify-center gap-1 h-11 text-sm transition ${tab === t.k ? 'tab-active' : 'text-zinc-500'}`, children: [_jsx(t.icon, { size: 14 }), " ", t.label] }, t.k))) }), _jsxs("main", { className: "px-4 pt-3 space-y-2.5", children: [!list.length && (_jsxs("div", { className: "py-20 text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: tab === 'selling' ? '🛍' : tab === 'sold' ? '🎉' : '🗑' }), _jsx("div", { className: "text-sm text-zinc-500", children: tab === 'selling' ? '还没有在售商品，快去发布第一件吧～' : tab === 'sold' ? '还没有成交的商品，加油！' : '没有下架的商品' }), tab === 'selling' && _jsx(Link, { to: "/publish", className: "btn-primary mt-4 px-5 h-10 text-xs inline-flex", children: "+ \u53D1\u5E03\u95F2\u7F6E" })] })), list.map((p, i) => (_jsxs("div", { className: "card flex gap-3 p-3", children: [_jsx(Link, { to: `/product/${p.id}`, className: "w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-50", children: _jsx("img", { src: p.cover || `https://dummyimage.com/200x200/eee/666&text=ZZU`, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx(Link, { to: `/product/${p.id}`, children: _jsx("h3", { className: "text-sm font-medium text-zinc-800 line-clamp-2 leading-snug", children: p.title }) }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1.5 flex-wrap", children: [_jsx("span", { className: "text-red-500 font-bold text-sm", children: formatPrice(p.price) }), _jsx("span", { className: `chip ${campusColor(p.campus || '')} !text-[10px] !py-0`, children: p.campus }), _jsx("span", { className: "chip !text-[10px] !py-0 bg-zinc-100 text-zinc-600", children: p.condition })] }), _jsxs("div", { className: "text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5", children: [timeAgo(p.created_at), _jsxs("span", { children: ["\u00B7 \u6D4F\u89C8 ", p.view_count || 0] }), _jsxs("span", { children: ["\u00B7 \u60F3\u6536 ", p.fav_count || 0] })] })] }), tab === 'selling' && (_jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx("button", { onClick: () => setStatus(p.id, 2, '确定标记为"已卖出"吗？'), className: "btn-primary h-7 flex-1 text-[11px]", children: "\u2713 \u5DF2\u5356\u51FA" }), _jsx("button", { onClick: () => setStatus(p.id, 3, '确定下架这件商品吗？'), className: "btn-outline h-7 flex-1 text-[11px] text-zinc-600", children: "\u4E0B\u67B6" })] })), tab === 'offline' && (_jsx("button", { onClick: () => setStatus(p.id, 1, '确定重新上架吗？'), className: "btn-primary h-7 w-full text-[11px] mt-1", children: "\u2191 \u91CD\u65B0\u4E0A\u67B6" }))] })] }, p.id || i)))] }), toast && (_jsx("div", { className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl", children: toast }))] }));
}
