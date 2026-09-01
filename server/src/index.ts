import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB, C, getNextId } from './db';
import { JWTUser, CAMPUS_LIST, CONDITION_LIST } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

/* ============== 修复 Express4 async handler 错误兜不住 =====================================
   100% 可靠版本：直接包装 app.get/post/put/patch/delete/all 方法，
   把每个 handler 返回的 Promise rejection 统一交给 next(err) → 全局错误中间件处理。
   （之前 prototype 打补丁的方法在 serverless/编译后路径会失效，已废弃）*/
function wrapAsync(fn: any): any {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      const ret = fn(req, res, next);
      if (ret && typeof ret.then === 'function') {
        Promise.resolve(ret).catch((e: any) => next(e || new Error(String(e))));
      }
      return ret;
    } catch (e) {
      return next(e);
    }
  };
}
(['get', 'post', 'put', 'patch', 'delete', 'all', 'use'] as const).forEach(method => {
  const orig = (app as any)[method].bind(app);
  (app as any)[method] = function (path: any, ...handlers: any[]) {
    const wrapped = handlers.map(h => (typeof h === 'function' ? wrapAsync(h) : h));
    return orig(path, ...wrapped);
  };
});
console.log('[async-wrapper-method] HTTP method 包装兜底已启用（app.get/post/...）');
/* =========================================================================================== */
const JWT_SECRET = process.env.JWT_SECRET || 'zzu-market-secret-2025-change-me';
const UPLOAD_DIR = path.resolve(__dirname, '../uploads');
try {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (_e) {
  // Serverless / 只读文件系统环境下 mkdir 可能失败，忽略即可
  console.warn('[uploads] 无法创建目录，跳过本地文件存储');
}

const WX_APPID = process.env.WX_APPID || '';
const WX_APPSECRET = process.env.WX_APPSECRET || '';
const HOST = process.env.HOST || ''; // 部署域名，传给小程序端用

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

/* ============== 通用工具 ============== */
const ok = (data?: any, msg = 'ok'): any => ({ code: 0, msg, data });
const fail = (msg: string, code = 1): any => ({ code, msg });

function auth(optional = false) {
  return (req: Request & { user?: JWTUser }, _res: Response, next: NextFunction) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return optional ? next() : _res.status(401).json(fail('未登录'));
    try {
      req.user = jwt.verify(token, JWT_SECRET) as JWTUser;
      next();
    } catch {
      return optional ? next() : _res.status(401).json(fail('登录已过期，请重新登录'));
    }
  };
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Partial<T> {
  const r: any = {};
  keys.forEach(k => { if (obj[k] !== undefined) r[k] = obj[k]; });
  return r;
}

/** 商品聚合管道（JOIN categories + users + textbooks） */
function productPipeline(filter: any, opts: { skip?: number; limit?: number; sort?: any } = {}) {
  const pipeline: any[] = [{ $match: filter }];
  if (opts.sort) pipeline.push({ $sort: opts.sort });
  else pipeline.push({ $sort: { created_at: -1 } });
  if (opts.skip) pipeline.push({ $skip: opts.skip });
  if (opts.limit) pipeline.push({ $limit: opts.limit });
  pipeline.push(
    { $lookup: { from: 'categories', localField: 'category_id', foreignField: 'id', as: '_cat' } },
    { $lookup: { from: 'users', localField: 'user_id', foreignField: 'id', as: '_seller' } },
    { $lookup: { from: 'textbooks', localField: 'textbook_id', foreignField: 'id', as: '_tb' } },
    { $unwind: { path: '$_cat', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$_seller', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$_tb', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1, title: 1, price: 1, original_price: 1, cover: 1, condition: 1, campus: 1, contact: 1, status: 1, view_count: 1, fav_count: 1, chat_count: 1, created_at: 1,
        category_name: '$_cat.name', category_icon: '$_cat.icon',
        seller_id: '$_seller.id', seller_name: '$_seller.nickname', seller_avatar: '$_seller.avatar', seller_campus: '$_seller.campus', seller_verified: '$_seller.verified',
        book_name: '$_tb.book_name', course_name: { $ifNull: ['$_tb.course_name', '$course_name'] },
        _cat: 0, _seller: 0, _tb: 0,
      }
    }
  );
  return pipeline;
}

/* ============== 公共：系统配置 ============== */
app.get('/api/config', async (_req, res) => {
  const categories = await C.categories().find({}, { projection: { _id: 0, id: 1, name: 1, icon: 1, sort: 1 } }).sort({ sort: 1 }).toArray();
  res.json(ok({
    site_name: 'ZZU二手市场',
    campus_list: CAMPUS_LIST,
    condition_list: CONDITION_LIST,
    categories,
  }));
});

/* ============================================================
 * 1. 用户模块
 * ============================================================ */
app.post('/api/auth/register', async (req, res) => {
  const { username, password, nickname, school_email } = req.body || {};
  if (!username || !password || !nickname) return res.json(fail('缺少必填字段'));
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.json(fail('用户名需3-20位字母数字下划线'));
  if (password.length < 6) return res.json(fail('密码至少6位'));
  const exists = await C.users().findOne({ $or: [{ username }, ...(school_email ? [{ school_email }] : [])] });
  if (exists) return res.json(fail('用户名或校园邮箱已注册'));

  const verify_code = school_email ? Math.random().toString(36).slice(2, 8).toUpperCase() : '';
  const id = await getNextId('users');
  const now = Date.now();
  await C.users().insertOne({
    id, username, password: bcrypt.hashSync(password, 10), nickname,
    avatar: null, student_id: null, school_email: school_email || null,
    verified: school_email ? 1 : 0, verify_code, role: 'user',
    created_at: now, updated_at: now,
  });
  const user = { id, username, nickname, avatar: null, verified: school_email ? 1 : 0, role: 'user' };
  const token = jwt.sign({ id, username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.json(ok({ token, user, verify_code, tip: school_email ? '使用验证码在"个人中心→校园认证"输入即可完成认证' : '未绑定校园邮箱，无法认证' }));
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json(fail('请输入账号密码'));
  const row: any = await C.users().findOne({ $or: [{ username }, { school_email: username }] });
  if (!row || !bcrypt.compareSync(password, row.password)) return res.json(fail('账号或密码错误'));
  const token = jwt.sign({ id: row.id, username: row.username, role: row.role }, JWT_SECRET, { expiresIn: '30d' });
  const user = pick(row, ['id', 'username', 'nickname', 'avatar', 'student_id', 'school_email', 'major', 'grade', 'campus', 'dormitory', 'verified', 'role']);
  res.json(ok({ token, user }));
});

/* ============== 微信一键登录（小程序 / 网页授权通用） ============== */
app.post('/api/auth/wx-login', async (req, res) => {
  const { code, avatar, nickname } = req.body || {};
  if (!code) return res.json(fail('缺少微信登录 code'));

  // 开发兜底：没有配置 AppID/AppSecret 时，用 code 作为 openid 的稳定键（方便本地测试）
  let openid = '';
  let unionid = '';
  if (WX_APPID && WX_APPSECRET) {
    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_APPSECRET}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
      const resp = await (globalThis as any).fetch(url);
      const data = await resp.json();
      if (data.errcode) return res.json(fail(`微信登录失败：${data.errmsg || data.errcode}`));
      openid = data.openid;
      unionid = data.unionid || '';
    } catch (e: any) {
      return res.json(fail('微信接口调用失败：' + (e.message || e)));
    }
  } else {
    // 开发模式：用 code 做伪 openid，保证流程能跑通
    openid = 'dev_' + require('crypto').createHash('md5').update(String(code)).digest('hex').slice(0, 24);
  }

  // 查用户，没有就注册一个
  let row: any = await C.users().findOne({ $or: [{ wx_openid: openid }, ...(unionid ? [{ wx_unionid: unionid }] : [])] });
  if (!row) {
    const id = await getNextId('users');
    const now = Date.now();
    const username = 'wx_' + openid.slice(-10);
    row = {
      id, username, password: bcrypt.hashSync(Math.random().toString(36), 10),
      nickname: nickname || ('微信同学' + openid.slice(-4)),
      avatar: avatar || null, student_id: null, school_email: null,
      verified: 0, verify_code: '', role: 'user',
      wx_openid: openid, wx_unionid: unionid || null,
      created_at: now, updated_at: now,
    };
    await C.users().insertOne(row);
  } else {
    // 补头像和昵称
    const patch: any = { updated_at: Date.now() };
    if (nickname && !row.nickname) patch.nickname = nickname;
    if (avatar && !row.avatar) patch.avatar = avatar;
    if (Object.keys(patch).length > 1) {
      await C.users().updateOne({ id: row.id }, { $set: patch });
      Object.assign(row, patch);
    }
  }

  const token = jwt.sign({ id: row.id, username: row.username, role: row.role }, JWT_SECRET, { expiresIn: '30d' });
  const user = pick(row, ['id', 'username', 'nickname', 'avatar', 'student_id', 'school_email', 'major', 'grade', 'campus', 'dormitory', 'verified', 'role']);
  res.json(ok({ token, user, is_new: true }));
});

/* ============== 管理员鉴权 ============== */
function adminOnly() {
  return (req: Request & { user?: JWTUser }, _res: Response, next: NextFunction) => {
    const u = req.user as any;
    if (!u || u.role !== 'admin') return _res.status(403).json(fail('无权限，仅管理员可访问'));
    next();
  };
}

/* ============================================================
 * 8. 管理员后台
 * ============================================================ */
app.get('/api/admin/stats', auth(), adminOnly(), async (_req, res) => {
  const now = Date.now();
  const dayStart = now - 24 * 3600 * 1000;
  const weekStart = now - 7 * 24 * 3600 * 1000;

  const [
    users, usersNew, verifiedUsers,
    products, productsActive, productsSold, productsToday,
    wanted, wantedActive,
    chats, messages,
    reports, reportsPending,
    favorites,
  ] = await Promise.all([
    C.users().countDocuments(),
    C.users().countDocuments({ created_at: { $gte: dayStart } }),
    C.users().countDocuments({ verified: { $gte: 1 } }),
    C.products().countDocuments(),
    C.products().countDocuments({ status: 1 }),
    C.products().countDocuments({ status: 2 }),
    C.products().countDocuments({ created_at: { $gte: dayStart } }),
    C.wanted().countDocuments(),
    C.wanted().countDocuments({ status: 1 }),
    C.chats().countDocuments(),
    C.messages().countDocuments(),
    C.reports().countDocuments(),
    C.reports().countDocuments({ handled: 0 }),
    C.favorites().countDocuments(),
  ]);

  // 近 7 天用户注册趋势
  const trend = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const d0 = now - (6 - i) * 24 * 3600 * 1000;
      const d1 = d0 + 24 * 3600 * 1000;
      const [u, p, w] = await Promise.all([
        C.users().countDocuments({ created_at: { $gte: d0, $lt: d1 } }),
        C.products().countDocuments({ created_at: { $gte: d0, $lt: d1 } }),
        C.wanted().countDocuments({ created_at: { $gte: d0, $lt: d1 } }),
      ]);
      const date = new Date(d0);
      return { day: `${date.getMonth() + 1}/${date.getDate()}`, users: u, products: p, wanted: w };
    })
  );

  // GMV 估算：所有已售商品价格加总
  const soldList = await C.products().find({ status: 2 }, { projection: { price: 1 } }).toArray();
  const gmv = soldList.reduce((s, p: any) => s + Number(p.price || 0), 0);

  res.json(ok({
    summary: {
      users, usersNew, verifiedUsers,
      products, productsActive, productsSold, productsToday,
      wanted, wantedActive,
      chats, messages,
      reports, reportsPending,
      favorites,
      gmv,
    },
    weekTrend: trend,
  }));
});

