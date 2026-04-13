#!/bin/bash
set -e
export VERCEL_TOKEN="vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA"
cd /home/profesor/.openclaw/workspace/profesui/frontend
echo "🚀 RIO: Forcing a clean, definitive deployment..."
# Remove .vercel folder to clear cached project settings if they are causing issues
rm -rf .vercel
npx vercel deploy --prod --token $VERCEL_TOKEN --yes
echo "✅ Deployment command executed."
