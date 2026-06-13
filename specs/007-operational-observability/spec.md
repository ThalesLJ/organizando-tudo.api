# Feature Specification: Operational Observability

**Feature Branch**: `[007-operational-observability]`

**Created**: 2026-06-12

**Status**: Done

**Input**: Retroactive specification generated from the implemented health module, deploy workflow, Domain Map, and `docs/deploy-api.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Check API and database availability publicly (Priority: P1)

Operators and deployment automation need a public lightweight health check that reports whether the API is alive and whether the database connection is available.

**Why this priority**: Public availability validation depends on a safe, simple endpoint that can be called outside the VPS and without authentication.

**Independent Test**: Can be validated by calling `GET /api/health` while the database is connected and while it is unavailable, then checking the returned status fields.

**Acceptance Scenarios**:

1. **Given** the database connection is ready, **When** `GET /api/health` is called, **Then** the domain payload reports `status: "ok"`, `database: "up"`, and an ISO timestamp.
2. **Given** the database connection is not ready, **When** `GET /api/health` is called, **Then** the domain payload reports `status: "degraded"`, `database: "down"`, and an ISO timestamp.
3. **Given** the global response interceptor is enabled, **When** the health endpoint succeeds, **Then** the final HTTP response also includes the standard `success: true` and `data` envelope.
4. **Given** a public caller accesses the health endpoint, **When** the response is returned, **Then** no secrets, environment values, database URI, stack traces, or deployment paths are exposed.

---

### User Story 2 - Deploy a single active API version (Priority: P1)

Operators need pushes to `master` and manual dispatches to publish one active API version on the VPS through a self-hosted Linux runner and PM2.

**Why this priority**: The API must have a repeatable release flow that replaces the previous process rather than leaving multiple active versions.

**Independent Test**: Can be validated manually by triggering the workflow, checking that the configured PM2 process exists once, and confirming the deployed API responds on the configured port through the public proxy.

**Acceptance Scenarios**:

1. **Given** the deploy workflow starts, **When** required repository variables are missing, **Then** the workflow fails before deploying the runtime application.
2. **Given** the configured shared API environment file is missing, **When** deployment starts, **Then** the workflow fails before starting PM2.
3. **Given** the self-hosted runner has the required prerequisites, **When** deployment runs, **Then** the workflow syncs the repository to the configured `current` directory, copies the shared `.env`, installs dependencies, builds the API, and detects the compiled entrypoint.
4. **Given** a previous PM2 process with the configured API name exists, **When** the new version starts, **Then** the previous process is removed first.
5. **Given** PM2 starts the new version, **When** startup completes, **Then** the workflow saves PM2 state and verifies the process can be described.

---

### User Story 3 - Validate public deployment health externally (Priority: P1)

Operators need the deployment pipeline to validate the public API health endpoint from outside the self-hosted VPS environment.

**Why this priority**: A successful local process start is not enough; the public URL must be reachable after deployment.

**Independent Test**: Can be validated by observing the post-deploy validation job that calls `https://organizandotudo.api.thaleslj.com/api/health` and fails when the response does not include an OK status.

**Acceptance Scenarios**:

1. **Given** the self-hosted deploy job succeeds, **When** the public validation job runs, **Then** it calls the public health URL from a hosted runner.
2. **Given** the public health response includes `"status":"ok"`, **When** validation completes, **Then** the workflow is considered successful.
3. **Given** the public health response is unavailable or does not include `"status":"ok"`, **When** validation completes, **Then** the workflow fails.

### Edge Cases

