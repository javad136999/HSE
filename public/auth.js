window.AUTH = {
  role: () => sessionStorage.getItem('role'),
  logout() { sessionStorage.removeItem('tk'); sessionStorage.removeItem('role'); location.reload(); },
  login(msg) {
    return new Promise(done => {
      const o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#071a2bee;display:grid;place-items:center;font-family:Vazirmatn,Tahoma,sans-serif';
      o.innerHTML = `<form style="background:#0d2a43;border:1px solid #1c4466;border-top:4px solid #ff7a1a;border-radius:16px;padding:20px;width:min(320px,90vw);color:#e8f1f8;display:grid;gap:10px">
        <b>ورود به سامانه</b><small id="m" style="color:#ffb347">${msg || ''}</small>
        <input id="u" placeholder="نام کاربری" autocomplete="username" style="padding:10px;border-radius:8px;border:1px solid #1c4466;background:#0a2236;color:#fff">
        <input id="p" type="password" placeholder="رمز عبور" autocomplete="current-password" style="padding:10px;border-radius:8px;border:1px solid #1c4466;background:#0a2236;color:#fff">
        <button style="padding:10px;border:0;border-radius:8px;background:#ff7a1a;color:#fff;font-weight:700;font-family:inherit">ورود</button></form>`;
      document.body.appendChild(o);
      o.querySelector('form').onsubmit = async e => {
        e.preventDefault();
        const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: o.querySelector('#u').value, password: o.querySelector('#p').value }) });
        if (!r.ok) { o.querySelector('#m').textContent = 'نام کاربری یا رمز اشتباه است'; return; }
        const d = await r.json(); sessionStorage.setItem('tk', d.token); sessionStorage.setItem('role', d.role); o.remove(); done();
      };
    });
  },
  async ensure(role) {
    while (!sessionStorage.getItem('tk') || (role && AUTH.role() !== role)) {
      sessionStorage.removeItem('tk');
      await AUTH.login(role ? 'برای این بخش ورود با حساب ادمین لازم است' : '');
    }
  },
  async api(path, opt = {}) {
    for (;;) {
      await AUTH.ensure();
      const r = await fetch(path, { ...opt, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sessionStorage.getItem('tk'), ...(opt.headers || {}) } });
      if (r.status === 401) { sessionStorage.removeItem('tk'); continue; }
      return r;
    }
  }
};
