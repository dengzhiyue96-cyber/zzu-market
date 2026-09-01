/**
 * ZZU二手市场 — Vercel Serverless Function 入口
 * 极简版：serverless-http 包装 Express
 * 不在 init 里阻塞等 MongoDB，让 Express 路由自己连（快速失败）
 */
const serverless = require('serverless-http');

process.env.SERVERLESS = 'true';

let handler = null;

async function init() {
  if (handler) return handler;
  const { app } = require('../server/dist/index.js');
  handler = serverless(app, {
    binary: ['image/*', 'audio/*', 'video/*', 'application/octet-stream'],
  });
  console.log('[Serverless] init() 完成，handler 已就绪');
  return handler;
}

export default async function (req, res) {
  try {
    const fn = await init();
    return fn(req, res);
  } catch (err) {
    console.error('[Serverless] 错误:', err);
    res.status(500).json({ code: 1, msg: '服务器错误：' + (err.message || err) });
  }
}
