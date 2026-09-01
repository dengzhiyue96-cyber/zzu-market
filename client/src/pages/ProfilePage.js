import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Settings, Package, Heart, MessageCircle, Shield, Edit3, MapPin, BarChart3, Upload, CircleHelp, Bell, Crown } from 'lucide-react';
import { useApp } from '../store/app';
import { verifiedBadge, campusColor } from '../lib/utils';
export default function ProfilePage() {
    const me = useApp((s) => s.user);
    const logout = useApp((s) => s.logout);
    const nav = useNavigate();
    const vb = verifiedBadge(me?.verified);
    if (!me) {
        return (_jsxs("div", { className: "max-w-xl mx-auto py-24 text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDC64" }), _jsx("div", { className: "text-sm text-zinc-500 mb-4", children: "\u8BF7\u5148\u767B\u5F55\u67E5\u770B\u4F60\u7684\u4E2D\u5FC3" }), _jsx(Link, { to: "/login", className: "btn-primary px-6 h-10 text-sm inline-flex", children: "\u53BB\u767B\u5F55" })] }));
    }
    const menuGroups = [
        {
            title: '我的交易',
            items: [
                { icon: Package, label: '我发布的', desc: `在售 ${me.stat?.selling_count || 0} · 已售 ${me.stat?.sold_count || 0}`, to: '/me/products' },
                { icon: Heart, label: '我的收藏', desc: `${me.stat?.fav_count || 0} 件心动商品`, to: '/favorites' },
                { icon: MessageCircle, label: '消息中心', desc: `${me.stat?.unread_count || 0} 条未读`, to: '/chats', badge: me.stat?.unread_count },
            ],
        },
        {
            title: '校园认证',
            items: [
                {
                    icon: Shield,
                    label: me.verified === 2 ? '✓ 已完成校园认证' : me.verified === 1 ? '认证审核中...' : '完成校园认证（解锁发布权限）',
                    desc: me.school_email ? `邮箱：${me.school_email}` : '绑定郑大校园邮箱，一键认证',
                    to: '/me/verify',
                    tag: me.verified === 2 ? { text: '已认证', cls: 'bg-emerald-100 text-emerald-700' } : me.verified === 1 ? { text: '审核中', cls: 'bg-amber-100 text-amber-700' } : { text: '未认证', cls: 'bg-red-100 text-red-600' },
                },
            ],
        },
        {
            title: '工具与设置',
            items: [
                ...(me.role === 'admin' ? [{
                        icon: Crown, label: '🛡 管理后台', desc: '数据看板 / 下架商品 / 封禁用户 / 处理举报',
                        to: '/admin', tag: { text: '管理员专属', cls: 'zzu-badge-gold text-[#522B75]' },
                    }] : []),
                { icon: Edit3, label: '编辑个人资料', desc: '昵称/头像/专业/宿舍/联系方式', to: '/me/profile' },
                { icon: Upload, label: '发布闲置', desc: '快把你宿舍的宝藏转给学弟学妹～', to: '/publish', primary: true },
                { icon: BarChart3, label: '经营数据（即将上线）', desc: '访问量/咨询量/成交统计', to: '' },
                { icon: Bell, label: '消息通知设置', desc: '有人咨询/出价/收藏 立刻提醒', to: '' },
                { icon: CircleHelp, label: '帮助中心 & 联系客服', desc: '交易纠纷/诈骗举报/运营合作', to: '' },
            ],
        },
    ];
    async function onLogout() {
        if (!confirm('确定退出登录吗？'))
            return;
        logout();
        nav('/');
    }
    return (_jsxs("div", { className: "max-w-xl mx-auto pb-6", children: [_jsxs("section", { className: "mx-4 mt-4 rounded-2xl p-4 bg-gradient-to-br from-brand via-[#5D4DEE] to-[#7C6BFF] text-white shadow-lg shadow-brand/20 relative overflow-hidden", children: [_jsx("div", { className: "absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" }), _jsxs("div", { className: "relative flex items-start gap-3", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center font-black text-2xl", children: me.nickname?.slice(0, 1) || '郑' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "text-lg font-bold truncate", children: me.nickname }), _jsx("span", { className: `chip ${vb.cls} !py-0`, children: vb.text }), me.role === 'admin' && _jsx("span", { className: "chip !bg-amber-400 !text-amber-900 !py-0", children: "\u7BA1\u7406\u5458" })] }), _jsxs("div", { className: "text-xs text-white/80 mt-1 flex items-center gap-2 flex-wrap", children: [me.major && _jsxs("span", { children: ["\uD83D\uDCDA ", me.major] }), me.grade && _jsxs("span", { children: ["\uD83C\uDF93 ", me.grade] }), me.campus && _jsxs("span", { className: `chip ${campusColor(me.campus)} !py-0 !text-[10px] bg-white/90`, children: [_jsx(MapPin, { size: 9, className: "inline -mt-0.5" }), me.campus] })] }), _jsx("div", { className: "text-[11px] text-white/70 mt-1 truncate", children: me.dormitory || '尚未填写宿舍信息' })] }), _jsxs(Link, { to: "/me/profile", className: "btn-outline h-8 px-3 text-[11px] !bg-white/15 !border-white/20 !text-white backdrop-blur", children: [_jsx(Settings, { size: 12 }), " \u7F16\u8F91"] })] }), _jsxs("div", { className: "relative mt-4 grid grid-cols-4 gap-1 text-center pt-3 border-t border-white/15", children: [_jsx(Stat, { label: "\u5728\u552E", value: me.stat?.selling_count || 0 }), _jsx(Stat, { label: "\u5DF2\u552E", value: me.stat?.sold_count || 0 }), _jsx(Stat, { label: "\u6536\u85CF", value: me.stat?.fav_count || 0 }), _jsx(Stat, { label: "\u672A\u8BFB", value: me.stat?.unread_count || 0 })] })] }), _jsx("div", { className: "mx-4 mt-5 space-y-4", children: menuGroups.map((g, gi) => (_jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "px-4 py-2 text-[11px] text-zinc-500 font-bold bg-zinc-50 border-b border-zinc-100", children: g.title }), _jsx("ul", { children: g.items.map((it, i) => {
                                const content = (_jsxs("div", { className: `px-4 py-3.5 flex items-center gap-3 ${i < g.items.length - 1 ? 'border-b border-zinc-50' : ''} ${it.primary ? 'bg-brand-soft/40' : ''} transition active:bg-zinc-50`, children: [_jsx("div", { className: `w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${it.primary ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-600'}`, children: _jsx(it.icon, { size: 17 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "text-sm font-medium text-zinc-800 flex items-center gap-2", children: [it.label, it.badge ? _jsx("span", { className: "min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center", children: it.badge > 99 ? '99+' : it.badge }) : null] }), it.desc && _jsx("div", { className: "text-[11px] text-zinc-500 mt-0.5 truncate", children: it.desc })] }), 'tag' in it && it.tag ? (_jsx("span", { className: `chip ${it.tag.cls} !py-0 text-[10px] shrink-0`, children: it.tag.text })) : it.to ? (_jsx(ChevronRight, { size: 16, className: "text-zinc-300 shrink-0" })) : (_jsx("span", { className: "chip !text-[10px] !py-0 bg-zinc-100 text-zinc-500 shrink-0", children: "\u5373\u5C06\u4E0A\u7EBF" }))] }));
                                return _jsx("li", { children: it.to ? _jsx(Link, { to: it.to, children: content }) : content }, i);
                            }) })] }, gi))) }), _jsx("div", { className: "mx-4 mt-5 mb-8", children: _jsxs("button", { onClick: onLogout, className: "w-full card py-3.5 text-sm font-medium text-red-500 flex items-center justify-center gap-1.5", children: [_jsx(LogOut, { size: 16 }), " \u9000\u51FA\u767B\u5F55"] }) }), _jsxs("div", { className: "text-center text-[11px] text-zinc-400 pb-6", children: ["ZZU\u4E8C\u624B\u5E02\u573A v1.0 \u00B7 \u8FD0\u884C\u4E2D \u00B7 \u7D2F\u8BA1\u670D\u52A1 ", 0, " \u540D\u90D1\u5927\u540C\u5B66"] })] }));
}
function Stat({ label, value }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "text-lg font-black", children: value }), _jsx("div", { className: "text-[10px] text-white/75", children: label })] }));
}
