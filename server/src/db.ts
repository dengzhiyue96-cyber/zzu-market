/**
 * 郑大二手市场 - 数据库层（MongoDB）
 * 使用 MongoDB Atlas 免费版，数据持久化，支持云部署
 */
import dns from 'dns';
import { MongoClient, Db } from 'mongodb';

// 校园网/本地 DNS 经常拦截 SRV 查询，切到公共 DNS 保证 MongoDB Atlas 能连上
try { dns.setDefaultResultOrder('ipv4first'); } catch {}
try { dns.setServers(['223.5.5.5', '119.29.29.29', '8.8.8.8', '1.1.1.1']); } catch {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zzu_market';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (dbInstance) return dbInstance;
  client = new MongoClient(MONGODB_URI);
  await client.connect();
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
}

export function getDB(): Db {
  if (!dbInstance) throw new Error('数据库未连接，请先调用 connectDB()');
  return dbInstance;
}

/** 获取自增ID */
export async function getNextId(name: string): Promise<number> {
  const db = getDB();
  const col = db.collection<any>('counters');
  const result = await col.findOneAndUpdate(
    { _id: name as any },
    { $inc: { seq: 1 } } as any,
    { upsert: true, returnDocument: 'after' as const }
  );
  return (result as any)?.value?.seq || 1;
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
