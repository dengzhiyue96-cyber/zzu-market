/**
 * ZZU二手市场 - 数据库层（MongoDB）
 * 使用 MongoDB Atlas 免费版，数据持久化，支持云部署
 */
import dns from 'dns';
import { MongoClient, Db } from 'mongodb';

// Vercel/云服务器环境用默认 DNS；本地/校园网需要 ipv4first
const isServerless = process.env.SERVERLESS === 'true';
if (!isServerless) {
  try { dns.setDefaultResultOrder('ipv4first'); } catch {}
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zzu_market';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let connectInFlight: Promise<Db> | null = null;

export async function connectDB(): Promise<Db> {
  if (dbInstance) return dbInstance;
  if (connectInFlight) return connectInFlight; // 并发请求合并（单飞）
  connectInFlight = (async (): Promise<Db> => {
    if (dbInstance) return dbInstance;
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
    });
    // 硬性10秒超时兜底：MongoDB URI错或DNS挂时，不再300秒死等
    await Promise.race([
      client.connect(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('MongoDB 连接超时（10s硬兜底）：请检查 MONGODB_URI 是否为最新 cluster0.vn3u94d 集群、IP 白名单是否为 0.0.0.0/0')),
          10000
        )
      ),
    ]);
    dbInstance = client.db('zzu_market');

    // 索引（幂等，已存在则跳过）
    await Promise.all([
      dbInstance.collection('users').createIndex({ id: 1 }, { unique: true }),
      dbInstance.collection('users').createIndex({ username: 1 }, { unique: true }),
      dbInstance.collection('users').createIndex({ school_email: 1 }, { unique: true, sparse: true }),
      dbInstance.collection('categories').createIndex({ id: 1 }, { unique: true }),
      dbInstance.collection('products').createIndex({ id: 1 }, { unique: true }),
      dbInstance.collection('products').createIndex({ status: 1, created_at: -1 }),
      dbInstance.collection('products').createIndex({ user_id: 1, status: 1 }),
      dbInstance.collection('products').createIndex({ category_id: 1, status: 1 }),
      dbInstance.collection('wanted').createIndex({ id: 1 }, { unique: true }),
      dbInstance.collection('wanted').createIndex({ status: 1, created_at: -1 }),
      dbInstance.collection('textbooks').createIndex({ id: 1 }, { unique: true }),
      dbInstance.collection('favorites').createIndex({ user_id: 1, product_id: 1 }, { unique: true }),
      dbInstance.collection('chats').createIndex({ id: 1 }, { unique: true }),
      dbInstance.collection('chats').createIndex({ buyer_id: 1, seller_id: 1 }),
      dbInstance.collection('messages').createIndex({ chat_id: 1, created_at: 1 }),
    ]);

    console.log('✅ MongoDB 已连接');
    return dbInstance;
  })().catch(err => {
    connectInFlight = null; // 失败清空：下一次请求可重新尝试，不会永远卡在rejected promise
    throw err;
  });
  return connectInFlight;
}

export function getDB(): Db {
  if (!dbInstance) throw new Error('数据库未连接，请先调用 connectDB()');
  return dbInstance;
}

/** 获取自增ID */
export async function getNextId(name: string): Promise<number> {
  const db = getDB();
  const col = db.collection<any>('counters');
  // 两步法：先 inc，再查询，避免 findOneAndUpdate 返回值兼容问题
  await col.updateOne({ _id: name }, { $inc: { seq: 1 } }, { upsert: true });
  const doc = await col.findOne({ _id: name });
  return doc?.seq || 1;
}

/** 集合访问器 */
export const C = {
  users: () => getDB().collection('users'),
  categories: () => getDB().collection('categories'),
  products: () => getDB().collection('products'),
  wanted: () => getDB().collection('wanted'),
  textbooks: () => getDB().collection('textbooks'),
  favorites: () => getDB().collection('favorites'),
  chats: () => getDB().collection('chats'),
  messages: () => getDB().collection('messages'),
  reports: () => getDB().collection('reports'),
  counters: () => getDB().collection('counters'),
};
