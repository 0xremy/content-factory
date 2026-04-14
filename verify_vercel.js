const https = require('https');

const TOKEN = 'vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA';

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

async function check() {
  console.log('Checking Vercel projects...');
  const projects = await request('https://api.vercel.com/v13/projects');
  if (projects.data && projects.data.projects) {
    console.log('Projects found:', JSON.stringify(projects.data.projects, null, 2));
    
    const project = projects.data.projects.find(p => p.name.includes('x-cms'));
    if (project) {
      console.log(`Checking deployments for project ${project.id}...`);
      const deploys = await request(`https://api.vercel.com/v13/projects/${project.id}/deployments`);
      console.log('Deployments:', JSON.stringify(deploys.data, null, 2));
    }
  } else {
    console.log('No projects found or error:', projects.data);
  }
}

check();