/* 商品列表（后台，包含下架/删除） */
app.get('/api/admin/products', auth(), adminOnly(), async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const size = Math.min(100, Number(req.query.size || 20));
  const filter: any = {};
  if (req.query.status && req.query.status !== 'all') filter.status = Number(req.query.status);
  if (req.query.keyword) {
    filter.$or = [
      { title: { $regex: String(req.query.keyword), $options: 'i' } },
      { id: Number(req.query.keyword) || -1 },
    ];
  }
  const [list, total] = await Promise.all([
    C.products().aggregate(productPipeline(filter, { skip: (page - 1) * size, limit: size })).toArray(),
    C.products().countDocuments(filter),
  ]);
  res.json(ok({ list, total, page, size }));
});

/* 修改商品状态：下架=0，在售=1，已售=2，删除=3 */
app.put('/api/admin/products/:id', auth(), adminOnly(), async (req: any, res) => {
  const id = Number(req.params.id);
  const { status, action } = req.body || {};
  let newStatus = Number(status);
  // 兼容 action 参数
  if (action === 'offline') newStatus = 0;
  if (action === 'online') newStatus = 1;
  if (action === 'sold') newStatus = 2;
  if (action === 'delete') newStatus = 3;
  if (![0, 1, 2, 3].includes(newStatus)) return res.json(fail('状态值错误'));
  await C.products().updateOne({ id }, { $set: { status: newStatus, updated_at: Date.now() } });
  res.json(ok(null, '操作成功'));
});

