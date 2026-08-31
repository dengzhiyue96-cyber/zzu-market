import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Megaphone, Plus, MapPin, X, AlertCircle } from 'lucide-react';
import { useApp } from '../store/app';
import { api } from '../lib/http';
import { campusColor, timeAgo } from '../lib/utils';

export default function WantedPage() {
  const cfg = useApp((s) => s.config);
  const token = useApp((s) => s.token);
  const me = useApp((s) => s.user);
  const nav = useNavigate();

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kw, setKw] = useState('');
  const [campus, setCampus] = useState('');
  const [showForm, setShowForm] = useState(false);

  // 发布求购表单
  const [form, setForm] = useState({
    title: '',
    description: '',
    expect_price: '',
    category_id: '',
    campus: me?.campus || '主校区',
    contact: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  function fetchList() {
    setLoading(true);
    const q = new URLSearchParams({ size: '50' });
    if (kw) q.set('keyword', kw);
    if (campus) q.set('campus', campus);
    api<{ list: any[] }>(`/api/wanted?${q.toString()}`)
      .then(r => r.code === 0 && setList(r.data.list))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchList(); }, [campus]); // eslint-disable-line

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }

  async function submit() {
    if (!token) return nav('/login?from=%2Fwanted');
    if (!form.title.trim()) return showToast('请填写想买什么');
    if (!form.contact.trim()) return showToast('请填写联系方式');
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      expect_price: form.expect_price ? Number(form.expect_price) : null,
      category_id: form.category_id ? Number(form.category_id) : null,
      campus: form.campus,
      contact: form.contact,
    };
    const r = await api('/api/wanted', { method: 'POST', data: payload });
    setSubmitting(false);
    if (r.code === 0) {
      showToast('🎉 求购发布成功！');
      setShowForm(false);
      setForm({ title: '', description: '', expect_price: '', category_id: '', campus: me?.campus || '主校区', contact: '' });
      setTimeout(() => fetchList(), 500);
    } else showToast(r.msg);
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white">
      {/* 顶部 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/" className="text-zinc-500 shrink-0"><ArrowLeft size={20} /></Link>
          <h1 className="text-base font-bold flex-1 flex items-center gap-1.5">
            <Megaphone size={18} className="text-orange-500" /> 求购专区
          </h1>
          <button onClick={() => token ? setShowForm(true) : nav('/login?from=%2Fwanted')} className="btn-primary h-9 px-4 text-xs">
            <Plus size={14} /> 发布求购
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchList(); }} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input className="input pl-9 pr-3" placeholder="搜你想买的..." value={kw} onChange={e => setKw(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary h-11 px-5 text-sm">搜索</button>
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {['', ...(cfg?.campus_list || [])].map(c => (
            <button key={c || '全部'} onClick={() => setCampus(c)}
              className={`shrink-0 text-xs px-3 h-7 rounded-full transition ${campus === c ? 'bg-orange-500 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
              {c || '全部校区'}
            </button>
          ))}
        </div>
      </header>

      {/* 列表 */}
      <section className="p-4 space-y-3">
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-400 animate-pulse">加载中...</div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-5xl mb-3">📢</div>
            <div className="text-sm text-zinc-400 mb-4">还没有求购信息</div>
            <button onClick={() => token ? setShowForm(true) : nav('/login?from=%2Fwanted')} className="btn-primary h-10 px-6 text-sm">
              <Plus size={16} /> 发布第一条求购
            </button>
          </div>
        ) : (
          list.map(w => (
            <Link to={`/wanted/${w.id}`} key={w.id} className="card p-3.5 active:bg-zinc-50 block">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-zinc-800">{w.title}</span>
                    {w.category_icon && <span className="text-base">{w.category_icon}</span>}
                  </div>
                  {w.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{w.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-400">
                    {w.campus && <span className={`chip ${campusColor(w.campus)} !text-[10px] !py-0`}><MapPin size={9} className="inline -mt-0.5" /> {w.campus}</span>}
                    <span>{w.buyer_name}</span>
                    <span>·</span>
                    <span>{timeAgo(w.created_at)}</span>
                  </div>
                </div>
                {w.expect_price != null && (
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-zinc-400">预期价格</div>
                    <div className="text-sm font-bold text-orange-500">≤ {w.expect_price}元</div>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </section>

      {/* 发布求购弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold">发布求购</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700">想买什么 <span className="text-red-500">*</span></label>
                <input className="input h-11 mt-1.5" placeholder="例：二手自行车 / 高数课本 / 显示器" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700">详细需求</label>
                <textarea className="textarea h-24 mt-1.5" placeholder="描述一下你的需求，比如品牌、型号、成色要求等" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-700">预期价格（元）</label>
                  <input className="input h-11 mt-1.5" type="number" placeholder="例：150" value={form.expect_price} onChange={e => setForm(f => ({ ...f, expect_price: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700">校区</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(cfg?.campus_list || []).map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, campus: c }))}
                        className={`text-xs px-2.5 h-8 rounded-lg transition ${form.campus === c ? 'bg-orange-500 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700">分类（可选）</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <button onClick={() => setForm(f => ({ ...f, category_id: '' }))}
                    className={`text-xs px-2.5 h-8 rounded-lg transition ${!form.category_id ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-600'}`}>不限</button>
                  {(cfg?.categories || []).map(c => (
                    <button key={c.id} onClick={() => setForm(f => ({ ...f, category_id: String(c.id) }))}
                      className={`text-xs px-2.5 h-8 rounded-lg transition ${form.category_id === String(c.id) ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700">联系方式 <span className="text-red-500">*</span></label>
                <input className="input h-11 mt-1.5" placeholder="微信 / QQ / 手机号" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
                <div className="text-[11px] text-zinc-400 mt-1">卖家会通过此联系方式联系你</div>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>发布求购后，有东西卖的卖家会直接通过你填的联系方式联系你，请确保联系方式准确。</div>
              </div>
              <button onClick={submit} disabled={submitting} className="btn-primary w-full h-12 text-sm font-bold">
                {submitting ? '发布中...' : '✨ 确认发布求购'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
