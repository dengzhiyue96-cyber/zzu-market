import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, GraduationCap, Upload, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/http';
import { useApp } from '../store/app';
import { verifiedBadge } from '../lib/utils';

export default function VerifyPage() {
  const me = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const nav = useNavigate();
  const [mode, setMode] = useState<'email' | 'card'>('email');
  const [emailCode, setEmailCode] = useState('');
  const [cardImg, setCardImg] = useState('');
  const [toast, setToast] = useState<{ t: 'ok' | 'err'; msg: string } | null>(null);
  const vb = verifiedBadge(me?.verified);

  function showToast(t: 'ok' | 'err', msg: string) {
    setToast({ t, msg });
    setTimeout(() => setToast(null), 2500);
  }

  async function submitEmail() {
    if (!emailCode.trim()) return showToast('err', '请输入6位邮箱验证码');
    const r = await api('/api/user/verify-school', { method: 'POST', data: { code: emailCode } });
    if (r.code === 0) {
      showToast('ok', '🎉 认证成功！你现在可以发布商品了');
      setUser({ verified: 2 });
      setTimeout(() => nav('/publish'), 1000);
    } else showToast('err', r.msg);
  }

  async function pickImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    await new Promise<void>(r => (reader.onload = () => r()));
    setCardImg(reader.result as string);
  }

  async function submitCard() {
    if (!cardImg) return showToast('err', '请上传学生证/校园卡照片');
    const r = await api('/api/user/verify-card', { method: 'POST', data: { image: cardImg } });
    if (r.code === 0) {
      showToast('ok', '已提交，管理员24小时内审核通过');
      setUser({ verified: 1 });
    } else showToast('err', r.msg);
  }

  return (
    <div className="max-w-xl mx-auto pb-10 min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-zinc-100 px-4 py-3 flex items-center gap-3">
        <Link to="/me" className="text-zinc-500 shrink-0"><ArrowLeft size={20} /></Link>
        <h1 className="text-base font-bold flex-1 flex items-center gap-1.5"><Shield size={18} className="text-brand" /> 校园认证中心</h1>
        <span className={`chip ${vb.cls} !py-0`}>{vb.text}</span>
      </header>

      {/* 认证权益 */}
      <section className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-brand/10 via-white to-emerald-50 p-4">
        <div className="text-sm font-bold text-zinc-800 mb-2">✅ 完成认证即可解锁以下权益：</div>
        <ul className="grid grid-cols-2 gap-2 text-xs text-zinc-700">
          <E icon="🛍" text="发布商品权限" />
          <E icon="💰" text="发布求购权限" />
          <E icon="📞" text="联系方式展示" />
          <E icon="🎯" text="教材精准匹配" />
          <E icon="🆔" text="认证标识曝光加权" />
          <E icon="🎁" text="参与平台活动奖励" />
        </ul>
      </section>

      {/* 认证方式切换 */}
      <section className="mx-4 mt-5">
        <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-full mb-5">
          <button onClick={() => setMode('email')} className={`h-10 rounded-full text-sm font-medium transition ${mode === 'email' ? 'bg-white text-brand shadow-sm' : 'text-zinc-500'}`}>
            <GraduationCap size={13} className="inline mr-1 -mt-0.5" /> 校园邮箱认证（1分钟）
          </button>
          <button onClick={() => setMode('card')} className={`h-10 rounded-full text-sm font-medium transition ${mode === 'card' ? 'bg-white text-brand shadow-sm' : 'text-zinc-500'}`}>
            <CreditCard size={13} className="inline mr-1 -mt-0.5" /> 学生证/校园卡（24h审核）
          </button>
        </div>

        {mode === 'email' ? (
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5"><GraduationCap size={16} className="text-brand" /> 方式一：校园邮箱（秒通过）</h3>
            <p className="text-xs text-zinc-500 mb-4">
              邮箱格式：<code className="px-1.5 py-0.5 bg-zinc-100 rounded font-mono">你的学号@gs.zzu.edu.cn</code>
              （本科生/研究生都适用）。注册时系统已自动生成验证码，下面输入即可。
            </p>

            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 mb-4 text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <div>
                <b>提示：</b>如果你还没有收到邮箱验证码，可以直接在浏览器打开你的校园邮箱，查看收件箱中来自「郑大集市」的邮件。
                MVP 阶段为了方便测试，你也可以 <b>直接使用注册后显示的验证码</b>（正式上线会接 SMTP 邮件服务）
              </div>
            </div>

            <label className="block mb-1.5">
              <span className="text-xs font-bold text-zinc-700">邮箱验证码</span>
            </label>
            <input maxLength={6} className="input h-12 !text-center !text-xl font-bold tracking-[0.5em] uppercase" placeholder="例如：A3F9K2"
              value={emailCode} onChange={e => setEmailCode(e.target.value.toUpperCase())} />

            {me?.school_email ? (
              <div className="mt-3 text-xs text-zinc-500 flex items-center gap-1.5">
                绑定邮箱：<b className="text-zinc-700">{me.school_email}</b>
              </div>
            ) : (
              <div className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
                <AlertCircle size={12} />你还未在注册时填写校园邮箱，请先在「编辑资料」里补充邮箱
              </div>
            )}

            <button onClick={submitEmail} className="btn-primary w-full h-11 mt-5 text-sm font-bold">
              ✨ 立即认证
            </button>
          </div>
        ) : (
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5"><CreditCard size={16} className="text-brand" /> 方式二：学生证 / 校园卡照片</h3>
            <p className="text-xs text-zinc-500 mb-4">
              上传你的学生证（有照片那页）或校园一卡通照片，管理员人工审核，24小时内通过。
              <b className="text-red-500">建议：拍摄时用手指遮挡身份证号，只保留姓名+学号+学院即可。</b>
            </p>

            <label className="block">
              <input type="file" accept="image/*" className="hidden" onChange={pickImg} />
              {cardImg ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-100 cursor-pointer">
                  <img src={cardImg} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 text-white flex items-center justify-center text-xs">点击重新上传</div>
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 flex flex-col items-center justify-center gap-1.5 cursor-pointer active:bg-zinc-100">
                  <Upload size={28} />
                  <span className="text-xs">点击上传学生证/校园卡照片</span>
                  <span className="text-[10px]">（支持JPG/PNG，最多5MB）</span>
                </div>
              )}
            </label>

            <button onClick={submitCard} className="btn-primary w-full h-11 mt-5 text-sm font-bold">
              提交审核 · 等待通知
            </button>

            <div className="mt-3 text-[11px] text-center text-zinc-400">
              人工审核通常在白天8:00-22:00进行，最快几分钟通过
            </div>
          </div>
        )}
      </section>

      {toast && (
        <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-3 rounded-xl ${toast.t === 'ok' ? 'bg-emerald-600' : 'bg-red-500'} text-white text-sm shadow-xl max-w-xs text-center`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function E({ icon, text }: { icon: string; text: string }) {
  return <li className="flex items-center gap-1.5"><span>{icon}</span><span>{text}</span></li>;
}
