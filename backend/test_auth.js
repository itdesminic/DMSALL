// Quick test script to call register and login endpoints (uses global fetch)

async function run() {
  const base = 'http://localhost:4000/api/auth';
  const user = { name: 'Test User', email: 'test@empresa.local', password: 'Test123*' };
  try {
    const r1 = await fetch(base + '/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
    const j1 = await r1.json();
    console.log('REGISTER:', j1);
  } catch (e) {
    console.error('Register error', e);
  }
  try {
    const r2 = await fetch(base + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, password: user.password }) });
    const j2 = await r2.json();
    console.log('LOGIN:', j2);
  } catch (e) {
    console.error('Login error', e);
  }
}

run();
