#!/bin/bash
set -e
echo "🚀 RIO: Performing Clean Vercel Deployment..."
cd /home/profesor/.openclaw/workspace/profesui/frontend
rm -rf .vercel
VERCEL_URL=$(npx vercel deploy --prod --token vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA --yes)
echo "Frontend Production URL: $VERCEL_URL"

echo "📦 Checking Render Backend Status..."
RENDER_TOKEN="rnd_mbNzOkinJPi4ftLu7eYlj0BDuT7W"
RENDER_SERVICES=$(curl -s -H "Authorization: Bearer $RENDER_TOKEN" https://api.render.com/v1/services)
echo "Render Services Response: $RENDER_SERVICES"
