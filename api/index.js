/**
 * ZZU二手市场 — Vercel Serverless Function 入口
 * 用 serverless-http 包装完整的 Express 应用
 * 所有 /api/* 请求都会 rewrite 到这里
 */
const serverless = require('serverless-http');

// 设置环境变量，让 Express 知道自己跑在 Serverless 里
process.env.SERVERLESS = 'true';

// Mongo 连接缓存（同一个实例内复用，避免冷启动每次重连）
// 使用 global.mongoose 保存连接池
const dbCache = require('./db-cache');

// 动态加载编译后的 Express app
let handler = null;

async function init() {
  if (handler) return handler;
  // 确保 MongoDB 已连接
  await dbCache.connect();
  // 加载 Express（serverless-http 需要第一次调用时拿到已就绪的 app）
  const { app } = require('../server/dist/index.js');
  handler = serverless(app, {
    binary: ['image/*', 'audio/*', 'video/*', 'application/octet-stream'],
  });
  return handler;
}

// Vercel Serverless 入口
export default async function (req, res) {
  try {
    const fn = await init();
    return fn(req, res);
  } catch (err) {
    console.error('Serverless Error:', err);
    res.status(500).json({ code: 1, msg: '服务器错误：' + (err.message || err) });
  }
}
