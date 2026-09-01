import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, BookOpenCheck, MapPin, AlertCircle, X } from 'lucide-react';
import { useApp } from '../store/app';
import { api } from '../lib/http';
export default function PublishPage() {
    const cfg = useApp((s) => s.config);
    const me = useApp((s) => s.user);
    const token = useApp((s) => s.token);
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const fileRef = useRef(null);
    const [form, setForm] = useState({
        category_id: '',
        title: '',
        description: '',
        price: '',
        original_price: '',
        condition: '9成新',
        campus: me?.campus || '主校区',
        contact: '',
        textbook_id: '',
        course_name: '',
    });
    const [images, setImages] = useState([]);
    // 教材搜索
    const [tbKeyword, setTbKeyword] = useState('');
    const [tbSuggest, setTbSuggest] = useState([]);
    const catName = useMemo(() => cfg?.categories.find(c => String(c.id) === form.category_id)?.name, [cfg, form.category_id]);
    useEffect(() => {
        if (!tbKeyword.trim() || catName !== '教材教辅' && catName !== '考研考证') {
            setTbSuggest([]);
            return;
        }
        api(`/api/textbooks/search?keyword=${encodeURIComponent(tbKeyword)}&limit=10`).then(r => r.code === 0 && setTbSuggest(Array.isArray(r.data) ? r.data.slice(0, 8) : []));
    }, [tbKeyword, catName]);
    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 1800);
    }
    async function onPickFile(e) {
        const files = Array.from(e.target.files || []);
        for (const file of files) {
            if (images.length >= 6)
                return showToast('最多6张图片');
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise(r => reader.onload = () => r());
            const r = await api('/api/upload', { method: 'POST', data: { base64: reader.result } });
            if (r.code === 0)
                setImages(imgs => [...imgs, r.data.url]);
            else
                showToast(r.msg);
        }
        if (fileRef.current)
            fileRef.current.value = '';
    }
    function removeImg(i) {
        setImages(imgs => imgs.filter((_, idx) => idx !== i));
    }
    function pickTb(tb) {
        setForm(f => ({ ...f, textbook_id: tb.id, course_name: tb.course_name }));
        setTbSuggest([]);
        setTbKeyword(tb.book_name);
        showToast(`已匹配《${tb.book_name}》`);
    }
    async function submit() {
        if (!token)
            return nav('/login?from=%2Fpublish');
        if (!form.category_id)
            return showToast('请选择分类');
        if (!form.title.trim())
            return showToast('请输入标题');
        if (form.title.length < 4)
            return showToast('标题至少4个字');
        if (!(Number(form.price) >= 0))
            return showToast('请输入正确的价格');
        if (!form.contact.trim())
            return showToast('请填写联系方式（微信/QQ/手机号）');
        setLoading(true);
        const payload = {
            ...form,
            category_id: Number(form.category_id),
            price: Number(form.price),
            original_price: form.original_price ? Number(form.original_price) : null,
            textbook_id: form.textbook_id ? Number(form.textbook_id) : null,
            cover: images[0] || '',
            images,
        };
        const r = await api('/api/products', { method: 'POST', data: payload });
        setLoading(false);
        if (r.code === 0) {
            showToast('🎉 发布成功！');
            setTimeout(() => nav(`/product/${r.data.id}`), 1200);
        }
        else
            showToast(r.msg);
    }
    return (_jsxs("div", { className: "max-w-xl mx-auto pb-10 bg-white min-h-screen", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3", children: [_jsx(Link, { to: "/", className: "text-zinc-500 shrink-0", children: _jsx(ArrowLeft, { size: 20 }) }), _jsx("h1", { className: "text-base font-bold flex-1", children: "\u53D1\u5E03\u95F2\u7F6E" }), _jsx("button", { onClick: submit, disabled: loading, className: "btn-primary h-9 px-4 text-xs", children: loading ? '发布中...' : '立即发布' })] }), _jsxs("section", { className: "p-4 space-y-5", children: [_jsxs(Block, { title: "\u5546\u54C1\u56FE\u7247", sub: "\u6700\u591A6\u5F20\uFF0C\u7B2C\u4E00\u5F20\u4E3A\u5C01\u9762\u56FE", children: [_jsxs("div", { className: "grid grid-cols-3 gap-2", children: [images.map((src, i) => (_jsxs("div", { className: "relative aspect-square rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100", children: [_jsx("img", { src: src, className: "w-full h-full object-cover" }), _jsx("button", { onClick: () => removeImg(i), className: "absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center", children: _jsx(X, { size: 12 }) })] }, i))), images.length < 6 && (_jsxs("button", { onClick: () => fileRef.current?.click(), className: "aspect-square rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 flex flex-col items-center justify-center gap-1 active:bg-zinc-100", children: [_jsx(ImagePlus, { size: 26 }), _jsx("span", { className: "text-[11px]", children: "\u4E0A\u4F20\u56FE\u7247" })] }))] }), _jsx("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: onPickFile })] }), _jsx(Block, { title: "\u5206\u7C7B", required: true, children: _jsx("div", { className: "grid grid-cols-4 gap-2", children: cfg?.categories.map(c => (_jsxs("button", { onClick: () => setForm(f => ({ ...f, category_id: String(c.id) })), className: `flex flex-col items-center gap-1 py-2.5 rounded-xl transition ${form.category_id === String(c.id) ? 'bg-brand/10 border border-brand text-brand' : 'bg-zinc-50 text-zinc-700 border border-transparent'}`, children: [_jsx("span", { className: "text-xl", children: c.icon }), _jsx("span", { className: "text-[11px] font-medium", children: c.name })] }, c.id))) }) }), (catName === '教材教辅' || catName === '考研考证') && (_jsxs(Block, { title: "\u6559\u6750/\u8BFE\u7A0B\u5339\u914D\uFF08\u90D1\u5927\u4E13\u5C5E\uFF09", sub: "\u5E2E\u4F60\u7CBE\u51C6\u5BF9\u63A5\u9700\u8981\u8FD9\u95E8\u8BFE\u7684\u5B66\u5F1F\u5B66\u59B9", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-brand", children: _jsx(BookOpenCheck, { size: 16 }) }), _jsx("input", { className: "input pl-9", placeholder: "\u8F93\u5165\u4E66\u540D\u6216\u8BFE\u7A0B\uFF0C\u5982\uFF1A\u9AD8\u7B49\u6570\u5B66\u3001\u8096\u79C0\u83631000\u9898...", value: tbKeyword, onChange: (e) => setTbKeyword(e.target.value) }), tbSuggest.length > 0 && (_jsx("div", { className: "absolute z-10 top-full left-0 right-0 mt-1.5 card p-1 max-h-64 overflow-y-auto", children: tbSuggest.map(tb => (_jsxs("button", { onClick: () => pickTb(tb), className: "w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-50", children: [_jsx("div", { className: "text-sm font-medium text-zinc-800 truncate", children: tb.book_name }), _jsxs("div", { className: "text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5", children: [_jsx("span", { className: "chip chip-brand !py-0 !px-1.5", children: tb.course_name || '课程' }), _jsx("span", { children: tb.college }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: tb.grade }), tb.sell_count ? _jsxs("span", { className: "ml-auto text-emerald-600", children: [tb.sell_count, "\u672C\u5728\u552E"] }) : null] })] }, tb.id))) }))] }), form.textbook_id && (_jsxs("div", { className: "mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-700", children: [_jsx(BookOpenCheck, { size: 14 }), "\u5DF2\u5339\u914D\u6559\u6750\uFF0C\u53D1\u5E03\u540E\u4F1A\u51FA\u73B0\u5728\u300C\u627E\u6559\u6750\u300D\u5BF9\u5E94\u8BFE\u7A0B\u4E0B"] }))] })), _jsxs(Block, { title: "\u6807\u9898", required: true, children: [_jsx("input", { className: "input", maxLength: 50, placeholder: "\u5982\uFF1AiPad 2021 64G WiFi \u51E0\u4E4E\u5168\u65B0", value: form.title, onChange: e => setForm(f => ({ ...f, title: e.target.value })) }), _jsxs("div", { className: "text-[11px] text-zinc-400 mt-1", children: [form.title.length, "/50\uFF0C\u4F18\u79C0\u7684\u6807\u9898\u80FD\u63D0\u9AD850%\u6210\u4EA4\u7387"] })] }), _jsx(Block, { title: "\u4EF7\u683C", required: true, children: _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-[11px] text-zinc-500 mb-1 block", children: "\u8F6C\u8BA9\u4EF7\uFF08\u5143\uFF09" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold", children: "\u00A5" }), _jsx("input", { inputMode: "decimal", className: "input pl-7 !text-base !font-bold", placeholder: "0.00", value: form.price, onChange: e => setForm(f => ({ ...f, price: e.target.value })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] text-zinc-500 mb-1 block", children: "\u539F\u4EF7\uFF08\u9009\u586B\uFF09" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400", children: "\u00A5" }), _jsx("input", { inputMode: "decimal", className: "input pl-7", placeholder: "\u8D2D\u4E70\u539F\u4EF7", value: form.original_price, onChange: e => setForm(f => ({ ...f, original_price: e.target.value })) })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Block, { title: "\u6210\u8272", required: true, children: _jsx(Chips, { values: cfg?.condition_list || [], value: form.condition, onChange: v => setForm(f => ({ ...f, condition: v })) }) }), _jsx(Block, { title: "\u6821\u533A", required: true, children: _jsx(Chips, { values: cfg?.campus_list || [], value: form.campus, onChange: v => setForm(f => ({ ...f, campus: v })), icon: _jsx(MapPin, { size: 9, className: "inline -mt-0.5" }) }) })] }), _jsxs(Block, { title: "\u8054\u7CFB\u65B9\u5F0F", required: true, children: [_jsx("input", { className: "input h-11", placeholder: "\u5FAE\u4FE1 / QQ / \u624B\u673A\u53F7\uFF08\u4E70\u5BB6\u4F1A\u901A\u8FC7\u6B64\u8054\u7CFB\u65B9\u5F0F\u8054\u7CFB\u4F60\uFF09", value: form.contact, onChange: e => setForm(f => ({ ...f, contact: e.target.value })) }), _jsx("div", { className: "text-[11px] text-zinc-400 mt-1", children: "\u26A0\uFE0F \u8BF7\u586B\u5199\u771F\u5B9E\u7684\u8054\u7CFB\u65B9\u5F0F\uFF0C\u4E70\u5BB6\u5C06\u76F4\u63A5\u901A\u8FC7\u6B64\u65B9\u5F0F\u8054\u7CFB\u4F60" })] }), _jsxs(Block, { title: "\u5546\u54C1\u63CF\u8FF0", children: [_jsx("textarea", { className: "textarea h-32", maxLength: 800, placeholder: "\u63CF\u8FF0\u4E00\u4E0B\u5546\u54C1\u7684\u8D2D\u4E70\u65F6\u95F4\u3001\u4F7F\u7528\u6B21\u6570\u3001\u6709\u6CA1\u6709\u7455\u75B5\u3001\u4E3A\u4EC0\u4E48\u51FA\u6389\u5427\uFF5E\n\n\u4F8B\uFF1A2024\u5E74\u53CC11\u8D2D\u5165\uFF0C\u53EA\u7A7F\u8FC7\u4E24\u6B21\uFF0C\u6D17\u8FC7\u4E00\u6B21\uFF0C\u540A\u724C\u4E0D\u5728\u4E86\uFF0C\u56E0\u4E3A\u4E70\u5927\u4E86\u4E00\u7801\u6240\u4EE5\u51FA\u3002", value: form.description, onChange: e => setForm(f => ({ ...f, description: e.target.value })) }), _jsxs("div", { className: "text-[11px] text-zinc-400 mt-1 text-right", children: [form.description.length, "/800"] })] }), _jsxs("div", { className: "rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 flex gap-2", children: [_jsx(AlertCircle, { size: 16, className: "shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("b", { children: "ZZU\u4E8C\u624B\u5E02\u573A\u7981\u6B62\u53D1\u5E03\uFF1A" }), _jsx("br", {}), "\u5047\u5192\u4F2A\u52A3\u3001\u70DF\u9152\u3001\u836F\u54C1\u3001\u7BA1\u5236\u7269\u54C1\u3001\u865A\u5047\u8EAB\u4EFD\u7684\u5546\u54C1\u3002\u8FDD\u89C4\u4E00\u6B21\u6C38\u4E45\u5C01\u53F7\uFF0C\u60C5\u8282\u4E25\u91CD\u4E0A\u62A5\u5B66\u6821\u4FDD\u536B\u5904\u3002"] })] }), _jsx("button", { onClick: submit, disabled: loading, className: "btn-primary w-full h-12 text-sm font-bold", children: loading ? '发布中...' : '✨ 确认发布' }), _jsx("div", { className: "text-[11px] text-center text-zinc-400", children: "\u53D1\u5E03\u5373\u540C\u610F\u300AZZU\u4E8C\u624B\u5E02\u573A\u7528\u6237\u534F\u8BAE\u300B" })] }), toast && (_jsx("div", { className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl", children: toast }))] }));
}
function Block({ title, sub, required, children }) {
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-baseline gap-1", children: [_jsx("span", { className: "text-sm font-bold", children: title }), required && _jsx("span", { className: "text-red-500", children: "*" }), sub && _jsx("span", { className: "text-[11px] text-zinc-400 ml-auto", children: sub })] }), children] }));
}
function Chips({ values, value, onChange, icon }) {
    return (_jsx("div", { className: "flex flex-wrap gap-1.5", children: values.map(v => (_jsxs("button", { onClick: () => onChange(v), className: `px-2.5 h-7 rounded-full text-xs transition ${value === v ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-700'}`, children: [icon, v] }, v))) }));
}
