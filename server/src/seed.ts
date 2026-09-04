/**
 * 种子数据：分类 + 郑大教材库 + 测试用户 + 商品 + 求购
 * MongoDB 版本，幂等写入（可重复执行）
 */
import { connectDB, C, getNextId } from './db';
import bcrypt from 'bcryptjs';

export async function seedMain() {
  await connectDB();
  const now = Date.now();
  const hash = bcrypt.hashSync('123456', 10);

  /* ============ 1. 分类 ============ */
  const categories = [
    { name: '教材教辅', icon: '📚', sort: 1 },
    { name: '3C数码', icon: '📱', sort: 2 },
    { name: '美妆服饰', icon: '👗', sort: 3 },
    { name: '宿舍用品', icon: '🛏', sort: 4 },
    { name: '运动户外', icon: '⚽', sort: 5 },
    { name: '考研考证', icon: '🎓', sort: 6 },
    { name: '乐器手办', icon: '🎸', sort: 7 },
    { name: '其他闲置', icon: '📦', sort: 99 },
  ];
  for (const c of categories) {
    const existing = await C.categories().findOne({ name: c.name });
    if (!existing) {
      const id = await getNextId('categories');
      await C.categories().insertOne({ id, ...c });
    }
  }
  const catMap = new Map<string, number>();
  (await C.categories().find({}, { projection: { _id: 0 } }).toArray()).forEach((c: any) => catMap.set(c.name, c.id));

  /* ============ 2. 郑大教材库 ============ */
  const textbooks: any[] = [
    { book_name: '高等数学（第七版）上册', course_name: '高等数学I', college: '数学与统计学院', major: '全院必修', grade: '大一', isbn: '9787040396638', author: '同济大学数学系', publisher: '高等教育出版社' },
    { book_name: '高等数学（第七版）下册', course_name: '高等数学II', college: '数学与统计学院', major: '全院必修', grade: '大一', isbn: '9787040396621', author: '同济大学数学系', publisher: '高等教育出版社' },
    { book_name: '线性代数（第六版）', course_name: '线性代数', college: '数学与统计学院', major: '全院必修', grade: '大一', isbn: '9787040346138', author: '同济大学数学系', publisher: '高等教育出版社' },
    { book_name: '概率论与数理统计（浙大第四版）', course_name: '概率论与数理统计', college: '数学与统计学院', major: '全院必修', grade: '大二', isbn: '9787040238969', author: '盛骤 谢式千', publisher: '高等教育出版社' },
    { book_name: '大学物理学（第三版）', course_name: '大学物理', college: '物理工程学院', major: '全院必修', grade: '大一', isbn: '9787040283541', author: '王少杰 顾牡', publisher: '高等教育出版社' },
    { book_name: 'C程序设计（第五版）', course_name: 'C语言程序设计', college: '信息工程学院', major: '计算机/软件/电气', grade: '大一', isbn: '9787302481447', author: '谭浩强', publisher: '清华大学出版社' },
    { book_name: '数据结构（C语言版）', course_name: '数据结构', college: '信息工程学院', major: '计算机/软件', grade: '大二', isbn: '9787302147510', author: '严蔚敏 吴伟民', publisher: '清华大学出版社' },
    { book_name: '计算机操作系统（第四版）', course_name: '操作系统', college: '信息工程学院', major: '计算机/软件', grade: '大三', isbn: '9787560636023', author: '汤小丹 汤子瀛', publisher: '西安电子科技大学出版社' },
    { book_name: '计算机网络（第八版）', course_name: '计算机网络', college: '信息工程学院', major: '计算机/软件', grade: '大三', isbn: '9787040551730', author: '谢希仁', publisher: '高等教育出版社' },
    { book_name: '电工学（第七版）上册', course_name: '电工技术', college: '电气工程学院', major: '电气/自动化', grade: '大二', isbn: '9787040344967', author: '秦曾煌', publisher: '高等教育出版社' },
    { book_name: '模拟电子技术基础（第五版）', course_name: '模电', college: '信息工程学院', major: '通信/电子', grade: '大二', isbn: '9787040425055', author: '童诗白 华成英', publisher: '高等教育出版社' },
    { book_name: '数字电子技术基础（第六版）', course_name: '数电', college: '信息工程学院', major: '通信/电子', grade: '大二', isbn: '9787040380057', author: '阎石', publisher: '高等教育出版社' },
    { book_name: '西方经济学（宏观部分·第八版）', course_name: '宏观经济学', college: '商学院', major: '经管类全院', grade: '大一', isbn: '9787300560474', author: '高鸿业', publisher: '中国人民大学出版社' },
    { book_name: '西方经济学（微观部分·第八版）', course_name: '微观经济学', college: '商学院', major: '经管类全院', grade: '大一', isbn: '9787300551555', author: '高鸿业', publisher: '中国人民大学出版社' },
    { book_name: '管理学（第十五版）', course_name: '管理学原理', college: '商学院', major: '工商管理/公共管理', grade: '大一', isbn: '9787300310831', author: '罗宾斯', publisher: '中国人民大学出版社' },
    { book_name: '基础会计（第八版）', course_name: '会计学基础', college: '商学院', major: '会计/财管', grade: '大一', isbn: '9787565448579', author: '陈国辉', publisher: '东北财经大学出版社' },
    { book_name: '马克思主义基本原理（2023版）', course_name: '马原', college: '马克思主义学院', major: '全校必修', grade: '大一/大二', isbn: '9787040598995', author: '本书编写组', publisher: '高等教育出版社' },
    { book_name: '毛泽东思想和中国特色社会主义理论体系概论（2023版）', course_name: '毛概', college: '马克思主义学院', major: '全校必修', grade: '大一/大二', isbn: '9787040599039', author: '本书编写组', publisher: '高等教育出版社' },
    { book_name: '中国近现代史纲要（2023版）', course_name: '近代史纲要', college: '马克思主义学院', major: '全校必修', grade: '大一', isbn: '9787040566246', author: '本书编写组', publisher: '高等教育出版社' },
    { book_name: '思想道德与法治（2023版）', course_name: '思修法基', college: '马克思主义学院', major: '全校必修', grade: '大一', isbn: '9787040566215', author: '本书编写组', publisher: '高等教育出版社' },
    { book_name: '大学英语精读1（第三版）', course_name: '大学英语', college: '外语学院', major: '全院必修', grade: '大一', isbn: '9787544673907', author: '翟象俊', publisher: '上海外语教育出版社' },
    { book_name: '全新版大学进阶英语 综合教程1', course_name: '大学英语', college: '外语学院', major: '全院必修', grade: '大一', isbn: '9787544679602', author: '季佩英', publisher: '上海外语教育出版社' },
    { book_name: '系统解剖学（第九版）', course_name: '系统解剖学', college: '基础医学院', major: '临床/口腔/预防', grade: '大一', isbn: '9787117267137', author: '丁文龙 王海杰', publisher: '人民卫生出版社' },
    { book_name: '生理学（第九版）', course_name: '生理学', college: '基础医学院', major: '临床/口腔', grade: '大二', isbn: '9787117267670', author: '王庭槐', publisher: '人民卫生出版社' },
    { book_name: '病理学（第九版）', course_name: '病理学', college: '基础医学院', major: '临床/口腔', grade: '大二', isbn: '9787117264389', author: '步宏 李一雷', publisher: '人民卫生出版社' },
    { book_name: '考研政治 肖秀荣1000题', course_name: '考研政治', college: '全校', major: '考研必备', grade: '大四', isbn: '无', author: '肖秀荣', publisher: '国家开放大学出版社' },
    { book_name: '考研政治 肖秀荣八套卷', course_name: '考研政治', college: '全校', major: '考研必备', grade: '大四', isbn: '无', author: '肖秀荣', publisher: '国家开放大学出版社' },
    { book_name: '考研政治 肖秀荣四套卷', course_name: '考研政治', college: '全校', major: '考研必备', grade: '大四', isbn: '无', author: '肖秀荣', publisher: '国家开放大学出版社' },
    { book_name: '考研英语 历年真题详解 张剑黄皮书', course_name: '考研英语一/二', college: '全校', major: '考研必备', grade: '大四', isbn: '无', author: '张剑', publisher: '世界图书出版公司' },
    { book_name: '李永乐考研数学复习全书', course_name: '考研数学', college: '全校', major: '考研数学一/二/三', grade: '大四', isbn: '无', author: '李永乐 王式安', publisher: '国家行政学院出版社' },
    { book_name: '新东方 六级词汇词根+联想记忆法', course_name: '英语六级', college: '全校', major: '四六级必备', grade: '大二/大三', isbn: '无', author: '俞敏洪', publisher: '浙江教育出版社' },
    { book_name: '新东方 四级词汇词根+联想记忆法', course_name: '英语四级', college: '全校', major: '四六级必备', grade: '大一/大二', isbn: '无', author: '俞敏洪', publisher: '浙江教育出版社' },
  ];

  for (let i = 0; i < textbooks.length; i++) {
    const b = textbooks[i];
    const existing = await C.textbooks().findOne({ book_name: b.book_name });
    if (!existing) {
      const id = await getNextId('textbooks');
      await C.textbooks().insertOne({ id, ...b, sort: i + 1 });
    }
  }
  const tbMap = new Map<string, number>();
  (await C.textbooks().find({}, { projection: { _id: 0 } }).toArray()).forEach((t: any) => tbMap.set(t.book_name, t.id));

  /* ============ 3. 测试用户 ============ */
  const users = [
    { username: 'admin', nickname: 'ZZU二手市场管理员', school_email: 'admin@zzu.edu.cn', major: null, grade: null, campus: '主校区', dormitory: null, verified: 2, role: 'admin' },
    { username: 'zzu_001', nickname: '小明同学（软件学院）', school_email: '202310101@gs.zzu.edu.cn', major: '软件工程', grade: '大三', campus: '主校区', dormitory: '柳园12号楼301', verified: 2, role: 'user' },
    { username: 'zzu_002', nickname: '小美（商学院）', school_email: '2022030402@gs.zzu.edu.cn', major: '会计学', grade: '大四', campus: '南校区', dormitory: '荷园5号楼412', verified: 2, role: 'user' },
  ];
  for (const u of users) {
    const existing = await C.users().findOne({ username: u.username });
    if (!existing) {
      const id = await getNextId('users');
      await C.users().insertOne({ id, ...u, password: hash, avatar: null, student_id: null, verify_code: '', created_at: now, updated_at: now });
    }
  }
  const userMap = new Map<string, number>();
  (await C.users().find({}, { projection: { _id: 0 } }).toArray()).forEach((u: any) => userMap.set(u.username, u.id));

  /* ============ 4. 测试商品 ============ */
  const sampleProducts: any[] = [
    { user: 'zzu_001', cat: '教材教辅', title: '考研英语张剑黄皮书（英一）2025版，几乎全新', desc: '买了没怎么看，答案册干净，原价89，半价出，适合2026考研的同学。主校区柳园自取。', price: 45, original: 89, textbook: '考研英语 历年真题详解 张剑黄皮书', course: '考研英语一', cond: '95新', campus: '主校区', contact: '微信：zzu_001_wx' },
    { user: 'zzu_001', cat: '教材教辅', title: '肖秀荣1000题 + 肖四肖八2025全套', desc: '肖1000做了前两章，肖八全新，肖四只做了一套选择。打包40块带走。', price: 40, original: 160, textbook: '考研政治 肖秀荣1000题', course: '考研政治', cond: '9成新', campus: '主校区', contact: '微信：zzu_001_wx' },
    { user: 'zzu_002', cat: '3C数码', title: 'iPad 2021款 64G WiFi 灰色', desc: '自用一年，带原装充电器，盒子齐全，屏幕无划痕，电池健康92%。送官方Smart Cover。面交验货。', price: 1780, original: 2999, textbook: null, course: null, cond: '95新', campus: '主校区', contact: 'QQ：123456789' },
    { user: 'zzu_002', cat: '3C数码', title: '罗技MX Master 3S 无线鼠标 石墨黑', desc: '程序员神器，用了3个月，手感一流但换了人体工学鼠标所以出。2024年双11买的，发票齐全。', price: 520, original: 799, textbook: null, course: null, cond: '99新', campus: '主校区', contact: 'QQ：123456789' },
    { user: 'zzu_001', cat: '宿舍用品', title: '宜家卡莱克书架（4格白色）', desc: '毕业搬宿舍带不走，原价399，现在100块。85成新，螺丝都在，柳园自取（可以帮你搬下楼）。', price: 100, original: 399, textbook: null, course: null, cond: '8成新', campus: '主校区', contact: '微信：zzu_001_wx' },
    { user: 'zzu_001', cat: '美妆服饰', title: '优衣库摇粒绒外套 男款M码 深蓝色', desc: '穿过两次，洗过一次，跟新的一样。大四毕业出闲置，原价199，现在60。', price: 60, original: 199, textbook: null, course: null, cond: '95新', campus: '主校区', contact: '微信：zzu_001_wx' },
    { user: 'zzu_002', cat: '运动户外', title: '迪卡侬80cm瑜伽垫 + 2kg哑铃一对', desc: '办了健身卡用不上，瑜伽垫加厚防滑款，哑铃包胶静音。打包60带走。', price: 60, original: 159, textbook: null, course: null, cond: '9成新', campus: '主校区', contact: 'QQ：123456789' },
    { user: 'zzu_001', cat: '考研考证', title: '新东方六级词汇乱序版 + 六级真题12套', desc: '六级已过，笔记很详细。荷园3号楼自取。', price: 30, original: 78, textbook: '新东方 六级词汇词根+联想记忆法', course: '英语六级', cond: '9成新', campus: '南校区', contact: '微信：zzu_001_wx' },
    { user: 'zzu_002', cat: '教材教辅', title: '数据结构（严蔚敏版）配套习题解析', desc: '考研复试用过，里面重点章节有高亮笔记，信息工程学院必备。', price: 15, original: 45, textbook: '数据结构（C语言版）', course: '数据结构', cond: '8成新', campus: '主校区', contact: 'QQ：123456789' },
    { user: 'zzu_001', cat: '其他闲置', title: '美的电热水壶 1.7L 304不锈钢', desc: '搬家出，烧水快，静音，无异味。20块钱出，先到先得，南校区荷园自取。', price: 20, original: 79, textbook: null, course: null, cond: '9成新', campus: '南校区', contact: '微信：zzu_001_wx' },
  ];

  let prodCount = await C.products().countDocuments();
  if (prodCount === 0) {
    for (let i = 0; i < sampleProducts.length; i++) {
      const p = sampleProducts[i];
      const id = await getNextId('products');
      const now2 = now - (i + 1) * 3600000;
      await C.products().insertOne({
        id, user_id: userMap.get(p.user)!, category_id: catMap.get(p.cat)!,
        title: p.title, description: p.desc, price: p.price, original_price: p.original,
        cover: '', images: '[]', textbook_id: p.textbook ? tbMap.get(p.textbook) || null : null,
        course_name: p.course, condition: p.cond, campus: p.campus, contact: p.contact,
        status: 1, view_count: 100 + i * 3, fav_count: 0, chat_count: 0,
        created_at: now2, updated_at: now2,
      });
    }
    prodCount = sampleProducts.length;
  }

  /* ============ 5. 求购示例数据 ============ */
  const sampleWanted: any[] = [
    { user: 'zzu_002', title: '求购二手自行车（变速）', desc: '刚开学需要一辆代步车，变速的，成色无所谓能骑就行。主校区最好。', expect: 150, cat: '其他闲置', campus: '主校区', contact: 'QQ：123456789' },
    { user: 'zzu_001', title: '求购高数同济第七版上册', desc: '上课用的，不需要习题册，只要课本。价格可谈。', expect: 15, cat: '教材教辅', campus: '主校区', contact: '微信：zzu_001_wx' },
    { user: 'zzu_002', title: '求购显示器 24寸 1080p', desc: '放宿舍写代码用，不需要高刷，1080p即可。有HDMI接口。', expect: 300, cat: '3C数码', campus: '主校区', contact: 'QQ：123456789' },
    { user: 'zzu_001', title: '求购考研数学李永乐复习全书', desc: '2026考研，数学一，需要复习全书+660题，有的联系。', expect: 35, cat: '考研考证', campus: '主校区', contact: '微信：zzu_001_wx' },
    { user: 'zzu_002', title: '求购宿舍小风扇（静音）', desc: '夏天太热了，需要一个小风扇，静音的，放床头用。', expect: 25, cat: '宿舍用品', campus: '南校区', contact: 'QQ：123456789' },
    { user: 'zzu_001', title: '求购吉他（民谣）入门级', desc: '想学吉他，需要一把入门级的民谣吉他，带琴包和拨片最好。', expect: 200, cat: '乐器手办', campus: '主校区', contact: '微信：zzu_001_wx' },
  ];

  let wantedCount = await C.wanted().countDocuments();
  if (wantedCount === 0) {
    for (let i = 0; i < sampleWanted.length; i++) {
      const w = sampleWanted[i];
      const id = await getNextId('wanted');
      const now2 = now - (i + 1) * 7200000;
      await C.wanted().insertOne({
        id, user_id: userMap.get(w.user)!, title: w.title, description: w.desc,
        expect_price: w.expect, category_id: catMap.get(w.cat) || null,
        campus: w.campus, contact: w.contact, status: 1, view_count: 50 + i * 2,
        created_at: now2, updated_at: now2,
      });
    }
    wantedCount = sampleWanted.length;
  }

  console.log(`
✅ MongoDB 种子数据写入完成！
📚 分类：${categories.length} 个
📖 郑大教材库：${textbooks.length} 本
👥 测试用户：${users.length} 个（密码均为 123456）
   - admin / 123456 （管理员）
   - zzu_001 / 123456 （软件学院大三）
   - zzu_002 / 123456 （商学院大四）
🛍 测试商品：${prodCount} 个
📢 求购信息：${wantedCount} 个
  `);
  return { categories: categories.length, textbooks: textbooks.length, users: users.length, products: prodCount, wanted: wantedCount };
}

// 直接运行时才执行（ts-node seed.ts 或 node dist/seed.js）
if (require.main === module) {
  seedMain().then(() => process.exit(0)).catch(err => { console.error('种子数据写入失败:', err); process.exit(1); });
}
