# ZZU二手市场 · 生产环境部署指南（方案B）

> **首年硬成本：682 元**
> - 学生云服务器 2核4G ≈ **200 元/年**（腾讯云/阿里云学生价）
> - .com 域名首年 ≈ **55 元**（推荐 zzujishi.com）
> - 短信5000条 ≈ **96 元**（阿里云/腾讯云）
> - 个体户工商执照（可选，做支付用）≈ **500 元**（线上就能办）

---

## 第 1 步：买域名（10 分钟）

1. 打开「阿里云域名」或「腾讯云域名」注册
2. 搜索以下域名，哪个便宜买哪个（推荐顺序）：

| 域名 | 推荐指数 | 首年约 |
|---|---|---|
| `zzujishi.com` | ⭐⭐⭐⭐⭐ | 42-55 元 |
| `zhengdajishi.com` | ⭐⭐⭐⭐ | 55-65 元 |
| `zzumarket.com` | ⭐⭐⭐⭐ | 55-70 元 |

3. 完成**实名认证**（个人实名认证即可，免费，一般几分钟通过）

> ⚠️ 不要买.xyz/.top 这类便宜后缀，用户容易以为是垃圾网站，.com 最值得。

---

## 第 2 步：买学生服务器（10 分钟）

**推荐腾讯云「云+校园」或阿里云「学生机」：**

| 参数 | 配置 | 价格 |
|---|---|---|
| CPU | 2核（vCPU） | |
| 内存 | **4GB**（方案B建议） | |
| 硬盘 | 40-60G SSD | |
| 带宽 | 3-5Mbps | |
| 操作系统 | Ubuntu 22.04 LTS / CentOS 7+ | |
| 价格 | **~200 元/年**（学生认证后） | |

如果你没有学生身份，普通 2核4G 新用户价大概 300-500 元/年，也可以接受。

**⚠️ 必须设置：**
- 安全组放行：**22 (SSH) / 80 (HTTP) / 443 (HTTPS) / 3001 (后端调试用)**
- 设置好 root 密码，保存好（或者下载密钥文件）

---

## 第 3 步：域名备案（1-3 天）

这是国内访问速度和稳定性的关键步骤：

1. 登录你买服务器的那个云服务商控制台
2. 找到「ICP备案」入口，开始首次备案
3. 需要准备：**身份证正反面 + 本人手持身份证照片 + 手机号 + 应急联系电话**
4. 填写网站信息：
   - 网站名称：**ZZU二手市场** / **ZZU集市** / （如果驳回就写"个人二手物品分享站"）
   - 服务内容：生活服务/物品交换分享
5. 一般阿里云/腾讯云先初审（1个工作日），然后管局审核（1-7个工作日，河南一般2天左右）

> 备案期间可以先用「IP:端口」访问调试，不影响开发测试。

---

## 第 4 步：服务器配置 & 部署（1 小时）

### 4.1 登录服务器
本地 Terminal（Windows用 PowerShell）：
```bash
ssh root@你的服务器公网IP
# 输入密码或选择密钥
```

### 4.2 安装基础环境
```bash
# 更新系统
apt update && apt upgrade -y   # Ubuntu
# yum update -y                # CentOS

# 安装 Node 20 LTS（推荐方式：nvm）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v    # 应该显示 v20.x.x
npm -v

# 安装 PM2（进程守护，保证服务器重启后也自动启动）
npm install -g pm2

# 安装 Nginx（反向代理+HTTPS+静态）
apt install -y nginx    # Ubuntu
# yum install -y nginx  # CentOS
```

### 4.3 上传代码

有两种方式：
#### 方式 A：Git 方式（推荐）
```bash
cd /opt
git clone 你在GitHub/Gitee上的仓库地址 zzu-market
cd zzu-market
```

#### 方式 B：scp 直接传（本地代码打包上传）
```bash
# 本地 Terminal 里执行（把项目文件夹传到服务器）
scp -r /本地项目路径/6a91badd1be38bb5886f9d0a/* root@服务器IP:/opt/zzu-market/
```

