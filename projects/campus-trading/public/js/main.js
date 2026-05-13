// Toggle favorite
function toggleFav(event, productId, btn) {
  event.preventDefault();
  event.stopPropagation();

  const isFaved = btn.dataset.faved === 'true' || btn.textContent.includes('已收藏');
  const url = isFaved ? '/unfavorite/' + productId : '/favorite/' + productId;

  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    .then(r => r.json())
    .then(data => {
      if (data.error) { alert(data.error); return; }
      if (isFaved) {
        btn.dataset.faved = 'false';
        if (btn.classList.contains('fav-btn')) {
          btn.textContent = '🤍 收藏';
        } else {
          btn.textContent = '❤️';
        }
      } else {
        btn.dataset.faved = 'true';
        if (btn.classList.contains('fav-btn')) {
          btn.textContent = '❤️ 已收藏';
        } else {
          btn.textContent = '❤️';
        }
      }
    });
}

// Contact seller modal
function contactSeller(productId) {
  fetch('/api/seller/' + productId)
    .then(r => r.json())
    .then(data => {
      document.getElementById('contactInfo').innerHTML = `
        <p><strong>卖家：</strong>${data.seller_name}</p>
        <p><strong>电话：</strong>${data.seller_phone || '未填写'}</p>
        <p class="hint">建议先电话沟通价格和取货方式</p>
      `;
      document.getElementById('contactModal').style.display = 'flex';
    });
}

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('contactModal');
  if (modal && e.target === modal) {
    modal.style.display = 'none';
  }
});

// Init favorites on page load
document.querySelectorAll('.fav-btn').forEach(btn => {
  const id = btn.getAttribute('onclick').match(/\d+/);
});
