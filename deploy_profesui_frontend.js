const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA';
const FRONTEND_DIR = '/home/profesor/.openclaw/workspace/profesui/frontend';

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      method: options.method || 'GET',
      ...options
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function deploy() {
  try {
    console.log('Connecting to Vercel...');
    
    // 1. Find or create project
    const projects = await request('https://api.vercel.com/v13/projects');
    let project = projects.data.projects.find(p => p.name === 'profesui-frontend');
    
    if (!project) {
      console.log('Creating project...');
      const newProject = await request('https://api.vercel.com/v13/projects', {
        method: 'POST',
        body: { name: 'profesui-frontend' }
      });
      project = newProject.data;
    }
    
    console.log(`Using project ${project.id}`);
    
    // 2. Deploy
    const files = [];
    const walk = (dir) => {
      fs.readdirSync(dir).forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === 'build') return;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else {
          const relativePath = path.relative(FRONTEND_DIR, fullPath);
          files.push({
            file: relativePath,
            content: fs.readFileSync(fullPath, 'utf8')
          });
        }
      });
    };
    
    walk(FRONTEND_DIR);
    
    console.log(`Uploading ${files.length} files...`);
    const deployment = await request('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      body: {
        projectId: project.id,
        files: files,
        projectSettings: {
          framework: 'create-react-app'
        }
      }
    });
    
    console.log('Deployment response:', JSON.stringify(deployment.data, null, 2));
    console.log('URL:', deployment.data.url);
  } catch (e) {
    console.error('Deployment failed:', e);
  }
}

deploy();
