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
  fetch(`/like/${postId}`, { method: 'POST' })
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
