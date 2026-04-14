#!/bin/bash
set -e
cd /home/profesor/.openclaw/workspace/profesui
git remote set-url origin https://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@github.com/0xremy/content-factory.git
git add .
git commit -m 'feat: Final Production Launch of PROFESUI - Secure Auth & Rebranding' || echo "No changes to commit"
git push origin main || git push origin master
echo "PUSH_SUCCESSFUL"
