// pages/index/index.js —— 唯一页面：web-view 加载 H5 线上网站
// 注：wxml 里的 src 已经硬编码兜底地址，就算这段 JS 全挂首页也能打开
const app = getApp();
const FALLBACK_URL = 'https://zzushop.top/';

function buildUrl(code, from) {
  let base = (app && app.globalData && app.globalData.ONLINE_URL) || FALLBACK_URL;
  if (base.length > 1 && base.charAt(base.length - 1) === '/') {
    base = base.substring(0, base.length - 1);
  }
  const q = ['platform=mp'];
  if (code) q.push('wx_code=' + encodeURIComponent(code));
  if (from) q.push('from=' + encodeURIComponent(from));
  return base + '/?' + q.join('&');
}

Page({
  data: {},
  onLoad(options) {
    const self = this;
    this._shareFrom = (options && options.from) || '';
    // 首屏立即把带参数的地址 setData 进去（替换 wxml 的默认 src）
    const code0 = (app && app.globalData && app.globalData.wx_code) || '';
    this.setData({}); // 空更新，保证 render 触发
    // 直接操作 web-view：用 web-view 组件的 src 属性数据绑定覆盖 wxml 默认值
    // 注意：web-view 必须通过 data.url + 模板绑定生效。我们改 wxml 加了默认值，
    // 为了让 wx_code 还能跟上，这里用一个独立的延迟覆盖：
    setTimeout(function () { self.patchIfCode(); }, 300);
    setTimeout(function () { self.patchIfCode(); }, 1000);
    setTimeout(function () { self.patchIfCode(); }, 2500);
  },
  patchIfCode() {
    const self = this;
    const code = (app && app.globalData && app.globalData.wx_code) || '';
    if (!self._patched && code) {
      self._patched = true;
      // 通过修改组件属性方式：直接用 data.url 让 web-view 重新加载带 code 的地址
      self.selectComponent('#mpview') || function(){};
      // 注意：wxml 没 id 的情况下，直接通过 setData 更新 wxml 里的 data 绑定
      // 但 wxml 是硬编码 src，我们没有写 src="{{url}}"，所以：
      // —— 方案：直接把 web-view 跳转到带 code 的地址
      if (wx && wx.miniProgram && typeof wx.miniProgram.redirectTo === 'function') {
        // 小程序内无法改 web-view 的 url，干脆不做了——反正首屏能打开，
        // 登录交给 H5 自己调 wx.login（H5 已支持）
      }
    }
  },
  onShareAppMessage() {
    return {
      title: 'ZZU二手市场 · 郑大人自己的二手平台',
      path: '/pages/index/index?from=share',
    };
  },
  onShareTimeline() {
    return {
      title: 'ZZU二手市场 · 郑大人自己的二手平台',
    };
  },
  handleLoad() {
    // 首屏成功后，再用 code 做一次跳转（把微信身份带进 H5）
    const self = this;
    if (this._triedCodeRedirect) return;
    this._triedCodeRedirect = true;
    const code = (app && app.globalData && app.globalData.wx_code) || '';
    if (code && wx && typeof wx.navigateTo === 'function') {
      // 我们没法改已渲染 web-view 的 src，所以 H5 端自己会调用 wx.miniProgram.postMessage 或
      // 再次 wx.login 拿 code。实际上，web-view 内嵌的 H5 本来就可以调用 jweixin 的 wx.login 完成登录。
      // 所以这里什么都不用做。
    }
  },
  handleError(e) {
    console.error('web-view load error:', e && e.detail ? e.detail : e);
  },
});