/* 用户列表 */
app.get('/api/admin/users', auth(), adminOnly(), async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const size = Math.min(100, Number(req.query.size || 20));
  const filter: any = {};
  if (req.query.keyword) {
    const kw = String(req.query.keyword);
    filter.$or = [
      { username: { $regex: kw, $options: 'i' } },
      { nickname: { $regex: kw, $options: 'i' } },
      { school_email: { $regex: kw, $options: 'i' } },
      { id: Number(kw) || -1 },
    ];
  }
  if (req.query.verified && req.query.verified !== 'all') filter.verified = Number(req.query.verified);
  const [rows, total] = await Promise.all([
    C.users().find(filter, {
      projection: { _id: 0, password: 0, verify_code: 0 },
      sort: { created_at: -1 }, skip: (page - 1) * size, limit: size,
    }).toArray(),
    C.users().countDocuments(filter),
  ]);
  res.json(ok({ list: rows, total, page, size }));
});

/* 修改用户：禁用/启用、改角色、通过认证 */
app.put('/api/admin/users/:id', auth(), adminOnly(), async (req: any, res) => {
  const id = Number(req.params.id);
  const { action, role, verified } = req.body || {};
  const $set: any = { updated_at: Date.now() };
  if (role) $set.role = role;
  if (verified !== undefined) $set.verified = Number(verified);
  if (action === 'ban') $set.role = 'banned';
  if (action === 'unban') $set.role = 'user';
  if (Object.keys($set).length <= 1) return res.json(fail('没有可修改的字段'));
  await C.users().updateOne({ id }, { $set });
  res.json(ok(null, '操作成功'));
});

/* 求购列表 + 修改状态 */
app.get('/api/admin/wanted', auth(), adminOnly(), async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const size = Math.min(100, Number(req.query.size || 20));
  const filter: any = {};
  if (req.query.status && req.query.status !== 'all') filter.status = Number(req.query.status);
  if (req.query.keyword) {
    filter.$or = [
      { title: { $regex: String(req.query.keyword), $options: 'i' } },
      { desc: { $regex: String(req.query.keyword), $options: 'i' } },
    ];
  }
  const rows = await C.wanted().find(filter, { sort: { created_at: -1 }, skip: (page - 1) * size, limit: size }).toArray();
  const total = await C.wanted().countDocuments(filter);
  res.json(ok({ list: rows, total, page, size }));
});

