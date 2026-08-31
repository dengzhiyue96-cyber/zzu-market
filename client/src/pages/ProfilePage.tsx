import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Settings, Package, Heart, MessageCircle, Shield, Edit3, MapPin, BarChart3, Upload, CircleHelp, Bell } from 'lucide-react';
import { useApp } from '../store/app';
import { verifiedBadge, campusColor } from '../lib/utils';
import { api } from '../lib/http';

export default function ProfilePage() {
  const me = useApp((s) => s.user);
  const logout = useApp((s) => s.logout);
  const nav = useNavigate();
  const vb = verifiedBadge(me?.verified);

  if (!me) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <div className="text-4xl mb-2">👤</div>
        <div className="text-sm text-zinc-500 mb-4">请先登录查看你的中心</div>
        <Link to="/login" className="btn-primary px-6 h-10 text-sm inline-flex">去登录</Link>
      </div>
    );
  }

  const menuGroups: any[] = [
    {
      title: '我的交易',
      items: [
        { icon: Package, label: '我发布的', desc: `在售 ${me.stat?.selling_count || 0} · 已售 ${me.stat?.sold_count || 0}`, to: '/me/products' },
        { icon: Heart, label: '我的收藏', desc: `${me.stat?.fav_count || 0} 件心动商品`, to: '/favorites' },
        { icon: MessageCircle, label: '消息中心', desc: `${me.stat?.unread_count || 0} 条未读`, to: '/chats', badge: me.stat?.unread_count },
      ],
    },
    {
      title: '校园认证',
      items: [
        {
          icon: Shield,
          label: me.verified === 2 ? '✓ 已完成校园认证' : me.verified === 1 ? '认证审核中...' : '完成校园认证（解锁发布权限）',
          desc: me.school_email ? `邮箱：${me.school_email}` : '绑定郑大校园邮箱，一键认证',
          to: '/me/verify',
          tag: me.verified === 2 ? { text: '已认证', cls: 'bg-emerald-100 text-emerald-700' } : me.verified === 1 ? { text: '审核中', cls: 'bg-amber-100 text-amber-700' } : { text: '未认证', cls: 'bg-red-100 text-red-600' },
        },
      ],
    },
    {
      title: '工具与设置',
      items: [
        { icon: Edit3, label: '编辑个人资料', desc: '昵称/头像/专业/宿舍/联系方式', to: '/me/profile' },
        { icon: Upload, label: '发布闲置', desc: '快把你宿舍的宝藏转给学弟学妹～', to: '/publish', primary: true },
        { icon: BarChart3, label: '经营数据（即将上线）', desc: '访问量/咨询量/成交统计', to: '' },
        { icon: Bell, label: '消息通知设置', desc: '有人咨询/出价/收藏 立刻提醒', to: '' },
        { icon: CircleHelp, label: '帮助中心 & 联系客服', desc: '交易纠纷/诈骗举报/运营合作', to: '' },
      ],
    },
  ];

  async function onLogout() {
    if (!confirm('确定退出登录吗？')) return;
    logout();
    nav('/');
  }

  return (
    <div className="max-w-xl mx-auto pb-6">
      {/* 头部卡片 */}
      <section className="mx-4 mt-4 rounded-2xl p-4 bg-gradient-to-br from-brand via-[#5D4DEE] to-[#7C6BFF] text-white shadow-lg shadow-brand/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center font-black text-2xl">
            {me.nickname?.slice(0, 1) || '郑'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold truncate">{me.nickname}</span>
              <span className={`chip ${vb.cls} !py-0`}>{vb.text}</span>
              {me.role === 'admin' && <span className="chip !bg-amber-400 !text-amber-900 !py-0">管理员</span>}
            </div>
            <div className="text-xs text-white/80 mt-1 flex items-center gap-2 flex-wrap">
              {me.major && <span>📚 {me.major}</span>}
              {me.grade && <span>🎓 {me.grade}</span>}
              {me.campus && <span className={`chip ${campusColor(me.campus)} !py-0 !text-[10px] bg-white/90`}><MapPin size={9} className="inline -mt-0.5" />{me.campus}</span>}
            </div>
            <div className="text-[11px] text-white/70 mt-1 truncate">{me.dormitory || '尚未填写宿舍信息'}</div>
          </div>
          <Link to="/me/profile" className="btn-outline h-8 px-3 text-[11px] !bg-white/15 !border-white/20 !text-white backdrop-blur">
            <Settings size={12} /> 编辑
          </Link>
        </div>

        {/* 数据条 */}
        <div className="relative mt-4 grid grid-cols-4 gap-1 text-center pt-3 border-t border-white/15">
          <Stat label="在售" value={me.stat?.selling_count || 0} />
          <Stat label="已售" value={me.stat?.sold_count || 0} />
          <Stat label="收藏" value={me.stat?.fav_count || 0} />
          <Stat label="未读" value={me.stat?.unread_count || 0} />
        </div>
      </section>

      {/* 菜单项 */}
      <div className="mx-4 mt-5 space-y-4">
        {menuGroups.map((g, gi) => (
          <div key={gi} className="card overflow-hidden">
            <div className="px-4 py-2 text-[11px] text-zinc-500 font-bold bg-zinc-50 border-b border-zinc-100">{g.title}</div>
            <ul>
              {g.items.map((it: any, i: number) => {
                const content = (
                  <div className={`px-4 py-3.5 flex items-center gap-3 ${i < g.items.length - 1 ? 'border-b border-zinc-50' : ''} ${it.primary ? 'bg-brand-soft/40' : ''} transition active:bg-zinc-50`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${it.primary ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                      <it.icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-800 flex items-center gap-2">
                        {it.label}
                        {it.badge ? <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{it.badge > 99 ? '99+' : it.badge}</span> : null}
                      </div>
                      {it.desc && <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{it.desc}</div>}
                    </div>
                    {'tag' in it && it.tag ? (
                      <span className={`chip ${(it as any).tag.cls} !py-0 text-[10px] shrink-0`}>{(it as any).tag.text}</span>
                    ) : it.to ? (
                      <ChevronRight size={16} className="text-zinc-300 shrink-0" />
                    ) : (
                      <span className="chip !text-[10px] !py-0 bg-zinc-100 text-zinc-500 shrink-0">即将上线</span>
                    )}
                  </div>
                );
                return <li key={i}>{it.to ? <Link to={it.to}>{content}</Link> : content}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* 退出登录 */}
      <div className="mx-4 mt-5 mb-8">
        <button onClick={onLogout} className="w-full card py-3.5 text-sm font-medium text-red-500 flex items-center justify-center gap-1.5">
          <LogOut size={16} /> 退出登录
        </button>
      </div>

      <div className="text-center text-[11px] text-zinc-400 pb-6">
        郑大二手市场 v1.0 · 运行中 · 累计服务 {0} 名郑大同学
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-lg font-black">{value}</div>
      <div className="text-[10px] text-white/75">{label}</div>
    </div>
  );
}
