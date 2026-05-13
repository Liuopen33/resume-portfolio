const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = 3000;
const PER_PAGE = 8;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'campus_trading_2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const catEmojis = { '图书教材':'📚','数码电子':'💻','生活电器':'🔌','家居用品':'🪑','运动户外':'⚽','乐器艺术':'🎸','服饰鞋包':'👗','美妆护肤':'💄' };
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.getCatEmoji = (cat) => catEmojis[cat] || '📦';
  next();
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Home
app.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const allProducts = db.getProducts({
    search: req.query.search || '',
    category: req.query.category || '',
    sort: req.query.sort || 'newest'
  });

  const totalPages = Math.ceil(allProducts.length / PER_PAGE);
  const offset = (page - 1) * PER_PAGE;
  const products = allProducts.slice(offset, offset + PER_PAGE);

  const categories = db.getCategories();
  res.render('index', {
    products, categories, page, totalPages,
    search: req.query.search || '',
    category: req.query.category || '',
    sort: req.query.sort || 'newest'
  });
});

// Product detail
app.get('/product/:id', (req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).render('404');
  const isFav = req.session.user ? db.isFavorited(req.session.user.id, product.id) : false;
  res.render('product', { product, isFav });
});

// Favorites
app.post('/favorite/:productId', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: '请先登录' });
  db.addFavorite(req.session.user.id, req.params.productId);
  res.json({ ok: true });
});

app.post('/unfavorite/:productId', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: '请先登录' });
  db.removeFavorite(req.session.user.id, req.params.productId);
  res.json({ ok: true });
});

app.get('/favorites', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const favorites = db.getFavorites(req.session.user.id);
  res.render('favorites', { favorites });
});

// Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const stats = db.getUserStats(req.session.user.id);
  res.render('dashboard', { stats });
});

// Seller info (AJAX)
app.get('/api/seller/:productId', (req, res) => {
  const product = db.getProduct(req.params.productId);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json({ seller_name: product.seller_name, seller_phone: product.seller_phone });
});

app.listen(PORT, () => {
  console.log(`校园二手交易平台: http://localhost:${PORT}`);
});
