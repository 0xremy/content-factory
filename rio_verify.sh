#!/bin/bash
echo "--- GIT VERIFICATION ---"
cd /home/profesor/.openclaw/workspace/profesui
git log -1 --pretty=format:"%s" || echo "No commits found"
git remote -v

echo "--- VERCEL VERIFICATION ---"
# Check if .vercel directory exists and has a projectId
if [ -d "/home/profesor/.openclaw/workspace/profesui/frontend/.vercel" ]; then
  echo "Vercel project config exists."
else
  echo "Vercel project config missing."
fi

echo "--- BACKEND VERIFICATION ---"
RENDER_TOKEN="rnd_mbNzOkinJPi4ftLu7eYlj0BDuT7W"
curl -s -H "Authorization: Bearer $RENDER_TOKEN" https://api.render.com/v1/services | grep -i "profesui" || echo "No PROFESUI service found in Render API."
