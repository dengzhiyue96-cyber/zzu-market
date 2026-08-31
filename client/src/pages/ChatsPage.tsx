import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronRight, Package, ShoppingCart } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { formatPrice, placeholder, timeAgo, campusColor } from '../lib/utils';

export default function ChatsPage() {
  const token = useApp((s) => s.token);
  const nav = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) nav('/login?from=%2Fchats');
  }, [token, nav]);

  async function reload() {
    setLoading(true);
    const r = await api('/api/chats');
    setLoading(false);
    if (r.code === 0) setList(r.data || []);
  }
  useEffect(() => { if (token) reload(); }, [token]);

  return (
    <div className="max-w-xl mx-auto pb-6">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3">
        <h1 className="text-lg font-bold flex items-center gap-1.5">
          <MessageCircle size={20} className="text-brand" />
          消息
          {list.some(x => x.unread) && (
            <span className="chip !bg-red-100 !text-red-600 !py-0 ml-1">{list.reduce((s, x) => s + x.unread, 0)}条未读</span>
          )}
        </h1>
      </header>

      <main className="px-2 pt-2">
        {loading && (
          <div className="py-20 text-center text-sm text-zinc-400 animate-pulse">消息加载中...</div>
        )}

        {!loading && !list.length && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-soft mx-auto flex items-center justify-center">
              <MessageCircle size={32} className="text-brand/60" />
            </div>
            <div className="mt-5 text-sm text-zinc-500">还没有聊天消息</div>
            <div className="mt-1 text-xs text-zinc-400">去淘一淘心仪的闲置，联系卖家吧～</div>
            <Link to="/" className="btn-primary mt-5 px-5 h-10 text-xs inline-flex">去逛闲置</Link>
          </div>
        )}

        <ul className="space-y-0.5">
          {list.map((c) => (
            <li key={c.id}>
              <Link to={`/chats/${c.id}`} className="flex items-center gap-3 p-3 rounded-xl active:bg-zinc-50 transition">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-indigo-400 text-white flex items-center justify-center font-bold">
                    {c.peer_name?.slice(-1) || '同'}
                  </div>
                  {c.unread ? (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {c.unread > 99 ? '99+' : c.unread}
                    </span>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0 border-b border-zinc-50 pb-3 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm truncate">{c.peer_name}</span>
                    <span className="text-[11px] text-zinc-400 shrink-0">{c.last_time ? timeAgo(c.last_time) : ''}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-500 truncate flex-1">
                      {c.last_message || '开始你们的第一次聊天吧 👋'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-300 shrink-0" />
              </Link>

              {/* 关联商品预览 */}
              {c.product_id && c.product_status !== 2 && (
                <Link to={`/product/${c.product_id}`} className="ml-[60px] mr-3 mb-3 mt-[-8px] rounded-lg bg-zinc-50 p-2 flex items-center gap-2 active:bg-zinc-100">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 shrink-0">
                    <img src={c.product_cover || placeholder(c.product_id, 80, 80, '🛍')} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-700 truncate flex items-center gap-1.5">
                      <Package size={11} className="text-zinc-400 shrink-0" />{c.product_title}
                    </div>
                    <div className="text-[11px] mt-0.5 flex items-center gap-2">
                      <span className="text-red-500 font-bold">{formatPrice(c.product_price)}</span>
                      <span className={`chip ${campusColor(c.product_campus || '')} !text-[10px] !py-0`}>{c.product_campus || ''}</span>
                      {c.product_status === 2 && <span className="chip !bg-zinc-200 !text-zinc-500 !text-[10px] !py-0">已售出</span>}
                    </div>
                  </div>
                  <ShoppingCart size={12} className="text-zinc-400 shrink-0" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
