const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA';
const FRONTEND_DIR = '/home/profesor/.openclaw/workspace/x-cms/frontend';

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
          resolve({ status: res.statusCode, data });
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
    
    const projects = await request('https://api.vercel.com/v13/projects');
    let project = projects.data.projects.find(p => p.name === 'x-cms-frontend');
    
    if (!project) {
      console.log('Creating project...');
      const newProject = await request('https://api.vercel.com/v13/projects', {
        method: 'POST',
        body: { name: 'x-cms-frontend' }
      });
      project = newProject.data;
    }
    
    console.log(`Using project ${project.id}`);
    
    // To deploy without Git, we should use the /v13/deployments endpoint with 'files'
    // But the API is tricky. Let's try the simple approach again with just 'file' and 'content'
    // and see if we can find the right keys.
    // According to some docs, it should be an array of { file: '...', content: '...' }
    // But we got an error. Let's try using a different structure or a different API.
    
    const files = [];
    const walk = (dir) => {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (file === 'node_modules') return;
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
  } catch (e) {
    console.error('Deployment failed:', e);
  }
}

deploy();
