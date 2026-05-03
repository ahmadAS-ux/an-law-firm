---
description: Verify and deploy to staging
---

Run the full pre-deploy verification and push:

1. Run `npm run build` — must succeed with zero errors
2. Run `npm start` briefly — must boot without errors (CTRL+C after 5 seconds)
3. If both pass:
   - git add .
   - git commit with a clear message in format: vX.Y.Z — what changed
   - git push origin main
4. Output the deploy URL: https://an-law-firm.onrender.com
5. Remind me to wait 2-3 minutes for Render to redeploy
6. Save the session summary to LAST_SESSION.md

If any step fails, STOP — do not push. Tell me exactly what failed.