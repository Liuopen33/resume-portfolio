const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

let data = { users: [], products: [], orders: [], favorites: [] };

// Load existing data
if (fs.existsSync(DB_PATH)) {
  data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Seed data if empty
if (data.users.length === 0) {
  const hash = bcrypt.hashSync('123456', 10);
  data.users = [
    { id: 1, username: '测试用户', password: hash, phone: '13800138000' },
    { id: 2, username: '小明同学', password: hash, phone: '13900139000' },
    { id: 3, username: '学姐二手', password: hash, phone: '13700137000' },
  ];

  let pid = 1;
  data.products = [
    { id: pid++, seller_id: 1, title: '大学英语四级词汇书', category: '图书教材', description: '几乎全新，只用铅笔划过几页，考完四级出。', price: 15, condition: '九成新', status: 'active', views: 0, created_at: '2025-09-20' },
    { id: pid++, seller_id: 1, title: '机械键盘 ikbc C87', category: '数码电子', description: '樱桃红轴，用了半年，无任何问题，送一套键帽。', price: 120, condition: '八成新', status: 'active', views: 0, created_at: '2025-09-22' },
    { id: pid++, seller_id: 2, title: '宿舍用小冰箱 4L', category: '生活电器', description: '迷你冰箱，制冷效果很好，毕业出。', price: 80, condition: '七成新', status: 'active', views: 0, created_at: '2025-10-01' },
    { id: pid++, seller_id: 2, title: '床上书桌 折叠款', category: '家居用品', description: '木质折叠床上书桌，很稳，带杯架和抽屉。', price: 35, condition: '九成新', status: 'active', views: 0, created_at: '2025-10-05' },
    { id: pid++, seller_id: 3, title: '滑板 双翘板', category: '运动户外', description: '入门双翘板，刷街代步够用，送护具一套。', price: 50, condition: '七成新', status: 'active', views: 0, created_at: '2025-10-10' },
    { id: pid++, seller_id: 3, title: '二手山地自行车 26寸', category: '运动户外', description: '变速正常，刹车灵敏，送锁和挡泥板。', price: 200, condition: '六成新', status: 'active', views: 0, created_at: '2025-10-12' },
    { id: pid++, seller_id: 1, title: '考研数学复习全书', category: '图书教材', description: '全新未拆封，便宜出。', price: 25, condition: '全新', status: 'active', views: 0, created_at: '2025-11-01' },
    { id: pid++, seller_id: 2, title: '民谣吉他 41寸', category: '乐器艺术', description: '音色不错，送变调夹和调音器。', price: 150, condition: '八成新', status: 'active', views: 0, created_at: '2025-11-05' },
  ];

  data.orders = [];
  data.favorites = [];
  save();
  console.log('数据库初始化完成，已插入示例数据');
}

// Helper to simulate SQL-like operations
const db = {
  // Users
  findUser: (username) => data.users.find(u => u.username === username),
  findUserById: (id) => data.users.find(u => u.id === id),
  createUser: (user) => {
    const id = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    const newUser = { id, ...user, created_at: new Date().toISOString() };
    data.users.push(newUser);
    save();
    return newUser;
  },

  // Products
  getProducts: (filter = {}) => {
    let products = data.products
      .filter(p => p.status === 'active')
      .map(p => {
        const seller = data.users.find(u => u.id === p.seller_id);
        return { ...p, seller_name: seller ? seller.username : '未知' };
      });

    if (filter.search) {
      const s = filter.search.toLowerCase();
      products = products.filter(p => p.title.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
    }
    if (filter.category) {
      products = products.filter(p => p.category === filter.category);
    }
    if (filter.sort === 'cheapest') products.sort((a, b) => a.price - b.price);
    else if (filter.sort === 'priciest') products.sort((a, b) => b.price - a.price);
    else products.sort((a, b) => b.created_at > a.created_at ? -1 : 1);

    return products;
  },

  getCategories: () => [...new Set(data.products.filter(p => p.status === 'active').map(p => p.category))],

  getProduct: (id) => {
    const p = data.products.find(p => p.id === parseInt(id));
    if (!p) return null;
    const seller = data.users.find(u => u.id === p.seller_id);
    p.views = (p.views || 0) + 1;
    save();
    return { ...p, seller_name: seller ? seller.username : '未知', seller_phone: seller ? seller.phone : '' };
  },

  createProduct: (product) => {
    const id = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1;
    const newProduct = { id, ...product, status: 'active', views: 0, created_at: new Date().toISOString().split('T')[0] };
    data.products.push(newProduct);
    save();
    return newProduct;
  },

  getProductsBySeller: (sellerId) => data.products.filter(p => p.seller_id === parseInt(sellerId)).sort((a, b) => b.created_at > a.created_at ? 1 : -1),

  updateProductStatus: (id, sellerId, status) => {
    const p = data.products.find(p => p.id === parseInt(id) && p.seller_id === parseInt(sellerId));
    if (p) { p.status = status; save(); return true; }
    return false;
  },

  deleteProduct: (id, sellerId) => {
    const idx = data.products.findIndex(p => p.id === parseInt(id) && p.seller_id === parseInt(sellerId));
    if (idx >= 0) { data.products.splice(idx, 1); save(); return true; }
    return false;
  },

  // Orders
  createOrder: (order) => {
    const id = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
    const newOrder = { id, ...order, status: 'pending', created_at: new Date().toISOString() };
    data.orders.push(newOrder);
    save();
    return newOrder;
  },

  getBuyOrders: (userId) => data.orders
    .filter(o => o.buyer_id === parseInt(userId))
    .map(o => {
      const p = data.products.find(pp => pp.id === o.product_id);
      const seller = data.users.find(u => u.id === o.seller_id);
      return { ...o, product_title: p ? p.title : '', price: p ? p.price : 0, image: p ? p.image : '', seller_name: seller ? seller.username : '' };
    }).sort((a, b) => b.created_at > a.created_at ? 1 : -1),

  getSellOrders: (userId) => data.orders
    .filter(o => o.seller_id === parseInt(userId))
    .map(o => {
      const p = data.products.find(pp => pp.id === o.product_id);
      const buyer = data.users.find(u => u.id === o.buyer_id);
      return { ...o, product_title: p ? p.title : '', price: p ? p.price : 0, image: p ? p.image : '', buyer_name: buyer ? buyer.username : '' };
    }).sort((a, b) => b.created_at > a.created_at ? 1 : -1),

  getOrder: (id) => data.orders.find(o => o.id === parseInt(id)),

  updateOrderStatus: (id, status) => {
    const o = data.orders.find(o => o.id === parseInt(id));
    if (o) { o.status = status; save(); return true; }
    return false;
  },
};

module.exports = db;
