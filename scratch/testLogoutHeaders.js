const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/logout',
  method: 'POST',
  headers: {
    'Cookie': 'sb-bdjitfwxtylhkqrqevyh-auth-token=some-fake-token; other-cookie=val'
  }
}, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:');
  console.log(JSON.stringify(res.headers, null, 2));
  
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Body: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
