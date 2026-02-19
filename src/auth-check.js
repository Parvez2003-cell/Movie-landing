const gate = document.getElementById('authGate');
const avatar = document.getElementById('avatar');
const btnLogout = document.getElementById('btnLogout');

if (gate) {
  gate.style.display = 'flex';
  gate.textContent = 'Loading...';
  gate.style.cssText = 'display:flex;align-items:center;justify-content:center;position:fixed;inset:0;background:#141414;color:#fff;font-size:1.2rem;z-index:9999;';
}

(async function checkAuth() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    const data = await res.json();

    if (!data.loggedIn) {
      window.location.href = '/login.html';
      return;
    }

    if (avatar && data.name) {
      avatar.textContent = data.name.charAt(0).toUpperCase();
    }
    if (btnLogout) {
      btnLogout.style.display = 'inline-block';
      btnLogout.addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '/login.html';
      });
    }
  } catch {
    window.location.href = '/login.html';
    return;
  }

  if (gate) gate.style.display = 'none';
})();