app.put('/api/admin/wanted/:id', auth(), adminOnly(), async (req: any, res) => {
  const id = Number(req.params.id);
  const { status, action } = req.body || {};
  let newStatus = Number(status);
  if (action === 'offline') newStatus = 0;
  if (action === 'online') newStatus = 1;
  if (action === 'delete') newStatus = 2;
  if (![0, 1, 2].includes(newStatus)) return res.json(fail('状态值错误'));
  await C.wanted().updateOne({ id }, { $set: { status: newStatus, updated_at: Date.now() } });
  res.json(ok(null, '操作成功'));
});

/* 举报列表 + 处理 */
app.get('/api/admin/reports', auth(), adminOnly(), async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const size = Math.min(100, Number(req.query.size || 20));
  const filter: any = {};
  if (req.query.handled && req.query.handled !== 'all') filter.handled = Number(req.query.handled);
  const rows = await C.reports().find(filter, { sort: { created_at: -1 }, skip: (page - 1) * size, limit: size }).toArray();
  const total = await C.reports().countDocuments(filter);
  res.json(ok({ list: rows, total, page, size }));
});

app.put('/api/admin/reports/:id', auth(), adminOnly(), async (req: any, res) => {
  const id = Number(req.params.id);
  await C.reports().updateOne({ id }, { $set: { handled: 1, handled_at: Date.now() } });
  res.json(ok(null, '已标记处理完成'));
});

app.post('/api/user/verify-school', auth(), async (req: any, res) => {
  const { code } = req.body || {};
  if (!code) return res.json(fail('请输入验证码'));
  const u: any = await C.users().findOne({ id: req.user.id });
  if (u?.verify_code && code.trim().toUpperCase() === u.verify_code) {
    await C.users().updateOne({ id: req.user.id }, { $set: { verified: 2, updated_at: Date.now() } });
    return res.json(ok(null, '认证成功！'));
  }
  res.json(fail('验证码错误'));
});

app.post('/api/user/verify-card', auth(), async (req: any, res) => {
  const { image } = req.body || {};
  if (!image) return res.json(fail('请上传学生证/校园卡照片'));
  await C.users().updateOne({ id: req.user.id }, { $set: { verified: 1, updated_at: Date.now() } });
  res.json(ok(null, '已提交审核，管理员将在24小时内通过'));
});

app.get('/api/user/me', auth(), async (req: any, res) => {
  const u: any = await C.users().findOne({ id: req.user.id }, { projection: { _id: 0, password: 0, verify_code: 0 } });
  if (!u) return res.json(fail('用户不存在'));
  const [selling, sold, fav, unread] = await Promise.all([
    C.products().countDocuments({ user_id: req.user.id, status: 1 }),
    C.products().countDocuments({ user_id: req.user.id, status: 2 }),
    C.favorites().countDocuments({ user_id: req.user.id }),
    C.messages().countDocuments({ receiver_id: req.user.id, read: 0 }),
  ]);
  res.json(ok({ ...u, stat: { selling_count: selling, sold_count: sold, fav_count: fav, unread_count: unread } }));
});

app.put('/api/user/profile', auth(), async (req: any, res) => {
  const allowed = ['nickname', 'avatar', 'student_id', 'major', 'grade', 'campus', 'dormitory', 'phone'];
  const fields: any = pick(req.body || {}, allowed as any);
  if (fields.campus && !CAMPUS_LIST.includes(fields.campus)) delete fields.campus;
  if (Object.keys(fields).length === 0) return res.json(fail('没有可更新的字段'));
  fields.updated_at = Date.now();
  await C.users().updateOne({ id: req.user.id }, { $set: fields });
  res.json(ok(null, '资料更新成功'));
});

/* ============================================================
 * 2. 商品模块
 * ============================================================ */
app.get('/api/products', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const size = Math.min(50, parseInt(req.query.size as string) || 20);
  const { keyword, category_id, campus, condition, course_name, min_price, max_price, user_id, textbook_id } = req.query;
  const filter: any = { status: 1 };

  // 关键词搜索：先查教材表，拿到匹配的 textbook_id 列表
  let textbookIds: number[] = [];
  if (keyword || course_name) {
    const kw = (keyword || course_name) as string;
    const tbFilter: any = { $or: [
      { book_name: { $regex: kw, $options: 'i' } },
      { course_name: { $regex: kw, $options: 'i' } },
    ]};
    if (course_name) {
      tbFilter.$or.push({ course_name: { $regex: course_name as string, $options: 'i' } });
    }
    const tbs = await C.textbooks().find(tbFilter, { projection: { id: 1 } }).toArray();
    textbookIds = tbs.map(t => t.id);
  }

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword as string, $options: 'i' } },
      { description: { $regex: keyword as string, $options: 'i' } },
      { course_name: { $regex: keyword as string, $options: 'i' } },
      ...(textbookIds.length ? [{ textbook_id: { $in: textbookIds } }] : []),
    ];
  }
  if (course_name) {
    filter.$or = [
      { course_name: { $regex: course_name as string, $options: 'i' } },
      ...(textbookIds.length ? [{ textbook_id: { $in: textbookIds } }] : []),
    ];
  }
  if (category_id) filter.category_id = Number(category_id);
  if (campus) filter.campus = campus;
  if (condition) filter.condition = condition;
  if (textbook_id) filter.textbook_id = Number(textbook_id);
  if (user_id) filter.user_id = Number(user_id);
  if (min_price) filter.price = { ...filter.price, $gte: Number(min_price) };
  if (max_price) filter.price = { ...filter.price, $lte: Number(max_price) };

  const [rows, total] = await Promise.all([
    C.products().aggregate(productPipeline(filter, { skip: (page - 1) * size, limit: size })).toArray(),
    C.products().countDocuments(filter),
  ]);
  res.json(ok({ list: rows, total, page, size }));
});

