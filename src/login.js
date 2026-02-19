const form = document.getElementById('loginForm');
const errorEl = document.getElementById('loginError');
const btn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  errorEl.textContent = '';

  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const detail = data.code || data.message;
      const base = data.error || 'Login failed.';
      throw new Error(detail ? `${base} (${detail})` : base);
    }

    window.location.href = '/';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
    btn.disabled = false;
    btn.textContent = 'SIGN IN';
  }
});
