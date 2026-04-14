const { execSync } = require('child_process');

try {
  console.log('Installing dependencies...');
  execSync('npm install', { cwd: './profesui/frontend', stdio: 'inherit' });
  console.log('Building project...');
  execSync('npm run build', { cwd: './profesui/frontend', stdio: 'inherit' });
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
