# Qwik City App ⚡️ – Personal Notes

This is a Qwik + Qwik City frontend for a personal notes app themed with "Ocean Professional".

- Create, view, edit, and delete notes
- LocalStorage persistence by default
- Automatically switches to API if VITE_API_BASE or VITE_BACKEND_URL is defined and reachable
- Modern, responsive UI with blue/amber accents

## Environment variables

The app reads these (do not hardcode values in code):
- VITE_API_BASE
- VITE_BACKEND_URL
- VITE_FRONTEND_URL
- VITE_WS_URL
- VITE_NODE_ENV
- VITE_ENABLE_SOURCE_MAPS
- VITE_PORT
- VITE_TRUST_PROXY
- VITE_LOG_LEVEL
- VITE_HEALTHCHECK_PATH
- VITE_FEATURE_FLAGS
- VITE_EXPERIMENTS_ENABLED

If `VITE_API_BASE` or `VITE_BACKEND_URL` is set and the backend responds, the app will use the API; otherwise it falls back to in-browser LocalStorage.

## Run

- Development: `npm start` (port 3000)
- Preview (prod build locally): `npm run preview`

## Build

```bash
npm run build
```

## Accessibility

- Labeled inputs for title and content
- Keyboard accessible buttons and focus ring
