const express = require('express');
const db = require('../db');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

router.get('/publish', requireAuth, (req, res) => res.render('publish', { error: null }));

router.post('/publish', requireAuth, (req, res) => {
  const { title, category, description, price, condition } = req.body;
  if (!title || !category || !price) return res.render('publish', { error: '标题、分类和价格不能为空' });
  db.createProduct({ seller_id: req.session.user.id, title, category, description: description || '', price: parseFloat(price), condition: condition || '良好' });
  res.redirect('/');
});

router.get('/my', requireAuth, (req, res) => {
  res.render('my-products', { products: db.getProductsBySeller(req.session.user.id) });
});

router.post('/sold/:id', requireAuth, (req, res) => {
  db.updateProductStatus(req.params.id, req.session.user.id, 'sold');
  res.redirect('/products/my');
});

router.post('/delete/:id', requireAuth, (req, res) => {
  db.deleteProduct(req.params.id, req.session.user.id);
  res.redirect('/products/my');
});

module.exports = router;
