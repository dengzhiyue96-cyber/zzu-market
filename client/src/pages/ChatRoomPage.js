import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Image as ImageIcon, MoreHorizontal, ShoppingBag } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { timeAgo, placeholder, formatPrice, campusColor } from '../lib/utils';
export default function ChatRoomPage() {
    const { id } = useParams();
    const me = useApp((s) => s.user);
    const token = useApp((s) => s.token);
    const nav = useNavigate();
    const [chat, setChat] = useState(null);
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const fileRef = useRef(null);
    useEffect(() => {
        if (!token)
            nav('/login?from=' + encodeURIComponent(location.pathname));
    }, [token]); // eslint-disable-line
    useEffect(() => {
        if (!id)
            return;
        api(`/api/chats/${id}/messages`).then(r => { if (r.code === 0)
            setMsgs(r.data); });
        // 拉会话信息
        api('/api/chats').then(r => {
            if (r.code === 0 && Array.isArray(r.data)) {
                const c = r.data.find((x) => String(x.id) === String(id));
                setChat(c);
            }
        });
    }, [id]);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs.length]);
    // 伪实时：每5秒轮询一次新消息（MVP简单实现）
    useEffect(() => {
        const t = setInterval(() => {
            if (!id)
                return;
            api(`/api/chats/${id}/messages`).then(r => {
                if (r.code === 0) {
                    setMsgs(prev => {
                        if (prev.length !== r.data.length)
                            return r.data;
                        return prev;
                    });
                }
            });
        }, 5000);
        return () => clearInterval(t);
    }, [id]);
    const peer_id = chat && me ? (chat.buyer_id === me.id ? chat.peer_id : chat.peer_id) : null;
    async function send() {
        if (!id || !peer_id || !text.trim() || sending)
            return;
        setSending(true);
        const r = await api('/api/messages', { method: 'POST', data: { chat_id: Number(id), receiver_id: Number(peer_id), content: text.trim() } });
        setSending(false);
        if (r.code === 0) {
            const msg = { id: r.data.id, chat_id: Number(id), sender_id: me?.id, receiver_id: peer_id, type: 'text', content: text.trim(), read: 0, created_at: r.data.created_at };
            setMsgs(m => [...m, msg]);
            setText('');
        }
    }
    async function sendImage(e) {
        const file = e.target.files?.[0];
        if (!file || !peer_id || !id)
            return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise(r => (reader.onload = () => r()));
        const up = await api('/api/upload', { method: 'POST', data: { base64: reader.result } });
        if (up.code !== 0)
            return;
        const r = await api('/api/messages', { method: 'POST', data: { chat_id: Number(id), receiver_id: Number(peer_id), type: 'image', content: up.data.url } });
        if (r.code === 0) {
            const msg = { id: r.data.id, chat_id: Number(id), sender_id: me?.id, receiver_id: peer_id, type: 'image', content: up.data.url, read: 0, created_at: r.data.created_at };
            setMsgs(m => [...m, msg]);
        }
        if (fileRef.current)
            fileRef.current.value = '';
    }
    const cover = chat?.product_cover || placeholder((chat?.product_id || 1) + 'c', 200, 200, '🛍');
    return (_jsxs("div", { className: "max-w-xl mx-auto h-screen flex flex-col bg-[#F2F3F5]", children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3", children: [_jsx(Link, { to: "/chats", className: "text-zinc-500 shrink-0", children: _jsx(ArrowLeft, { size: 20 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-[15px] font-bold truncate", children: chat?.peer_name || '会话中...' }), _jsx("div", { className: "text-[11px] text-zinc-500 truncate", children: chat?.unread ? `${chat.unread}条新消息` : 'ZZU二手市场 · 校内安全聊天' })] }), _jsx("button", { className: "text-zinc-400", children: _jsx(MoreHorizontal, { size: 20 }) })] }), chat?.product_id && (_jsxs(Link, { to: `/product/${chat.product_id}`, className: "mx-3 mt-3 card p-2.5 flex items-center gap-2.5 active:bg-zinc-50", children: [_jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden bg-zinc-50 shrink-0", children: _jsx("img", { src: cover, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium text-zinc-800 truncate", children: chat.product_title }), _jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [_jsx("span", { className: "text-red-500 font-bold text-sm", children: formatPrice(chat.product_price) }), _jsx("span", { className: `chip ${campusColor(chat.product_campus || '')} !text-[10px] !py-0`, children: chat.product_campus || '主校区' })] })] }), _jsx(ShoppingBag, { size: 16, className: "text-zinc-400 shrink-0" })] })), _jsxs("main", { className: "flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar", children: [_jsx("div", { className: "text-center text-[11px] text-zinc-400 py-2", children: "\u672C\u4F1A\u8BDD\u5185\u5BB9\u5DF2\u52A0\u5BC6\uFF0C\u4EC5\u9650\u4F60\u4EEC\u4E24\u4EBA\u53EF\u89C1" }), msgs.map(m => (_jsx(MessageBubble, { msg: m, me: me?.id }, m.id))), _jsx("div", { ref: bottomRef })] }), _jsxs("footer", { className: "sticky bottom-0 z-20 bg-white border-t border-zinc-100 px-3 py-2.5 flex items-end gap-2", children: [_jsx("button", { className: "btn-outline h-10 w-10 shrink-0", onClick: () => fileRef.current?.click(), children: _jsx(ImageIcon, { size: 18 }) }), _jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: sendImage }), _jsx("div", { className: "flex-1", children: _jsx("textarea", { className: "textarea min-h-[40px] !py-2 max-h-32", rows: 1, placeholder: `和${chat?.peer_name || '对方'}聊聊...`, value: text, onChange: e => setText(e.target.value), onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            } } }) }), _jsx("button", { onClick: send, disabled: !text.trim() || sending, className: "btn-primary h-10 w-10 shrink-0", children: _jsx(Send, { size: 16 }) })] })] }));
}
function MessageBubble({ msg, me }) {
    const mine = msg.sender_id === me;
    const isImg = msg.type === 'image';
    return (_jsx("div", { className: `flex ${mine ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `flex items-end gap-2 max-w-[82%] ${mine ? 'flex-row-reverse' : ''}`, children: [_jsx("div", { className: `w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white ${mine ? 'bg-brand' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`, children: mine ? '我' : '同' }), _jsxs("div", { className: "flex flex-col gap-1 min-w-0", children: [isImg ? (_jsx("div", { className: `bubble p-1 overflow-hidden ${mine ? 'bubble-me' : 'bubble-peer'}`, children: _jsx("img", { src: msg.content, alt: "", className: "rounded-lg max-w-[240px]" }) })) : (_jsx("div", { className: `bubble ${mine ? 'bubble-me' : 'bubble-peer'}`, children: _jsx("span", { className: "whitespace-pre-wrap break-words", children: msg.content }) })), _jsxs("div", { className: `text-[10px] text-zinc-400 ${mine ? 'text-right pr-1' : 'pl-1'}`, children: [timeAgo(msg.created_at), mine && !msg.read ? ' · 未读' : ''] })] })] }) }));
}
