const form = document.getElementById('signupForm');
const errorEl = document.getElementById('signupError');
const btn = document.getElementById('signupBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  errorEl.textContent = '';

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.hidden = false;
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: document.getElementById('userId').value.trim(),
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password,
      }),
    });

    let data = {};
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      const detail = data?.code || data?.message;
      const base = data?.error || 'Registration failed.';
      if (res.status === 401 && !detail) {
        throw new Error('Access blocked. Disable Deployment Protection in Vercel Settings → Deployment Protection.');
      }
      const full = detail ? `${base} — ${detail}` : base;
      throw new Error(full);
    }

    window.location.href = '/login.html';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
});
