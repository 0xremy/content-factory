const { execSync } = require('child_process');
try {
  const output = execSync('git -C /home/profesor/.openclaw/workspace/x-cms/frontend remote -v').toString();
  console.log(output);
} catch (e) {
  console.error('Error:', e.message);
}
