const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findGitRemotes(dir) {
  const results = [];
  const walk = (currentDir) => {
    try {
      const files = fs.readdirSync(currentDir);
      if (files.includes('.git')) {
        try {
          const remote = execSync('git -C ' + currentDir + ' remote -v').toString();
          results.push({ dir: currentDir, remote });
        } catch (e) {}
      }
      files.forEach(file => {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules' && file !== '.git') {
          walk(fullPath);
        }
      });
    } catch (e) {}
  };
  walk(dir);
  return results;
}

const remotes = findGitRemotes('/home/profesor/.openclaw/workspace');
console.log(JSON.stringify(remotes, null, 2));
