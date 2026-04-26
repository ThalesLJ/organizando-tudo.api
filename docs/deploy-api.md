# API Deploy Single Version

## Goal

Configure automatic API deployment on push to `master`, using GitHub Actions with a self-hosted Linux runner on the VPS and PM2 to manage a single active version at a time.

## Flow

1. The runner receives a push to the `master` branch.
2. The workflow syncs the code to `current`.
3. The workflow copies `.env` from the shared path.
4. The workflow installs dependencies and runs the build.
5. The workflow removes the previous PM2 process by application name.
6. The workflow automatically detects the compiled entrypoint in `dist/main.js` or `dist/src/main.js`.
7. The workflow starts the new version with PM2 on the port defined by `PORT` in `.env`.
8. A second GitHub job (`ubuntu-latest`) validates the public endpoint `https://organizandotudo.api.thaleslj.com/api/health`.

## Files

- Workflow: `.github/workflows/deploy.yml`

## External Health Check

Endpoint validated by GitHub outside the VPS:

- `https://organizandotudo.api.thaleslj.com/api/health`

Expected response for a valid deployment:

```json
{
  "status": "ok",
  "database": "up",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Required GitHub Variables (Repository Variables)

- `API_DEPLOY_BASE_DIR`
- `API_ENV_FILE`
- `API_PM2_APP_NAME`

Recommended values for this project:

- `API_PM2_APP_NAME=organizandotudo-api`

## VPS Prerequisites

- Self-hosted Linux runner active for the repository.
- Node.js 22 installed.
- `pm2`, `rsync`, `curl`, and `bash` installed for user `github-runner`.
- API environment file available at the path defined by `API_ENV_FILE`, with `PORT` set.
- Apache configured to proxy traffic to the port defined by `PORT` in the API `.env`.
- No `sudo` usage in the workflow.

## VPS Deploy Structure (Single Version)

Base directory defined by `API_DEPLOY_BASE_DIR`:

- `current/`
- `logs/`
- No backup of previous versions in this model.
