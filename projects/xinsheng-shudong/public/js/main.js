// Dark mode toggle
function toggleTheme() {
  const root = document.documentElement;
  const body = document.body;
  const btn = document.querySelector('.theme-toggle');
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  btn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load saved theme
(function() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = '☀️';
  }
})();

// Mood selector
document.querySelectorAll('.mood-option').forEach(opt => {
  opt.addEventListener('click', function() {
    document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('active'));
    this.classList.add('active');
    this.querySelector('input').checked = true;
  });
});

// Character counter
const textarea = document.querySelector('textarea[name="content"]');
const charCount = document.getElementById('charCount');
if (textarea && charCount) {
  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length;
  });
}

// Like button
function likePost(postId, btn) {
  fetch('/like/' + postId, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      btn.classList.add('liked');
      btn.querySelector('.like-count').textContent = data.likes;
      btn.innerHTML = '❤️ <span class="like-count">' + data.likes + '</span>';
    });
}

// Auto-resize textarea
if (textarea) {
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 240) + 'px';
  });
}
