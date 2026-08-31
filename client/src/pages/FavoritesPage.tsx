import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { formatPrice, timeAgo, campusColor } from '../lib/utils';

export default function FavoritesPage() {
  const token = useApp((s) => s.token);
  const nav = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!token) nav('/login?from=%2Ffavorites');
    reload();
  }, [token]); // eslint-disable-line

  async function reload() {
    const r = await api('/api/favorites?size=50');
    if (r.code === 0) setList(r.data.list || []);
  }

  async function unFav(id: number, fav_id: number) {
    const r = await api(`/api/products/${id}/fav`, { method: 'POST' });
    if (r.code === 0) { setList(l => l.filter(x => x.fav_id !== fav_id)); showToast('已取消收藏'); }
    else showToast(r.msg);
  }

  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(''), 1500);
  }

  return (
    <div className="max-w-xl mx-auto pb-10 bg-white min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3">
        <Link to="/me" className="text-zinc-500 shrink-0"><ArrowLeft size={20} /></Link>
        <h1 className="text-base font-bold flex-1 flex items-center gap-1.5"><Heart size={18} className="text-red-500" fill="currentColor" /> 我的收藏</h1>
      </header>

      <main className="px-4 pt-3 space-y-2.5">
        {!list.length && (
          <div className="py-24 text-center">
            <div className="text-4xl mb-2">💔</div>
            <div className="text-sm text-zinc-500">还没有收藏的商品</div>
            <Link to="/" className="btn-primary mt-4 px-5 h-10 text-xs inline-flex">去逛逛</Link>
          </div>
        )}

        {list.map((p) => (
          <div key={p.fav_id} className="card flex gap-3 p-3 active:bg-zinc-50">
            <Link to={`/product/${p.product_id || p.id}`} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-50">
              <img src={p.cover || `https://dummyimage.com/200x200/eee/666&text=ZZU`} className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <Link to={`/product/${p.product_id || p.id}`}>
                <h3 className="text-sm font-medium text-zinc-800 line-clamp-2 leading-snug">{p.title}</h3>
              </Link>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-red-500 font-bold text-sm">{formatPrice(p.price)}</span>
                <span className={`chip ${campusColor(p.campus || p.seller_campus || '')} !text-[10px] !py-0`}>{p.campus || p.seller_campus || '主校区'}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-zinc-400">{timeAgo(p.fav_time || p.created_at)} 收藏 · by {p.seller_name || '同学'}</span>
                <button onClick={() => unFav(p.product_id || p.id, p.fav_id)} className="chip !text-[10px] !py-0.5 !bg-red-50 !text-red-500">
                  <Heart size={10} className="inline mr-0.5" fill="currentColor" /> 取消
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {toast && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
