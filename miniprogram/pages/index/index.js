// pages/index/index.js —— 唯一页面：web-view 加载 H5 线上网站
const app = getApp();

Page({
  data: {
    url: '',
    loaded: false,
  },

  onLoad(options) {
    let base = app.globalData.ONLINE_URL;
    if (!base) {
      wx.showModal({
        title: '配置缺失',
        content: '请先在 miniprogram/app.js 中配置 ONLINE_URL',
        showCancel: false,
      });
      return;
    }

    // 启动时拿到的 wx_code 附在 URL，H5 端可用它调用后端的微信一键登录
    const code = app.globalData.wx_code || '';
    const from = options.from ? encodeURIComponent(options.from) : '';
    const sep = base.includes('?') ? '&' : '?';
    let url = `${base}${sep}platform=mp`;
    if (code) url += `&wx_code=${code}`;
    if (from) url += `&from=${from}`;

    this.setData({ url });
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
    this.setData({ loaded: true });
  },

  handleError(e) {
    console.error('web-view load error:', e.detail);
    wx.showToast({
      title: '页面加载失败，请重试',
      icon: 'none',
    });
  },
});
