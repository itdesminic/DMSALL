const http = require('http');

function post(path, data) {
  const payload = JSON.stringify(data);
  const options = {
    hostname: 'localhost',
    port: 4000,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, body: body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    const user = { name: 'HTTP Test', email: 'http-test@empresa.local', password: 'Http123*' };
    const r1 = await post('/api/auth/register', user);
    console.log('REGISTER', r1.status, r1.body);
    const r2 = await post('/api/auth/login', { email: user.email, password: user.password });
    console.log('LOGIN', r2.status, r2.body);
  } catch (e) {
    console.error('Error', e);
  }
})();
