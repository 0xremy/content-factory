#!/bin/bash
cd /home/profesor/.openclaw/workspace/profesui
git add backend/.env
git commit -m 'fix: correct typo in DASHBOARD_PASSWORD env variable'
git remote set-url origin https://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@github.com/0xremy/content-factory.git
git push origin head:main || git push origin head:master
