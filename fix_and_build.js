const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'profesui/frontend');

try {
  console.log('Removing node_modules and package-lock.json...');
  // Use recursive rm for node_modules
  execSync('rm -rf node_modules package-lock.json', { cwd: frontendPath, stdio: 'inherit' });
  
  console.log('Installing dependencies...');
  execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });
  
  console.log('Building project...');
  execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });
  
  console.log('Build successful!');
} catch (error) {
  console.error('Error occurred:', error.message);
  process.exit(1);
}
