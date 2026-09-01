// 极简健康检查：完全不连 DB，只测 Serverless + rewrites 是否正常
export default function handler(req, res) {
  res.status(200).json({
    code: 0,
    msg: 'ok',
    data: {
      service: 'ZZU二手市场 API',
      version: '1.0.0',
      serverless: true,
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'production',
    },
  });
}
