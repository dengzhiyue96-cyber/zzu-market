# 郑大集市 · 项目根 README

> 🎓 **郑州大学专属二手交易平台** — 方案B（标准版）
> 技术栈：**Node.js 18 + Express + SQLite（后端）** + **React 18 + TypeScript + Vite + Tailwind（前端）**

## 📁 目录结构

```
.
├── server/                 # 🟢 后端服务 (Express + SQLite)
│   ├── package.json        # 依赖配置
│   ├── tsconfig.json
│   ├── data/               # ⚠️ SQLite 数据库文件（首次启动自动生成）
│   ├── uploads/            # ⚠️ 用户上传的图片
│   └── src/
│       ├── index.ts        # 全部路由 & 启动入口
│       ├── db.ts           # 数据库表结构 & 连接
│       ├── seed.ts         # 种子数据（分类/教材库/测试用户/示例商品）
│       └── types.ts        # 通用类型定义
│
├── client/                 # 🔵 前端 Web（React+Vite，响应式H5+微信小程序版）
│   ├── index.html          # 入口HTML，配置了Logo和SEO
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts      # 代理 /api → localhost:3001
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx        # 渲染入口
│       ├── App.tsx         # 路由配置
│       ├── index.css       # Tailwind + 全局样式（聊天气泡、按钮组件类）
│       ├── lib/
│       │   ├── http.ts     # Axios 封装 + 401 自动跳转登录
│       │   └── utils.ts    # 时间/价格/占位图/认证徽章 等工具
│       ├── store/app.ts    # Zustand：用户/Token/全局配置
│       ├── components/
│       │   ├── NavBar.tsx  # 底部导航栏（首页/找教材/发布/消息/我的）
│       │   └── ProductCard.tsx  # 商品卡片（通用，首页/列表/收藏复用）
│       └── pages/
│           ├── HomePage.tsx       # 首页（搜索/分类/找教材入口/最新闲置）
│           ├── ProductListPage.tsx # 列表 + 筛选抽屉
│           ├── ProductDetailPage.tsx # 商品详情 + 图片轮播 + 购买操作栏
│           ├── PublishPage.tsx     # 发布页面（含教材匹配搜索建议）
│           ├── TextbookPage.tsx    # 🚀 郑大专属：教材课程匹配
│           ├── ChatsPage.tsx       # 消息/会话列表
│           ├── ChatRoomPage.tsx    # 聊天房（文字+图片，5秒轮询伪实时）
│           ├── LoginPage.tsx       # 登录/注册双Tab（含测试账号提示）
│           ├── ProfilePage.tsx     # 个人中心（数据/认证/菜单）
│           ├── MyProductsPage.tsx  # 我发布的商品（在售/已售/下架）
│           ├── FavoritesPage.tsx   # 我的收藏
│           └── VerifyPage.tsx      # 🚀 校园认证（邮箱验证码/学生证人工审核）
│
└── DEPLOY.md               # 🚀 部署说明：域名/服务器/SSL/上线全流程
```

## 💻 本地运行（5分钟启动）

### 前置条件
- **Node.js ≥ 18**（推荐 18/20 LTS，官网 https://nodejs.org 下载）
- Windows 自带 PowerShell / Terminal 即可操作

### 第一步：启动后端（端口 3001）

```bash
cd server
npm install          # 第一次安装依赖（5-10分钟，better-sqlite3需要编译）
npm run seed         # ⚠️ 首次必执行：写入分类/郑大教材库/测试用户/示例商品
npm run dev          # 开发模式，代码修改自动重启
```

看到提示 `Local: http://localhost:3001` 表示启动成功。

### 第二步：启动前端（端口 5173）

```bash
# 打开第二个 Terminal 窗口
cd client
npm install          # 第一次安装依赖
npm run dev          # 开发模式，自动热更新
```

看到 `Local: http://localhost:5273/` 即可用浏览器打开，**手机和电脑在同一个WiFi下，手机也能访问（移动端适配过）**。
> ⚠️ 为什么是 5273 不是默认 5173？因为你另一个项目「RecurWords（单词树/单词书）」也用了 5173，为了不冲突改成 5273。如果你关掉了单词树，想改回 5173，编辑 client/vite.config.ts 里的 port 字段即可。

### 测试账号（密码都是 123456）

