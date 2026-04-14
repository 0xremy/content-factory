const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function downloadPackage(packageName, destination) {
  console.log(`Downloading ${packageName}...`);
  const url = `https://registry.npmjs.org/${packageName}/latest`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const json = JSON.parse(data);
        const tarballUrl = json.dist.tarball;
        
        https.get(tarballUrl, (resTar) => {
          const filePath = path.join(destination, `${packageName}.tgz`);
          const file = fs.createWriteStream(filePath);
          resTar.pipe(file);
          file.on('finish', () => {
            console.log(`Downloaded tarball to ${filePath}`);
            resolve(filePath);
          });
        }).on('error', reject);
      });
    }).on('error', reject);
  });
}

async function run() {
  const dest = '/tmp/npm_packages';
  if (!fs.existsSync(dest)) fs.mkdirSync(dest);
  
  try {
    await downloadPackage('mongodb', dest);
    console.log('Package downloaded. Now we would need to untar it.');
    // I can't use 'tar' command, so I'd need a JS untar library...
  } catch (e) {
    console.error(e);
  }
}

run();
