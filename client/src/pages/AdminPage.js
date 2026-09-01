import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/app';
import { api } from '../lib/http';
import { timeAgo, formatPrice } from '../lib/utils';
import ZZULogo from '../components/ZZULogo';
import { BarChart3, Package, Users, Megaphone, AlertTriangle, MessageCircle, Eye, XCircle, CheckCircle2, PencilLine, Ban, Search, ChevronLeft, ChevronRight, Crown, LogOut, TrendingUp, Shield, RotateCcw, } from 'lucide-react';
export default function AdminPage() {
    const nav = useNavigate();
    const user = useApp((s) => s.user);
    const logout = useApp((s) => s.logout);
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    useEffect(() => {
        if (user && user.role !== 'admin') {
            nav('/');
            return;
        }
        api('/api/admin/stats').then(r => r.code === 0 && setStats(r.data));
    }, [user, nav]);
    if (user?.role !== 'admin') {
        return (_jsx("div", { className: "h-full flex items-center justify-center text-zinc-500 text-sm", children: "\u65E0\u6743\u9650\uFF0C\u4EC5\u7BA1\u7406\u5458\u53EF\u8BBF\u95EE\u3002\u6B63\u5728\u8DF3\u8F6C..." }));
    }
    const tabs = [
        { key: 'overview', label: '数据看板', icon: BarChart3 },
        { key: 'products', label: '商品管理', icon: Package },
        { key: 'users', label: '用户管理', icon: Users },
        { key: 'wanted', label: '求购管理', icon: Megaphone },
        { key: 'reports', label: '举报处理', icon: AlertTriangle },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-zinc-50 text-zinc-800", children: [_jsxs("header", { className: "sticky top-0 z-30 bg-gradient-to-r from-brand via-[#7B46AA] to-brand-dark text-white shadow-md", children: [_jsxs("div", { className: "max-w-7xl mx-auto px-4 py-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ZZULogo, { size: 36, withText: true, className: "!text-white [&_div_div]:text-white [&_div_div:last-child]:text-white/70" }), _jsxs("span", { className: "ml-2 px-2.5 py-1 rounded-full text-[10px] bg-white/20 backdrop-blur", children: [_jsx(Crown, { size: 12, className: "inline -mt-0.5 mr-1" }), "\u7BA1\u7406\u540E\u53F0"] })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsxs("span", { className: "hidden sm:inline opacity-90", children: ["\u6B22\u8FCE\uFF0C", user?.nickname || '管理员'] }), _jsxs("button", { onClick: () => { logout(); nav('/'); }, className: "flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition", children: [_jsx(LogOut, { size: 14 }), " \u9000\u51FA"] })] })] }), _jsx("nav", { className: "max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar", children: tabs.map(t => (_jsxs("button", { onClick: () => setTab(t.key), className: `flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition ${tab === t.key
                                ? 'border-gold text-white font-semibold bg-white/10'
                                : 'border-transparent text-white/70 hover:text-white'}`, children: [_jsx(t.icon, { size: 16 }), " ", t.label, t.key === 'reports' && stats?.summary?.reportsPending > 0 && (_jsx("span", { className: "ml-0.5 min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 flex items-center justify-center", children: stats.summary.reportsPending }))] }, t.key))) })] }), _jsxs("main", { className: "max-w-7xl mx-auto p-4 md:p-6", children: [tab === 'overview' && _jsx(OverviewTab, { stats: stats, onJump: setTab }), tab === 'products' && _jsx(ProductsAdmin, {}), tab === 'users' && _jsx(UsersAdmin, {}), tab === 'wanted' && _jsx(WantedAdmin, {}), tab === 'reports' && _jsx(ReportsAdmin, {})] })] }));
}
/* ================== Tab 1：数据看板 ================== */
function OverviewTab({ stats, onJump }) {
    const s = stats?.summary || {};
    const trend = stats?.weekTrend || [];
    const cards = [
        { label: '用户总数', value: s.users || 0, sub: `今日新增 ${s.usersNew || 0}`, icon: Users, color: 'from-brand to-[#8B4FBD]', action: () => onJump('users') },
        { label: '认证学生', value: s.verifiedUsers || 0, sub: '已通过校园认证', icon: Shield, color: 'from-gold to-[#E6C07A]', action: () => onJump('users') },
        { label: '商品总数', value: s.products || 0, sub: `在售 ${s.productsActive} / 已售 ${s.productsSold}`, icon: Package, color: 'from-[#4A56B0] to-[#6A3A91]', action: () => onJump('products') },
        { label: '求购信息', value: s.wanted || 0, sub: `在求 ${s.wantedActive} 条`, icon: Megaphone, color: 'from-[#07C160] to-[#3ED88E]', action: () => onJump('wanted') },
        { label: '消息总量', value: s.messages || 0, sub: `会话数 ${s.chats}`, icon: MessageCircle, color: 'from-[#F09E3C] to-[#F4B86A]', action: () => onJump('reports') },
        { label: '举报待处理', value: s.reportsPending || 0, sub: `累计举报 ${s.reports}`, icon: AlertTriangle, color: 'from-[#E05A5A] to-[#F28E8E]', action: () => onJump('reports'), warn: (s.reportsPending || 0) > 0 },
        { label: '收藏行为', value: s.favorites || 0, sub: '用户累计收藏次数', icon: TrendingUp, color: 'from-[#8B4FBD] to-[#C9A658]', action: () => onJump('products') },
        { label: '成交 GMV 估算', value: `¥ ${Number(s.gmv || 0).toFixed(0)}`, sub: '所有标记为已售的商品总价', icon: Crown, color: 'from-[#C9A658] to-[#6A3A91]', action: () => onJump('products') },
    ];
    const max = Math.max(1, ...trend.map((d) => Math.max(d.users, d.products, d.wanted)));
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4", children: cards.map(c => (_jsxs("button", { onClick: c.action, className: `text-left card p-5 hover:shadow-lg transition group ${c.warn ? 'ring-2 ring-red-300 animate-pulse' : ''}`, children: [_jsx("div", { className: `inline-flex w-10 h-10 rounded-xl text-white items-center justify-center bg-gradient-to-br ${c.color} shadow-md mb-3 group-hover:scale-105 transition`, children: _jsx(c.icon, { size: 18 }) }), _jsx("div", { className: "text-xs text-zinc-500", children: c.label }), _jsx("div", { className: "mt-1 text-2xl font-bold text-zinc-900", children: c.value }), _jsx("div", { className: "mt-1 text-[11px] text-zinc-400", children: c.sub })] }, c.label))) }), _jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-base font-bold text-zinc-900", children: "\u8FD1 7 \u5929\u6570\u636E\u8D8B\u52BF" }), _jsx("div", { className: "text-xs text-zinc-500 mt-0.5", children: "\u7528\u6237\u6CE8\u518C / \u5546\u54C1\u53D1\u5E03 / \u6C42\u8D2D\u53D1\u5E03 \u6BCF\u65E5\u6570\u91CF" })] }), _jsxs("div", { className: "flex gap-3 text-[11px]", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-3 h-3 rounded bg-brand" }), " \u65B0\u589E\u7528\u6237"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-3 h-3 rounded bg-gold-dark" }), " \u65B0\u589E\u5546\u54C1"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-3 h-3 rounded bg-[#07C160]" }), " \u65B0\u589E\u6C42\u8D2D"] })] })] }), _jsx("div", { className: "flex items-end justify-between gap-3 h-52 border-b border-l border-zinc-100 px-2 pb-2", children: trend.map((d) => (_jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [_jsxs("div", { className: "w-full flex items-end gap-1 justify-center h-44", children: [_jsx("div", { className: "w-1/3 rounded-t bg-brand transition-all hover:opacity-80", style: { height: `${(d.users / max) * 100}%`, minHeight: d.users > 0 ? '3px' : 0 }, title: `新增用户: ${d.users}` }), _jsx("div", { className: "w-1/3 rounded-t bg-gold-dark transition-all hover:opacity-80", style: { height: `${(d.products / max) * 100}%`, minHeight: d.products > 0 ? '3px' : 0 }, title: `新增商品: ${d.products}` }), _jsx("div", { className: "w-1/3 rounded-t bg-[#07C160] transition-all hover:opacity-80", style: { height: `${(d.wanted / max) * 100}%`, minHeight: d.wanted > 0 ? '3px' : 0 }, title: `新增求购: ${d.wanted}` })] }), _jsx("div", { className: "text-[11px] text-zinc-500", children: d.day })] }, d.day))) })] })] }));
}
/* ================== 通用列表分页 Hook ================== */
function useList(fetchFn, deps = []) {
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [total, setTotal] = useState(0);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState({});
    async function load(q, p) {
        const params = { ...query, ...q };
        if (p)
            setPage(p);
        setQuery(params);
        setLoading(true);
        try {
            const r = await fetchFn({ ...params, page: p || page, size });
            if (r.code === 0) {
                setList(r.data.list || []);
                setTotal(r.data.total || 0);
            }
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, [...deps]); // eslint-disable-line
    return { list, total, page, size, setPage, load, loading, query, setQuery };
}
/* ================== Tab 2：商品管理 ================== */
function ProductsAdmin() {
    const { list, total, page, size, setPage, load, loading } = useList((q) => api(`/api/admin/products?${new URLSearchParams(q).toString()}`));
    const [kw, setKw] = useState('');
    const [status, setStatus] = useState('all');
    function search() { load({ keyword: kw, status }, 1); }
    async function action(id, act) {
        if (!confirm(`确认操作：${act}？`))
            return;
        const r = await api(`/api/admin/products/${id}`, { method: 'PUT', data: { action: act } });
        if (r.code === 0) {
            load();
        }
        else
            alert(r.msg);
    }
    const statusMap = { 0: '已下架', 1: '在售', 2: '已售', 3: '已删除' };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "card p-4 flex flex-wrap gap-2 items-center", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-[240px]", children: [_jsx(Search, { size: 16, className: "text-zinc-400" }), _jsx("input", { value: kw, onChange: e => setKw(e.target.value), onKeyDown: e => e.key === 'Enter' && search(), placeholder: "\u641C\u7D22\u5546\u54C1\u6807\u9898 / \u5546\u54C1ID", className: "input !py-2" })] }), _jsxs("select", { value: status, onChange: e => { setStatus(e.target.value); load({ status: e.target.value }, 1); }, className: "input !py-2 !w-auto", children: [_jsx("option", { value: "all", children: "\u5168\u90E8\u72B6\u6001" }), _jsx("option", { value: "1", children: "\u5728\u552E" }), _jsx("option", { value: "0", children: "\u5DF2\u4E0B\u67B6" }), _jsx("option", { value: "2", children: "\u5DF2\u552E" }), _jsx("option", { value: "3", children: "\u5DF2\u5220\u9664" })] }), _jsx("button", { onClick: search, className: "btn-primary px-5 h-10", children: "\u641C\u7D22" })] }), _jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wider", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-3", children: "ID" }), _jsx("th", { className: "text-left p-3", children: "\u5C01\u9762" }), _jsx("th", { className: "text-left p-3", children: "\u6807\u9898" }), _jsx("th", { className: "text-left p-3", children: "\u5356\u5BB6" }), _jsx("th", { className: "text-left p-3", children: "\u4EF7\u683C" }), _jsx("th", { className: "text-left p-3", children: "\u6821\u533A" }), _jsx("th", { className: "text-left p-3", children: "\u72B6\u6001" }), _jsx("th", { className: "text-left p-3", children: "\u53D1\u5E03\u65F6\u95F4" }), _jsx("th", { className: "text-left p-3 w-60", children: "\u64CD\u4F5C" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 9, className: "p-6 text-center text-zinc-400", children: "\u52A0\u8F7D\u4E2D..." }) }), !loading && list.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 9, className: "p-6 text-center text-zinc-400", children: "\u6682\u65E0\u6570\u636E" }) }), list.map((p) => (_jsxs("tr", { className: "border-t border-zinc-100 hover:bg-zinc-50", children: [_jsxs("td", { className: "p-3 text-zinc-500", children: ["#", p.id] }), _jsx("td", { className: "p-3", children: _jsx("img", { src: p.cover || '', alt: "", className: "w-12 h-12 rounded-lg object-cover bg-zinc-100" }) }), _jsx("td", { className: "p-3 max-w-[200px] truncate font-medium", children: p.title }), _jsx("td", { className: "p-3", children: p.seller_name || '-' }), _jsx("td", { className: "p-3 text-brand font-semibold", children: formatPrice(p.price) }), _jsx("td", { className: "p-3 text-zinc-500", children: p.campus || '-' }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `chip ${p.status === 1 ? 'chip-brand'
                                                            : p.status === 2 ? 'chip-gold'
                                                                : p.status === 3 ? '!bg-red-50 !text-red-600'
                                                                    : '!bg-zinc-200 !text-zinc-600'}`, children: statusMap[p.status] || '未知' }) }), _jsx("td", { className: "p-3 text-zinc-500 text-xs", children: timeAgo(p.created_at) }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [_jsxs("button", { onClick: () => window.open(`/product/${p.id}`, '_blank'), className: "chip hover:!bg-brand hover:!text-white transition inline-flex items-center gap-1", children: [_jsx(Eye, { size: 12 }), " \u67E5\u770B"] }), p.status === 1 && (_jsxs("button", { onClick: () => action(p.id, 'offline'), className: "chip hover:!bg-amber-100 hover:!text-amber-700 inline-flex items-center gap-1", children: [_jsx(XCircle, { size: 12 }), " \u4E0B\u67B6"] })), p.status === 0 && (_jsxs("button", { onClick: () => action(p.id, 'online'), className: "chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1", children: [_jsx(CheckCircle2, { size: 12 }), " \u6062\u590D"] })), _jsxs("button", { onClick: () => action(p.id, 'delete'), className: "chip !bg-red-50 !text-red-600 hover:!bg-red-100 inline-flex items-center gap-1", children: [_jsx(Ban, { size: 12 }), " \u5220\u9664"] })] }) })] }, p.id)))] })] }) }), _jsx(Pagination, { page: page, size: size, total: total, onChange: setPage })] })] }));
}
/* ================== Tab 3：用户管理 ================== */
function UsersAdmin() {
    const { list, total, page, size, setPage, load, loading } = useList((q) => api(`/api/admin/users?${new URLSearchParams(q).toString()}`));
    const [kw, setKw] = useState('');
    const [vf, setVf] = useState('all');
    function search() { load({ keyword: kw, verified: vf }, 1); }
    async function act(id, action, value) {
        const r = await api(`/api/admin/users/${id}`, {
            method: 'PUT',
            data: { action, ...(value !== undefined ? value : {}) }
        });
        if (r.code === 0)
            load();
        else
            alert(r.msg);
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "card p-4 flex flex-wrap gap-2 items-center", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-[240px]", children: [_jsx(Search, { size: 16, className: "text-zinc-400" }), _jsx("input", { value: kw, onChange: e => setKw(e.target.value), onKeyDown: e => e.key === 'Enter' && search(), placeholder: "\u641C\u7D22\u7528\u6237\u540D / \u6635\u79F0 / \u6821\u56ED\u90AE\u7BB1 / \u7528\u6237ID", className: "input !py-2" })] }), _jsxs("select", { value: vf, onChange: e => { setVf(e.target.value); load({ verified: e.target.value }, 1); }, className: "input !py-2 !w-auto", children: [_jsx("option", { value: "all", children: "\u5168\u90E8\u8BA4\u8BC1\u72B6\u6001" }), _jsx("option", { value: "0", children: "\u672A\u8BA4\u8BC1" }), _jsx("option", { value: "1", children: "\u5F85\u5BA1\u6838" }), _jsx("option", { value: "2", children: "\u5DF2\u8BA4\u8BC1" })] }), _jsx("button", { onClick: search, className: "btn-primary px-5 h-10", children: "\u641C\u7D22" })] }), _jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-zinc-50 text-zinc-600 text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-3", children: "ID" }), _jsx("th", { className: "text-left p-3", children: "\u7528\u6237" }), _jsx("th", { className: "text-left p-3", children: "\u6821\u56ED\u90AE\u7BB1" }), _jsx("th", { className: "text-left p-3", children: "\u6821\u533A/\u5BBF\u820D" }), _jsx("th", { className: "text-left p-3", children: "\u8BA4\u8BC1" }), _jsx("th", { className: "text-left p-3", children: "\u89D2\u8272" }), _jsx("th", { className: "text-left p-3", children: "\u6CE8\u518C\u65F6\u95F4" }), _jsx("th", { className: "text-left p-3 w-80", children: "\u64CD\u4F5C" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-6 text-center text-zinc-400", children: "\u52A0\u8F7D\u4E2D..." }) }), !loading && list.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-6 text-center text-zinc-400", children: "\u6682\u65E0\u6570\u636E" }) }), list.map((u) => (_jsxs("tr", { className: "border-t border-zinc-100 hover:bg-zinc-50", children: [_jsxs("td", { className: "p-3 text-zinc-500", children: ["#", u.id] }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand font-bold", children: (u.nickname || u.username).charAt(0) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: u.nickname || '-' }), _jsxs("div", { className: "text-xs text-zinc-500", children: ["@", u.username] })] })] }) }), _jsx("td", { className: "p-3 text-xs text-zinc-500", children: u.school_email || '-' }), _jsx("td", { className: "p-3 text-xs text-zinc-500", children: [u.campus, u.dormitory].filter(Boolean).join(' · ') || '-' }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `chip ${u.verified === 2 ? 'chip-gold'
                                                            : u.verified === 1 ? 'chip-brand'
                                                                : ''}`, children: u.verified === 2 ? '✓ 已认证' : u.verified === 1 ? '审核中' : '未认证' }) }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `chip ${u.role === 'admin' ? 'zzu-badge-gold'
                                                            : u.role === 'banned' ? '!bg-red-50 !text-red-600'
                                                                : ''}`, children: u.role === 'admin' ? '管理员' : u.role === 'banned' ? '已封禁' : '普通用户' }) }), _jsx("td", { className: "p-3 text-xs text-zinc-500", children: timeAgo(u.created_at) }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [u.verified === 1 && (_jsxs("button", { onClick: () => act(u.id, 'none', { verified: 2 }), className: "chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1", children: [_jsx(CheckCircle2, { size: 12 }), " \u901A\u8FC7\u8BA4\u8BC1"] })), u.verified !== 2 && (_jsxs("button", { onClick: () => act(u.id, 'none', { verified: 2 }), className: "chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1", children: [_jsx(Shield, { size: 12 }), " \u6807\u8BB0\u8BA4\u8BC1"] })), u.role !== 'admin' ? (_jsxs("button", { onClick: () => act(u.id, 'none', { role: 'admin' }), className: "chip chip-gold inline-flex items-center gap-1", children: [_jsx(Crown, { size: 12 }), " \u5347\u4E3A\u7BA1\u7406\u5458"] })) : (_jsxs("button", { onClick: () => act(u.id, 'none', { role: 'user' }), className: "chip hover:!bg-zinc-200 inline-flex items-center gap-1", children: [_jsx(RotateCcw, { size: 12 }), " \u964D\u4E3A\u666E\u901A"] })), u.role !== 'banned' ? (_jsxs("button", { onClick: () => act(u.id, 'ban'), className: "chip !bg-red-50 !text-red-600 hover:!bg-red-100 inline-flex items-center gap-1", children: [_jsx(Ban, { size: 12 }), " \u5C01\u7981"] })) : (_jsxs("button", { onClick: () => act(u.id, 'unban'), className: "chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1", children: [_jsx(CheckCircle2, { size: 12 }), " \u89E3\u5C01"] }))] }) })] }, u.id)))] })] }) }), _jsx(Pagination, { page: page, size: size, total: total, onChange: setPage })] })] }));
}
/* ================== Tab 4：求购管理 ================== */
function WantedAdmin() {
    const { list, total, page, size, setPage, load, loading } = useList((q) => api(`/api/admin/wanted?${new URLSearchParams(q).toString()}`));
    const [kw, setKw] = useState('');
    const [st, setSt] = useState('all');
    function search() { load({ keyword: kw, status: st }, 1); }
    async function act(id, action) {
        const r = await api(`/api/admin/wanted/${id}`, { method: 'PUT', data: { action } });
        if (r.code === 0)
            load();
        else
            alert(r.msg);
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "card p-4 flex flex-wrap gap-2 items-center", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-[240px]", children: [_jsx(Search, { size: 16, className: "text-zinc-400" }), _jsx("input", { value: kw, onChange: e => setKw(e.target.value), onKeyDown: e => e.key === 'Enter' && search(), placeholder: "\u641C\u7D22\u6807\u9898 / \u63CF\u8FF0", className: "input !py-2" })] }), _jsxs("select", { value: st, onChange: e => { setSt(e.target.value); load({ status: e.target.value }, 1); }, className: "input !py-2 !w-auto", children: [_jsx("option", { value: "all", children: "\u5168\u90E8" }), _jsx("option", { value: "1", children: "\u663E\u793A\u4E2D" }), _jsx("option", { value: "0", children: "\u5DF2\u4E0B\u67B6" }), _jsx("option", { value: "2", children: "\u5DF2\u5220\u9664" })] }), _jsx("button", { onClick: search, className: "btn-primary px-5 h-10", children: "\u641C\u7D22" })] }), _jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-zinc-50 text-zinc-600 text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-3", children: "ID" }), _jsx("th", { className: "text-left p-3", children: "\u6807\u9898" }), _jsx("th", { className: "text-left p-3", children: "\u4EF7\u683C" }), _jsx("th", { className: "text-left p-3", children: "\u53D1\u5E03\u4EBA" }), _jsx("th", { className: "text-left p-3", children: "\u8054\u7CFB\u65B9\u5F0F" }), _jsx("th", { className: "text-left p-3", children: "\u72B6\u6001" }), _jsx("th", { className: "text-left p-3", children: "\u53D1\u5E03\u65F6\u95F4" }), _jsx("th", { className: "text-left p-3 w-40", children: "\u64CD\u4F5C" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-6 text-center text-zinc-400", children: "\u52A0\u8F7D\u4E2D..." }) }), !loading && list.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-6 text-center text-zinc-400", children: "\u6682\u65E0\u6570\u636E" }) }), list.map((w) => (_jsxs("tr", { className: "border-t border-zinc-100 hover:bg-zinc-50", children: [_jsxs("td", { className: "p-3 text-zinc-500", children: ["#", w.id] }), _jsx("td", { className: "p-3 max-w-[280px] font-medium", children: w.title }), _jsx("td", { className: "p-3 text-brand font-semibold", children: formatPrice(w.price) }), _jsxs("td", { className: "p-3", children: ["ID ", w.user_id] }), _jsx("td", { className: "p-3 text-zinc-500 text-xs", children: w.contact || '-' }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `chip ${w.status === 1 ? 'chip-brand' : w.status === 2 ? '!bg-red-50 !text-red-600' : ''}`, children: w.status === 1 ? '显示' : w.status === 0 ? '下架' : '删除' }) }), _jsx("td", { className: "p-3 text-xs text-zinc-500", children: timeAgo(w.created_at) }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [w.status === 1 && (_jsxs("button", { onClick: () => act(w.id, 'offline'), className: "chip hover:!bg-amber-100 hover:!text-amber-700 inline-flex items-center gap-1", children: [_jsx(XCircle, { size: 12 }), " \u4E0B\u67B6"] })), _jsxs("button", { onClick: () => act(w.id, 'delete'), className: "chip !bg-red-50 !text-red-600 hover:!bg-red-100 inline-flex items-center gap-1", children: [_jsx(Ban, { size: 12 }), " \u5220\u9664"] })] }) })] }, w.id)))] })] }) }), _jsx(Pagination, { page: page, size: size, total: total, onChange: setPage })] })] }));
}
/* ================== Tab 5：举报处理 ================== */
function ReportsAdmin() {
    const { list, total, page, size, setPage, load, loading } = useList((q) => api(`/api/admin/reports?${new URLSearchParams(q).toString()}`));
    const [hd, setHd] = useState('all');
    async function done(id) {
        const r = await api(`/api/admin/reports/${id}`, { method: 'PUT' });
        if (r.code === 0)
            load();
        else
            alert(r.msg);
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "card p-4 flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm text-zinc-500", children: "\u5904\u7406\u72B6\u6001\uFF1A" }), [
                        ['all', '全部'],
                        ['0', '待处理'],
                        ['1', '已处理'],
                    ].map(([v, t]) => (_jsx("button", { onClick: () => { setHd(v); load({ handled: v }, 1); }, className: `px-3 py-1.5 rounded-full text-xs border transition ${hd === v ? 'bg-brand text-white border-brand shadow-glow' : 'bg-white border-zinc-200 text-zinc-600 hover:border-brand'}`, children: t }, v)))] }), _jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-zinc-50 text-zinc-600 text-xs uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-3", children: "ID" }), _jsx("th", { className: "text-left p-3", children: "\u4E3E\u62A5\u7C7B\u578B" }), _jsx("th", { className: "text-left p-3", children: "\u5BF9\u8C61ID" }), _jsx("th", { className: "text-left p-3", children: "\u4E3E\u62A5\u7406\u7531" }), _jsx("th", { className: "text-left p-3", children: "\u4E3E\u62A5\u4EBAID" }), _jsx("th", { className: "text-left p-3", children: "\u72B6\u6001" }), _jsx("th", { className: "text-left p-3", children: "\u65F6\u95F4" }), _jsx("th", { className: "text-left p-3 w-52", children: "\u64CD\u4F5C" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-6 text-center text-zinc-400", children: "\u52A0\u8F7D\u4E2D..." }) }), !loading && list.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 8, className: "p-6 text-center text-zinc-400", children: "\u6682\u65E0\u4E3E\u62A5\uFF0C\u7EE7\u7EED\u52A0\u6CB9 \uD83C\uDF89" }) }), list.map((r) => (_jsxs("tr", { className: "border-t border-zinc-100 hover:bg-zinc-50", children: [_jsxs("td", { className: "p-3 text-zinc-500", children: ["#", r.id] }), _jsx("td", { className: "p-3", children: _jsx("span", { className: "chip", children: r.target_type === 'product' ? '📦 商品' : r.target_type === 'user' ? '👤 用户' : '💬 消息' }) }), _jsxs("td", { className: "p-3 text-brand", children: ["#", r.target_id] }), _jsx("td", { className: "p-3 max-w-[260px] text-zinc-700", children: r.reason }), _jsxs("td", { className: "p-3 text-zinc-500", children: ["#", r.reporter_id] }), _jsx("td", { className: "p-3", children: r.handled
                                                        ? _jsxs("span", { className: "chip chip-gold inline-flex items-center gap-1", children: [_jsx(CheckCircle2, { size: 12 }), " \u5DF2\u5904\u7406"] })
                                                        : _jsxs("span", { className: "chip !bg-red-50 !text-red-600 inline-flex items-center gap-1 animate-pulse", children: [_jsx(AlertTriangle, { size: 12 }), " \u5F85\u5904\u7406"] }) }), _jsx("td", { className: "p-3 text-xs text-zinc-500", children: timeAgo(r.created_at) }), _jsx("td", { className: "p-3", children: _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [_jsxs("button", { onClick: () => {
                                                                    if (r.target_type === 'product')
                                                                        window.open(`/product/${r.target_id}`, '_blank');
                                                                    else if (r.target_type === 'user')
                                                                        alert(`请在用户管理搜索用户ID：${r.target_id}`);
                                                                    else
                                                                        alert(`消息 ID：${r.target_id}`);
                                                                }, className: "chip hover:!bg-brand hover:!text-white inline-flex items-center gap-1", children: [_jsx(Eye, { size: 12 }), " \u67E5\u770B\u5BF9\u8C61"] }), !r.handled && (_jsxs("button", { onClick: () => done(r.id), className: "chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1", children: [_jsx(PencilLine, { size: 12 }), " \u6807\u8BB0\u5DF2\u5904\u7406"] }))] }) })] }, r.id)))] })] }) }), _jsx(Pagination, { page: page, size: size, total: total, onChange: setPage })] })] }));
}
/* ================== 分页组件 ================== */
function Pagination({ page, size, total, onChange }) {
    const pages = Math.max(1, Math.ceil(total / size));
    return (_jsxs("div", { className: "p-4 flex items-center justify-between border-t border-zinc-100 text-sm", children: [_jsxs("span", { className: "text-zinc-500 text-xs", children: ["\u5171 ", total, " \u6761 \u00B7 \u7B2C ", page, "/", pages, " \u9875"] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => onChange(Math.max(1, page - 1)), disabled: page <= 1, className: "inline-flex items-center w-9 h-9 rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50", children: _jsx(ChevronLeft, { size: 16 }) }), _jsx("button", { onClick: () => onChange(Math.min(pages, page + 1)), disabled: page >= pages, className: "inline-flex items-center w-9 h-9 rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50", children: _jsx(ChevronRight, { size: 16 }) })] })] }));
}
