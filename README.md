# Society of Jesus — Vercel-ready build

This build keeps the original single-file application and fixes the fresh-deployment
problem where Vercel starts with an empty browser database.

## Deploy
1. Replace the repository's `index.html` with this one.
2. Commit and push to GitHub.
3. Vercel will redeploy automatically.

The application remains a static single-page app. Its editable admin data is still
stored in the browser's localStorage, while the initial production starter content
is now bundled into the page so a fresh deployment is not blank.

Important: browser localStorage is per-device/browser. If the original detailed
content only existed in an old browser's localStorage, it cannot be recovered from
GitHub/Vercel unless it was exported or copied into the site data.
