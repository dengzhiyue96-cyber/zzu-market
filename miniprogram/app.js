// app.js —— ZZU二手市场 小程序入口
App({
  globalData: {
    // ↓↓ 线上环境填你的生产域名（部署到 CloudBase 之后的地址）↓↓
    // 注意：必须在微信公众平台 → 开发管理 → 业务域名 里把这个域名加入白名单
    ONLINE_URL: 'https://zzushop.top/',
    // 小程序 AppID 和 AppSecret（申请后填下面两个字段，可以放到后端作为环境变量，更安全）
    APPID: 'wx6e68035ec1e69185',
    APPSECRET: 'PLEASE_FILL_IN_APPSECRET_FROM_MP_BACKGROUND',
  },

  onLaunch() {
    // 每次启动静默获取微信登录 code，传给 H5 页面做一键登录
    wx.login({
      success: (res) => {
        if (res.code) {
          this.globalData.wx_code = res.code;
        }
      },
    });

    // 检查更新
    if (wx.getUpdateManager) {
      const um = wx.getUpdateManager();
      um.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已准备好，是否重启应用？',
          success: (r) => r.confirm && um.applyUpdate(),
        });
      });
    }
  },
});
