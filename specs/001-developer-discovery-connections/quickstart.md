# Quickstart: Local Application Launch

This guide covers starting the existing service only. It intentionally contains no unit or
end-to-end test commands or endpoint-exercise scenarios, in accordance with the project
constitution and the selected testing-policy resolution.

## Prerequisites

- Node.js runtime supported by the deployment environment. The root `package.json` currently
  does not specify `engines.node`.
- A reachable MongoDB instance.
- Environment variables configured locally:
  - `MONGODB_URI` — MongoDB connection string.
  - `JWT_SECRET` — secret used to sign authentication tokens.
  - `PORT` — optional; defaults to `3000`.
  - `FRONTEND_URL` — optional allowed frontend origin(s); defaults to
    `http://localhost:5173`.

Do not commit environment secrets.

## Start the service

```sh
npm install
npm start
```

For local development with automatic restarts:

```sh
npm run dev
```

## Expected startup

When configuration and the database connection are valid, the service logs that the database is
connected and that the HTTP server is listening on the configured port.

This guide does not claim to verify the feature flows or the 1,000-member capacity criterion.
Those are outside a startup guide and no end-to-end validation is planned.
