const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

router.get('/register', (req, res) => res.render('register', { error: null }));

router.post('/register', (req, res) => {
  const { username, password, phone } = req.body;
  if (!username || !password) return res.render('register', { error: '用户名和密码不能为空' });
  if (password.length < 6) return res.render('register', { error: '密码至少6位' });
  if (db.findUser(username)) return res.render('register', { error: '用户名已存在' });

  const user = db.createUser({ username, password: bcrypt.hashSync(password, 10), phone: phone || '' });
  req.session.user = { id: user.id, username: user.username };
  res.redirect('/');
});

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.findUser(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('login', { error: '用户名或密码错误' });
  }
  req.session.user = { id: user.id, username: user.username };
  res.redirect('/');
});

router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

module.exports = router;
