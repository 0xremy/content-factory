const https = require('https');

const options = {
  hostname: 'api.render.com',
  path: '/v1/owners', // Guessing the endpoint
  method: 'GET',
  headers: {
    'Authorization': 'Bearer rnd_mbNzOkinJPi4ftLu7eYlj0BDuT7W'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error(e));
req.end();
