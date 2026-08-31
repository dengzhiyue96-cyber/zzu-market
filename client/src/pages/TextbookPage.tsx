import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, BookOpen, GraduationCap, MapPin, Filter, Sparkles, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import ProductCard, { type ProductCardData } from '../components/ProductCard';

/**
 * ZZU二手市场·核心特色页：教材课程匹配
 * 搜索课程名/院系/年级 → 直接展示学长学姐的二手书
 */
export default function TextbookPage() {
  const cfg = useApp((s) => s.config);
  const loc = useLocation();
  const nav = useNavigate();
  const initKw = new URLSearchParams(loc.search).get('course') || '';
  const [kw, setKw] = useState(initKw);
  const [dept, setDept] = useState('');
  const [grade, setGrade] = useState('');
  const [campus, setCampus] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const deptList = ['全校公共课', '数学与统计学院', '物理工程学院', '信息工程学院', '电气工程学院', '商学院', '外语学院', '马克思主义学院', '基础医学院'];
  const gradeList = ['大一', '大二', '大三', '大四', '考研'];
  const dept_f = dept === '全校公共课' ? '' : dept;

  useEffect(() => {
    if (!kw && !dept_f && !grade) { setResults([]); return; }
    setLoading(true);
    const q = new URLSearchParams({ course_name: kw });
    if (dept_f) q.set('college', dept_f);
    if (grade) q.set('grade', grade);
    api(`/api/textbooks/recommend?${q.toString()}`)
      .then(r => r.code === 0 && setResults(r.data || []))
      .finally(() => setLoading(false));
  }, [kw, dept_f, grade]);

  const allHot = results.filter(r => r.sell_count);
  const pending = results.filter(r => !r.sell_count);

  function goList(tb: any) {
    nav(`/list?textbook_id=${tb.id}${campus ? '&campus=' + encodeURIComponent(campus) : ''}`);
  }

  return (
    <div className="max-w-xl mx-auto pb-6 min-h-screen">
      {/* 顶部搜索 */}
      <header className="sticky top-0 z-20 bg-gradient-to-b from-emerald-50 via-white to-white backdrop-blur border-b border-zinc-100">
        <div className="px-4 pt-3 pb-3 flex items-center gap-2">
          <Link to="/" className="text-zinc-500 shrink-0"><ArrowLeft size={20} /></Link>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input className="input pl-9 h-11" placeholder="搜课程名/书名：高等数学、考研英语..." value={kw} onChange={(e) => setKw(e.target.value)} />
          </div>
          <button onClick={() => setFilterOpen(true)} className="btn-outline h-11 w-11 shrink-0"><Filter size={16} /></button>
        </div>
        {/* 快捷标签 */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          <span className={`chip !h-7 shrink-0 ${!dept ? '!bg-emerald-100 !text-emerald-700' : ''}`} onClick={() => setDept('')}>全部学院</span>
          {deptList.slice(0, 6).map(d => (
            <button key={d} onClick={() => setDept(d)} className={`chip !h-7 shrink-0 ${dept === d ? '!bg-emerald-100 !text-emerald-700' : ''}`}>{d}</button>
          ))}
        </div>
      </header>

      {/* 英雄区 */}
      <section className="px-4 pt-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Sparkles size={26} />
            </div>
            <div>
              <div className="text-lg font-bold">教材找对人 · 课程智能匹配</div>
              <div className="text-xs text-white/85 mt-1 leading-relaxed">
                输入你的课程，直接对接上过这门课的学长学姐手里的教材<br />
                比书店便宜 <b>60%</b>，还带他们的课堂笔记和重点标注 🌟
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 搜索热词 */}
      {!kw && !dept_f && !grade && (
        <section className="px-4 pt-5">
          <h2 className="text-sm font-bold mb-2.5 flex items-center gap-1.5"><BookOpen size={14} className="text-brand" /> 热门搜索课程</h2>
          <div className="flex flex-wrap gap-2">
            {['高等数学', '数据结构', '线性代数', '马原', '毛概', '肖秀荣1000题', '大学物理', '模电', '数电', '会计学基础', '大学英语', '系统解剖学'].map(k => (
              <button key={k} onClick={() => setKw(k)} className="chip !h-7 active:bg-zinc-200">
                {k}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 结果区 */}
      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-bold flex items-center gap-1.5">
            <GraduationCap size={16} className="text-brand" />
            {loading ? '搜索中...' : `匹配结果（${results.length}门课程）`}
          </h2>
        </div>

        {!loading && !results.length && (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-sm text-zinc-500">试试搜索上面的热门课程吧</div>
          </div>
        )}

        {/* 有人在卖的教材（优先展示） */}
        {allHot.length ? (
          <div className="space-y-3 mb-5">
            <div className="text-xs font-bold text-zinc-500">✅ 有学长学姐在卖 · 直接对接</div>
            {allHot.map(tb => (
              <button key={tb.id} onClick={() => goList(tb)} className="w-full card p-3.5 text-left active:bg-zinc-50 transition grid grid-cols-[auto,1fr,auto] gap-3 items-center">
                <div className="w-12 h-14 rounded-lg bg-emerald-50 border border-emerald-100 text-brand flex items-center justify-center text-2xl">📖</div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-800 truncate">{tb.book_name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="chip chip-brand !py-0 !px-1.5 !text-[10px]">{tb.course_name || '课程'}</span>
                    <span className="chip !bg-zinc-100 !text-zinc-600 !py-0 !px-1.5 !text-[10px]">{tb.college}</span>
                    <span className="chip !bg-zinc-100 !text-zinc-600 !py-0 !px-1.5 !text-[10px]">{tb.grade}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 truncate">作者：{tb.author} · {tb.publisher}</div>
                  {tb.sample_pid && (
                    <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {tb.sample_campus} · {tb.sample_seller}（{tb.sample_grade}）挂着 "{tb.sample_title?.slice(0, 10)}…" 卖 {tb.sample_price}元
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="chip !bg-emerald-100 !text-emerald-700 !py-0.5">{tb.sell_count}本在售</span>
                  <ChevronRight size={18} className="text-zinc-400" />
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {/* 暂无人卖的教材（可发布占位） */}
        {pending.length ? (
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-500">📝 同课程书籍（暂时没人挂 · 你可以第一个发布）</div>
            {pending.slice(0, 8).map(tb => (
              <div key={tb.id} className="card p-3 flex items-center gap-3">
                <div className="w-10 h-12 rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center text-lg">📕</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-800 truncate">{tb.book_name}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                    <span className="chip chip-brand !py-0 !px-1.5 !text-[10px]">{tb.course_name || '课程'}</span>
                    <span>{tb.college}</span>
                  </div>
                </div>
                <Link to={`/publish?tb=${tb.id}`} className="btn-outline h-8 px-3 text-[11px]">我来发布</Link>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* 筛选抽屉 */}
      {filterOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setFilterOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-w-xl mx-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">教材筛选</h3>
              <button onClick={() => setFilterOpen(false)} className="text-zinc-400"><X size={20} /></button>
            </div>
            <div className="space-y-4 text-sm">
              <Sec title="学院/系别">
                <div className="flex flex-wrap gap-1.5">
                  {deptList.map(d => (
                    <Chip key={d} active={dept === d} onClick={() => setDept(d)}>{d}</Chip>
                  ))}
                </div>
              </Sec>
              <Sec title="年级">
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={!grade} onClick={() => setGrade('')}>全部</Chip>
                  {gradeList.map(g => (<Chip key={g} active={grade === g} onClick={() => setGrade(g)}>{g}</Chip>))}
                </div>
              </Sec>
              <Sec title="校区（看卖家）">
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={!campus} onClick={() => setCampus('')}>全部</Chip>
                  {cfg?.campus_list.map(c => (<Chip key={c} active={campus === c} onClick={() => setCampus(c)}>{c}</Chip>))}
                </div>
              </Sec>
            </div>
            <button className="btn-primary w-full h-11 text-sm mt-6" onClick={() => setFilterOpen(false)}>确定</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold text-zinc-700 mb-2">{title}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 h-7 rounded-full text-xs transition ${active ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-700'}`}>
      {children}
    </button>
  );
}
