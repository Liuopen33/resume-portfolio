const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');
let data = { users: [], products: [], orders: [], favorites: [] };

if (fs.existsSync(DB_PATH)) {
  data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save() { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

// Seed
if (data.users.length === 0) {
  const hash = bcrypt.hashSync('123456', 10);
  data.users = [
    { id: 1, username: '测试用户', password: hash, phone: '13800138000' },
    { id: 2, username: '小明同学', password: hash, phone: '13900139000' },
    { id: 3, username: '学姐二手', password: hash, phone: '13700137000' },
  ];

  let pid = 1;
  const P = (sid, title, cat, desc, price, cond, emoji, date) => ({
    id: pid++, seller_id: sid, title, category: cat, description: desc,
    price, condition: cond, emoji, status: 'active',
    views: Math.floor(Math.random() * 80), created_at: date
  });

  data.products = [
    P(1, '大学英语四级词汇书', '图书教材', '几乎全新，只用铅笔划过几页，考完四级便宜出，附赠四级真题一套。', 15, '九成新', '📖', '2025-09-20'),
    P(1, '机械键盘 ikbc C87 樱桃红轴', '数码电子', '樱桃红轴手感清脆，用了半年无任何问题，送PBT键帽+拔键器。', 120, '八成新', '⌨️', '2025-09-22'),
    P(2, '宿舍迷你小冰箱 4L', '生活电器', '冷暖两用，4L容量放6罐饮料刚好，制冷效果很好，毕业出。', 80, '七成新', '🧊', '2025-10-01'),
    P(2, '木质折叠床上书桌', '家居用品', '实木材质很稳，带杯架和隐藏式抽屉，可折叠不占空间。', 35, '九成新', '📐', '2025-10-05'),
    P(3, '入门双翘滑板 送护具', '运动户外', '刷街代步够用，板面几乎无划痕，送护膝护肘护腕全套。', 50, '七成新', '🛹', '2025-10-10'),
    P(3, '26寸山地自行车 禧玛诺21速', '运动户外', '变速顺畅刹车灵敏，送车锁和挡泥板，校园通勤神器。', 200, '六成新', '🚲', '2025-10-12'),
    P(1, '考研数学复习全书（张宇）', '图书教材', '全新未拆封，换了专业方向所以出，塑封膜都没撕。', 25, '全新', '📚', '2025-11-01'),
    P(2, '41寸民谣吉他 云杉面板', '乐器艺术', '音色温暖手感舒适，送变调夹+调音器+备用琴弦一套。', 150, '八成新', '🎸', '2025-11-05'),
    P(3, 'iPad Air 5 64G 深空灰', '数码电子', 'M1芯片电池健康92%，屏幕无划痕，送保护壳和充电器。', 2200, '九成新', '📱', '2025-10-15'),
    P(1, '罗技 G502 游戏鼠标', '数码电子', '用了三个月换无线版了，成色很新包装盒都在。', 80, '九五新', '🖱️', '2025-11-10'),
    P(2, '纯棉床上三件套 1.5m床', '家居用品', '纯棉面料亲肤透气，洗干净叠好了直接拿走。', 30, '八成新', '🛏️', '2025-09-28'),
    P(3, '多功能宿舍电煮锅 1.5L', '生活电器', '煮面煮粥火锅都行，不粘涂层好清洗，宿舍党必备。', 40, '八成新', '🍳', '2025-10-20'),
    P(1, '桃花心木尤克里里 23寸', '乐器艺术', '音准稳定适合入门，送教程书和调音器。', 65, '九成新', '🪕', '2025-10-08'),
    P(2, '空气炸锅 3.5L 大容量', '生活电器', '烤鸡翅薯条超方便，说明书和食谱都在。', 95, '八成新', '🍟', '2025-11-15'),
    P(3, '斯伯丁篮球 74-604Y', '运动户外', '室内外通用手感好，气打得刚好拿来就能用。', 55, '八成新', '🏀', '2025-09-25'),
    P(1, '高等数学 同济第七版 全套', '图书教材', '上下册+习题全解三本打包出，笔记工整可参考。', 28, '七成新', '📕', '2025-09-15'),
  ];
  data.orders = [];
  data.favorites = [];
  save();
  console.log('已初始化 ' + data.products.length + ' 件商品');
}

const db = {
  findUser: (u) => data.users.find(x => x.username === u),
  findUserById: (id) => data.users.find(x => x.id === id),
  createUser: (user) => {
    const id = Math.max(0, ...data.users.map(u => u.id)) + 1;
    const u = { id, ...user, created_at: new Date().toISOString() };
    data.users.push(u); save(); return u;
  },
  getProducts: (f = {}) => {
    let ps = data.products.filter(p => p.status === 'active').map(p => {
      const s = data.users.find(u => u.id === p.seller_id);
      return { ...p, seller_name: s ? s.username : '未知' };
    });
    if (f.search) {
      const q = f.search.toLowerCase();
      ps = ps.filter(p => p.title.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
    }
    if (f.category) ps = ps.filter(p => p.category === f.category);
    if (f.sort === 'cheapest') ps.sort((a,b) => a.price - b.price);
    else if (f.sort === 'priciest') ps.sort((a,b) => b.price - a.price);
    else ps.sort((a,b) => b.created_at > a.created_at ? -1 : 1);
    return ps;
  },
  getCategories: () => [...new Set(data.products.filter(p => p.status==='active').map(p => p.category))],
  getProduct: (id) => {
    const p = data.products.find(p => p.id === parseInt(id));
    if (!p) return null;
    p.views = (p.views||0) + 1; save();
    const s = data.users.find(u => u.id === p.seller_id);
    return { ...p, seller_name: s?s.username:'未知', seller_phone: s?s.phone:'' };
  },
  createProduct: (prod) => {
    const id = Math.max(0, ...data.products.map(p => p.id)) + 1;
    const np = { id, ...prod, emoji: prod.emoji || '📦', status:'active', views:0, created_at: new Date().toISOString().split('T')[0] };
    data.products.push(np); save(); return np;
  },
  getProductsBySeller: (sid) => data.products.filter(p => p.seller_id===parseInt(sid)).sort((a,b) => b.created_at > a.created_at ? 1 : -1),
  updateProductStatus: (id, sid, st) => { const p = data.products.find(p => p.id===parseInt(id)&&p.seller_id===parseInt(sid)); if(p){p.status=st;save();return true} return false },
  deleteProduct: (id, sid) => { const i = data.products.findIndex(p => p.id===parseInt(id)&&p.seller_id===parseInt(sid)); if(i>=0){data.products.splice(i,1);save();return true} return false },
  createOrder: (o) => { const id = Math.max(0,...data.orders.map(x=>x.id))+1; const no={id,...o,status:'pending',created_at:new Date().toISOString()}; data.orders.push(no);save();return no },
  getBuyOrders: (uid) => data.orders.filter(o=>o.buyer_id===parseInt(uid)).map(o=>{
    const p=data.products.find(x=>x.id===o.product_id), s=data.users.find(x=>x.id===o.seller_id);
    return {...o,product_title:p?p.title:'',price:p?p.price:0,seller_name:s?s.username:''}
  }).sort((a,b)=>b.created_at>a.created_at?1:-1),
  getSellOrders: (uid) => data.orders.filter(o=>o.seller_id===parseInt(uid)).map(o=>{
    const p=data.products.find(x=>x.id===o.product_id), b=data.users.find(x=>x.id===o.buyer_id);
    return {...o,product_title:p?p.title:'',price:p?p.price:0,buyer_name:b?b.username:''}
  }).sort((a,b)=>b.created_at>a.created_at?1:-1),
  getOrder: (id) => data.orders.find(o=>o.id===parseInt(id)),
  updateOrderStatus: (id,st) => { const o=data.orders.find(x=>x.id===parseInt(id)); if(o){o.status=st;save();return true} return false },
  addFavorite: (uid,pid) => { if(data.favorites.find(f=>f.user_id===parseInt(uid)&&f.product_id===parseInt(pid))) return false; data.favorites.push({id:data.favorites.length+1,user_id:parseInt(uid),product_id:parseInt(pid),created_at:new Date().toISOString()});save();return true },
  removeFavorite: (uid,pid) => { const i=data.favorites.findIndex(f=>f.user_id===parseInt(uid)&&f.product_id===parseInt(pid)); if(i>=0){data.favorites.splice(i,1);save();return true} return false },
  isFavorited: (uid,pid) => data.favorites.some(f=>f.user_id===parseInt(uid)&&f.product_id===parseInt(pid)),
  getFavorites: (uid) => data.favorites.filter(f=>f.user_id===parseInt(uid)).map(f=>{ const p=data.products.find(x=>x.id===f.product_id); if(!p)return null; const s=data.users.find(x=>x.id===p.seller_id); return {...f,product:{...p,seller_name:s?s.username:'未知'}} }).filter(Boolean).sort((a,b)=>b.created_at>a.created_at?1:-1),
  getUserStats: (uid) => ({ productCount: data.products.filter(p=>p.seller_id===parseInt(uid)).length, activeProducts: data.products.filter(p=>p.seller_id===parseInt(uid)&&p.status==='active').length, buyCount: data.orders.filter(o=>o.buyer_id===parseInt(uid)).length, sellCount: data.orders.filter(o=>o.seller_id===parseInt(uid)).length, favoriteCount: data.favorites.filter(f=>f.user_id===parseInt(uid)).length }),
};

module.exports = db;
