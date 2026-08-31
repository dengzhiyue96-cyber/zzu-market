import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Megaphone, Plus, MapPin, X, AlertCircle } from 'lucide-react';
import { useApp } from '../store/app';
import { api } from '../lib/http';
import { campusColor, timeAgo } from '../lib/utils';
export default function WantedPage() {
    const cfg = useApp((s) => s.config);
    const token = useApp((s) => s.token);
    const me = useApp((s) => s.user);
    const nav = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kw, setKw] = useState('');
    const [campus, setCampus] = useState('');
    const [showForm, setShowForm] = useState(false);
    // 发布求购表单
    const [form, setForm] = useState({
        title: '',
        description: '',
        expect_price: '',
        category_id: '',
        campus: me?.campus || '主校区',
        contact: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');
    function fetchList() {
        setLoading(true);
        const q = new URLSearchParams({ size: '50' });
        if (kw)
            q.set('keyword', kw);
        if (campus)
            q.set('campus', campus);
        api(`/api/wanted?${q.toString()}`)
            .then(r => r.code === 0 && setList(r.data.list))
            .finally(() => setLoading(false));
    }
    useEffect(() => { fetchList(); }, [campus]); // eslint-disable-line
    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 1800);
    }
    async function submit() {
        if (!token)
            return nav('/login?from=%2Fwanted');
        if (!form.title.trim())
            return showToast('请填写想买什么');
        if (!form.contact.trim())
            return showToast('请填写联系方式');
        setSubmitting(true);
        const payload = {
            title: form.title.trim(),
            description: form.description,
            expect_price: form.expect_price ? Number(form.expect_price) : null,
            category_id: form.category_id ? Number(form.category_id) : null,
            campus: form.campus,
            contact: form.contact,
        };
        const r = await api('/api/wanted', { method: 'POST', data: payload });
        setSubmitting(false);
        if (r.code === 0) {
            showToast('🎉 求购发布成功！');
            setShowForm(false);
            setForm({ title: '', description: '', expect_price: '', category_id: '', campus: me?.campus || '主校区', contact: '' });
            setTimeout(() => fetchList(), 500);
        }
        else
            showToast(r.msg);
    }
    return (_jsxs("div", { className: "max-w-xl mx-auto min-h-screen bg-white", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(Link, { to: "/", className: "text-zinc-500 shrink-0", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("h1", { className: "text-base font-bold flex-1 flex items-center gap-1.5", children: [_jsx(Megaphone, { size: 18, className: "text-orange-500" }), " \u6C42\u8D2D\u4E13\u533A"] }), _jsxs("button", { onClick: () => token ? setShowForm(true) : nav('/login?from=%2Fwanted'), className: "btn-primary h-9 px-4 text-xs", children: [_jsx(Plus, { size: 14 }), " \u53D1\u5E03\u6C42\u8D2D"] })] }), _jsxs("form", { onSubmit: (e) => { e.preventDefault(); fetchList(); }, className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" }), _jsx("input", { className: "input pl-9 pr-3", placeholder: "\u641C\u4F60\u60F3\u4E70\u7684...", value: kw, onChange: e => setKw(e.target.value) })] }), _jsx("button", { type: "submit", className: "btn-primary h-11 px-5 text-sm", children: "\u641C\u7D22" })] }), _jsx("div", { className: "mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1", children: ['', ...(cfg?.campus_list || [])].map(c => (_jsx("button", { onClick: () => setCampus(c), className: `shrink-0 text-xs px-3 h-7 rounded-full transition ${campus === c ? 'bg-orange-500 text-white' : 'bg-zinc-100 text-zinc-600'}`, children: c || '全部校区' }, c || '全部'))) })] }), _jsx("section", { className: "p-4 space-y-3", children: loading ? (_jsx("div", { className: "py-12 text-center text-sm text-zinc-400 animate-pulse", children: "\u52A0\u8F7D\u4E2D..." })) : list.length === 0 ? (_jsxs("div", { className: "py-12 text-center", children: [_jsx("div", { className: "text-5xl mb-3", children: "\uD83D\uDCE2" }), _jsx("div", { className: "text-sm text-zinc-400 mb-4", children: "\u8FD8\u6CA1\u6709\u6C42\u8D2D\u4FE1\u606F" }), _jsxs("button", { onClick: () => token ? setShowForm(true) : nav('/login?from=%2Fwanted'), className: "btn-primary h-10 px-6 text-sm", children: [_jsx(Plus, { size: 16 }), " \u53D1\u5E03\u7B2C\u4E00\u6761\u6C42\u8D2D"] })] })) : (list.map(w => (_jsx(Link, { to: `/wanted/${w.id}`, className: "card p-3.5 active:bg-zinc-50 block", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm font-bold text-zinc-800", children: w.title }), w.category_icon && _jsx("span", { className: "text-base", children: w.category_icon })] }), w.description && (_jsx("p", { className: "text-xs text-zinc-500 mt-1 line-clamp-2", children: w.description })), _jsxs("div", { className: "flex items-center gap-2 mt-2 text-[11px] text-zinc-400", children: [w.campus && _jsxs("span", { className: `chip ${campusColor(w.campus)} !text-[10px] !py-0`, children: [_jsx(MapPin, { size: 9, className: "inline -mt-0.5" }), " ", w.campus] }), _jsx("span", { children: w.buyer_name }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: timeAgo(w.created_at) })] })] }), w.expect_price != null && (_jsxs("div", { className: "text-right shrink-0", children: [_jsx("div", { className: "text-[10px] text-zinc-400", children: "\u9884\u671F\u4EF7\u683C" }), _jsxs("div", { className: "text-sm font-bold text-orange-500", children: ["\u2264 ", w.expect_price, "\u5143"] })] }))] }) }, w.id)))) }), showForm && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center", onClick: () => setShowForm(false), children: _jsxs("div", { className: "bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "sticky top-0 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between", children: [_jsx("h2", { className: "text-base font-bold", children: "\u53D1\u5E03\u6C42\u8D2D" }), _jsx("button", { onClick: () => setShowForm(false), className: "text-zinc-400", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-sm font-medium text-zinc-700", children: ["\u60F3\u4E70\u4EC0\u4E48 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { className: "input h-11 mt-1.5", placeholder: "\u4F8B\uFF1A\u4E8C\u624B\u81EA\u884C\u8F66 / \u9AD8\u6570\u8BFE\u672C / \u663E\u793A\u5668", value: form.title, onChange: e => setForm(f => ({ ...f, title: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-zinc-700", children: "\u8BE6\u7EC6\u9700\u6C42" }), _jsx("textarea", { className: "textarea h-24 mt-1.5", placeholder: "\u63CF\u8FF0\u4E00\u4E0B\u4F60\u7684\u9700\u6C42\uFF0C\u6BD4\u5982\u54C1\u724C\u3001\u578B\u53F7\u3001\u6210\u8272\u8981\u6C42\u7B49", value: form.description, onChange: e => setForm(f => ({ ...f, description: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-zinc-700", children: "\u9884\u671F\u4EF7\u683C\uFF08\u5143\uFF09" }), _jsx("input", { className: "input h-11 mt-1.5", type: "number", placeholder: "\u4F8B\uFF1A150", value: form.expect_price, onChange: e => setForm(f => ({ ...f, expect_price: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-zinc-700", children: "\u6821\u533A" }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-1.5", children: (cfg?.campus_list || []).map(c => (_jsx("button", { onClick: () => setForm(f => ({ ...f, campus: c })), className: `text-xs px-2.5 h-8 rounded-lg transition ${form.campus === c ? 'bg-orange-500 text-white' : 'bg-zinc-100 text-zinc-600'}`, children: c }, c))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-zinc-700", children: "\u5206\u7C7B\uFF08\u53EF\u9009\uFF09" }), _jsxs("div", { className: "flex flex-wrap gap-1.5 mt-1.5", children: [_jsx("button", { onClick: () => setForm(f => ({ ...f, category_id: '' })), className: `text-xs px-2.5 h-8 rounded-lg transition ${!form.category_id ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-600'}`, children: "\u4E0D\u9650" }), (cfg?.categories || []).map(c => (_jsxs("button", { onClick: () => setForm(f => ({ ...f, category_id: String(c.id) })), className: `text-xs px-2.5 h-8 rounded-lg transition ${form.category_id === String(c.id) ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-600'}`, children: [c.icon, " ", c.name] }, c.id)))] })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-sm font-medium text-zinc-700", children: ["\u8054\u7CFB\u65B9\u5F0F ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { className: "input h-11 mt-1.5", placeholder: "\u5FAE\u4FE1 / QQ / \u624B\u673A\u53F7", value: form.contact, onChange: e => setForm(f => ({ ...f, contact: e.target.value })) }), _jsx("div", { className: "text-[11px] text-zinc-400 mt-1", children: "\u5356\u5BB6\u4F1A\u901A\u8FC7\u6B64\u8054\u7CFB\u65B9\u5F0F\u8054\u7CFB\u4F60" })] }), _jsxs("div", { className: "rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 flex gap-2", children: [_jsx(AlertCircle, { size: 16, className: "shrink-0 mt-0.5" }), _jsx("div", { children: "\u53D1\u5E03\u6C42\u8D2D\u540E\uFF0C\u6709\u4E1C\u897F\u5356\u7684\u5356\u5BB6\u4F1A\u76F4\u63A5\u901A\u8FC7\u4F60\u586B\u7684\u8054\u7CFB\u65B9\u5F0F\u8054\u7CFB\u4F60\uFF0C\u8BF7\u786E\u4FDD\u8054\u7CFB\u65B9\u5F0F\u51C6\u786E\u3002" })] }), _jsx("button", { onClick: submit, disabled: submitting, className: "btn-primary w-full h-12 text-sm font-bold", children: submitting ? '发布中...' : '✨ 确认发布求购' })] })] }) })), toast && (_jsx("div", { className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl", children: toast }))] }));
}
