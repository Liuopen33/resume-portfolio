const express = require('express');
const db = require('../db');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
}

router.post('/create/:productId', requireAuth, (req, res) => {
  const product = db.getProduct(req.params.productId);
  if (!product || product.status !== 'active') return res.status(400).send('商品不可用');
  if (product.seller_id === req.session.user.id) return res.status(400).send('不能买自己的商品');

  db.createOrder({ product_id: product.id, buyer_id: req.session.user.id, seller_id: product.seller_id });
  db.updateProductStatus(product.id, product.seller_id, 'reserved');
  res.redirect('/orders/my');
});

router.get('/my', requireAuth, (req, res) => {
  res.render('my-orders', {
    buys: db.getBuyOrders(req.session.user.id),
    sells: db.getSellOrders(req.session.user.id)
  });
});

router.post('/status/:id', requireAuth, (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order || order.seller_id !== req.session.user.id) return res.status(403).send('无权操作');

  db.updateOrderStatus(req.params.id, req.body.status);
  if (req.body.status === 'completed') {
    db.updateProductStatus(order.product_id, order.seller_id, 'sold');
  }
  res.redirect('/orders/my');
});

module.exports = router;
