/**
 * ZZU二手市场 — Vercel Serverless Function 入口
 * 极简版：serverless-http + server 里自己的 connectDB（不要两套 DB 连接）
 */
const serverless = require('serverless-http');

process.env.SERVERLESS = 'true';

// 动态加载编译后的 Express app
let handler = null;
let dbPromise = null;

async function init() {
  if (handler) return handler;

  const { app } = require('../server/dist/index.js');

  // 用 server 自己的 connectDB（db.ts 里的），不要 api/db-cache.js
  // 设置 8 秒超时（Vercel Hobby maxDuration 10s）
  const { connectDB } = require('../server/dist/db.js');

  dbPromise = connectDB().catch(err => {
    console.error('MongoDB 连接失败:', err.message);
  });

  // 等 DB 连上再返回 handler
  await dbPromise;

  handler = serverless(app, {
    binary: ['image/*', 'audio/*', 'video/*', 'application/octet-stream'],
  });
  return handler;
}

// Vercel Serverless 入口
export default async function (req, res) {
  const start = Date.now();
  try {
    const fn = await init();
    const elapsed = Date.now() - start;
    console.log(`[Serverless] 请求 ${req.url} 初始化耗时: ${elapsed}ms`);
    return fn(req, res);
  } catch (err) {
    console.error('[Serverless] 错误:', err);
    res.status(500).json({ code: 1, msg: '服务器错误：' + (err.message || err) });
  }
}