| 用户名 | 角色 | 说明 |
|---|---|---|
| `admin` | 管理员 | 后续开发后台管理功能 |
| `zzu_001` | 软件学院·大三·柳园宿舍 | 已发布 iPad、罗技鼠标、数据结构教材 等 |
| `zzu_002` | 商学院·大四·荷园宿舍 | 已发布 考研黄皮书、肖四肖八、瑜伽垫 等 |

## ✅ 已实现功能清单（方案B）

### 🎯 P0 核心（全部完成）
- ✅ 用户：注册/登录/JWT鉴权
- ✅ 校园认证：邮箱验证码 + 学生证人工审核（双模式）
- ✅ 商品：发布/编辑/下架/标记已售/收藏/浏览
- ✅ 列表：搜索/分类/校区/成色/价格区间/课程名 多维筛选
- ✅ 详情：图片轮播/相关推荐/卖家信息/三操作栏（收藏/聊天/购买）
- ✅ 聊天：会话列表 / 聊天房（文字+图片）/ 5秒轮询伪实时
- ✅ 个人中心：数据看板/我的商品（3状态Tab）/我的收藏/消息/认证中心

### 🚀 郑大专属（差异化功能，全部完成）
- ✅ 内置**33本郑大主流院系教材库**（数学/计算机/电气/经管/医学/公修/考研四六级）
- ✅ 「找教材」页：课程名搜索 → 自动推荐学长学姐挂出的二手书 + 对应院系/年级
- ✅ 发布页：如果分类选「教材/考研」，自动弹出教材匹配搜索建议，自动关联 `textbook_id`
- ✅ 4校区快捷切换（主校区/南校区/北校区/东校区），每种校区不同色标签
- ✅ 郑大校园邮箱后缀 `@gs.zzu.edu.cn` 自动识别，6位验证码秒通过认证

## 📈 数据接口速查

所有接口前缀 `/api`，POST 采用 JSON，响应格式 `{code:0|1, msg, data}`：

| 分类 | 接口 | 方法 | 说明 |
|---|---|---|---|
| **公共** | `/config` | GET | 站点配置（校区列表/分类/成色等） |
| **用户** | `/auth/register` `/auth/login` | POST | 注册登录 |
| | `/user/me` | GET | 个人信息+数据统计 |
| | `/user/verify-school` `/user/verify-card` | POST | 校园认证（两种方式） |
| **商品** | `/products` | GET+查询参数 | 商品列表（keyword/category_id/campus/condition/textbook_id/course_name/min_price/max_price） |
| | `/products/:id` | GET | 商品详情（view+1，同分类相关推荐） |
| | `/products` | POST | 发布商品 |
| | `/products/:id` | PUT | 编辑/上下架/标记已售 |
| | `/products/:id/fav` | POST | 收藏/取消收藏 切换 |
| | `/favorites` | GET | 我的收藏 |
| **教材匹配** | `/textbooks/search` | GET | 教材库搜索 |
| | `/textbooks/recommend` | GET | 课程/院系匹配（核心） |
| **聊天** | `/chats` | GET | 会话列表（含未读数） |
| | `/chats/start` | POST | 从商品发起聊天（如无则创建会话） |
| | `/chats/:id/messages` | GET | 消息历史（自动标记已读） |
| | `/messages` | POST | 发送一条消息（文字/图片/系统） |
| **其他** | `/reports` | POST | 违规举报 |
| | `/upload` | POST | 上传图片（base64） |

## 🔧 后续可扩展（方案C方向）

- [ ] **微信小程序版**：用 H5 打包成 uni-app，体验几乎一致，开发成本低
- [ ] **担保交易**：个体户工商执照（0-500元）+ 微信支付商户号接入
- [ ] **配送系统**：派单/接单/骑手注册/跑腿费结算
- [ ] **广告后台**：Banner位配置/报价单/广告商管理
- [ ] **管理后台**：/admin 路由（举报处理/用户封禁/违规商品下架）
- [ ] **短信通知**：用户聊天/购买时触发（0.032元/条）
- [ ] **真实SMTP邮件**：校园认证/找回密码真实邮件发送

---

**遇到问题？** 检查：
1. Node 版本是不是 ≥18
2. `server/data` 和 `server/uploads` 目录能不能写（权限问题）
3. 前端 API 是不是走了 `/api` 代理（vite.config.ts 里配置了）

祝你郑大集市早日做大做强 🎉！