app.get('/api/products/:id', auth(true), async (req: any, res) => {
  const pid = Number(req.params.id);
  const rows = await C.products().aggregate(productPipeline({ id: pid })).toArray();
  const p = rows[0];
  if (!p) return res.json(fail('商品不存在或已下架'));
  await C.products().updateOne({ id: pid }, { $inc: { view_count: 1 } });
  p.view_count += 1;
  p.favored = req.user ? !!(await C.favorites().findOne({ user_id: req.user.id, product_id: pid })) : false;
  // 相关商品
  const related = await C.products().aggregate(
    productPipeline({ id: { $ne: pid }, status: 1, $or: [{ category_id: p.category_id }, ...(p.textbook_id ? [{ textbook_id: p.textbook_id }] : [])] }, { limit: 6 })
  ).toArray();
  res.json(ok({ ...p, related }));
});

app.post('/api/products', auth(), async (req: any, res) => {
  const b = req.body || {};
  if (!b.title || !b.category_id || !(b.price >= 0)) return res.json(fail('标题/分类/价格 是必填'));
  if (!b.contact) return res.json(fail('请填写联系方式'));
  const id = await getNextId('products');
  const now = Date.now();
  await C.products().insertOne({
    id, user_id: req.user.id, category_id: Number(b.category_id),
    title: b.title.trim(), description: b.description || '',
    price: Number(b.price), original_price: b.original_price ? Number(b.original_price) : null,
    cover: b.cover || '', images: b.images ? JSON.stringify(b.images) : '[]',
    textbook_id: b.textbook_id ? Number(b.textbook_id) : null,
    course_name: b.course_name || null,
    condition: CONDITION_LIST.includes(b.condition) ? b.condition : '9成新',
    campus: CAMPUS_LIST.includes(b.campus) ? b.campus : (req.user.campus || '主校区'),
    contact: b.contact, status: 1,
    view_count: 0, fav_count: 0, chat_count: 0,
    created_at: now, updated_at: now,
  });
  res.json(ok({ id }, '发布成功'));
});

app.put('/api/products/:id', auth(), async (req: any, res) => {
  const id = Number(req.params.id);
  const p: any = await C.products().findOne({ id });
  if (!p) return res.json(fail('商品不存在'));
  if (p.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json(fail('无权编辑'));
  const allowed = ['title', 'description', 'price', 'original_price', 'cover', 'images', 'textbook_id', 'course_name', 'condition', 'campus', 'contact', 'category_id', 'status'];
  const fields: any = pick(req.body || {}, allowed as any);
  if (fields.images) fields.images = JSON.stringify(fields.images);
  if (fields.status !== undefined && ![1, 2, 3].includes(Number(fields.status))) delete fields.status;
  if (fields.condition && !CONDITION_LIST.includes(fields.condition)) delete fields.condition;
  if (fields.campus && !CAMPUS_LIST.includes(fields.campus)) delete fields.campus;
  if (Object.keys(fields).length === 0) return res.json(ok(null, '无更新'));
  fields.updated_at = Date.now();
  await C.products().updateOne({ id }, { $set: fields });
  res.json(ok(null, '更新成功'));
});

app.post('/api/products/:id/fav', auth(), async (req: any, res) => {
  const pid = Number(req.params.id);
  const exist = await C.favorites().findOne({ user_id: req.user.id, product_id: pid });
  if (exist) {
    await C.favorites().deleteOne({ _id: exist._id });
    await C.products().updateOne({ id: pid }, { $inc: { fav_count: -1 } });
    return res.json(ok({ favored: false }, '已取消收藏'));
  }
  await C.favorites().insertOne({ user_id: req.user.id, product_id: pid, created_at: Date.now() });
  await C.products().updateOne({ id: pid }, { $inc: { fav_count: 1 } });
  res.json(ok({ favored: true }, '收藏成功'));
});

app.get('/api/favorites', auth(), async (req: any, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const size = Math.min(50, parseInt(req.query.size as string) || 20);
  const favs = await C.favorites().find({ user_id: req.user.id }).sort({ created_at: -1 }).skip((page - 1) * size).limit(size).toArray();
  const productIds = favs.map(f => f.product_id);
  const rows = productIds.length ? await C.products().aggregate(productPipeline({ id: { $in: productIds } })).toArray() : [];
  // 按 favorites 的顺序排列
  const map = new Map(rows.map((r: any) => [r.id, r]));
  const list = favs.map(f => ({ ...(map.get(f.product_id) || {}), fav_id: f._id, fav_time: f.created_at }));
  const total = await C.favorites().countDocuments({ user_id: req.user.id });
  res.json(ok({ list, total, page, size }));
});

/* ============================================================
 * 2.5 求购模块
 * ============================================================ */
function wantedPipeline(filter: any, opts: { skip?: number; limit?: number } = {}) {
  const pipeline: any[] = [{ $match: filter }, { $sort: { created_at: -1 } }];
  if (opts.skip) pipeline.push({ $skip: opts.skip });
  if (opts.limit) pipeline.push({ $limit: opts.limit });
  pipeline.push(
    { $lookup: { from: 'categories', localField: 'category_id', foreignField: 'id', as: '_cat' } },
    { $lookup: { from: 'users', localField: 'user_id', foreignField: 'id', as: '_buyer' } },
    { $unwind: { path: '$_cat', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$_buyer', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: 1, title: 1, description: 1, expect_price: 1, campus: 1, contact: 1, status: 1, view_count: 1, created_at: 1,
        category_name: '$_cat.name', category_icon: '$_cat.icon',
        buyer_id: '$_buyer.id', buyer_name: '$_buyer.nickname', buyer_avatar: '$_buyer.avatar', buyer_campus: '$_buyer.campus', buyer_verified: '$_buyer.verified',
        _cat: 0, _buyer: 0,
      }
    }
  );
  return pipeline;
}

app.get('/api/wanted', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const size = Math.min(50, parseInt(req.query.size as string) || 20);
  const { keyword, campus, category_id, user_id } = req.query;
  const filter: any = { status: 1 };
  if (keyword) filter.$or = [{ title: { $regex: keyword as string, $options: 'i' } }, { description: { $regex: keyword as string, $options: 'i' } }];
  if (campus) filter.campus = campus;
  if (category_id) filter.category_id = Number(category_id);
  if (user_id) filter.user_id = Number(user_id);
  const [rows, total] = await Promise.all([
    C.wanted().aggregate(wantedPipeline(filter, { skip: (page - 1) * size, limit: size })).toArray(),
    C.wanted().countDocuments(filter),
  ]);
  res.json(ok({ list: rows, total, page, size }));
});

