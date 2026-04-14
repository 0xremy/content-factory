const fs = require('fs');
const path = require('path');

function findEnvFiles(dir) {
  const results = [];
  const walk = (currentDir) => {
    try {
      const files = fs.readdirSync(currentDir);
      files.forEach(file => {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (file !== 'node_modules' && file !== '.git') {
            walk(fullPath);
          }
        } else if (file.startsWith('.env')) {
          results.push(fullPath);
        }
      });
    } catch (e) {}
  };
  walk(dir);
  return results;
}

const envFiles = findEnvFiles('/home/profesor/.openclaw/workspace/x-cms');
envFiles.forEach(file => {
  console.log(`--- ${file} ---`);
  console.log(fs.readFileSync(file, 'utf8'));
});
