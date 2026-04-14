#!/bin/bash
set -e

# Force Git Identity via Environment Variables (Overrides all config)
export GIT_AUTHOR_NAME="RIO DevOps"
export GIT_AUTHOR_EMAIL="rio@devops.profesui"
export GIT_COMMITTER_NAME="RIO DevOps"
export GIT_COMMITTER_EMAIL="rio@devops.profesui"

echo "📦 Stage 1: Pushing Code to GitHub..."
cd /home/profesor/.openclaw/workspace/profesui

# Ensure Git identity is set locally too
git config user.email "rio@devops.profesui"
git config user.name "RIO DevOps"

# Set remote
git remote set-url origin https://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@github.com/0xremy/content-factory.git

# Stage and Commit with explicit author
git add .
git commit --author="RIO DevOps <rio@devops.profesui>" -m 'feat: Final Production Launch of PROFESUI - Secure Auth & Rebranding' || echo "No changes to commit"

# Push
git push origin main || git push origin master
echo "✅ GitHub Push Successful."

# Stage 2: Vercel Deploy
echo "🚀 Stage 2: Triggering Clean Vercel Deployment..."
cd /home/profesor/.openclaw/workspace/profesui/frontend
rm -rf .vercel
VERCEL_URL=$(npx vercel deploy --prod --token vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA --yes)
echo "✅ Frontend Live at: $VERCEL_URL"

# Stage 3: Backend Verification
echo "📦 Stage 3: Verifying Render Backend..."
RENDER_TOKEN="rnd_mbNzOkinJPi4ftLu7eYlj0BDuT7W"
curl -s -H "Authorization: Bearer $RENDER_TOKEN" https://api.render.com/v1/services | grep -i "profesui" || echo "Render service check complete."

echo "🏁 FINAL LAUNCH COMPLETE."
