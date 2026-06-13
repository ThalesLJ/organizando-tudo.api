# Research: Operational Observability

**Feature**: `007-operational-observability`
**Created**: 2026-06-12
**Status**: Done

## Purpose

Document the ambiguity review and decisions for the retroactive Operational Observability specification.

## Resolved Questions

### Decision: Keep health check public and lightweight

**Resolution**: `GET /api/health` is unauthenticated and reports only API/database availability and timestamp.

**Rationale**: The endpoint is used by public post-deploy validation and must not require a token or expose sensitive internals.

### Decision: Use database connection state as health signal

**Resolution**: The health endpoint reports `ok/up` when the database connection is ready and `degraded/down` otherwise.

**Rationale**: The current API depends on MongoDB for its core behavior, and connection readiness is the implemented operational signal.

### Decision: Preserve single-version PM2 deployment

**Resolution**: Deployment syncs source to `current/`, removes the previous PM2 process with the configured app name, starts the new process, and saves PM2 state.

**Rationale**: The implemented workflow keeps exactly one active API version instead of managing release directories or backups.

### Decision: Validate health from outside the VPS

**Resolution**: A hosted GitHub runner calls the public health URL after the self-hosted deployment job succeeds.

**Rationale**: Validating from outside the VPS confirms that public proxying and the deployed API are reachable externally.

### Decision: Keep deployment configuration in repository variables and shared environment file

**Resolution**: The workflow requires `API_DEPLOY_BASE_DIR`, `API_ENV_FILE`, and `API_PM2_APP_NAME`, and copies the shared API environment file into the deployed runtime directory.

**Rationale**: Deployment paths and PM2 app names are operational configuration, while runtime secrets remain outside repository source.

## Constitutional Alignment

- Health checks remain safe and lightweight.
- Required operational values are documented without exposing secret values.
- Deployment validation is CI/developer responsibility, not local AI-agent command execution.
- No automated test tasks or repository validation commands are introduced into task artifacts.

## Outcome

No unresolved ambiguity remains for this retroactive specification.
