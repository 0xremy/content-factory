const { execSync } = require('child_process');

try {
  const output = execSync('cd /home/profesor/.openclaw/workspace/x-cms/backend && git remote -v').toString();
  console.log(output);
} catch (e) {
  console.error('Error:', e.message);
}
