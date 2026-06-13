# Data Model: Operational Observability

**Feature**: `007-operational-observability`
**Created**: 2026-06-12
**Status**: Done

## Entities and Operational Contracts

### Health Status

Public domain payload returned by `GET /api/health`.

**Fields**:

- `status`: `ok` when the database is connected; `degraded` otherwise.
- `database`: `up` when the database is connected; `down` otherwise.
- `timestamp`: ISO timestamp generated at response time.

**Final HTTP envelope**:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "up",
    "timestamp": "2026-06-12T00:00:00.000Z"
  }
}
```

### Database Connection State

Runtime Mongoose connection readiness used by the health controller.

**Rules**:

- Ready state connected maps to `status: "ok"` and `database: "up"`.
- Any non-connected state maps to `status: "degraded"` and `database: "down"`.

### Deployment Workflow

GitHub Actions workflow that deploys the API.

**Triggers**:

- Push to `master`.
- Manual workflow dispatch.

**Required repository variables**:

- `API_DEPLOY_BASE_DIR`
- `API_ENV_FILE`
- `API_PM2_APP_NAME`

### Deployment Runtime

Single active deployed API version on the VPS.

**Directory structure**:

```text
API_DEPLOY_BASE_DIR/
├── current/
└── logs/
```

**Runtime rules**:

- Source sync target is `current/`.
- Runtime environment file is copied to `current/.env`.
- PM2 process name comes from `API_PM2_APP_NAME`.
- Logs are written under `logs/`.
- No previous-version backup directory is part of this model.

### Public Health Validation

Hosted-runner post-deploy check.

**URL**:

```text
https://organizandotudo.api.thaleslj.com/api/health
```

**Rule**:

- Response must include `"status":"ok"`.

## Relationships

- Health Status derives from Database Connection State.
- Deployment Workflow creates or updates Deployment Runtime.
- Deployment Workflow starts the API through PM2.
- Public Health Validation depends on Deployment Runtime being reachable through the public URL.

## Validation Rules

- Missing required repository variables fail deployment.
- Missing configured API environment file fails deployment.
- Missing `PORT` in deployed `.env` fails deployment.
- Missing PM2 on the runner host fails deployment.
- Missing supported compiled entrypoint fails deployment.
- Missing PM2 process after startup fails deployment.
- Public health response without `"status":"ok"` fails validation.
