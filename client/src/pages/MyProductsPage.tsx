import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Trash2, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { formatPrice, timeAgo, campusColor } from '../lib/utils';

type Tab = 'selling' | 'sold' | 'offline';

export default function MyProductsPage() {
  const me = useApp((s) => s.user);
  const token = useApp((s) => s.token);
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('selling');
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!token) return nav('/login?from=%2Fme%2Fproducts');
    reload();
  }, [token, tab]); // eslint-disable-line

  async function reload() {
    const statusMap = { selling: 1, sold: 2, offline: 3 };
    const r = await api(`/api/products?user_id=${me?.id}&size=50&_status=${tab}`);
    if (r.code === 0) {
      // 前端按status二次过滤（后端没有status查询参数时）
      const all: any[] = r.data.list || [];
      const s = statusMap[tab];
      const filtered = all.filter(x => x.status === undefined || x.status === s);
      setList(filtered);
      setTotal(r.data.total || 0);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }

  async function setStatus(id: number, status: 1 | 2 | 3, msg: string) {
    if (!confirm(msg)) return;
    const r = await api(`/api/products/${id}`, { method: 'PUT', data: { status } });
    if (r.code === 0) { reload(); showToast('操作成功'); }
    else showToast(r.msg);
  }

  const tabs: { k: Tab; label: string; icon: any }[] = [
    { k: 'selling', label: '在售中', icon: Tag },
    { k: 'sold', label: '已卖出', icon: CheckCircle2 },
    { k: 'offline', label: '已下架', icon: Trash2 },
  ];

  return (
    <div className="max-w-xl mx-auto pb-10 bg-white min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3">
        <Link to="/me" className="text-zinc-500 shrink-0"><ArrowLeft size={20} /></Link>
        <h1 className="text-base font-bold flex-1">我的闲置</h1>
        <Link to="/publish" className="btn-primary h-9 px-3 text-xs">+ 发布新商品</Link>
      </header>

      <div className="grid grid-cols-3 border-b border-zinc-100">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex items-center justify-center gap-1 h-11 text-sm transition ${tab === t.k ? 'tab-active' : 'text-zinc-500'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <main className="px-4 pt-3 space-y-2.5">
        {!list.length && (
          <div className="py-20 text-center">
            <div className="text-4xl mb-2">{tab === 'selling' ? '🛍' : tab === 'sold' ? '🎉' : '🗑'}</div>
            <div className="text-sm text-zinc-500">
              {tab === 'selling' ? '还没有在售商品，快去发布第一件吧～' : tab === 'sold' ? '还没有成交的商品，加油！' : '没有下架的商品'}
            </div>
            {tab === 'selling' && <Link to="/publish" className="btn-primary mt-4 px-5 h-10 text-xs inline-flex">+ 发布闲置</Link>}
          </div>
        )}

        {list.map((p, i) => (
          <div key={p.id || i} className="card flex gap-3 p-3">
            <Link to={`/product/${p.id}`} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-50">
              <img src={p.cover || `https://dummyimage.com/200x200/eee/666&text=ZZU`} className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <Link to={`/product/${p.id}`}>
                  <h3 className="text-sm font-medium text-zinc-800 line-clamp-2 leading-snug">{p.title}</h3>
                </Link>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-red-500 font-bold text-sm">{formatPrice(p.price)}</span>
                  <span className={`chip ${campusColor(p.campus || '')} !text-[10px] !py-0`}>{p.campus}</span>
                  <span className="chip !text-[10px] !py-0 bg-zinc-100 text-zinc-600">{p.condition}</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  {timeAgo(p.created_at)}
                  <span>· 浏览 {p.view_count || 0}</span>
                  <span>· 想收 {p.fav_count || 0}</span>
                </div>
              </div>
              {tab === 'selling' && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setStatus(p.id, 2, '确定标记为"已卖出"吗？')}
                    className="btn-primary h-7 flex-1 text-[11px]">✓ 已卖出</button>
                  <button onClick={() => setStatus(p.id, 3, '确定下架这件商品吗？')}
                    className="btn-outline h-7 flex-1 text-[11px] text-zinc-600">下架</button>
                </div>
              )}
              {tab === 'offline' && (
                <button onClick={() => setStatus(p.id, 1, '确定重新上架吗？')}
                  className="btn-primary h-7 w-full text-[11px] mt-1">↑ 重新上架</button>
              )}
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
