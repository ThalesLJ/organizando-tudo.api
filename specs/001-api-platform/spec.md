# Feature Specification: API Platform

**Feature Branch**: `[001-api-platform]`

**Created**: 2026-06-12

**Status**: Done

**Input**: Retroactive specification generated from the implemented API platform, Domain Map, `docs/backend-structure.md`, and `docs/security.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run the API as the system source of truth (Priority: P1)

The system owner needs the NestJS API to act as the authoritative backend for authentication, session control, business rules, MongoDB access, validation, response formatting, and sensitive infrastructure.

**Why this priority**: All client applications depend on a single backend boundary so critical security and persistence behavior is not duplicated outside the API.

**Independent Test**: Can be validated by starting the API with all required configuration present, confirming every controller is exposed under the global `/api` prefix, and confirming the web consumer can use the API without connecting directly to MongoDB or validating JWT signatures itself.

**Acceptance Scenarios**:

1. **Given** the API starts with valid configuration, **When** a feature controller declares a route such as `auth`, `users`, `notes`, `budgets`, `expenses`, or `health`, **Then** the externally visible route is available under `/api/...`.
2. **Given** a web consumer needs backend data, **When** it calls the Organizando Tudo API through its backend layer, **Then** the API owns MongoDB access, JWT validation, session validation, and business rules.
3. **Given** a browser request is visible in developer tools, **When** security-sensitive work is needed, **Then** the sensitive logic remains on the backend instead of trying to hide browser traffic.

---

### User Story 2 - Validate requests and normalize responses globally (Priority: P1)

API consumers need consistent request rejection, successful response envelopes, and error response envelopes across every endpoint.

**Why this priority**: A stable contract reduces duplicated client handling and prevents undeclared payload fields from reaching business logic.

**Independent Test**: Can be validated by sending valid and invalid payloads to any DTO-backed endpoint and checking successful responses use `success: true` with `data`, while failed responses use `success: false` with an error object, timestamp, and path.

**Acceptance Scenarios**:

1. **Given** a request contains fields not declared by the endpoint DTO, **When** it reaches the API, **Then** the request is rejected before service logic runs.
2. **Given** a controller returns a domain payload, **When** the response leaves the API, **Then** the payload is wrapped in `{ "success": true, "data": ... }`.
3. **Given** a handled or unexpected error occurs, **When** the response is returned, **Then** the API returns `{ "success": false, "error": { "code", "message" }, "timestamp", "path" }`.
4. **Given** an unexpected internal failure occurs, **When** the error is handled, **Then** the client receives a generic internal error response while the server logs the failure.

---

### User Story 3 - Fail fast on required runtime configuration (Priority: P1)

Operators need the API to fail immediately when mandatory runtime values are missing or invalid.

**Why this priority**: Missing secrets, database URIs, issuer values, encryption keys, or invalid ports can lead to insecure or unusable deployments.

**Independent Test**: Can be validated manually by attempting to start the API with one required value missing or with an invalid port and confirming startup fails before serving requests.

**Acceptance Scenarios**:

1. **Given** `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_ISSUER`, or `ENCRYPTION_KEY` is missing, **When** the API boots, **Then** startup fails immediately.
2. **Given** `PORT` is not a positive number, **When** the API boots, **Then** startup fails immediately.
3. **Given** all required values are present and valid, **When** the API boots, **Then** it connects to MongoDB using the configured URI and listens on the configured port.

### Edge Cases

- The API must reject non-whitelisted request fields globally instead of silently ignoring potentially unsafe input.
- The API must not serve requests when required runtime configuration is absent.
- The API must not expose stack traces, database internals, secrets, credentials, tokens, hashes, or decrypted content in error responses.
- Browser requests are visible by design; security must come from moving logic to the backend, using HTTPS, HttpOnly cookies in the web layer, and validating everything in the external API.
- Feature modules stay independent and cohesive even when they share common infrastructure.
- Runtime configuration must not use insecure fallbacks for required values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose all API routes under the global `/api` prefix.
- **FR-002**: The system MUST validate incoming DTO-backed payloads globally with transformation enabled, whitelisting enabled, and non-whitelisted fields rejected.
- **FR-003**: Controllers MUST handle HTTP routing, authentication guards, request DTO binding, and delegation only.
- **FR-004**: Services MUST own business rules, persistence orchestration, security-sensitive transformations, and public response mapping.
- **FR-005**: Schemas MUST define MongoDB persistence shape through Mongoose.
- **FR-006**: Shared guards, decorators, filters, interceptors, crypto, email, and secrets behavior MUST remain in common or infrastructure modules.
- **FR-007**: Successful responses MUST use the standard envelope with `success: true` and `data`.
- **FR-008**: Failed responses MUST use the standard envelope with `success: false`, `error.code`, `error.message`, `timestamp`, and `path`.
- **FR-009**: Unexpected internal errors MUST be normalized into generic server errors for clients while being logged internally.
- **FR-010**: The API MUST require `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_ISSUER`, and `ENCRYPTION_KEY` during bootstrap.
- **FR-011**: `PORT` MUST be a valid positive number.
- **FR-012**: The API MUST connect to MongoDB through the configured database URI.
- **FR-013**: Feature modules MUST register their own persistence schemas by domain.
- **FR-014**: The application module MUST include the sessions, authentication, users, notes, budgets, expenses, and health modules while keeping domain responsibilities modular.
- **FR-015**: The API MUST remain the only layer responsible for MongoDB access, JWT signing, JWT validation, session validation, and critical business rules.
- **FR-016**: The web consumer MUST use its backend layer to forward authenticated requests and MUST NOT replace the external API's security checks.
- **FR-017**: Browser-side code MUST NOT store tokens in local storage or expose token material to JavaScript; token storage belongs to the web backend using HttpOnly cookies.
- **FR-018**: Source code, API contracts, module names, DTOs, schemas, and Spec Kit artifacts for this project MUST use English project terminology.

### Key Entities *(include if feature involves data)*

- **API Application**: The backend service that owns routing, validation, response normalization, business rules, persistence access, and sensitive infrastructure.
- **Feature Module**: A cohesive API domain with controller, service, DTO, schema, and module boundaries when applicable.
- **Runtime Configuration**: Required environment values that allow the API to start safely and connect to dependent services.
- **Response Envelope**: The public response structure for successful and failed API responses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of API endpoints are externally reachable under the `/api` prefix.
- **SC-002**: 100% of invalid DTO-backed payloads with undeclared properties are rejected before service logic executes.
- **SC-003**: 100% of successful controller responses are returned with the standard success envelope.
- **SC-004**: 100% of handled or unexpected HTTP failures are returned with the standard error envelope.
- **SC-005**: The API fails startup in every manual validation where one required runtime value is missing or `PORT` is invalid.
- **SC-006**: 100% of feature modules preserve controller, service, DTO, schema, and module boundaries where applicable.

## Assumptions

- This is a retroactive specification for behavior already implemented in the current project.
- `tasks.md` is intentionally omitted for this retroactive documentation pass.
- The web project acts as a BFF/consumer and does not replace the external API as the source of truth.
- Operational observability, health checks, and deployment flow are specified separately in `007-operational-observability`.
