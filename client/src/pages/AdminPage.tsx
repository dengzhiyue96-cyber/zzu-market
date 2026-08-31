import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/app';
import { api } from '../lib/http';
import { timeAgo, formatPrice } from '../lib/utils';
import ZZULogo from '../components/ZZULogo';
import {
  BarChart3, Package, Users, Megaphone, AlertTriangle, MessageCircle,
  Eye, XCircle, CheckCircle2, PencilLine, Ban, Search, ChevronLeft, ChevronRight,
  Crown, LogOut, TrendingUp, Shield, RotateCcw,
} from 'lucide-react';

type Tab = 'overview' | 'products' | 'users' | 'wanted' | 'reports';

export default function AdminPage() {
  const nav = useNavigate();
  const user = useApp((s) => s.user);
  const logout = useApp((s) => s.logout);
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      nav('/');
      return;
    }
    api('/api/admin/stats').then(r => r.code === 0 && setStats(r.data));
  }, [user, nav]);

  if (user?.role !== 'admin') {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        无权限，仅管理员可访问。正在跳转...
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: '数据看板', icon: BarChart3 },
    { key: 'products', label: '商品管理', icon: Package },
    { key: 'users',    label: '用户管理', icon: Users },
    { key: 'wanted',   label: '求购管理', icon: Megaphone },
    { key: 'reports',  label: '举报处理', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800">
      {/* 顶栏 */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand via-[#7B46AA] to-brand-dark text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ZZULogo size={36} withText className="!text-white [&_div_div]:text-white [&_div_div:last-child]:text-white/70" />
            <span className="ml-2 px-2.5 py-1 rounded-full text-[10px] bg-white/20 backdrop-blur">
              <Crown size={12} className="inline -mt-0.5 mr-1" />
              管理后台
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline opacity-90">欢迎，{user?.nickname || '管理员'}</span>
            <button
              onClick={() => { logout(); nav('/'); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition"
            >
              <LogOut size={14} /> 退出
            </button>
          </div>
        </div>
        {/* Tab */}
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition ${
                tab === t.key
                  ? 'border-gold text-white font-semibold bg-white/10'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <t.icon size={16} /> {t.label}
              {t.key === 'reports' && stats?.summary?.reportsPending > 0 && (
                <span className="ml-0.5 min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 flex items-center justify-center">
                  {stats.summary.reportsPending}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {tab === 'overview' && <OverviewTab stats={stats} onJump={setTab} />}
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'users' && <UsersAdmin />}
        {tab === 'wanted' && <WantedAdmin />}
        {tab === 'reports' && <ReportsAdmin />}
      </main>
    </div>
  );
}

/* ================== Tab 1：数据看板 ================== */
function OverviewTab({ stats, onJump }: { stats: any; onJump: (t: Tab) => void }) {
  const s = stats?.summary || {};
  const trend = stats?.weekTrend || [];

  const cards = [
    { label: '用户总数', value: s.users || 0, sub: `今日新增 ${s.usersNew || 0}`, icon: Users, color: 'from-brand to-[#8B4FBD]', action: () => onJump('users') },
    { label: '认证学生', value: s.verifiedUsers || 0, sub: '已通过校园认证', icon: Shield, color: 'from-gold to-[#E6C07A]', action: () => onJump('users') },
    { label: '商品总数', value: s.products || 0, sub: `在售 ${s.productsActive} / 已售 ${s.productsSold}`, icon: Package, color: 'from-[#4A56B0] to-[#6A3A91]', action: () => onJump('products') },
    { label: '求购信息', value: s.wanted || 0, sub: `在求 ${s.wantedActive} 条`, icon: Megaphone, color: 'from-[#07C160] to-[#3ED88E]', action: () => onJump('wanted') },
    { label: '消息总量', value: s.messages || 0, sub: `会话数 ${s.chats}`, icon: MessageCircle, color: 'from-[#F09E3C] to-[#F4B86A]', action: () => onJump('reports') },
    { label: '举报待处理', value: s.reportsPending || 0, sub: `累计举报 ${s.reports}`, icon: AlertTriangle, color: 'from-[#E05A5A] to-[#F28E8E]', action: () => onJump('reports'), warn: (s.reportsPending || 0) > 0 },
    { label: '收藏行为', value: s.favorites || 0, sub: '用户累计收藏次数', icon: TrendingUp, color: 'from-[#8B4FBD] to-[#C9A658]', action: () => onJump('products') },
    { label: '成交 GMV 估算', value: `¥ ${Number(s.gmv || 0).toFixed(0)}`, sub: '所有标记为已售的商品总价', icon: Crown, color: 'from-[#C9A658] to-[#6A3A91]', action: () => onJump('products') },
  ];

  const max = Math.max(1, ...trend.map((d: any) => Math.max(d.users, d.products, d.wanted)));

  return (
    <div className="space-y-6">
      {/* KPI 卡片 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <button
            key={c.label}
            onClick={c.action}
            className={`text-left card p-5 hover:shadow-lg transition group ${c.warn ? 'ring-2 ring-red-300 animate-pulse' : ''}`}
          >
            <div className={`inline-flex w-10 h-10 rounded-xl text-white items-center justify-center bg-gradient-to-br ${c.color} shadow-md mb-3 group-hover:scale-105 transition`}>
              <c.icon size={18} />
            </div>
            <div className="text-xs text-zinc-500">{c.label}</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900">{c.value}</div>
            <div className="mt-1 text-[11px] text-zinc-400">{c.sub}</div>
          </button>
        ))}
      </div>

      {/* 趋势图 */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-base font-bold text-zinc-900">近 7 天数据趋势</div>
            <div className="text-xs text-zinc-500 mt-0.5">用户注册 / 商品发布 / 求购发布 每日数量</div>
          </div>
          <div className="flex gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand"></span> 新增用户</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gold-dark"></span> 新增商品</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#07C160]"></span> 新增求购</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 h-52 border-b border-l border-zinc-100 px-2 pb-2">
          {trend.map((d: any) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1 justify-center h-44">
                <div className="w-1/3 rounded-t bg-brand transition-all hover:opacity-80"
                  style={{ height: `${(d.users / max) * 100}%`, minHeight: d.users > 0 ? '3px' : 0 }}
                  title={`新增用户: ${d.users}`}
                />
                <div className="w-1/3 rounded-t bg-gold-dark transition-all hover:opacity-80"
                  style={{ height: `${(d.products / max) * 100}%`, minHeight: d.products > 0 ? '3px' : 0 }}
                  title={`新增商品: ${d.products}`}
                />
                <div className="w-1/3 rounded-t bg-[#07C160] transition-all hover:opacity-80"
                  style={{ height: `${(d.wanted / max) * 100}%`, minHeight: d.wanted > 0 ? '3px' : 0 }}
                  title={`新增求购: ${d.wanted}`}
                />
              </div>
              <div className="text-[11px] text-zinc-500">{d.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================== 通用列表分页 Hook ================== */
function useList<T = any>(fetchFn: (q: any) => Promise<any>, deps: any[] = []) {
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<any>({});

  async function load(q?: any, p?: number) {
    const params = { ...query, ...q };
    if (p) setPage(p);
    setQuery(params);
    setLoading(true);
    try {
      const r = await fetchFn({ ...params, page: p || page, size });
      if (r.code === 0) {
        setList(r.data.list || []);
        setTotal(r.data.total || 0);
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { load() }, [...deps]); // eslint-disable-line

  return { list, total, page, size, setPage, load, loading, query, setQuery };
}

/* ================== Tab 2：商品管理 ================== */
function ProductsAdmin() {
  const { list, total, page, size, setPage, load, loading } = useList<any>(
    (q) => api(`/api/admin/products?${new URLSearchParams(q as any).toString()}`)
  );
  const [kw, setKw] = useState('');
  const [status, setStatus] = useState<string>('all');

  function search() { load({ keyword: kw, status }, 1); }

  async function action(id: number, act: string) {
    if (!confirm(`确认操作：${act}？`)) return;
    const r = await api(`/api/admin/products/${id}`, { method: 'PUT', data: { action: act } });
    if (r.code === 0) { load(); } else alert(r.msg);
  }

  const statusMap: Record<number, string> = { 0: '已下架', 1: '在售', 2: '已售', 3: '已删除' };

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-zinc-400" />
          <input value={kw} onChange={e => setKw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="搜索商品标题 / 商品ID" className="input !py-2" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); load({ status: e.target.value }, 1); }} className="input !py-2 !w-auto">
          <option value="all">全部状态</option>
          <option value="1">在售</option>
          <option value="0">已下架</option>
          <option value="2">已售</option>
          <option value="3">已删除</option>
        </select>
        <button onClick={search} className="btn-primary px-5 h-10">搜索</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">封面</th>
                <th className="text-left p-3">标题</th>
                <th className="text-left p-3">卖家</th>
                <th className="text-left p-3">价格</th>
                <th className="text-left p-3">校区</th>
                <th className="text-left p-3">状态</th>
                <th className="text-left p-3">发布时间</th>
                <th className="text-left p-3 w-60">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="p-6 text-center text-zinc-400">加载中...</td></tr>}
              {!loading && list.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-zinc-400">暂无数据</td></tr>}
              {list.map((p: any) => (
                <tr key={p.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="p-3 text-zinc-500">#{p.id}</td>
                  <td className="p-3">
                    <img src={p.cover || ''} alt="" className="w-12 h-12 rounded-lg object-cover bg-zinc-100" />
                  </td>
                  <td className="p-3 max-w-[200px] truncate font-medium">{p.title}</td>
                  <td className="p-3">{p.seller_name || '-'}</td>
                  <td className="p-3 text-brand font-semibold">{formatPrice(p.price)}</td>
                  <td className="p-3 text-zinc-500">{p.campus || '-'}</td>
                  <td className="p-3">
                    <span className={`chip ${
                      p.status === 1 ? 'chip-brand'
                      : p.status === 2 ? 'chip-gold'
                      : p.status === 3 ? '!bg-red-50 !text-red-600'
                      : '!bg-zinc-200 !text-zinc-600'
                    }`}>{statusMap[p.status] || '未知'}</span>
                  </td>
                  <td className="p-3 text-zinc-500 text-xs">{timeAgo(p.created_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => window.open(`/product/${p.id}`, '_blank')}
                        className="chip hover:!bg-brand hover:!text-white transition inline-flex items-center gap-1">
                        <Eye size={12} /> 查看
                      </button>
                      {p.status === 1 && (
                        <button onClick={() => action(p.id, 'offline')}
                          className="chip hover:!bg-amber-100 hover:!text-amber-700 inline-flex items-center gap-1">
                          <XCircle size={12} /> 下架
                        </button>
                      )}
                      {p.status === 0 && (
                        <button onClick={() => action(p.id, 'online')}
                          className="chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> 恢复
                        </button>
                      )}
                      <button onClick={() => action(p.id, 'delete')}
                        className="chip !bg-red-50 !text-red-600 hover:!bg-red-100 inline-flex items-center gap-1">
                        <Ban size={12} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} size={size} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

/* ================== Tab 3：用户管理 ================== */
function UsersAdmin() {
  const { list, total, page, size, setPage, load, loading } = useList<any>(
    (q) => api(`/api/admin/users?${new URLSearchParams(q as any).toString()}`)
  );
  const [kw, setKw] = useState('');
  const [vf, setVf] = useState<string>('all');

  function search() { load({ keyword: kw, verified: vf }, 1); }

  async function act(id: number, action: string, value?: any) {
    const r = await api(`/api/admin/users/${id}`, {
      method: 'PUT',
      data: { action, ...(value !== undefined ? value : {}) }
    });
    if (r.code === 0) load(); else alert(r.msg);
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-zinc-400" />
          <input value={kw} onChange={e => setKw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="搜索用户名 / 昵称 / 校园邮箱 / 用户ID" className="input !py-2" />
        </div>
        <select value={vf} onChange={e => { setVf(e.target.value); load({ verified: e.target.value }, 1); }} className="input !py-2 !w-auto">
          <option value="all">全部认证状态</option>
          <option value="0">未认证</option>
          <option value="1">待审核</option>
          <option value="2">已认证</option>
        </select>
        <button onClick={search} className="btn-primary px-5 h-10">搜索</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">用户</th>
                <th className="text-left p-3">校园邮箱</th>
                <th className="text-left p-3">校区/宿舍</th>
                <th className="text-left p-3">认证</th>
                <th className="text-left p-3">角色</th>
                <th className="text-left p-3">注册时间</th>
                <th className="text-left p-3 w-80">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="p-6 text-center text-zinc-400">加载中...</td></tr>}
              {!loading && list.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-zinc-400">暂无数据</td></tr>}
              {list.map((u: any) => (
                <tr key={u.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="p-3 text-zinc-500">#{u.id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand font-bold">
                        {(u.nickname || u.username).charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{u.nickname || '-'}</div>
                        <div className="text-xs text-zinc-500">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-zinc-500">{u.school_email || '-'}</td>
                  <td className="p-3 text-xs text-zinc-500">{[u.campus, u.dormitory].filter(Boolean).join(' · ') || '-'}</td>
                  <td className="p-3">
                    <span className={`chip ${
                      u.verified === 2 ? 'chip-gold'
                      : u.verified === 1 ? 'chip-brand'
                      : ''
                    }`}>
                      {u.verified === 2 ? '✓ 已认证' : u.verified === 1 ? '审核中' : '未认证'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`chip ${
                      u.role === 'admin' ? 'zzu-badge-gold'
                      : u.role === 'banned' ? '!bg-red-50 !text-red-600'
                      : ''
                    }`}>
                      {u.role === 'admin' ? '管理员' : u.role === 'banned' ? '已封禁' : '普通用户'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-zinc-500">{timeAgo(u.created_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.verified === 1 && (
                        <button onClick={() => act(u.id, 'none', { verified: 2 })}
                          className="chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> 通过认证
                        </button>
                      )}
                      {u.verified !== 2 && (
                        <button onClick={() => act(u.id, 'none', { verified: 2 })}
                          className="chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1">
                          <Shield size={12} /> 标记认证
                        </button>
                      )}
                      {u.role !== 'admin' ? (
                        <button onClick={() => act(u.id, 'none', { role: 'admin' })}
                          className="chip chip-gold inline-flex items-center gap-1">
                          <Crown size={12} /> 升为管理员
                        </button>
                      ) : (
                        <button onClick={() => act(u.id, 'none', { role: 'user' })}
                          className="chip hover:!bg-zinc-200 inline-flex items-center gap-1">
                          <RotateCcw size={12} /> 降为普通
                        </button>
                      )}
                      {u.role !== 'banned' ? (
                        <button onClick={() => act(u.id, 'ban')}
                          className="chip !bg-red-50 !text-red-600 hover:!bg-red-100 inline-flex items-center gap-1">
                          <Ban size={12} /> 封禁
                        </button>
                      ) : (
                        <button onClick={() => act(u.id, 'unban')}
                          className="chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> 解封
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} size={size} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

/* ================== Tab 4：求购管理 ================== */
function WantedAdmin() {
  const { list, total, page, size, setPage, load, loading } = useList<any>(
    (q) => api(`/api/admin/wanted?${new URLSearchParams(q as any).toString()}`)
  );
  const [kw, setKw] = useState('');
  const [st, setSt] = useState<string>('all');
  function search() { load({ keyword: kw, status: st }, 1); }

  async function act(id: number, action: string) {
    const r = await api(`/api/admin/wanted/${id}`, { method: 'PUT', data: { action } });
    if (r.code === 0) load(); else alert(r.msg);
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-zinc-400" />
          <input value={kw} onChange={e => setKw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="搜索标题 / 描述" className="input !py-2" />
        </div>
        <select value={st} onChange={e => { setSt(e.target.value); load({ status: e.target.value }, 1); }} className="input !py-2 !w-auto">
          <option value="all">全部</option>
          <option value="1">显示中</option>
          <option value="0">已下架</option>
          <option value="2">已删除</option>
        </select>
        <button onClick={search} className="btn-primary px-5 h-10">搜索</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">标题</th>
                <th className="text-left p-3">价格</th>
                <th className="text-left p-3">发布人</th>
                <th className="text-left p-3">联系方式</th>
                <th className="text-left p-3">状态</th>
                <th className="text-left p-3">发布时间</th>
                <th className="text-left p-3 w-40">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="p-6 text-center text-zinc-400">加载中...</td></tr>}
              {!loading && list.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-zinc-400">暂无数据</td></tr>}
              {list.map((w: any) => (
                <tr key={w.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="p-3 text-zinc-500">#{w.id}</td>
                  <td className="p-3 max-w-[280px] font-medium">{w.title}</td>
                  <td className="p-3 text-brand font-semibold">{formatPrice(w.price)}</td>
                  <td className="p-3">ID {w.user_id}</td>
                  <td className="p-3 text-zinc-500 text-xs">{w.contact || '-'}</td>
                  <td className="p-3">
                    <span className={`chip ${
                      w.status === 1 ? 'chip-brand' : w.status === 2 ? '!bg-red-50 !text-red-600' : ''
                    }`}>
                      {w.status === 1 ? '显示' : w.status === 0 ? '下架' : '删除'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-zinc-500">{timeAgo(w.created_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {w.status === 1 && (
                        <button onClick={() => act(w.id, 'offline')}
                          className="chip hover:!bg-amber-100 hover:!text-amber-700 inline-flex items-center gap-1">
                          <XCircle size={12} /> 下架
                        </button>
                      )}
                      <button onClick={() => act(w.id, 'delete')}
                        className="chip !bg-red-50 !text-red-600 hover:!bg-red-100 inline-flex items-center gap-1">
                        <Ban size={12} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} size={size} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

/* ================== Tab 5：举报处理 ================== */
function ReportsAdmin() {
  const { list, total, page, size, setPage, load, loading } = useList<any>(
    (q) => api(`/api/admin/reports?${new URLSearchParams(q as any).toString()}`)
  );
  const [hd, setHd] = useState<string>('all');

  async function done(id: number) {
    const r = await api(`/api/admin/reports/${id}`, { method: 'PUT' });
    if (r.code === 0) load(); else alert(r.msg);
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <span className="text-sm text-zinc-500">处理状态：</span>
        {[
          ['all', '全部'],
          ['0', '待处理'],
          ['1', '已处理'],
        ].map(([v, t]) => (
          <button key={v} onClick={() => { setHd(v); load({ handled: v }, 1); }}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              hd === v ? 'bg-brand text-white border-brand shadow-glow' : 'bg-white border-zinc-200 text-zinc-600 hover:border-brand'
            }`}>{t}</button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">举报类型</th>
                <th className="text-left p-3">对象ID</th>
                <th className="text-left p-3">举报理由</th>
                <th className="text-left p-3">举报人ID</th>
                <th className="text-left p-3">状态</th>
                <th className="text-left p-3">时间</th>
                <th className="text-left p-3 w-52">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="p-6 text-center text-zinc-400">加载中...</td></tr>}
              {!loading && list.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-zinc-400">暂无举报，继续加油 🎉</td></tr>}
              {list.map((r: any) => (
                <tr key={r.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="p-3 text-zinc-500">#{r.id}</td>
                  <td className="p-3">
                    <span className="chip">
                      {r.target_type === 'product' ? '📦 商品' : r.target_type === 'user' ? '👤 用户' : '💬 消息'}
                    </span>
                  </td>
                  <td className="p-3 text-brand">#{r.target_id}</td>
                  <td className="p-3 max-w-[260px] text-zinc-700">{r.reason}</td>
                  <td className="p-3 text-zinc-500">#{r.reporter_id}</td>
                  <td className="p-3">
                    {r.handled
                      ? <span className="chip chip-gold inline-flex items-center gap-1"><CheckCircle2 size={12} /> 已处理</span>
                      : <span className="chip !bg-red-50 !text-red-600 inline-flex items-center gap-1 animate-pulse"><AlertTriangle size={12} /> 待处理</span>
                    }
                  </td>
                  <td className="p-3 text-xs text-zinc-500">{timeAgo(r.created_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => {
                        if (r.target_type === 'product') window.open(`/product/${r.target_id}`, '_blank');
                        else if (r.target_type === 'user') alert(`请在用户管理搜索用户ID：${r.target_id}`);
                        else alert(`消息 ID：${r.target_id}`);
                      }} className="chip hover:!bg-brand hover:!text-white inline-flex items-center gap-1">
                        <Eye size={12} /> 查看对象
                      </button>
                      {!r.handled && (
                        <button onClick={() => done(r.id)}
                          className="chip hover:!bg-emerald-100 hover:!text-emerald-700 inline-flex items-center gap-1">
                          <PencilLine size={12} /> 标记已处理
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} size={size} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

/* ================== 分页组件 ================== */
function Pagination({ page, size, total, onChange }: { page: number; size: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="p-4 flex items-center justify-between border-t border-zinc-100 text-sm">
      <span className="text-zinc-500 text-xs">共 {total} 条 · 第 {page}/{pages} 页</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}
          className="inline-flex items-center w-9 h-9 rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => onChange(Math.min(pages, page + 1))} disabled={page >= pages}
          className="inline-flex items-center w-9 h-9 rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
