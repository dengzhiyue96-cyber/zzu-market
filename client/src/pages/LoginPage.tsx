import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, GraduationCap, User, Mail, Shield, AlertCircle, Check } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const login = useApp((s) => s.login);
  const from = params.get('from') || '/';
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ username: '', password: '', nickname: '', school_email: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string; code?: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const r = await api(url, { method: 'POST', data: form });
      if (r.code === 0) {
        login(r.data.token, r.data.user);
        if (mode === 'register') {
          setMsg({ type: 'ok', text: `注册成功！校园邮箱验证码：${r.data.verify_code || '请在个人中心获取'}，去完成校园认证吧`, code: r.data.verify_code });
          setTimeout(() => nav('/me/verify'), 1200);
        } else {
          setMsg({ type: 'ok', text: '登录成功，正在跳转...' });
          setTimeout(() => nav(decodeURIComponent(from)), 800);
        }
      } else {
        setMsg({ type: 'err', text: r.msg });
      }
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.msg || '网络异常' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full grid lg:grid-cols-2 bg-gradient-to-br from-brand-soft via-white to-white">
      {/* 左侧插画/品牌区 */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-brand via-[#5D4DEE] to-[#8A7CFF] text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-2xl">郑</div>
          <div>
            <div className="text-xl font-black">郑大二手市场</div>
            <div className="text-sm text-white/80">郑州大学专属二手交易平台</div>
          </div>
        </div>

        <div>
          <div className="text-4xl font-black leading-tight mb-4">校内直连 ·<br />放心交易</div>
          <ul className="space-y-3 text-white/90 text-sm">
            {[
              ['🎓', '仅郑大学生可注册交易，杜绝社会人员'],
              ['📢', '求购专区，发布你想买的东西'],
              ['📚', '教材课程智能匹配，学长学姐的书直接对接'],
              ['🛡', '联系方式直接沟通，同学之间更放心'],
            ].map(([icon, t]) => (
              <li key={t} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                <span className="text-xl">{icon}</span><span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-white/60">
          © 2025 郑大二手市场 · 郑州大学学生创业项目 · 只为同学更好服务
        </div>
      </div>

      {/* 右侧表单 */}
      <div className="flex items-center justify-center p-5 lg:p-10">
        <div className="w-full max-w-sm">
          {/* 手机端品牌 */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand/30">郑</div>
              <div className="text-left">
                <div className="text-xl font-black">郑大二手市场</div>
                <div className="text-xs text-zinc-500">郑州大学专属 · 校内交易</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            {/* 切换Tab */}
            <div className="grid grid-cols-2 p-1 rounded-full bg-zinc-100 mb-6">
              {(['login', 'register'] as Mode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setMsg(null); }}
                  className={`h-9 rounded-full text-sm font-medium transition ${mode === m ? 'bg-white text-brand shadow-sm' : 'text-zinc-500'}`}>
                  {m === 'login' ? '登录' : '注册'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              <Field icon={<User size={16} />} label="用户名 / 校园邮箱" placeholder="如：zzu_2024 或 2024xxxxx@gs.zzu.edu.cn"
                value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} />

              {mode === 'register' && (
                <>
                  <Field icon={<User size={16} />} label="昵称（同学看到的名字）" placeholder="如：柳园的小明"
                    value={form.nickname} onChange={v => setForm(f => ({ ...f, nickname: v }))} />
                  <Field icon={<Mail size={16} />} label="郑大校园邮箱（用于认证，可选）" placeholder="如：20241010101@gs.zzu.edu.cn"
                    value={form.school_email} onChange={v => setForm(f => ({ ...f, school_email: v }))} />
                </>
              )}

              <Field icon={<Lock size={16} />} label="密码" type="password" placeholder={mode === 'login' ? '请输入密码' : '至少6位，建议字母+数字组合'}
                value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />

              {/* 认证提示 */}
              {mode === 'register' && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 flex gap-2">
                  <Shield size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <b>校园邮箱是认证关键：</b>
                    格式通常是「学号@gs.zzu.edu.cn」。
                    注册后系统会自动生成6位验证码，复制到「个人中心→校园认证」粘贴即可完成认证，
                    <b>认证后才可以发布商品 + 开通担保交易权限。</b>
                  </div>
                </div>
              )}

              {msg && (
                <div className={`rounded-xl p-3 text-xs flex items-start gap-2 ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {msg.type === 'ok' ? <Check size={14} className="mt-0.5" /> : <AlertCircle size={14} className="mt-0.5" />}
                  <div>
                    {msg.text}
                    {msg.code && (
                      <div className="mt-2 p-2 bg-white/80 rounded-lg text-center font-mono font-bold text-sm tracking-widest select-all">
                        验证码：{msg.code}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button disabled={loading} className="btn-primary w-full h-11 text-sm font-bold">
                {loading ? '提交中...' : mode === 'login' ? '登 录' : '立即注册 · 加入郑大二手市场'}
              </button>

              {/* 快捷测试账号 */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 text-[11px] text-zinc-500 space-y-1">
                <div className="font-bold text-zinc-700 flex items-center gap-1"><GraduationCap size={12} /> 测试体验账号（密码均为 123456）：</div>
                <div>• 管理员：<code className="px-1.5 py-0.5 bg-white rounded font-mono text-zinc-700">admin / 123456</code></div>
                <div>• 软件学院大三：<code className="px-1.5 py-0.5 bg-white rounded font-mono text-zinc-700">zzu_001 / 123456</code>（柳园校区）</div>
                <div>• 商学院大四：<code className="px-1.5 py-0.5 bg-white rounded font-mono text-zinc-700">zzu_002 / 123456</code>（荷园校区）</div>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-[11px] text-zinc-400">
            登录/注册即同意《郑大二手市场用户协议》和《隐私保护政策》
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, placeholder, value, onChange, type = 'text' }: {
  icon: React.ReactNode; label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-700 mb-1.5 block">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} className="input pl-10 h-11" />
      </div>
    </label>
  );
}