- The health endpoint is intentionally unauthenticated and must stay limited to safe availability information.
- The health check must remain low cost and must not perform expensive diagnostics.
- The health response reflects only the current database connection state and current timestamp.
- The deployment workflow must fail if `pm2` is missing on the runner host.
- The deployment workflow must fail if `PORT` cannot be read from the deployed `.env` file.
- The deployment workflow must fail if neither `dist/main.js` nor `dist/src/main.js` exists after build.
- The deployment model has only one active version under `current/` and does not keep backup release directories.
- The workflow intentionally excludes `.git`, `.github`, `node_modules`, and `dist` from the synchronized deploy source.
- The workflow uses no `sudo` commands and assumes the runner user already has the required permissions.
- Apache or equivalent public proxying is an operational prerequisite outside the API source code.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose public health checking at `GET /api/health`.
- **FR-002**: The health endpoint MUST return a domain payload containing `status`, `database`, and `timestamp`.
- **FR-003**: The health endpoint MUST return `status: "ok"` and `database: "up"` when the database connection is ready.
- **FR-004**: The health endpoint MUST return `status: "degraded"` and `database: "down"` when the database connection is not ready.
- **FR-005**: The health endpoint timestamp MUST be an ISO string representing the response generation time.
- **FR-006**: The health endpoint MUST NOT require authentication.
- **FR-007**: The health endpoint MUST NOT expose database URI, environment values, secrets, internal paths, stack traces, or credentials.
- **FR-008**: The health endpoint response MUST still pass through the global successful response envelope.
- **FR-009**: The deployment workflow MUST run on pushes to `master`.
- **FR-010**: The deployment workflow MUST support manual execution through workflow dispatch.
- **FR-011**: The deployment job MUST run on a self-hosted runner.
- **FR-012**: The deployment workflow MUST use Node.js 22.
- **FR-013**: The deployment workflow MUST require repository variables `API_DEPLOY_BASE_DIR`, `API_ENV_FILE`, and `API_PM2_APP_NAME`.
- **FR-014**: The deployment workflow MUST fail when the configured API environment file path is missing or does not exist.
- **FR-015**: The deployment workflow MUST fail when PM2 is not available on the runner host.
- **FR-016**: The deployment workflow MUST create or use `current/` and `logs/` under the configured deploy base directory.
- **FR-017**: The deployment workflow MUST synchronize the repository into `current/`.
- **FR-018**: The deployment workflow MUST exclude `.git`, `.github`, `node_modules`, and `dist` from the synchronized deploy source.
- **FR-019**: The deployment workflow MUST copy the configured shared API environment file to `current/.env`.
- **FR-020**: The deployment workflow MUST read `PORT` from `current/.env` and fail when it is missing.
- **FR-021**: The deployment workflow MUST install dependencies and build the API in the deployed `current/` directory.
- **FR-022**: The deployment workflow MUST accept `dist/main.js` or `dist/src/main.js` as the compiled runtime entrypoint.
- **FR-023**: The deployment workflow MUST fail when no supported compiled entrypoint exists.
- **FR-024**: The deployment workflow MUST remove any existing PM2 process with the configured application name before starting the new process.
- **FR-025**: The deployment workflow MUST start PM2 with the configured application name and the port read from `.env`.
- **FR-026**: The deployment workflow MUST write PM2 output and error logs to the configured log file under `logs/`.
- **FR-027**: The deployment workflow MUST save the PM2 process list after starting the API.
- **FR-028**: The deployment workflow MUST fail when the configured PM2 process cannot be described after startup.
- **FR-029**: The public validation job MUST run on a hosted Linux runner after the self-hosted deployment job succeeds.
- **FR-030**: The public validation job MUST call `https://organizandotudo.api.thaleslj.com/api/health`.
- **FR-031**: The public validation job MUST retry transient public health failures.
- **FR-032**: The public validation job MUST fail unless the public health response includes `"status":"ok"`.
- **FR-033**: The deployment runtime model MUST maintain a single active version and MUST NOT require previous-version backup directories.

### Key Entities *(include if feature involves data)*

- **Health Status**: Public operational response containing API/database status and a timestamp.
- **Database Connection State**: Runtime connection readiness used to determine health status.
- **Deployment Workflow**: GitHub Actions workflow that publishes the API from repository source to the VPS runtime directory.
- **Deployment Runtime**: Single active PM2-managed API process under the configured `current/` directory.
- **Repository Variables**: Required deployment configuration values managed in GitHub repository settings.
- **Public Health Validation**: Hosted-runner check that confirms the public API URL is reachable and healthy after deployment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The public health endpoint returns a valid status payload in under 2 seconds during normal operating conditions.
- **SC-002**: 100% of healthy database connection checks return `status: "ok"` and `database: "up"`.
- **SC-003**: 100% of unavailable database connection checks return `status: "degraded"` and `database: "down"`.
- **SC-004**: 100% of successful deployments leave exactly one PM2 process with the configured API application name.
- **SC-005**: 100% of deployments with missing required repository variables fail before starting PM2.
- **SC-006**: 100% of deployments with missing runtime entrypoint fail before replacing the public runtime with an unverified process.
- **SC-007**: 100% of successful deployment workflows include hosted-runner validation of the public health URL.

## Assumptions

- This is a retroactive specification for behavior already implemented in the current project.
- `tasks.md` is intentionally omitted for this retroactive documentation pass.
- Deployment validation that runs repository commands is CI or developer responsibility and is not executed locally by the AI agent.
- VPS prerequisites include a self-hosted Linux runner, Node.js 22, PM2, rsync, curl, bash, a shared API `.env`, and public proxying to the configured API port.
- The documented recommended PM2 application name is `organizandotudo-api`.
