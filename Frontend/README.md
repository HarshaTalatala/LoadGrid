# LoadGrid Frontend

A responsive React + TypeScript dashboard for the LoadGrid Spring Boot transport operations API.

## Features
- Logistics overview with load, bid, booking and transporter summaries
- Load list, status filtering, create-load form and best-bid ranking
- Bid list and reject action
- Booking lookup and cancellation
- Transporter lookup and truck-inventory editor
- API mode for the Spring Boot backend and demo mode for a public UI preview
- Responsive layout, loading/error states, and accessible form labels

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite app opens at `http://localhost:5173`. The backend should be running at `http://localhost:8080`.

## API configuration

Set `VITE_API_BASE_URL` to the backend origin. The frontend calls the routes documented by the current backend:
- `/load`, `/load/{id}`, `/load/{id}/cancel`, `/load/{id}/best-bids`
- `/bid`, `/bid/{id}`, `/bid/{id}/reject`
- `/booking`, `/booking/{id}`, `/booking/{id}/cancel`
- `/transporter`, `/transporter/{id}`, `/transporter/{id}/trucks`

If your backend exposes a global context path, include it in `VITE_API_BASE_URL`. If the browser blocks requests, configure CORS in Spring Boot for the frontend origin.

## Demo mode

For a hosted UI preview without a publicly accessible backend, set `VITE_DEMO_MODE=true` before building. Demo mode uses sample data in the browser and does not persist to the Spring Boot database. Do not describe demo mode as a live backend integration.

```bash
VITE_DEMO_MODE=true npm run build
```

## Deploy

Build with `npm run build` and deploy the generated `dist/` directory to Vercel, Netlify, Cloudflare Pages, or any static host. Set environment variables in the hosting dashboard before building.

## Important
This frontend does not add authentication. The backend currently has no authentication/authorization, so do not expose mutation endpoints publicly until backend access controls are added. API DTO fields are aligned to the analyzed backend model; confirm request field names against `/swagger-ui/index.html` before final production use.