app.get('/api/wanted/:id', auth(true), async (req: any, res) => {
  const rows = await C.wanted().aggregate(wantedPipeline({ id: Number(req.params.id) })).toArray();
  const w = rows[0];
  if (!w) return res.json(fail('求购信息不存在'));
  await C.wanted().updateOne({ id: w.id }, { $inc: { view_count: 1 } });
  w.view_count += 1;
  res.json(ok(w));
});

app.post('/api/wanted', auth(), async (req: any, res) => {
  const b = req.body || {};
  if (!b.title || !b.contact) return res.json(fail('标题和联系方式是必填'));
  const id = await getNextId('wanted');
  const now = Date.now();
  await C.wanted().insertOne({
    id, user_id: req.user.id, title: b.title.trim(), description: b.description || '',
    expect_price: b.expect_price != null ? Number(b.expect_price) : null,
    category_id: b.category_id ? Number(b.category_id) : null,
    campus: CAMPUS_LIST.includes(b.campus) ? b.campus : (req.user.campus || '主校区'),
    contact: b.contact, status: 1, view_count: 0,
    created_at: now, updated_at: now,
  });
  res.json(ok({ id }, '发布求购成功'));
});

app.put('/api/wanted/:id', auth(), async (req: any, res) => {
  const id = Number(req.params.id);
  const w: any = await C.wanted().findOne({ id });
  if (!w) return res.json(fail('求购信息不存在'));
  if (w.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json(fail('无权编辑'));
  const allowed = ['title', 'description', 'expect_price', 'campus', 'contact', 'category_id', 'status'];
  const fields: any = pick(req.body || {}, allowed as any);
  if (fields.campus && !CAMPUS_LIST.includes(fields.campus)) delete fields.campus;
  if (fields.status !== undefined && ![1, 2, 3].includes(Number(fields.status))) delete fields.status;
  if (Object.keys(fields).length === 0) return res.json(ok(null, '无更新'));
  fields.updated_at = Date.now();
  await C.wanted().updateOne({ id }, { $set: fields });
  res.json(ok(null, '更新成功'));
});

app.delete('/api/wanted/:id', auth(), async (req: any, res) => {
  const id = Number(req.params.id);
  const w: any = await C.wanted().findOne({ id });
  if (!w) return res.json(fail('求购信息不存在'));
  if (w.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json(fail('无权删除'));
  await C.wanted().deleteOne({ id });
  res.json(ok(null, '删除成功'));
});

/* ============================================================
 * 3. 教材/课程匹配模块
 * ============================================================ */
app.get('/api/textbooks/search', async (req, res) => {
  const { keyword, college, major, grade } = req.query as any;
  const filter: any = {};
  if (keyword) {
    filter.$or = [
      { book_name: { $regex: keyword, $options: 'i' } },
      { course_name: { $regex: keyword, $options: 'i' } },
      { author: { $regex: keyword, $options: 'i' } },
      { isbn: { $regex: keyword, $options: 'i' } },
    ];
  }
  if (college) filter.college = { $regex: college, $options: 'i' };
  if (major) filter.major = { $regex: major, $options: 'i' };
  if (grade) filter.grade = { $regex: grade, $options: 'i' };
  const textbooks = await C.textbooks().find(filter).sort({ sort: 1 }).limit(50).toArray();
  // 批量查在售数量
  const tbIds = textbooks.map(t => t.id);
  const counts = await C.products().aggregate([
    { $match: { textbook_id: { $in: tbIds }, status: 1 } },
    { $group: { _id: '$textbook_id', count: { $sum: 1 } } },
  ]).toArray();
  const countMap = new Map(counts.map((c: any) => [c._id, c.count]));
  const rows = textbooks.map(t => ({ ...t, sell_count: countMap.get(t.id) || 0 }));
  res.json(ok(rows));
});

app.get('/api/textbooks/recommend', async (req, res) => {
  const course_name = (req.query.course_name as string) || '';
  const college = req.query.college as string;
  const grade = req.query.grade as string;
  if (!course_name && !college) return res.json(ok([]));

  const tbFilter: any = {};
  if (course_name) {
    tbFilter.$or = [
      { course_name: { $regex: course_name, $options: 'i' } },
      { book_name: { $regex: course_name, $options: 'i' } },
    ];
  }
  if (college) tbFilter.college = { $regex: college, $options: 'i' };
  if (grade) tbFilter.grade = { $regex: grade, $options: 'i' };
  const textbooks = await C.textbooks().find(tbFilter).sort({ sort: 1 }).limit(30).toArray();

  // 批量查每个教材的在售商品
  const tbIds = textbooks.map(t => t.id);
  const products = tbIds.length ? await C.products().aggregate([
    { $match: { textbook_id: { $in: tbIds }, status: 1 } },
    { $sort: { created_at: -1 } },
    { $group: { _id: '$textbook_id', products: { $push: '$$ROOT' } } },
  ]).toArray() : [];
  const prodMap = new Map(products.map((p: any) => [p._id, p.products]));

  // 批量查卖家信息
  const sellerIds = [...new Set([...products.flatMap((p: any) => p.products.map((x: any) => x.user_id))])];
  const sellers = sellerIds.length ? await C.users().find({ id: { $in: sellerIds } }, { projection: { _id: 0, id: 1, nickname: 1, grade: 1 } }).toArray() : [];
  const sellerMap = new Map(sellers.map(s => [s.id, s]));

  const rows = textbooks.map(t => {
    const ps = prodMap.get(t.id) || [];
    const first = ps[0];
    const seller = first ? sellerMap.get(first.user_id) : null;
    return {
      ...t,
      sell_count: ps.length,
      sample_pid: first?.id || null,
      sample_title: first?.title || null,
      sample_price: first?.price || null,
      sample_campus: first?.campus || null,
      sample_seller: seller?.nickname || null,
      sample_grade: seller?.grade || null,
    };
  });
  res.json(ok(rows));
});

/* ============================================================
 * 4. 聊天模块
 * ============================================================ */
async function ensureChat(buyer_id: number, seller_id: number, product_id?: number) {
  if (buyer_id === seller_id) return null;
  const filter: any = { buyer_id, seller_id };
  if (product_id) filter.$or = [{ product_id }, { product_id: null }];
  const exist = await C.chats().findOne(filter);
  if (exist) return exist.id;
  const id = await getNextId('chats');
  await C.chats().insertOne({ id, buyer_id, seller_id, product_id: product_id || null, last_message: null, last_time: Date.now(), created_at: Date.now() });
  return id;
}

app.get('/api/chats', auth(), async (req: any, res) => {
  const chats = await C.chats().find({ $or: [{ buyer_id: req.user.id }, { seller_id: req.user.id }] }).sort({ last_time: -1, created_at: -1 }).toArray();
  if (!chats.length) return res.json(ok([]));

  // 批量查商品和用户
  const productIds = [...new Set(chats.map(c => c.product_id).filter(Boolean))] as number[];
  const userIds = [...new Set(chats.flatMap(c => [c.buyer_id, c.seller_id]))];
  const [products, users, unreadCounts] = await Promise.all([
    productIds.length ? C.products().find({ id: { $in: productIds } }).toArray() : [],
    C.users().find({ id: { $in: userIds } }, { projection: { _id: 0, id: 1, nickname: 1, avatar: 1 } }).toArray(),
    C.messages().aggregate([
      { $match: { chat_id: { $in: chats.map(c => c.id) }, receiver_id: req.user.id, read: 0 } },
      { $group: { _id: '$chat_id', count: { $sum: 1 } } },
    ]).toArray(),
  ]);
  const prodMap = new Map<any, any>(products.map((p: any) => [p.id, p]) as any);
  const userMap = new Map<any, any>(users.map((u: any) => [u.id, u]) as any);
  const unreadMap = new Map<any, any>(unreadCounts.map((u: any) => [u._id, u.count]) as any);

  const rows = chats.map((c: any) => {
    const isBuyer = c.buyer_id === req.user.id;
    const peer: any = userMap.get(isBuyer ? c.seller_id : c.buyer_id);
    const p: any = c.product_id ? prodMap.get(c.product_id) : null;
    return {
      ...c,
      product_title: p?.title || null, product_cover: p?.cover || null, product_price: p?.price || null, product_status: p?.status || null,
      peer_name: peer?.nickname || '未知', peer_avatar: peer?.avatar || null,
      peer_id: isBuyer ? c.seller_id : c.buyer_id,
      unread: unreadMap.get(c.id) || 0,
    };
  });
  res.json(ok(rows));
});

app.get('/api/chats/:id/messages', auth(), async (req: any, res) => {
  const chat_id = Number(req.params.id);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const size = Math.min(100, parseInt(req.query.size as string) || 50);
  const chat: any = await C.chats().findOne({ id: chat_id });
  if (!chat || (chat.buyer_id !== req.user.id && chat.seller_id !== req.user.id)) return res.status(403).json(fail('无访问权限'));
  await C.messages().updateMany({ chat_id, receiver_id: req.user.id, read: 0 }, { $set: { read: 1 } });
  const msgs = await C.messages().find({ chat_id }).sort({ created_at: -1 }).skip((page - 1) * size).limit(size).toArray();
  msgs.reverse();
  res.json(ok(msgs));
});

app.post('/api/chats/start', auth(), async (req: any, res) => {
  const { product_id } = req.body || {};
  if (!product_id) return res.json(fail('请选择商品'));
  const p: any = await C.products().findOne({ id: Number(product_id) });
  if (!p) return res.json(fail('商品不存在'));
  const chatId = await ensureChat(req.user.id, p.user_id, Number(product_id));
  if (!chatId) return res.json(fail('不能与自己聊天'));
  res.json(ok({ chat_id: chatId }));
});

app.post('/api/messages', auth(), async (req: any, res) => {
  const { chat_id, receiver_id, content, type = 'text' } = req.body || {};
  if (!chat_id || !receiver_id || !content) return res.json(fail('缺少必填项'));
  const chat: any = await C.chats().findOne({ id: Number(chat_id) });
  if (!chat) return res.json(fail('会话不存在'));
  const id = await getNextId('messages');
  const now = Date.now();
  await C.messages().insertOne({
    id, chat_id: Number(chat_id), sender_id: req.user.id, receiver_id: Number(receiver_id),
    type: ['text', 'image', 'system'].includes(type) ? type : 'text',
    content, read: 0, created_at: now,
  });
  await C.chats().updateOne({ id: Number(chat_id) }, { $set: { last_message: String(content).slice(0, 100), last_time: now } });
  res.json(ok({ id, created_at: now }));
});

/* ============================================================
 * 5. 举报
 * ============================================================ */
app.post('/api/reports', auth(), async (req: any, res) => {
  const { target_type, target_id, reason } = req.body || {};
  if (!target_type || !target_id || !reason) return res.json(fail('请填写举报理由'));
  if (!['product', 'user', 'message'].includes(target_type)) return res.json(fail('举报对象不合法'));
  const id = await getNextId('reports');
  await C.reports().insertOne({ id, reporter_id: req.user.id, target_type, target_id: Number(target_id), reason, handled: 0, created_at: Date.now() });
  res.json(ok(null, '举报已提交，平台将在24小时内处理'));
});

/* ============================================================
 * 6. 图片上传
 * ============================================================ */
app.post('/api/upload', auth(), async (req: any, res) => {
  const { base64, type = 'image' } = req.body || {};
  if (!base64) return res.json(fail('请上传图片'));
  const m = base64.match(/^data:(.+?);base64,(.+)$/);
  const mime = m ? m[1] : 'image/png';
  const buf = Buffer.from(m ? m[2] : base64, 'base64');
  if (buf.length > 5 * 1024 * 1024) return res.json(fail('图片不能超过5M'));
  const ext = mime.includes('png') ? 'png' : mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);
  const url = `/uploads/${filename}`;
  res.json(ok({ url, full_url: `${req.protocol}://${req.get('host')}${url}` }));
});

/* ============================================================
 * 静态文件服务（生产环境，serve client/dist）
 * ============================================================ */
const staticDir = path.resolve(__dirname, '../public');
if (!process.env.SERVERLESS && fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return res.status(404).json(fail('接口不存在'));
    }
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

/* ============================================================
 * 全局错误兜底中间件（必须在所有路由之后、启动之前）
 * ============================================================ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const msg = err?.message || String(err) || '未知错误';
  console.error('❌ 服务器错误：', msg, err?.stack || '');
  if (res.headersSent) return;
  // 识别关键错误类型，返回可读信息
  let code = err?.statusCode || err?.status || 500;
  if (typeof code !== 'number' || code < 100 || code > 999) code = 500;
  res.status(code).json({
    code,
    msg: code === 500 ? `服务器内部错误：${msg.slice(0, 200)}` : msg,
    data: null,
  });
});

/* ============================================================
 * 启动
 * ============================================================ */
async function start() {
  if (process.env.SERVERLESS) {
    // Serverless 模式：异步连 DB（不阻塞），路由自己 getDB() 时会自动连上
    connectDB().then(() => {
      console.log('✅ Serverless: MongoDB 已连接');
    }).catch(err => {
      console.error('❌ Serverless: MongoDB 连接失败:', err.message);
    });
    return;
  }
  await connectDB();
  app.listen(PORT, () => {
    console.log(`
  ┌────────────────────────────────────────────┐
  │   🎓 ZZU二手市场 · 后端服务已启动               │
  │   Local:  http://localhost:${PORT}              │
  │   DB:     MongoDB                           │
  │   种子数据: npm run seed                    │
  └────────────────────────────────────────────┘
    `);
  });
}
start().catch(err => { console.error('启动失败:', err); if (!process.env.SERVERLESS) process.exit(1); });

// Serverless 模式下导出 app 给外部（serverless-http 包装）
export { app };
