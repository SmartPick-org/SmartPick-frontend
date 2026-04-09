# CORS Fix Record (ngrok Workaround)

## Problem
When calling the ngrok backend API from the Vercel-deployed frontend, a CORS error occurred. 
- **Error**: `Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present.`
- **Reason**: ngrok's free plan displays a "browser warning" page for first-time visitors. This page intercepts the browser's `OPTIONS` preflight request, providing an HTML response without CORS headers, which causes the browser to block the subsequent `POST` request.

## Workaround (Applied)
Added a specific header to all frontend API requests to bypass the ngrok warning page.

- **Header**: `ngrok-skip-browser-warning: "69420"`
- **Affected Files**: `src/state/apiService.ts`
- **Date**: 2026-04-09

## Restoration Guide (Post-ngrok)
When moving to a production environment (AWS, GCP, etc.):
1. **Frontend**: Remove the `ngrok-skip-browser-warning` header from all `fetch` calls in `src/state/apiService.ts`.
2. **Backend**: Update `allow_origins` to specifically permit the Vercel production domain (e.g., `https://smart-pick...vercel.app`) instead of using a wildcard (*).
