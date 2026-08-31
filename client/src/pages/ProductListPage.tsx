import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { useApp } from '../store/app';
import { api } from '../lib/http';
import ProductCard, { type ProductCardData } from '../components/ProductCard';

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const cfg = useApp((s) => s.config);
  const [kw, setKw] = useState(params.get('keyword') || '');
  const [list, setList] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const initialFilter = {
    category_id: params.get('category_id') || '',
    campus: params.get('campus') || '',
    condition: '',
    min_price: '',
    max_price: '',
    course_name: params.get('course_name') || '',
  };
  const [filter, setFilter] = useState(initialFilter);
  const [draft, setDraft] = useState(initialFilter);

  useEffect(() => {
    setPage(1);
  }, [params.toString()]); // eslint-disable-line

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('size', '20');
    if (kw) q.set('keyword', kw);
    Object.entries(filter).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
    api<{ list: ProductCardData[]; total: number }>(`/api/products?${q.toString()}`)
      .then(r => { if (r.code === 0) { setList(r.data.list); setTotal(r.data.total); } })
      .finally(() => setLoading(false));
  }, [page, kw, JSON.stringify(filter)]); // eslint-disable-line

  const activeCat = cfg?.categories.find(c => String(c.id) === filter.category_id);

  function apply() {
    setFilter(draft);
    setShowFilter(false);
  }

  function reset() {
    const d = { category_id: '', campus: '', condition: '', min_price: '', max_price: '', course_name: '' };
    setDraft(d); setFilter(d); setShowFilter(false);
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* 搜索栏 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100">
        <div className="px-4 py-3 flex items-center gap-2">
          <Link to="/" className="text-zinc-500 shrink-0"><X size={20} /></Link>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input className="input pl-9 h-10" placeholder="搜索二手商品/教材/课程..." value={kw} onChange={(e) => setKw(e.target.value)} />
          </div>
          <button onClick={() => setShowFilter(true)} className="btn-outline h-10 w-10 shrink-0"><SlidersHorizontal size={16} /></button>
        </div>
        {/* 标签栏 */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          <span className={`chip !h-7 shrink-0 ${activeCat ? '' : 'chip-brand'}`}>
            <Filter size={11} /> 全部
          </span>
          {activeCat && <span className="chip chip-brand !h-7 shrink-0">{activeCat.icon} {activeCat.name}</span>}
          {filter.campus && <span className="chip chip-brand !h-7 shrink-0"><MapPin size={11} /> {filter.campus}</span>}
          {filter.condition && <span className="chip chip-brand !h-7 shrink-0">{filter.condition}</span>}
          {filter.course_name && <span className="chip chip-brand !h-7 shrink-0">📚 {filter.course_name}</span>}
        </div>
      </header>

      {/* 结果计数 */}
      <div className="px-4 pt-3 text-xs text-zinc-500 flex items-center justify-between">
        <span>共找到 <b className="text-zinc-800">{total}</b> 件商品</span>
        <span className="text-brand">{loading ? '加载中...' : ''}</span>
      </div>

      {/* 网格 */}
      <main className="px-4 pt-2 pb-6">
        <div className="grid grid-cols-2 gap-2.5">
          {list.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
        {!loading && !list.length && (
          <div className="py-20 text-center">
            <div className="text-4xl mb-2">🛒</div>
            <div className="text-sm text-zinc-500">没有找到符合条件的商品</div>
            <Link to="/publish" className="btn-primary mt-4 px-5 h-10 text-xs">去发布第一件</Link>
          </div>
        )}
        {list.length && list.length >= 20 && (
          <button className="btn-outline w-full mt-4 h-10 text-xs" onClick={() => setPage(p => p + 1)} disabled={loading}>
            加载更多
          </button>
        )}
      </main>

      {/* 筛选抽屉 */}
      {showFilter && (
        <div className="fixed inset-0 z-50" onClick={() => setShowFilter(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-w-xl mx-auto max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">筛选条件</h3>
              <button onClick={() => setShowFilter(false)} className="text-zinc-400"><X size={20} /></button>
            </div>
            <div className="space-y-4 text-sm">
              <Section title="分类">
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={!draft.category_id} onClick={() => setDraft(d => ({ ...d, category_id: '' }))}>全部</Chip>
                  {cfg?.categories.map(c => (
                    <Chip key={c.id} active={draft.category_id === String(c.id)} onClick={() => setDraft(d => ({ ...d, category_id: String(c.id) }))}>
                      {c.icon} {c.name}
                    </Chip>
                  ))}
                </div>
              </Section>
              <Section title="校区">
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={!draft.campus} onClick={() => setDraft(d => ({ ...d, campus: '' }))}>全部</Chip>
                  {cfg?.campus_list.map(c => (
                    <Chip key={c} active={draft.campus === c} onClick={() => setDraft(d => ({ ...d, campus: c }))}>{c}</Chip>
                  ))}
                </div>
              </Section>
              <Section title="成色">
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={!draft.condition} onClick={() => setDraft(d => ({ ...d, condition: '' }))}>不限</Chip>
                  {cfg?.condition_list.map(c => (
                    <Chip key={c} active={draft.condition === c} onClick={() => setDraft(d => ({ ...d, condition: c }))}>{c}</Chip>
                  ))}
                </div>
              </Section>
              <Section title="价格区间">
                <div className="flex items-center gap-2">
                  <input className="input h-10 !text-center" placeholder="最低" value={draft.min_price} onChange={e => setDraft(d => ({ ...d, min_price: e.target.value }))} />
                  <span className="text-zinc-400">—</span>
                  <input className="input h-10 !text-center" placeholder="最高" value={draft.max_price} onChange={e => setDraft(d => ({ ...d, max_price: e.target.value }))} />
                </div>
              </Section>
              <Section title="课程名（精准匹配教材）">
                <input className="input h-10" placeholder="如：高等数学、数据结构" value={draft.course_name} onChange={e => setDraft(d => ({ ...d, course_name: e.target.value }))} />
              </Section>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6 pt-2 border-t border-zinc-100">
              <button className="btn-outline h-11 text-sm" onClick={reset}>重置</button>
              <button className="btn-primary h-11 text-sm" onClick={apply}>应用筛选</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold text-zinc-700 mb-2">{title}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 h-7 rounded-full text-xs transition ${active ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-700'}`}>
      {children}
    </button>
  );
}
