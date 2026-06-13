# Organizando Tudo API

Organizando Tudo API is the NestJS backend for Organizando Tudo. It is responsible for authentication, authorization, session validation, user data, encrypted notes, financial records, transactional emails, MongoDB persistence, and the public API consumed by the Next.js Backend for Frontend.

The project was developed using Specification-Driven Development (SDD). More information about the adopted SDD workflow and Microsoft Spec Kit usage is available in [`AGENTS.md`](./AGENTS.md).

## Features

- Authentication flow with account creation, login, logout, password recovery, JWT generation, and single active session control.
- Bearer JWT authentication backed by persisted session validation on every protected request.
- Password, recovery code, and session token hashing before persistence.
- User profile endpoints for authenticated account data, username/email updates, language preferences, and interface color preferences.
- Private notes with encrypted `title` and `content` fields at rest.
- Public note viewing for notes explicitly marked as public.
- Financial management for budgets and expenses with create, update, list, get, and delete operations.
- Centralized DTO validation with strict whitelisting and rejection of unknown request properties.
- Standard response envelope and centralized HTTP exception formatting.
- SMTP-based transactional emails for password recovery and account update notifications.
- MongoDB-backed secret loading for SMTP credentials.
- Health check endpoint for deployment validation.
- Automated deployment workflow using GitHub Actions, a self-hosted Linux runner, and PM2.

## Tech Stack

- [NestJS](https://nestjs.com/) 11
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- [Passport](https://www.passportjs.org/) and `passport-jwt`
- [@nestjs/jwt](https://docs.nestjs.com/security/authentication)
- [class-validator](https://github.com/typestack/class-validator) and [class-transformer](https://github.com/typestack/class-transformer)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for hashing
- Node.js `crypto` for note encryption
- [Nodemailer](https://nodemailer.com/) for SMTP email delivery
- ESLint and Prettier

## Architecture

This application is the backend source of truth for business rules, validation, authentication, session control, infrastructure integrations, and data persistence.

Expected data flow:

```text
HTTP request -> Controller -> DTO validation -> Guard/decorator -> Service -> Mongoose/Infrastructure -> Response mapping -> Global response envelope
```

The API layer is responsible for:

- Validating request payloads with DTOs and global validation pipes.
- Signing JWT tokens and validating Bearer tokens.
- Validating persisted sessions in MongoDB.
- Enforcing ownership checks for user-owned data.
- Hashing passwords, recovery codes, and session tokens.
- Encrypting note content before persistence.
- Loading SMTP credentials from MongoDB through an isolated secrets service.
- Returning normalized responses and safe error payloads.

Global runtime behavior is configured in `src/main.ts`:

- API prefix: `/api`
- Global `ValidationPipe` with `transform`, `whitelist`, and `forbidNonWhitelisted`
- Global HTTP exception filter
- Global response interceptor

## Project Structure

TODO: This section will be completed when the project structure reaches its final level.

## Environment Variables

Create a local `.env` file based on [`.env.example`](./.env.example).

```env
PORT=3000
MONGO_URI=""
JWT_SECRET=""
JWT_ISSUER=""
ENCRYPTION_KEY=""
```

Variables:

- `PORT`: port used by the API when running locally or under PM2.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: secret used to sign and validate JWT tokens.
- `JWT_ISSUER`: issuer required when signing and validating JWT tokens.
- `ENCRYPTION_KEY`: secret used to data encryption.

The application validates required environment variables during bootstrap and fails immediately when any required value is missing or invalid.

SMTP credentials are not read from `.env`. They are loaded from MongoDB by the secrets infrastructure and must include:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run start:dev
```

The API listens on the port defined by `PORT`. With the default example value, the health endpoint is available at [`http://localhost:3000/api/health`](http://localhost:3000/api/health).

## Available Scripts

```bash
npm run start
```

Starts the NestJS application.

```bash
npm run start:dev
```

Starts the NestJS application in watch mode.

```bash
npm run start:debug
```

Starts the NestJS application in debug watch mode.

```bash
npm run build
```

Builds the production application into `dist/`.

```bash
npm run start:prod
```

Starts the compiled production application from `dist/main`.

```bash
npm run lint
```

Runs ESLint for `src` and `test`.

```bash
npm run format
```

Formats TypeScript files in `src` and `test` with Prettier.

The repository also contains Jest scripts in `package.json`, but the project does not currently define an automated test suite as a delivery gate.

## Deployment

The repository includes a GitHub Actions workflow for deploying one active API version at a time. The workflow is defined in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

Deployment runs automatically on pushes to `master` and can also be started manually through `workflow_dispatch`. The first job, `deploy-api`, runs on the configured self-hosted Linux runner using Bash. It validates the required repository variables, checks that `pm2` is available on the runner host, prepares the deployment directories, synchronizes the repository into the active `current` directory, copies the configured environment file to `.env`, installs dependencies, builds the NestJS application, detects the compiled entrypoint, and restarts the PM2 process.

The deployment directory is always treated as a single active version:

```text
API_DEPLOY_BASE_DIR/
├── current/
└── logs/
```

During synchronization, the workflow excludes `.git`, `.github`, `node_modules`, and `dist`. This keeps deployment output focused on the runtime application while allowing the runner to recreate dependencies and build artifacts on the server.

After copying the environment file, the workflow reads `PORT` from `.env`. That port is then used to start the compiled API with PM2:

```bash
PORT="$api_port" pm2 start "$entrypoint" --name "$API_PM2_APP_NAME" --time --output "$log_file" --error "$log_file"
```

The workflow checks for `dist/main.js` first and falls back to `dist/src/main.js` when necessary. Before starting the new process, the workflow deletes any existing PM2 process with the same application name. It then runs `pm2 save` and verifies that PM2 can describe the process. Logs are written to `API_DEPLOY_BASE_DIR/logs/<API_PM2_APP_NAME>.log`.

After the self-hosted deployment job completes, a second GitHub-hosted job named `validate-api-public-health` runs on `ubuntu-latest`. This job calls the public health endpoint from outside the VPS and fails the workflow if the response does not include `"status":"ok"`.

Validated public health endpoint:

```text
https://organizandotudo.api.thaleslj.com/api/health
```

Expected health response shape:

```json
{
  "status": "ok",
  "database": "up",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Required repository variables:

- `API_DEPLOY_BASE_DIR`
- `API_ENV_FILE`
- `API_PM2_APP_NAME`

Recommended PM2 application name:

```text
API_PM2_APP_NAME=organizandotudo-api
```

The VPS runner must have Node.js 22, `pm2`, `rsync`, `curl`, and `bash` available. The external environment file referenced by `API_ENV_FILE` must exist and include `PORT`. Apache, or the active reverse proxy, should route public traffic to that same port.