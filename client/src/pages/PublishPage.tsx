import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, BookOpenCheck, MapPin, AlertCircle, X, Upload } from 'lucide-react';
import { useApp } from '../store/app';
import { api } from '../lib/http';

export default function PublishPage() {
  const cfg = useApp((s) => s.config);
  const me = useApp((s) => s.user);
  const token = useApp((s) => s.token);
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    category_id: '',
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: '9成新',
    campus: me?.campus || '主校区',
    contact: '',
    textbook_id: '' as string | number,
    course_name: '',
  });
  const [images, setImages] = useState<string[]>([]);

  // 教材搜索
  const [tbKeyword, setTbKeyword] = useState('');
  const [tbSuggest, setTbSuggest] = useState<any[]>([]);

  const catName = useMemo(
    () => cfg?.categories.find(c => String(c.id) === form.category_id)?.name,
    [cfg, form.category_id]
  );

  useEffect(() => {
    if (!tbKeyword.trim() || catName !== '教材教辅' && catName !== '考研考证') { setTbSuggest([]); return; }
    api(`/api/textbooks/search?keyword=${encodeURIComponent(tbKeyword)}&limit=10`).then(r => r.code === 0 && setTbSuggest(Array.isArray(r.data) ? r.data.slice(0, 8) : []));
  }, [tbKeyword, catName]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (images.length >= 6) return showToast('最多6张图片');
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise<void>(r => reader.onload = () => r());
      const r = await api('/api/upload', { method: 'POST', data: { base64: reader.result } });
      if (r.code === 0) setImages(imgs => [...imgs, r.data.url]);
      else showToast(r.msg);
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeImg(i: number) {
    setImages(imgs => imgs.filter((_, idx) => idx !== i));
  }

  function pickTb(tb: any) {
    setForm(f => ({ ...f, textbook_id: tb.id, course_name: tb.course_name }));
    setTbSuggest([]);
    setTbKeyword(tb.book_name);
    showToast(`已匹配《${tb.book_name}》`);
  }

  async function submit() {
    if (!token) return nav('/login?from=%2Fpublish');
    if (!form.category_id) return showToast('请选择分类');
    if (!form.title.trim()) return showToast('请输入标题');
    if (form.title.length < 4) return showToast('标题至少4个字');
    if (!(Number(form.price) >= 0)) return showToast('请输入正确的价格');
    if (!form.contact.trim()) return showToast('请填写联系方式（微信/QQ/手机号）');
    setLoading(true);
    const payload: any = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      textbook_id: form.textbook_id ? Number(form.textbook_id) : null,
      cover: images[0] || '',
      images,
    };
    const r = await api('/api/products', { method: 'POST', data: payload });
    setLoading(false);
    if (r.code === 0) {
      showToast('🎉 发布成功！');
      setTimeout(() => nav(`/product/${r.data.id}`), 1200);
    } else showToast(r.msg);
  }

  return (
    <div className="max-w-xl mx-auto pb-10 bg-white min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-zinc-500 shrink-0"><ArrowLeft size={20} /></Link>
        <h1 className="text-base font-bold flex-1">发布闲置</h1>
        <button onClick={submit} disabled={loading} className="btn-primary h-9 px-4 text-xs">
          {loading ? '发布中...' : '立即发布'}
        </button>
      </header>

      <section className="p-4 space-y-5">
        {/* 图片 */}
        <Block title="商品图片" sub="最多6张，第一张为封面图">
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100">
                <img src={src} className="w-full h-full object-cover" />
                <button onClick={() => removeImg(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={12} /></button>
              </div>
            ))}
            {images.length < 6 && (
              <button onClick={() => fileRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 flex flex-col items-center justify-center gap-1 active:bg-zinc-100">
                <ImagePlus size={26} />
                <span className="text-[11px]">上传图片</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickFile} />
        </Block>

        {/* 分类 */}
        <Block title="分类" required>
          <div className="grid grid-cols-4 gap-2">
            {cfg?.categories.map(c => (
              <button key={c.id} onClick={() => setForm(f => ({ ...f, category_id: String(c.id) }))}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition ${form.category_id === String(c.id) ? 'bg-brand/10 border border-brand text-brand' : 'bg-zinc-50 text-zinc-700 border border-transparent'}`}>
                <span className="text-xl">{c.icon}</span>
                <span className="text-[11px] font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        </Block>

        {/* 教材搜索（只有教辅/考研类显示） */}
        {(catName === '教材教辅' || catName === '考研考证') && (
          <Block title="教材/课程匹配（郑大专属）" sub="帮你精准对接需要这门课的学弟学妹">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand"><BookOpenCheck size={16} /></div>
              <input className="input pl-9" placeholder="输入书名或课程，如：高等数学、肖秀荣1000题..." value={tbKeyword} onChange={(e) => setTbKeyword(e.target.value)} />
              {tbSuggest.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1.5 card p-1 max-h-64 overflow-y-auto">
                  {tbSuggest.map(tb => (
                    <button key={tb.id} onClick={() => pickTb(tb)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-50">
                      <div className="text-sm font-medium text-zinc-800 truncate">{tb.book_name}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                        <span className="chip chip-brand !py-0 !px-1.5">{tb.course_name || '课程'}</span>
                        <span>{tb.college}</span>
                        <span>·</span>
                        <span>{tb.grade}</span>
                        {tb.sell_count ? <span className="ml-auto text-emerald-600">{tb.sell_count}本在售</span> : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.textbook_id && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-700">
                <BookOpenCheck size={14} />
                已匹配教材，发布后会出现在「找教材」对应课程下
              </div>
            )}
          </Block>
        )}

        {/* 标题 */}
        <Block title="标题" required>
          <input className="input" maxLength={50} placeholder="如：iPad 2021 64G WiFi 几乎全新" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="text-[11px] text-zinc-400 mt-1">{form.title.length}/50，优秀的标题能提高50%成交率</div>
        </Block>

        {/* 价格 */}
        <Block title="价格" required>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-500 mb-1 block">转让价（元）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">¥</span>
                <input inputMode="decimal" className="input pl-7 !text-base !font-bold" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 mb-1 block">原价（选填）</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">¥</span>
                <input inputMode="decimal" className="input pl-7" placeholder="购买原价" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} />
              </div>
            </div>
          </div>
        </Block>

        {/* 成色 / 校区 */}
        <div className="grid grid-cols-2 gap-3">
          <Block title="成色" required>
            <Chips values={cfg?.condition_list || []} value={form.condition} onChange={v => setForm(f => ({ ...f, condition: v }))} />
          </Block>
          <Block title="校区" required>
            <Chips values={cfg?.campus_list || []} value={form.campus} onChange={v => setForm(f => ({ ...f, campus: v }))} icon={<MapPin size={9} className="inline -mt-0.5" />} />
          </Block>
        </div>

        {/* 联系方式 */}
        <Block title="联系方式" required>
          <input
            className="input h-11"
            placeholder="微信 / QQ / 手机号（买家会通过此联系方式联系你）"
            value={form.contact}
            onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
          />
          <div className="text-[11px] text-zinc-400 mt-1">⚠️ 请填写真实的联系方式，买家将直接通过此方式联系你</div>
        </Block>

        {/* 描述 */}
        <Block title="商品描述">
          <textarea className="textarea h-32" maxLength={800} placeholder="描述一下商品的购买时间、使用次数、有没有瑕疵、为什么出掉吧～&#10;&#10;例：2024年双11购入，只穿过两次，洗过一次，吊牌不在了，因为买大了一码所以出。"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="text-[11px] text-zinc-400 mt-1 text-right">{form.description.length}/800</div>
        </Block>

        {/* 发布提示 */}
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <b>郑大集市禁止发布：</b><br />
            假冒伪劣、烟酒、药品、管制物品、虚假身份的商品。违规一次永久封号，情节严重上报学校保卫处。
          </div>
        </div>

        <button onClick={submit} disabled={loading} className="btn-primary w-full h-12 text-sm font-bold">
          {loading ? '发布中...' : '✨ 确认发布'}
        </button>
        <div className="text-[11px] text-center text-zinc-400">
          发布即同意《郑大集市用户协议》
        </div>
      </section>

      {toast && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-900/90 text-white text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function Block({ title, sub, required, children }: { title: string; sub?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-1">
        <span className="text-sm font-bold">{title}</span>
        {required && <span className="text-red-500">*</span>}
        {sub && <span className="text-[11px] text-zinc-400 ml-auto">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

function Chips({ values, value, onChange, icon }: { values: string[]; value: string; onChange: (v: string) => void; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map(v => (
        <button key={v} onClick={() => onChange(v)} className={`px-2.5 h-7 rounded-full text-xs transition ${value === v ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-700'}`}>
          {icon}{v}
        </button>
      ))}
    </div>
  );
}
