import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, GraduationCap, ShoppingBag, Sparkles, ChevronRight, MapPin, ArrowRight, Megaphone } from 'lucide-react';
import { useApp } from '../store/app';
import { api } from '../lib/http';
import ProductCard, { type ProductCardData } from '../components/ProductCard';
import { campusColor } from '../lib/utils';

export default function HomePage() {
  const cfg = useApp((s) => s.config);
  const campus = useApp((s) => s.user?.campus) || '';
  const nav = useNavigate();
  const [hot, setHot] = useState<ProductCardData[]>([]);
  const [latest, setLatest] = useState<ProductCardData[]>([]);
  const [wanted, setWanted] = useState<any[]>([]);
  const [kw, setKw] = useState('');
  const [activeCampus, setActiveCampus] = useState(campus || '主校区');

  useEffect(() => {
    api<{ list: ProductCardData[] }>('/api/products?size=8').then(r => r.code === 0 && setHot(r.data.list));
    api<{ list: ProductCardData[] }>('/api/products?size=12').then(r => r.code === 0 && setLatest(r.data.list));
    api<{ list: any[] }>('/api/wanted?size=4').then(r => r.code === 0 && setWanted(r.data.list));
  }, []);

  const campuses = useMemo(() => ['全部', ...(cfg?.campus_list || [])], [cfg]);
  const cate = cfg?.categories || [];

  const textbookHots = [
    { course: '高等数学', seller: '柳园15号楼', count: 12 },
    { course: '数据结构', seller: '菊园3号楼', count: 9 },
    { course: '肖秀荣1000题', seller: '荷园5号楼', count: 18 },
    { course: '六级词汇', seller: '松园2号楼', count: 7 },
  ];

  function search(e?: React.FormEvent) {
    e?.preventDefault();
    nav(`/list?keyword=${encodeURIComponent(kw)}${activeCampus && activeCampus !== '全部' ? '&campus=' + encodeURIComponent(activeCampus) : ''}`);
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* 顶部品牌 + 搜索栏 */}
      <header className="sticky top-0 z-20 bg-gradient-to-b from-white via-white/95 to-white/70 backdrop-blur px-4 pt-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand/20">郑</div>
            <div>
              <div className="text-base font-bold leading-tight">ZZU二手市场</div>
              <div className="text-[11px] text-zinc-500 leading-tight">郑州大学专属 · 校内直连 · 放心交易</div>
            </div>
          </div>
          <Link to="/me/verify" className="chip chip-brand !py-1">
            <GraduationCap size={12} /> 校园认证
          </Link>
        </div>
        <form onSubmit={search} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="input pl-9 pr-3"
              placeholder="搜教材/数码/宿舍好物…"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary h-11 px-5 text-sm">
            搜索
          </button>
        </form>
        {/* 校区快捷切换 */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {campuses.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCampus(c)}
              className={`shrink-0 text-xs px-3 h-7 rounded-full transition ${activeCampus === c ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-600'}`}
            >
              <MapPin size={10} className="inline mr-1 -mt-0.5" />{c}
            </button>
          ))}
        </div>
      </header>

      {/* Banner：三大保障 */}
      <section className="px-4 pt-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-brand via-[#5D4DEE] to-[#8A7CFF] text-white shadow-lg shadow-brand/20 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid grid-cols-3 gap-2">
            {[
              { icon: '✅', t: '校内认证', d: '仅郑大学生可交易' },
              { icon: '📢', t: '求购专区', d: '发布你想买的东西' },
              { icon: '🛡', t: '真实可靠', d: '联系方式直接沟通' },
            ].map(x => (
              <div key={x.t} className="bg-white/10 backdrop-blur rounded-xl p-2.5">
                <div className="text-xl leading-none">{x.icon}</div>
                <div className="text-xs font-bold mt-1.5">{x.t}</div>
                <div className="text-[10px] text-white/80 mt-0.5">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 分类 */}
      <section className="px-4 pt-5">
        <div className="grid grid-cols-4 gap-3">
          {cate.slice(0, 8).map(c => (
            <Link
              key={c.id}
              to={`/list?category_id=${c.id}`}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition active:bg-zinc-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center text-2xl shadow-sm">{c.icon}</div>
              <span className="text-[11px] text-zinc-700 font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 教材刚需入口（郑大特色） */}
      <section className="px-4 pt-5">
        <Link to="/textbooks" className="card p-4 flex items-center gap-4 block group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <Sparkles size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold">找教材 · 课程匹配</span>
              <span className="chip chip-brand !text-[10px] !py-0">郑大专属</span>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">搜课程名，自动推荐学长学姐的二手书</div>
          </div>
          <ChevronRight size={18} className="text-zinc-400 group-active:translate-x-1 transition" />
        </Link>
      </section>

      {/* 求购专区入口 */}
      <section className="px-4 pt-3">
        <Link to="/wanted" className="card p-4 flex items-center gap-4 block group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center shadow-md shadow-orange-200">
            <Megaphone size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold">求购专区</span>
              <span className="chip !bg-orange-100 !text-orange-600 !text-[10px] !py-0">我想买</span>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">发布你想买的东西，等卖家来找你</div>
          </div>
          <ChevronRight size={18} className="text-zinc-400 group-active:translate-x-1 transition" />
        </Link>
      </section>

      {/* 最新求购 */}
      {wanted.length > 0 && (
        <section className="px-4 pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-bold flex items-center gap-1.5"><Megaphone size={16} className="text-orange-500" /> 最新求购</h2>
            <Link to="/wanted" className="text-xs text-zinc-500 flex items-center gap-0.5">更多 <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2.5">
            {wanted.map(w => (
              <Link to={`/wanted/${w.id}`} key={w.id} className="card p-3 flex items-center gap-3 active:bg-zinc-50">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-zinc-800 truncate">{w.title}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
                    {w.campus && <span className={`chip ${campusColor(w.campus)} !text-[10px] !py-0`}>{w.campus}</span>}
                    <span className="text-zinc-400">{w.buyer_name}</span>
                  </div>
                </div>
                {w.expect_price != null && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-orange-500">≤ {w.expect_price}元</div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 热门教材速查 */}
      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold flex items-center gap-1.5"><GraduationCap size={16} className="text-brand" /> 开学抢书单</h2>
          <Link to="/textbooks" className="text-xs text-zinc-500 flex items-center gap-0.5">更多 <ArrowRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {textbookHots.map(t => (
            <Link to={`/textbooks?course=${encodeURIComponent(t.course)}`} key={t.course} className="card p-3 active:bg-zinc-50">
              <div className="text-sm font-bold text-zinc-800 truncate">{t.course}</div>
              <div className="flex items-center justify-between mt-2">
                <span className={`chip ${campusColor(t.seller.includes('柳') ? '主校区' : t.seller.includes('荷') ? '南校区' : '主校区')} !text-[10px]`}>
                  <MapPin size={9} className="inline -mt-0.5" /> {t.seller}
                </span>
                <span className="text-xs text-zinc-500">{t.count} 本在售</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 最新闲置 */}
      <section className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold flex items-center gap-1.5"><ShoppingBag size={16} className="text-brand" /> 最新闲置</h2>
          <Link to="/list" className="text-xs text-zinc-500 flex items-center gap-0.5">查看全部 <ArrowRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {(latest.length ? latest : hot).map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {!latest.length && !hot.length && (
          <div className="py-12 text-center text-sm text-zinc-400">暂无商品，快去「发布」第一件吧～</div>
        )}
      </section>

      <div className="py-8 text-center text-[11px] text-zinc-400">
        © ZZU二手市场 · 郑州大学学生创业项目
      </div>
    </div>
  );
}
