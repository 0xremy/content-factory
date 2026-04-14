const https = require('https');

const HOST = 'content-factory-68ch.onrender.com';
const PATH = '/api/posts';

const payload = {
  title: 'Test Post',
  content_en: 'Hello World',
  content_vi: 'Chào Thế Giới',
  status: 'draft'
};

function postRequest(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: HOST,
      path: PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

postRequest(payload)
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Error:', err.message));
