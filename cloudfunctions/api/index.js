/**
 * ZZU二手市场 — CloudBase 云函数入口
 * 用 serverless-http 包装 Express，和 Vercel 一样的思路
 * CloudBase 云函数格式：exports.main = async (event, context) => {}
 */
const serverless = require('serverless-http');

process.env.SERVERLESS = 'true';

let handler = null;

function init() {
  if (handler) return handler;
  const { app } = require('./server-dist/index.js');
  handler = serverless(app, {
    binary: ['image/*', 'audio/*', 'video/*', 'application/octet-stream'],
  });
  console.log('[CloudBase] init() 完成');
  return handler;
}

// CloudBase 云函数 HTTP 触发格式
exports.main = async (event, context) => {
  try {
    const fn = init();
    // CloudBase 事件格式转成 HTTP 请求格式（serverless-http 自动处理大部分）
    // CloudBase 的 event 里 path 已经是完整路径
    return fn(event, context);
  } catch (err) {
    console.error('[CloudBase] 错误:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 1, msg: '服务器错误：' + (err.message || err) }),
    };
  }
};
