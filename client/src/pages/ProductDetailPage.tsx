import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MessageCircle, MapPin, Shield, Phone, Handshake, Flag, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import ProductCard, { type ProductCardData } from '../components/ProductCard';
import { campusColor, formatPrice, placeholder, timeAgo, verifiedBadge } from '../lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const token = useApp((s) => s.token);
  const me = useApp((s) => s.user);
  const [p, setP] = useState<any>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!id) return;
    api(`/api/products/${id}`).then(r => r.code === 0 ? setP(r.data) : (setToast(r.msg), setTimeout(() => setToast(''), 2000)));
  }, [id]);

  if (!p) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <Link to="/" className="text-sm text-zinc-500 flex items-center gap-1"><ArrowLeft size={16} />返回首页</Link>
        <div className="py-20 text-center text-zinc-400 text-sm animate-pulse">商品加载中...</div>
      </div>
    );
  }

  const imgs: string[] = p.images ? JSON.parse(p.images) : [];
  const allImgs = [p.cover, ...imgs].filter(Boolean);
  if (!allImgs.length) allImgs.push(placeholder(p.id + 'p', 600, 600, p.category_icon || '🛍'));

  const vb = verifiedBadge(p.seller_verified);

  async function fav() {
    if (!token) return nav('/login?from=' + encodeURIComponent(location.pathname));
    const r = await api(`/api/products/${p.id}/fav`, { method: 'POST' });
    if (r.code === 0) {
      setP({ ...p, favored: r.data.favored, fav_count: p.fav_count + (r.data.favored ? 1 : -1) });
      showToast(r.data.favored ? '❤ 收藏成功' : '已取消收藏');
    }
  }

  async function startChat() {
    if (!token) return nav('/login?from=' + encodeURIComponent(location.pathname));
    if (me?.id === p.seller_id) return showToast('这是你自己发布的商品～');
    const r = await api('/api/chats/start', { method: 'POST', data: { product_id: p.id } });
    if (r.code === 0) nav(`/chats/${r.data.chat_id}`);
    else showToast(r.msg);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }

  const isOwner = me?.id === p.seller_id;

  return (
    <div className="max-w-xl mx-auto pb-24 bg-white min-h-screen">
      {/* 顶部图片轮播 */}
      <div className="relative bg-zinc-50">
        <div className="aspect-square overflow-hidden">
          <img src={allImgs[imgIdx]} alt={p.title} className="w-full h-full object-cover" />
        </div>
        <button onClick={() => nav(-1)} className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={fav} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center">
            <Heart size={18} fill={p.favored ? 'currentColor' : 'none'} className={p.favored ? 'text-red-400' : ''} />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center">
            <Flag size={18} />
          </button>
        </div>
        {allImgs.length > 1 && (
          <>
            <button onClick={() => setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-zinc-600 flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setImgIdx(i => (i + 1) % allImgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-zinc-600 flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {allImgs.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`h-1.5 rounded-full transition-all ${imgIdx === i ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 价格 & 卖家 */}
      <div className="px-4 pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-red-500 leading-none">{formatPrice(p.price)}</span>
          {p.original_price && <span className="text-sm text-zinc-400 line-through">{formatPrice(p.original_price)}</span>}
          {p.original_price && <span className="chip !bg-red-100 !text-red-600 !py-0">{Math.round((1 - p.price / p.original_price) * 100)}% OFF</span>}
        </div>
        <h1 className="mt-2.5 text-base font-semibold text-zinc-900 leading-snug">{p.title}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {p.course_name && <span className="chip chip-brand">📚 匹配课程：{p.course_name}</span>}
          {p.book_name && <span className="chip !bg-emerald-100 !text-emerald-700">📖 {p.book_name}</span>}
          <span className={`chip ${campusColor(p.campus)}`}><MapPin size={10} className="inline -mt-0.5" /> {p.campus}</span>
          <span className="chip">{p.condition}</span>
          <span className="chip text-zinc-500">{timeAgo(p.created_at)}</span>
        </div>

        {/* 数据统计 */}
        <div className="mt-3 grid grid-cols-3 border-t border-zinc-100 pt-3 text-center">
          <Stat label="浏览" value={p.view_count} />
          <Stat label="想收" value={p.fav_count} />
          <Stat label="咨询" value={p.chat_count || 0} />
        </div>
      </div>

      {/* 联系方式 */}
      {p.contact && (
        <div className="mx-4 mt-4 rounded-xl bg-orange-50 border border-orange-200 p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center shrink-0">
            <Phone size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-orange-600 font-medium">联系方式</div>
            <div className="text-sm font-bold text-zinc-800 mt-0.5 select-all">{p.contact}</div>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText(p.contact); setToast('联系方式已复制'); setTimeout(() => setToast(''), 1500); }}
            className="btn-outline h-8 px-3 text-xs shrink-0"
          >复制</button>
        </div>
      )}

      {/* 保障 */}
      <div className="mx-4 mt-3 rounded-xl bg-brand-soft grid grid-cols-3 text-xs">
        <Guar icon={<Shield size={14} />} text="校内认证" />
        <Guar icon={<Phone size={14} />} text="直接联系" />
        <Guar icon={<Handshake size={14} />} text="同学交易" />
      </div>

      {/* 描述 */}
      <section className="px-4 pt-5">
        <h2 className="text-sm font-bold mb-2">商品描述</h2>
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {p.description || '卖家没有填写详细描述，点右下角「聊聊」问问TA吧～'}
        </p>
      </section>

      {/* 卖家信息 */}
      <section className="mx-4 mt-5 card p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-indigo-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
            {p.seller_name?.slice(-2) || '同'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold truncate">{p.seller_name}</span>
              <span className={`chip ${vb.cls} !py-0 !px-2`}>{vb.text}</span>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <Star size={11} className="text-amber-500" fill="currentColor" />
              <span>守信卖家 · {p.seller_campus || '主校区'}</span>
            </div>
          </div>
          <Link to={`/list?user_id=${p.seller_id}`} className="btn-outline h-8 px-3 text-xs">TA的闲置</Link>
        </div>
      </section>

      {/* 相关推荐 */}
      {p.related?.length ? (
        <section className="px-4 pt-6">
          <h2 className="text-base font-bold mb-3">相关推荐</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {p.related.map((r: ProductCardData) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      ) : null}

      <div className="h-16" />

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-100 bg-white">
        <div className="max-w-xl mx-auto grid grid-cols-[auto,1fr,1fr] gap-2 p-3">
          <button onClick={fav} className="btn-outline h-12 w-16 flex-col !py-1">
            <Heart size={16} fill={p.favored ? '#ef4444' : 'none'} className={p.favored ? 'text-red-500' : ''} />
            <span className="text-[10px]">{p.fav_count || 0}</span>
          </button>
          <button onClick={startChat} className="btn-outline h-12 text-sm">
            <MessageCircle size={16} /> 聊聊
          </button>
          {isOwner ? (
            <button className="btn-primary h-12 text-sm" onClick={() => nav('/me/products')}>管理我的商品</button>
          ) : (
            <button onClick={startChat} className="btn-primary h-12 text-sm font-bold">
              💰{p.price < 100 ? '我想要' : '联系卖家'}
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl animate-fade">
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-base font-bold text-zinc-800">{value}</div>
      <div className="text-[11px] text-zinc-500">{label}</div>
    </div>
  );
}

function Guar({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-1 py-2.5 text-brand font-medium">
      {icon}{text}
    </div>
  );
}
