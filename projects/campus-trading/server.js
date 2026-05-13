const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = 3000;

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

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Home
app.get('/', (req, res) => {
  const products = db.getProducts({
    search: req.query.search || '',
    category: req.query.category || '',
    sort: req.query.sort || 'newest'
  });
  const categories = db.getCategories();
  res.render('index', {
    products, categories,
    search: req.query.search || '',
    category: req.query.category || '',
    sort: req.query.sort || 'newest'
  });
});

// Product detail
app.get('/product/:id', (req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).render('404');
  res.render('product', { product });
});

app.listen(PORT, () => {
  console.log(`校园二手交易平台: http://localhost:${PORT}`);
});
