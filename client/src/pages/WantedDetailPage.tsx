import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Megaphone, Eye, ShoppingBag } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { campusColor, timeAgo } from '../lib/utils';
import ProductCard, { type ProductCardData } from '../components/ProductCard';

export default function WantedDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const me = useApp((s) => s.user);
  const [w, setW] = useState<any>(null);
  const [related, setRelated] = useState<ProductCardData[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api(`/api/wanted/${id}`).then(r => r.code === 0 && setW(r.data));
    // 尝试搜相关商品（用标题关键词）
    if (w?.title) {
      api<{ list: ProductCardData[] }>(`/api/products?keyword=${encodeURIComponent(w.title)}&size=4`)
        .then(r => r.code === 0 && setRelated(r.data.list));
    }
  }, [id]); // eslint-disable-line

  useEffect(() => {
    if (w?.title) {
      api<{ list: ProductCardData[] }>(`/api/products?keyword=${encodeURIComponent(w.title)}&size=4`)
        .then(r => r.code === 0 && setRelated(r.data.list));
    }
  }, [w?.title]); // eslint-disable-line

  if (!w) return (
    <div className="max-w-xl mx-auto min-h-screen bg-white flex items-center justify-center">
      <span className="text-sm text-zinc-400 animate-pulse">加载中...</span>
    </div>
  );

  const isOwner = me?.id === w.buyer_id;

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3">
        <Link to="/wanted" className="text-zinc-500 shrink-0"><ArrowLeft size={20} /></Link>
        <h1 className="text-base font-bold flex-1 flex items-center gap-1.5">
          <Megaphone size={18} className="text-orange-500" /> 求购详情
        </h1>
      </header>

      <div className="px-4 pt-4">
        <h1 className="text-lg font-bold text-zinc-900 leading-snug">{w.title}</h1>
        {w.expect_price != null && (
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-500">≤ {w.expect_price}</span>
            <span className="text-sm text-zinc-400">元</span>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {w.campus && <span className={`chip ${campusColor(w.campus)}`}><MapPin size={10} className="inline -mt-0.5" /> {w.campus}</span>}
          {w.category_name && <span className="chip">{w.category_icon} {w.category_name}</span>}
          <span className="chip text-zinc-500">{timeAgo(w.created_at)}</span>
          <span className="chip text-zinc-500"><Eye size={10} className="inline -mt-0.5" /> {w.view_count || 0}</span>
        </div>
      </div>

      {/* 联系方式 */}
      {w.contact && (
        <div className="mx-4 mt-4 rounded-xl bg-orange-50 border border-orange-200 p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center shrink-0">
            <Phone size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-orange-600 font-medium">{isOwner ? '你发布的联系方式' : '买家联系方式'}</div>
            <div className="text-sm font-bold text-zinc-800 mt-0.5 select-all">{w.contact}</div>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText(w.contact); setToast('联系方式已复制'); setTimeout(() => setToast(''), 1500); }}
            className="btn-outline h-8 px-3 text-xs shrink-0"
          >复制</button>
        </div>
      )}

      {/* 详细需求 */}
      {w.description && (
        <section className="px-4 pt-5">
          <h2 className="text-sm font-bold mb-2">详细需求</h2>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{w.description}</p>
        </section>
      )}

      {/* 买家信息 */}
      <section className="mx-4 mt-5 card p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
            {w.buyer_name?.slice(-2) || '同'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold truncate">{w.buyer_name}</span>
              {w.buyer_verified === 2 && <span className="chip chip-brand !py-0 !px-2 !text-[10px]">已认证</span>}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">{w.buyer_campus || '主校区'}</div>
          </div>
        </div>
      </section>

      {/* 相关商品推荐 */}
      {related.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-base font-bold mb-3 flex items-center gap-1.5">
            <ShoppingBag size={16} className="text-brand" /> 相关在售商品
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {related.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <div className="h-16" />

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-100 bg-white">
        <div className="max-w-xl mx-auto grid grid-cols-2 gap-2 p-3">
          {isOwner ? (
            <button className="btn-primary h-12 text-sm col-span-2" onClick={() => nav('/wanted')}>返回求购列表</button>
          ) : (
            <>
              <button
                onClick={() => { navigator.clipboard?.writeText(w.contact); setToast('联系方式已复制'); setTimeout(() => setToast(''), 1500); }}
                className="btn-primary h-12 text-sm font-bold col-span-2"
              >
                <Phone size={16} /> 复制联系方式联系买家
              </button>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
