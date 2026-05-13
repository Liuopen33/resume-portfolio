const express = require('express');
const session = require('express-session');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const aiEngine = require('./ai-engine');

const app = express();
const PORT = 3001;

// In-memory storage
const posts = [];
const replies = [];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'shudong_secret_2025',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Ensure every visitor has a session ID
app.use((req, res, next) => {
  if (!req.session.userId) {
    req.session.userId = 'anonymous_' + uuidv4().slice(0, 8);
  }
  res.locals.userId = req.session.userId;
  next();
});

// Home - show the tree hole wall
app.get('/', (req, res) => {
  const mood = req.query.mood || 'all';
  const search = req.query.search || '';
  let filtered = [...posts].reverse();

  if (mood !== 'all') {
    filtered = filtered.filter(p => p.mood === mood);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => p.content.toLowerCase().includes(s) || p.nickname.toLowerCase().includes(s));
  }
  res.render('index', { posts: filtered, mood, search, moods: aiEngine.moods, replies });
});

// Emotion trends (ECharts data)
app.get('/api/trends', (req, res) => {
  const counts = {};
  aiEngine.moods.forEach(m => { counts[m.key] = 0; });
  posts.forEach(p => {
    if (counts[p.mood] !== undefined) counts[p.mood]++;
    else counts[p.mood] = 1;
  });
  const data = aiEngine.moods
    .filter(m => m.key !== 'other')
    .map(m => ({ name: m.label, value: counts[m.key] || 0, icon: m.icon }));
  res.json(data);
});

// Weekly trend
app.get('/api/weekly', (req, res) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = posts.filter(p => p.createdAt.startsWith(dateStr)).length;
    days.push({ date: dateStr.slice(5), count });
  }
  res.json(days);
});

// About page
app.get('/about', (req, res) => {
  res.render('about', { moods: aiEngine.moods, totalPosts: posts.length });
});

// Submit a confession / feeling
app.post('/post', (req, res) => {
  const { content, mood, nickname } = req.body;
  if (!content || content.trim().length === 0) return res.redirect('/');

  const aiResponse = aiEngine.respond(content);

  const post = {
    id: uuidv4().slice(0, 12),
    content: content.trim(),
    mood: mood || 'other',
    nickname: nickname || '匿名树友',
    userId: req.session.userId,
    aiReply: aiResponse,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  posts.push(post);
  res.redirect('/');
});

// Like a post
app.post('/like/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (post) { post.likes++; }
  res.json({ likes: post ? post.likes : 0 });
});

// Reply to a post (from users)
app.post('/reply/:postId', (req, res) => {
  const { content } = req.body;
  if (!content || content.trim().length === 0) return res.redirect('/');

  replies.push({
    id: uuidv4().slice(0, 8),
    postId: req.params.postId,
    content: content.trim(),
    nickname: '匿名树友',
    createdAt: new Date().toISOString(),
  });
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`心声树洞已启动: http://localhost:${PORT}`);

  // Seed some initial posts
  if (posts.length === 0) {
    const seeds = [
      { content: '今天考试没考好，心情很低落，觉得自己好笨。', mood: 'sad', nickname: '迷茫的少年' },
      { content: '刚刚拿到了实习offer！努力了一个月终于有回报了！', mood: 'happy', nickname: '开心的橘子' },
      { content: '和最好的朋友吵架了，不知道该怎么和好。', mood: 'worried', nickname: '孤独的鲸鱼' },
      { content: '深夜图书馆回来，抬头看到满天星星，突然觉得一切都值得。', mood: 'calm', nickname: '夜归人' },
    ];
    seeds.forEach(s => {
      posts.push({
        id: uuidv4().slice(0, 12),
        content: s.content,
        mood: s.mood,
        nickname: s.nickname,
        userId: 'seed',
        aiReply: aiEngine.respond(s.content),
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        likes: Math.floor(Math.random() * 10),
      });
    });
  }
});