### 4.4 启动后端
```bash
cd /opt/zzu-market/server
npm install
npm run build          # TypeScript 编译 → dist/
npm run seed           # ⚠️ 首次：写入种子数据（分类/教材库/测试用户）
pm2 start dist/index.js --name zzu-server
pm2 save               # 保存PM2进程列表，服务器重启自动恢复
pm2 startup            # 设置开机自启（按提示复制命令执行一下即可）
pm2 status             # 应该看到 zzu-server online
```

### 4.5 构建前端
```bash
cd /opt/zzu-market/client
npm install
# ⚠️ 重要：如果前后端同服务器，构建时不需要设置 VITE_API_BASE
# 否则 VITE_API_BASE=https://api.你的域名.com npm run build
npm run build          # 构建产物在 dist/
mkdir -p /var/www/zzu && cp -r dist/* /var/www/zzu/
```

### 4.6 Nginx 配置（H5网站 + 反向代理后端）

编辑 `/etc/nginx/sites-available/zzu.conf`：

```nginx
server {
    listen 80;
    server_name zzujishi.com www.zzujishi.com;   # 换成你的域名

    # 前端静态（手机/PC浏览器访问）
    location / {
        root /var/www/zzu;
        index index.html;
        try_files $uri $uri/ /index.html;         # React单页应用关键
    }

    # 后端API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # 用户上传图片
    location /uploads/ {
        root /opt/zzu-market/server;
        expires 30d;
    }
}
```

生效：
```bash
ln -s /etc/nginx/sites-available/zzu.conf /etc/nginx/sites-enabled/
nginx -t        # 测试配置（看到successful就对了）
systemctl restart nginx
```

### 4.7 HTTPS（免费SSL，必开）
```bash
# 安装 certbot
apt install -y certbot python3-certbot-nginx
# 一键申请Let's Encrypt免费证书
certbot --nginx -d zzujishi.com -d www.zzujishi.com
# 按提示：输入邮箱 → 同意协议 → 是否重定向到HTTPS（选2=强制）
```

✅ 好了！现在 `https://zzujishi.com` 就能访问了！

---

## 第 5 步：微信小程序（可选，方案B标配）

**最简单的做法：用「微信云开发」或「WebView套壳」**

1. 去 https://mp.weixin.qq.com 注册小程序（个人主体即可，300元认证费或用个体工商户免费）
2. 小程序类目选择「电商平台 / 二手物品」
3. 开发工具里新建一个只包含 `<web-view src="https://zzujishi.com">` 的页面
4. 提交审核 → 发布

这样你的 H5 就变成了微信小程序，用户不用下载直接微信里就能打开～

---

## 第 6 步：域名解析（最后一步）

回云服务商「域名解析」页面，加 2 条 A 记录：

| 主机记录 | 记录类型 | 记录值 |
|---|---|---|
| `@` | A | 你的服务器公网IP |
| `www` | A | 你的服务器公网IP |

> 如果你有API子域需求（如 `api.zzujishi.com`），再加一条 A 记录即可。

---

## 🚨 上线前检查清单

- [ ] 注册「admin」账号并登录，改一个强密码
- [ ] 域名能访问，HTTPS 小锁显示🔒
- [ ] `/api/config` 接口返回正常（`curl https://你的域名/api/config`）
- [ ] 测试账号 zzu_001/zzu_002 能发布/浏览/收藏/聊天
- [ ] 手机微信里打开过，速度正常
- [ ] 种子数据已执行 `npm run seed`
- [ ] PM2 进程 `pm2 status` 都是 online
- [ ] 每日自动备份数据库（可选，建议配一个）：
  ```bash
  crontab -e
  # 每天凌晨3点备份数据库
  0 3 * * * cp /opt/zzu-market/server/data/zzu_market.db /opt/backup/zzu_$(date +\%Y\%m\%d).db
  ```

---

## 💰 支付 & 配送系统（盈利前准备，可选）

当你做到日活500+，想开通担保交易和配送，去当地工商所/河南掌上登记APP办**个体工商户营业执照**，经营范围写「二手物品销售/日用百货/互联网销售」，费用0-500元。

有了营业执照后就能申请：
- 微信支付商户号（费率 0.38%-0.6%）
- 支付宝当面付
- 配送的话对接「顺丰同城」或自建校园骑手（勤工俭学同学）

---

**跑起来了之后如果遇到问题，把报错截图发给我，我帮你排查 🎯**
