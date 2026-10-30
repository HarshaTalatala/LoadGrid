# LoadGrid

LoadGrid is a transport operations platform for managing loads, bids, bookings, and fleet inventory.

This workspace contains a Spring Boot API and a React/Vite frontend. The frontend defaults to the Vite development proxy, so local browser requests use the backend at `http://localhost:8080` without hardcoded production URLs.

## Prerequisites

- Java 25 LTS
- Maven 3.9+ or the included Maven wrapper
- Node.js 18+ and npm
- PostgreSQL 14+ for live integration

## Configure PostgreSQL

Create a database and user, then export the variables from [`.env.example`](./.env.example):

```sql
CREATE DATABASE transport_management_system;
CREATE USER tms_user WITH PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE transport_management_system TO tms_user;
```

The backend reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `CORS_ALLOWED_ORIGINS`. Never put real credentials in source control.

## Start locally

```powershell
cd Backend
.\mvnw.cmd spring-boot:run
```

If PostgreSQL is not configured yet, use the disposable local H2 profile to run the full UI/API flow:

```powershell
cd Backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

The local profile is in-memory and resets when the backend stops; use PostgreSQL for persistent data.

In another terminal:

```powershell
cd Frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Swagger is at `http://localhost:8080/swagger-ui/index.html`; OpenAPI is at `http://localhost:8080/v1/api-docs`.

## Validate

```powershell
cd Backend
.\mvnw.cmd test
.\mvnw.cmd package

cd ..\Frontend
npm run build
```

Demo mode is opt-in only (`VITE_DEMO_MODE=true`) and must not be used to represent a production integration.

## Deploy to Render with Docker

The frontend is deployed separately on Vercel. Render only needs to run the Spring Boot backend using Docker. The repository includes a backend Dockerfile and a [`render.yaml`](./render.yaml) Blueprint:

1. Create a Render PostgreSQL database and copy its internal JDBC connection details.
2. In Render, choose **New > Blueprint** and connect this repository.
3. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` on `loadgrid-api` from the Render PostgreSQL database.
4. Set `CORS_ALLOWED_ORIGINS` to the exact Vercel frontend URL, for example `https://your-app.vercel.app`.
5. Deploy the backend and copy its public HTTPS URL.
6. In Vercel, set `VITE_API_BASE_URL` to the Render backend URL, then redeploy the frontend.

The backend Dockerfile uses Java 25, matching `pom.xml`, and listens on Render's `PORT` environment variable. The current API has no authentication or authorization and exposes write operations; add access controls before public deployment.

## Neon database

The repository is linked to the Neon `production` branch through [`neon.ts`](./neon.ts). After authenticating with the Neon CLI, run:

```powershell
neon deploy
```

This pulls `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `NEON_BRANCH` into the ignored `.env.local` file. The backend Docker image uses the pooled `DATABASE_URL` automatically when `DB_URL` is not set. On Render, set `DATABASE_URL` to the Neon pooled connection string, or set `DB_URL` explicitly if using another PostgreSQL provider.

For Vercel, keep the frontend configured with `VITE_API_BASE_URL` pointing to the Render backend. The frontend does not connect directly to Neon.
