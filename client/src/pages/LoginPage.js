import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, GraduationCap, User, Mail, Shield, AlertCircle, Check } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
export default function LoginPage() {
    const [params] = useSearchParams();
    const nav = useNavigate();
    const login = useApp((s) => s.login);
    const from = params.get('from') || '/';
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', password: '', nickname: '', school_email: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const r = await api(url, { method: 'POST', data: form });
            if (r.code === 0) {
                login(r.data.token, r.data.user);
                if (mode === 'register') {
                    setMsg({ type: 'ok', text: `注册成功！校园邮箱验证码：${r.data.verify_code || '请在个人中心获取'}，去完成校园认证吧`, code: r.data.verify_code });
                    setTimeout(() => nav('/me/verify'), 1200);
                }
                else {
                    setMsg({ type: 'ok', text: '登录成功，正在跳转...' });
                    setTimeout(() => nav(decodeURIComponent(from)), 800);
                }
            }
            else {
                setMsg({ type: 'err', text: r.msg });
            }
        }
        catch (err) {
            setMsg({ type: 'err', text: err?.msg || '网络异常' });
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "min-h-full grid lg:grid-cols-2 bg-gradient-to-br from-brand-soft via-white to-white", children: [_jsxs("div", { className: "hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-brand via-[#5D4DEE] to-[#8A7CFF] text-white", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-2xl", children: "\u90D1" }), _jsxs("div", { children: [_jsx("div", { className: "text-xl font-black", children: "\u90D1\u5927\u96C6\u5E02" }), _jsx("div", { className: "text-sm text-white/80", children: "\u90D1\u5DDE\u5927\u5B66\u4E13\u5C5E\u4E8C\u624B\u4EA4\u6613\u5E73\u53F0" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-4xl font-black leading-tight mb-4", children: ["\u6821\u5185\u76F4\u8FDE \u00B7", _jsx("br", {}), "\u653E\u5FC3\u4EA4\u6613"] }), _jsx("ul", { className: "space-y-3 text-white/90 text-sm", children: [
                                    ['🎓', '仅郑大学生可注册交易，杜绝社会人员'],
                                    ['📢', '求购专区，发布你想买的东西'],
                                    ['📚', '教材课程智能匹配，学长学姐的书直接对接'],
                                    ['🛡', '联系方式直接沟通，同学之间更放心'],
                                ].map(([icon, t]) => (_jsxs("li", { className: "flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3", children: [_jsx("span", { className: "text-xl", children: icon }), _jsx("span", { children: t })] }, t))) })] }), _jsx("div", { className: "text-xs text-white/60", children: "\u00A9 2025 \u90D1\u5927\u96C6\u5E02 \u00B7 \u90D1\u5DDE\u5927\u5B66\u5B66\u751F\u521B\u4E1A\u9879\u76EE \u00B7 \u53EA\u4E3A\u540C\u5B66\u66F4\u597D\u670D\u52A1" })] }), _jsx("div", { className: "flex items-center justify-center p-5 lg:p-10", children: _jsxs("div", { className: "w-full max-w-sm", children: [_jsx("div", { className: "lg:hidden mb-8 text-center", children: _jsxs("div", { className: "inline-flex items-center gap-2", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand/30", children: "\u90D1" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "text-xl font-black", children: "\u90D1\u5927\u96C6\u5E02" }), _jsx("div", { className: "text-xs text-zinc-500", children: "\u90D1\u5DDE\u5927\u5B66\u4E13\u5C5E \u00B7 \u6821\u5185\u4EA4\u6613" })] })] }) }), _jsxs("div", { className: "card p-6", children: [_jsx("div", { className: "grid grid-cols-2 p-1 rounded-full bg-zinc-100 mb-6", children: ['login', 'register'].map(m => (_jsx("button", { onClick: () => { setMode(m); setMsg(null); }, className: `h-9 rounded-full text-sm font-medium transition ${mode === m ? 'bg-white text-brand shadow-sm' : 'text-zinc-500'}`, children: m === 'login' ? '登录' : '注册' }, m))) }), _jsxs("form", { onSubmit: submit, className: "space-y-3.5", children: [_jsx(Field, { icon: _jsx(User, { size: 16 }), label: "\u7528\u6237\u540D / \u6821\u56ED\u90AE\u7BB1", placeholder: "\u5982\uFF1Azzu_2024 \u6216 2024xxxxx@gs.zzu.edu.cn", value: form.username, onChange: v => setForm(f => ({ ...f, username: v })) }), mode === 'register' && (_jsxs(_Fragment, { children: [_jsx(Field, { icon: _jsx(User, { size: 16 }), label: "\u6635\u79F0\uFF08\u540C\u5B66\u770B\u5230\u7684\u540D\u5B57\uFF09", placeholder: "\u5982\uFF1A\u67F3\u56ED\u7684\u5C0F\u660E", value: form.nickname, onChange: v => setForm(f => ({ ...f, nickname: v })) }), _jsx(Field, { icon: _jsx(Mail, { size: 16 }), label: "\u90D1\u5927\u6821\u56ED\u90AE\u7BB1\uFF08\u7528\u4E8E\u8BA4\u8BC1\uFF0C\u53EF\u9009\uFF09", placeholder: "\u5982\uFF1A20241010101@gs.zzu.edu.cn", value: form.school_email, onChange: v => setForm(f => ({ ...f, school_email: v })) })] })), _jsx(Field, { icon: _jsx(Lock, { size: 16 }), label: "\u5BC6\u7801", type: "password", placeholder: mode === 'login' ? '请输入密码' : '至少6位，建议字母+数字组合', value: form.password, onChange: v => setForm(f => ({ ...f, password: v })) }), mode === 'register' && (_jsxs("div", { className: "rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 flex gap-2", children: [_jsx(Shield, { size: 14, className: "shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("b", { children: "\u6821\u56ED\u90AE\u7BB1\u662F\u8BA4\u8BC1\u5173\u952E\uFF1A" }), "\u683C\u5F0F\u901A\u5E38\u662F\u300C\u5B66\u53F7@gs.zzu.edu.cn\u300D\u3002 \u6CE8\u518C\u540E\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u751F\u62106\u4F4D\u9A8C\u8BC1\u7801\uFF0C\u590D\u5236\u5230\u300C\u4E2A\u4EBA\u4E2D\u5FC3\u2192\u6821\u56ED\u8BA4\u8BC1\u300D\u7C98\u8D34\u5373\u53EF\u5B8C\u6210\u8BA4\u8BC1\uFF0C", _jsx("b", { children: "\u8BA4\u8BC1\u540E\u624D\u53EF\u4EE5\u53D1\u5E03\u5546\u54C1 + \u5F00\u901A\u62C5\u4FDD\u4EA4\u6613\u6743\u9650\u3002" })] })] })), msg && (_jsxs("div", { className: `rounded-xl p-3 text-xs flex items-start gap-2 ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`, children: [msg.type === 'ok' ? _jsx(Check, { size: 14, className: "mt-0.5" }) : _jsx(AlertCircle, { size: 14, className: "mt-0.5" }), _jsxs("div", { children: [msg.text, msg.code && (_jsxs("div", { className: "mt-2 p-2 bg-white/80 rounded-lg text-center font-mono font-bold text-sm tracking-widest select-all", children: ["\u9A8C\u8BC1\u7801\uFF1A", msg.code] }))] })] })), _jsx("button", { disabled: loading, className: "btn-primary w-full h-11 text-sm font-bold", children: loading ? '提交中...' : mode === 'login' ? '登 录' : '立即注册 · 加入郑大集市' }), _jsxs("div", { className: "rounded-xl bg-zinc-50 border border-zinc-100 p-3 text-[11px] text-zinc-500 space-y-1", children: [_jsxs("div", { className: "font-bold text-zinc-700 flex items-center gap-1", children: [_jsx(GraduationCap, { size: 12 }), " \u6D4B\u8BD5\u4F53\u9A8C\u8D26\u53F7\uFF08\u5BC6\u7801\u5747\u4E3A 123456\uFF09\uFF1A"] }), _jsxs("div", { children: ["\u2022 \u7BA1\u7406\u5458\uFF1A", _jsx("code", { className: "px-1.5 py-0.5 bg-white rounded font-mono text-zinc-700", children: "admin / 123456" })] }), _jsxs("div", { children: ["\u2022 \u8F6F\u4EF6\u5B66\u9662\u5927\u4E09\uFF1A", _jsx("code", { className: "px-1.5 py-0.5 bg-white rounded font-mono text-zinc-700", children: "zzu_001 / 123456" }), "\uFF08\u67F3\u56ED\u6821\u533A\uFF09"] }), _jsxs("div", { children: ["\u2022 \u5546\u5B66\u9662\u5927\u56DB\uFF1A", _jsx("code", { className: "px-1.5 py-0.5 bg-white rounded font-mono text-zinc-700", children: "zzu_002 / 123456" }), "\uFF08\u8377\u56ED\u6821\u533A\uFF09"] })] })] })] }), _jsx("div", { className: "mt-6 text-center text-[11px] text-zinc-400", children: "\u767B\u5F55/\u6CE8\u518C\u5373\u540C\u610F\u300A\u90D1\u5927\u96C6\u5E02\u7528\u6237\u534F\u8BAE\u300B\u548C\u300A\u9690\u79C1\u4FDD\u62A4\u653F\u7B56\u300B" })] }) })] }));
}
function Field({ icon, label, placeholder, value, onChange, type = 'text' }) {
    return (_jsxs("label", { className: "block", children: [_jsx("span", { className: "text-xs font-bold text-zinc-700 mb-1.5 block", children: label }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400", children: icon }), _jsx("input", { type: type, value: value, onChange: e => onChange(e.target.value), placeholder: placeholder, className: "input pl-10 h-11" })] })] }));
}
