import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { useApp } from '../store/app';
import { api } from '../lib/http';
import ProductCard from '../components/ProductCard';
export default function ProductListPage() {
    const [params, setParams] = useSearchParams();
    const cfg = useApp((s) => s.config);
    const [kw, setKw] = useState(params.get('keyword') || '');
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const initialFilter = {
        category_id: params.get('category_id') || '',
        campus: params.get('campus') || '',
        condition: '',
        min_price: '',
        max_price: '',
        course_name: params.get('course_name') || '',
    };
    const [filter, setFilter] = useState(initialFilter);
    const [draft, setDraft] = useState(initialFilter);
    useEffect(() => {
        setPage(1);
    }, [params.toString()]); // eslint-disable-line
    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams();
        q.set('page', String(page));
        q.set('size', '20');
        if (kw)
            q.set('keyword', kw);
        Object.entries(filter).forEach(([k, v]) => { if (v)
            q.set(k, String(v)); });
        api(`/api/products?${q.toString()}`)
            .then(r => { if (r.code === 0) {
            setList(r.data.list);
            setTotal(r.data.total);
        } })
            .finally(() => setLoading(false));
    }, [page, kw, JSON.stringify(filter)]); // eslint-disable-line
    const activeCat = cfg?.categories.find(c => String(c.id) === filter.category_id);
    function apply() {
        setFilter(draft);
        setShowFilter(false);
    }
    function reset() {
        const d = { category_id: '', campus: '', condition: '', min_price: '', max_price: '', course_name: '' };
        setDraft(d);
        setFilter(d);
        setShowFilter(false);
    }
    return (_jsxs("div", { className: "max-w-xl mx-auto", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100", children: [_jsxs("div", { className: "px-4 py-3 flex items-center gap-2", children: [_jsx(Link, { to: "/", className: "text-zinc-500 shrink-0", children: _jsx(X, { size: 20 }) }), _jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" }), _jsx("input", { className: "input pl-9 h-10", placeholder: "\u641C\u7D22\u4E8C\u624B\u5546\u54C1/\u6559\u6750/\u8BFE\u7A0B...", value: kw, onChange: (e) => setKw(e.target.value) })] }), _jsx("button", { onClick: () => setShowFilter(true), className: "btn-outline h-10 w-10 shrink-0", children: _jsx(SlidersHorizontal, { size: 16 }) })] }), _jsxs("div", { className: "px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar", children: [_jsxs("span", { className: `chip !h-7 shrink-0 ${activeCat ? '' : 'chip-brand'}`, children: [_jsx(Filter, { size: 11 }), " \u5168\u90E8"] }), activeCat && _jsxs("span", { className: "chip chip-brand !h-7 shrink-0", children: [activeCat.icon, " ", activeCat.name] }), filter.campus && _jsxs("span", { className: "chip chip-brand !h-7 shrink-0", children: [_jsx(MapPin, { size: 11 }), " ", filter.campus] }), filter.condition && _jsx("span", { className: "chip chip-brand !h-7 shrink-0", children: filter.condition }), filter.course_name && _jsxs("span", { className: "chip chip-brand !h-7 shrink-0", children: ["\uD83D\uDCDA ", filter.course_name] })] })] }), _jsxs("div", { className: "px-4 pt-3 text-xs text-zinc-500 flex items-center justify-between", children: [_jsxs("span", { children: ["\u5171\u627E\u5230 ", _jsx("b", { className: "text-zinc-800", children: total }), " \u4EF6\u5546\u54C1"] }), _jsx("span", { className: "text-brand", children: loading ? '加载中...' : '' })] }), _jsxs("main", { className: "px-4 pt-2 pb-6", children: [_jsx("div", { className: "grid grid-cols-2 gap-2.5", children: list.map(p => _jsx(ProductCard, { p: p }, p.id)) }), !loading && !list.length && (_jsxs("div", { className: "py-20 text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDED2" }), _jsx("div", { className: "text-sm text-zinc-500", children: "\u6CA1\u6709\u627E\u5230\u7B26\u5408\u6761\u4EF6\u7684\u5546\u54C1" }), _jsx(Link, { to: "/publish", className: "btn-primary mt-4 px-5 h-10 text-xs", children: "\u53BB\u53D1\u5E03\u7B2C\u4E00\u4EF6" })] })), list.length && list.length >= 20 && (_jsx("button", { className: "btn-outline w-full mt-4 h-10 text-xs", onClick: () => setPage(p => p + 1), disabled: loading, children: "\u52A0\u8F7D\u66F4\u591A" }))] }), showFilter && (_jsxs("div", { className: "fixed inset-0 z-50", onClick: () => setShowFilter(false), children: [_jsx("div", { className: "absolute inset-0 bg-black/40" }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-w-xl mx-auto max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-base font-bold", children: "\u7B5B\u9009\u6761\u4EF6" }), _jsx("button", { onClick: () => setShowFilter(false), className: "text-zinc-400", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "space-y-4 text-sm", children: [_jsx(Section, { title: "\u5206\u7C7B", children: _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [_jsx(Chip, { active: !draft.category_id, onClick: () => setDraft(d => ({ ...d, category_id: '' })), children: "\u5168\u90E8" }), cfg?.categories.map(c => (_jsxs(Chip, { active: draft.category_id === String(c.id), onClick: () => setDraft(d => ({ ...d, category_id: String(c.id) })), children: [c.icon, " ", c.name] }, c.id)))] }) }), _jsx(Section, { title: "\u6821\u533A", children: _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [_jsx(Chip, { active: !draft.campus, onClick: () => setDraft(d => ({ ...d, campus: '' })), children: "\u5168\u90E8" }), cfg?.campus_list.map(c => (_jsx(Chip, { active: draft.campus === c, onClick: () => setDraft(d => ({ ...d, campus: c })), children: c }, c)))] }) }), _jsx(Section, { title: "\u6210\u8272", children: _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [_jsx(Chip, { active: !draft.condition, onClick: () => setDraft(d => ({ ...d, condition: '' })), children: "\u4E0D\u9650" }), cfg?.condition_list.map(c => (_jsx(Chip, { active: draft.condition === c, onClick: () => setDraft(d => ({ ...d, condition: c })), children: c }, c)))] }) }), _jsx(Section, { title: "\u4EF7\u683C\u533A\u95F4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { className: "input h-10 !text-center", placeholder: "\u6700\u4F4E", value: draft.min_price, onChange: e => setDraft(d => ({ ...d, min_price: e.target.value })) }), _jsx("span", { className: "text-zinc-400", children: "\u2014" }), _jsx("input", { className: "input h-10 !text-center", placeholder: "\u6700\u9AD8", value: draft.max_price, onChange: e => setDraft(d => ({ ...d, max_price: e.target.value })) })] }) }), _jsx(Section, { title: "\u8BFE\u7A0B\u540D\uFF08\u7CBE\u51C6\u5339\u914D\u6559\u6750\uFF09", children: _jsx("input", { className: "input h-10", placeholder: "\u5982\uFF1A\u9AD8\u7B49\u6570\u5B66\u3001\u6570\u636E\u7ED3\u6784", value: draft.course_name, onChange: e => setDraft(d => ({ ...d, course_name: e.target.value })) }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mt-6 pt-2 border-t border-zinc-100", children: [_jsx("button", { className: "btn-outline h-11 text-sm", onClick: reset, children: "\u91CD\u7F6E" }), _jsx("button", { className: "btn-primary h-11 text-sm", onClick: apply, children: "\u5E94\u7528\u7B5B\u9009" })] })] })] }))] }));
}
function Section({ title, children }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-zinc-700 mb-2", children: title }), children] }));
}
function Chip({ active, onClick, children }) {
    return (_jsx("button", { onClick: onClick, className: `px-3 h-7 rounded-full text-xs transition ${active ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-700'}`, children: children }));
}
