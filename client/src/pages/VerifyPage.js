import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, GraduationCap, Upload, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { verifiedBadge } from '../lib/utils';
export default function VerifyPage() {
    const me = useApp((s) => s.user);
    const setUser = useApp((s) => s.setUser);
    const nav = useNavigate();
    const [mode, setMode] = useState('email');
    const [emailCode, setEmailCode] = useState('');
    const [cardImg, setCardImg] = useState('');
    const [toast, setToast] = useState(null);
    const vb = verifiedBadge(me?.verified);
    function showToast(t, msg) {
        setToast({ t, msg });
        setTimeout(() => setToast(null), 2500);
    }
    async function submitEmail() {
        if (!emailCode.trim())
            return showToast('err', '请输入6位邮箱验证码');
        const r = await api('/api/user/verify-school', { method: 'POST', data: { code: emailCode } });
        if (r.code === 0) {
            showToast('ok', '🎉 认证成功！你现在可以发布商品了');
            setUser({ verified: 2 });
            setTimeout(() => nav('/publish'), 1000);
        }
        else
            showToast('err', r.msg);
    }
    async function pickImg(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise(r => (reader.onload = () => r()));
        setCardImg(reader.result);
    }
    async function submitCard() {
        if (!cardImg)
            return showToast('err', '请上传学生证/校园卡照片');
        const r = await api('/api/user/verify-card', { method: 'POST', data: { image: cardImg } });
        if (r.code === 0) {
            showToast('ok', '已提交，管理员24小时内审核通过');
            setUser({ verified: 1 });
        }
        else
            showToast('err', r.msg);
    }
    return (_jsxs("div", { className: "max-w-xl mx-auto pb-10 min-h-screen bg-white", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3", children: [_jsx(Link, { to: "/me", className: "text-zinc-500 shrink-0", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("h1", { className: "text-base font-bold flex-1 flex items-center gap-1.5", children: [_jsx(Shield, { size: 18, className: "text-brand" }), " \u6821\u56ED\u8BA4\u8BC1\u4E2D\u5FC3"] }), _jsx("span", { className: `chip ${vb.cls} !py-0`, children: vb.text })] }), _jsxs("section", { className: "mx-4 mt-4 rounded-2xl bg-gradient-to-br from-brand/10 via-white to-emerald-50 p-4", children: [_jsx("div", { className: "text-sm font-bold text-zinc-800 mb-2", children: "\u2705 \u5B8C\u6210\u8BA4\u8BC1\u5373\u53EF\u89E3\u9501\u4EE5\u4E0B\u6743\u76CA\uFF1A" }), _jsxs("ul", { className: "grid grid-cols-2 gap-2 text-xs text-zinc-700", children: [_jsx(E, { icon: "\uD83D\uDECD", text: "\u53D1\u5E03\u5546\u54C1\u6743\u9650" }), _jsx(E, { icon: "\uD83D\uDCB0", text: "\u53D1\u5E03\u6C42\u8D2D\u6743\u9650" }), _jsx(E, { icon: "\uD83D\uDCDE", text: "\u8054\u7CFB\u65B9\u5F0F\u5C55\u793A" }), _jsx(E, { icon: "\uD83C\uDFAF", text: "\u6559\u6750\u7CBE\u51C6\u5339\u914D" }), _jsx(E, { icon: "\uD83C\uDD94", text: "\u8BA4\u8BC1\u6807\u8BC6\u66DD\u5149\u52A0\u6743" }), _jsx(E, { icon: "\uD83C\uDF81", text: "\u53C2\u4E0E\u5E73\u53F0\u6D3B\u52A8\u5956\u52B1" })] })] }), _jsxs("section", { className: "mx-4 mt-5", children: [_jsxs("div", { className: "grid grid-cols-2 p-1 bg-zinc-100 rounded-full mb-5", children: [_jsxs("button", { onClick: () => setMode('email'), className: `h-10 rounded-full text-sm font-medium transition ${mode === 'email' ? 'bg-white text-brand shadow-sm' : 'text-zinc-500'}`, children: [_jsx(GraduationCap, { size: 13, className: "inline mr-1 -mt-0.5" }), " \u6821\u56ED\u90AE\u7BB1\u8BA4\u8BC1\uFF081\u5206\u949F\uFF09"] }), _jsxs("button", { onClick: () => setMode('card'), className: `h-10 rounded-full text-sm font-medium transition ${mode === 'card' ? 'bg-white text-brand shadow-sm' : 'text-zinc-500'}`, children: [_jsx(CreditCard, { size: 13, className: "inline mr-1 -mt-0.5" }), " \u5B66\u751F\u8BC1/\u6821\u56ED\u5361\uFF0824h\u5BA1\u6838\uFF09"] })] }), mode === 'email' ? (_jsxs("div", { className: "card p-5", children: [_jsxs("h3", { className: "text-sm font-bold mb-1 flex items-center gap-1.5", children: [_jsx(GraduationCap, { size: 16, className: "text-brand" }), " \u65B9\u5F0F\u4E00\uFF1A\u6821\u56ED\u90AE\u7BB1\uFF08\u79D2\u901A\u8FC7\uFF09"] }), _jsxs("p", { className: "text-xs text-zinc-500 mb-4", children: ["\u90AE\u7BB1\u683C\u5F0F\uFF1A", _jsx("code", { className: "px-1.5 py-0.5 bg-zinc-100 rounded font-mono", children: "\u4F60\u7684\u5B66\u53F7@gs.zzu.edu.cn" }), "\uFF08\u672C\u79D1\u751F/\u7814\u7A76\u751F\u90FD\u9002\u7528\uFF09\u3002\u6CE8\u518C\u65F6\u7CFB\u7EDF\u5DF2\u81EA\u52A8\u751F\u6210\u9A8C\u8BC1\u7801\uFF0C\u4E0B\u9762\u8F93\u5165\u5373\u53EF\u3002"] }), _jsxs("div", { className: "rounded-xl bg-emerald-50 border border-emerald-100 p-3 mb-4 text-xs text-emerald-700 flex items-start gap-2", children: [_jsx(CheckCircle2, { size: 15, className: "shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("b", { children: "\u63D0\u793A\uFF1A" }), "\u5982\u679C\u4F60\u8FD8\u6CA1\u6709\u6536\u5230\u90AE\u7BB1\u9A8C\u8BC1\u7801\uFF0C\u53EF\u4EE5\u76F4\u63A5\u5728\u6D4F\u89C8\u5668\u6253\u5F00\u4F60\u7684\u6821\u56ED\u90AE\u7BB1\uFF0C\u67E5\u770B\u6536\u4EF6\u7BB1\u4E2D\u6765\u81EA\u300CZZU\u4E8C\u624B\u5E02\u573A\u300D\u7684\u90AE\u4EF6\u3002 MVP \u9636\u6BB5\u4E3A\u4E86\u65B9\u4FBF\u6D4B\u8BD5\uFF0C\u4F60\u4E5F\u53EF\u4EE5 ", _jsx("b", { children: "\u76F4\u63A5\u4F7F\u7528\u6CE8\u518C\u540E\u663E\u793A\u7684\u9A8C\u8BC1\u7801" }), "\uFF08\u6B63\u5F0F\u4E0A\u7EBF\u4F1A\u63A5 SMTP \u90AE\u4EF6\u670D\u52A1\uFF09"] })] }), _jsx("label", { className: "block mb-1.5", children: _jsx("span", { className: "text-xs font-bold text-zinc-700", children: "\u90AE\u7BB1\u9A8C\u8BC1\u7801" }) }), _jsx("input", { maxLength: 6, className: "input h-12 !text-center !text-xl font-bold tracking-[0.5em] uppercase", placeholder: "\u4F8B\u5982\uFF1AA3F9K2", value: emailCode, onChange: e => setEmailCode(e.target.value.toUpperCase()) }), me?.school_email ? (_jsxs("div", { className: "mt-3 text-xs text-zinc-500 flex items-center gap-1.5", children: ["\u7ED1\u5B9A\u90AE\u7BB1\uFF1A", _jsx("b", { className: "text-zinc-700", children: me.school_email })] })) : (_jsxs("div", { className: "mt-3 text-xs text-amber-600 flex items-center gap-1.5", children: [_jsx(AlertCircle, { size: 12 }), "\u4F60\u8FD8\u672A\u5728\u6CE8\u518C\u65F6\u586B\u5199\u6821\u56ED\u90AE\u7BB1\uFF0C\u8BF7\u5148\u5728\u300C\u7F16\u8F91\u8D44\u6599\u300D\u91CC\u8865\u5145\u90AE\u7BB1"] })), _jsx("button", { onClick: submitEmail, className: "btn-primary w-full h-11 mt-5 text-sm font-bold", children: "\u2728 \u7ACB\u5373\u8BA4\u8BC1" })] })) : (_jsxs("div", { className: "card p-5", children: [_jsxs("h3", { className: "text-sm font-bold mb-1 flex items-center gap-1.5", children: [_jsx(CreditCard, { size: 16, className: "text-brand" }), " \u65B9\u5F0F\u4E8C\uFF1A\u5B66\u751F\u8BC1 / \u6821\u56ED\u5361\u7167\u7247"] }), _jsxs("p", { className: "text-xs text-zinc-500 mb-4", children: ["\u4E0A\u4F20\u4F60\u7684\u5B66\u751F\u8BC1\uFF08\u6709\u7167\u7247\u90A3\u9875\uFF09\u6216\u6821\u56ED\u4E00\u5361\u901A\u7167\u7247\uFF0C\u7BA1\u7406\u5458\u4EBA\u5DE5\u5BA1\u6838\uFF0C24\u5C0F\u65F6\u5185\u901A\u8FC7\u3002", _jsx("b", { className: "text-red-500", children: "\u5EFA\u8BAE\uFF1A\u62CD\u6444\u65F6\u7528\u624B\u6307\u906E\u6321\u8EAB\u4EFD\u8BC1\u53F7\uFF0C\u53EA\u4FDD\u7559\u59D3\u540D+\u5B66\u53F7+\u5B66\u9662\u5373\u53EF\u3002" })] }), _jsxs("label", { className: "block", children: [_jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: pickImg }), cardImg ? (_jsxs("div", { className: "relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-100 cursor-pointer", children: [_jsx("img", { src: cardImg, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/30 text-white flex items-center justify-center text-xs", children: "\u70B9\u51FB\u91CD\u65B0\u4E0A\u4F20" })] })) : (_jsxs("div", { className: "aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 flex flex-col items-center justify-center gap-1.5 cursor-pointer active:bg-zinc-100", children: [_jsx(Upload, { size: 28 }), _jsx("span", { className: "text-xs", children: "\u70B9\u51FB\u4E0A\u4F20\u5B66\u751F\u8BC1/\u6821\u56ED\u5361\u7167\u7247" }), _jsx("span", { className: "text-[10px]", children: "\uFF08\u652F\u6301JPG/PNG\uFF0C\u6700\u591A5MB\uFF09" })] }))] }), _jsx("button", { onClick: submitCard, className: "btn-primary w-full h-11 mt-5 text-sm font-bold", children: "\u63D0\u4EA4\u5BA1\u6838 \u00B7 \u7B49\u5F85\u901A\u77E5" }), _jsx("div", { className: "mt-3 text-[11px] text-center text-zinc-400", children: "\u4EBA\u5DE5\u5BA1\u6838\u901A\u5E38\u5728\u767D\u59298:00-22:00\u8FDB\u884C\uFF0C\u6700\u5FEB\u51E0\u5206\u949F\u901A\u8FC7" })] }))] }), toast && (_jsx("div", { className: `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-3 rounded-xl ${toast.t === 'ok' ? 'bg-emerald-600' : 'bg-red-500'} text-white text-sm shadow-xl max-w-xs text-center`, children: toast.msg }))] }));
}
function E({ icon, text }) {
    return _jsxs("li", { className: "flex items-center gap-1.5", children: [_jsx("span", { children: icon }), _jsx("span", { children: text })] });
}
