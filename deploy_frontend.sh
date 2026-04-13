#!/bin/bash
export VERCEL_TOKEN="vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA"
cd /home/profesor/.openclaw/workspace/profesui/frontend
echo "Starting Vercel deployment..."
npx vercel deploy --prod --token $VERCEL_TOKEN --yes
echo "Vercel deployment finished."
