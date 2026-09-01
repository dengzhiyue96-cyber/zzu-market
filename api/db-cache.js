/**
 * MongoDB 连接缓存（Vercel Serverless 跨调用复用）
 * 把 connectDB 的核心逻辑抽出来，供 server/index.ts 和 api/index.js 共享
 */
const { MongoClient } = require('mongodb');
const dns = require('dns');

// DNS 修复（校园网经常拦截 SRV 查询）
try { dns.setDefaultResultOrder('ipv4first'); } catch {}
try { dns.setServers(['223.5.5.5', '119.29.29.29', '8.8.8.8', '1.1.1.1']); } catch {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zzu_market';

// global.mongodb 是 Vercel Serverless 实例级缓存
// 同一个容器里多次调用会复用这个连接
const globalCache = global.mongodb || (global.mongodb = {});

module.exports = {
  async connect() {
    if (globalCache.db) return globalCache.db;
    globalCache.client = new MongoClient(MONGODB_URI);
    await globalCache.client.connect();
    globalCache.db = globalCache.client.db('zzu_market');
    console.log('✅ MongoDB 已连接（Vercel Serverless）');

    // 幂等索引创建（第一次启动时跑一次就行）
    try {
      const db = globalCache.db;
      await Promise.all([
        db.collection('users').createIndex({ id: 1 }, { unique: true }),
        db.collection('users').createIndex({ username: 1 }, { unique: true }),
        db.collection('products').createIndex({ id: 1 }, { unique: true }),
        db.collection('products').createIndex({ status: 1, created_at: -1 }),
        db.collection('wanted').createIndex({ id: 1 }, { unique: true }),
      ]);
    } catch (e) { /* 索引已存在，忽略 */ }

    return globalCache.db;
  },
  getDb() {
    if (!globalCache.db) throw new Error('DB 未连接');
    return globalCache.db;
  },
};
