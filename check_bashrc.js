const fs = require('fs');
try {
  const content = fs.readFileSync('/home/profesor/.bashrc', 'utf8');
  console.log(content.split('\n').filter(line => line.toLowerCase().includes('github')).join('\n'));
} catch (e) {
  console.error(e);
}
