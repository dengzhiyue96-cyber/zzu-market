"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.C = void 0;
exports.connectDB = connectDB;
exports.getDB = getDB;
exports.getNextId = getNextId;
/**
 * ZZU二手市场 - 数据库层（MongoDB）
 * 使用 MongoDB Atlas 免费版，数据持久化，支持云部署
 */
const dns_1 = __importDefault(require("dns"));
const mongodb_1 = require("mongodb");
// Vercel/云服务器环境用默认 DNS；本地/校园网需要 ipv4first
const isServerless = process.env.SERVERLESS === 'true';
if (!isServerless) {
    try {
        dns_1.default.setDefaultResultOrder('ipv4first');
    }
    catch { }
}
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zzu_market';
let client = null;
let dbInstance = null;
async function connectDB() {
    if (dbInstance)
        return dbInstance;
    client = new mongodb_1.MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10,
    });
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
function getDB() {
    if (!dbInstance)
        throw new Error('数据库未连接，请先调用 connectDB()');
    return dbInstance;
}
/** 获取自增ID */
async function getNextId(name) {
    const db = getDB();
    const col = db.collection('counters');
    const result = await col.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
    return result?.value?.seq || 1;
}
/** 集合访问器 */
exports.C = {
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
