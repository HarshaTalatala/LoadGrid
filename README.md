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

## Deployment and limitations

Build `Frontend/dist` and deploy it to a static host with `VITE_API_BASE_URL` set to the HTTPS API origin before building. Deploy the backend with `.\mvnw.cmd package` and provide PostgreSQL variables plus an HTTPS-aware `CORS_ALLOWED_ORIGINS`. The current API has no authentication or authorization and exposes write operations; add access controls before public deployment.
