#!/bin/bash
exec > /home/profesor/.openclaw/workspace/profesui/launch.log 2>&1
set -x
set -e

VERCEL_TOKEN="vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA"
RENDER_TOKEN="rnd_mbNzOkinJPi4ftLu7eYlj0BDuT7W"
MONGO_URI="mongodb+srv://remy12558_db_user:7UymPwodnvryZ9vZ@content-factory.kozprjg.mongodb.net/?appName=content-factory"

echo "🚀 Starting PROFESUI Final Live Launch..."

echo "📦 Deploying Frontend to Vercel..."
cd /home/profesor/.openclaw/workspace/profesui/frontend
# Use npx to ensure vercel is available
VERCEL_URL=$(npx vercel deploy --prod --token $VERCEL_TOKEN --yes)
echo "Frontend URL: $VERCEL_URL"

echo "📦 Deploying Backend to Render..."
# We can't use the CLI because it's not installed. 
# We'll try to see if any service exists.
RENDER_SERVICES=$(curl -s -H "Authorization: Bearer $RENDER_TOKEN" https://api.render.com/v1/services)
echo "Render Services: $RENDER_SERVICES"

echo "🏁 Launch Sequence Attempted."
