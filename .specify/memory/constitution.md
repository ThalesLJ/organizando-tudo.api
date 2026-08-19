<!--
Sync Impact Report
Version change: 1.0.1 -> 1.1.0
Modified principles:
- Added: VI. Simplicity & Focused Change
- Added: VII. Manual Quality Assurance
- Refined: I. Modular NestJS API Boundary
- Refined: II. Strict Typing, Naming Conventions & English Codebase
- Refined: III. Preference-Aware User System & Localization Support
- Refined: IV. Security by Default, Note Encryption & Persisted Sessions
- Refined: V. Validated Contracts and Global Response System
Added sections:
- Spec Kit Workflow: Complex vs. Simple Features (Artifact Scalability Logic)
- Anti-Regression Checklist
Modified sections:
- Mandatory Spec Kit Flow -> Spec Kit Workflow: Complex vs. Simple Features
- Development Workflow and Quality Gates -> Anti-Regression Checklist & Spec Kit Workflow
- Governance
Templates requiring updates:
- .specify/templates/plan-template.md: aligned with scaled artifact workflows and manual QA gates
- .specify/templates/spec-template.md: aligned with simple/complex classification and English content rules
- .specify/templates/tasks-template.md: aligned with manual validation tasks and developer boundaries
Follow-up TODOs: none
-->
# Organizando Tudo API Constitution

## Core Principles

### I. Modular NestJS API Boundary

The API MUST remain a modular NestJS backend organized around cohesive feature
modules under `src/modules` and shared infrastructure under `src/infrastructure`
and `src/common`. Controllers MUST handle HTTP routing, authentication guards,
request DTO binding, and delegation. Services MUST hold business rules,
persistence orchestration, security-sensitive transformations, and response
mapping. Schemas MUST define MongoDB persistence shapes through Mongoose.

Feature work MUST preserve this boundary:

- Controllers MUST NOT contain persistence rules, cryptographic operations, or
  business workflows beyond calling the appropriate service.
- Services MUST receive validated DTOs or explicit primitive inputs and MUST
  return normalized public response objects.
- Shared guards, decorators, filters, interceptors, crypto, email, and secrets
  behavior MUST stay in common or infrastructure modules instead of being copied
  into feature modules.
- New modules MUST follow the existing controller/service/schema/dto/module
  layout unless the feature has no persistence or no HTTP surface.

The expected request flow is:

```text
HTTP Request -> Controller -> DTO Validation -> Guard / Decorator -> Service -> Mongoose Schema -> Response Interceptor -> Standard Envelope
```

**Rationale**: The implemented architecture clearly isolates HTTP transport,
business logic, persistence mapping, and cross-cutting infrastructure, keeping
the system maintainable, auditable, and resilient.

### II. Strict Typing, Naming Conventions & English Codebase

The general codebase language is English. All names for classes, properties,
methods, functions, variables, business rules, entities, DTOs, modules,
controllers, providers, services, repositories, schemas, contracts, and Spec Kit
artifacts MUST be written in English while remaining consistent with the application domain.

TypeScript `strict` mode MUST remain enabled. The JavaScript `var` keyword and the
TypeScript `any` type are **prohibited** (along with uncontracted objects,
`Record<string, any>`, and type suppressions without real handling). `unknown` MAY be
used only when explicit narrowing or validation happens before consumption.

Naming conventions MUST follow idiomatic standards:
- Classes, DTOs, schemas, modules, controllers, services, decorators, guards,
  filters, interceptors, types, and enums MUST use PascalCase.
- Methods, functions, properties, parameters, and local variables MUST use camelCase.
- Interfaces MUST always start with `I` (e.g., `IUserResponse`, `ISessionPayload`).
- Immutable global constants and environment variables MUST use UPPER_SNAKE_CASE.
- Files and folders MUST follow NestJS naming conventions (lowercase with domain suffixes such as `.module.ts`, `.service.ts`, `.controller.ts`, `.schema.ts`, `.dto.ts`).

**Rationale**: Explicit types and uniform naming prevent runtime regressions, keep
API contracts predictable, and maintain readability across the entire backend stack.

### III. Preference-Aware User System & Localization Support

User preferences for language (English `en`, Portuguese `pt`, Spanish `es`) and
custom interface theme colors MUST remain first-class domain capabilities.
Profile endpoints MUST persist and return these preferences, enabling seamless
synchronization across client applications.

All API response messages, error codes, and exception payloads MUST use
standardized error codes and clear descriptive messages in English, allowing
clients to map them to localized user-facing copy reliably.

**Rationale**: The API serves multiple client platforms; centralized preference
persistence and normalized error contracts guarantee consistent multi-device behavior.

### IV. Security by Default, Note Encryption & Persisted Sessions

Authentication and authorization MUST remain explicit for all private resources.
Private endpoints MUST use `JwtAuthGuard` or an equivalent guard that validates
the JWT token integrity, session identifier, token hash, session validity,
expiration, and user active status against MongoDB.

Sensitive data MUST be protected throughout the entire lifecycle:
- Passwords, recovery codes, and session tokens MUST be stored only as salted hashes (e.g., bcrypt) and never returned in plain text.
- Note `title` and `content` fields MUST remain encrypted at rest using authenticated cryptography (AES-256-GCM) and decrypted only when delivering authorized payloads.
- Environment variables required for bootstrapping MUST be validated at startup (`env.validation.ts`).
- SMTP credentials MUST be securely loaded from MongoDB via the secrets infrastructure service and never committed to source files.
- Logs MUST NEVER contain passwords, tokens, recovery codes, secrets, or decrypted note content.
- Generic `try/catch` blocks that swallow errors without safe logging, error normalization, or controlled propagation are strictly prohibited.

**Rationale**: Treating session validation, cryptographic hashing, and note
encryption at rest as first-class infrastructure prevents security regressions and data breaches.

### V. Validated Contracts and Global Response System

All request payloads MUST be validated through DTOs and NestJS validation mechanisms
before reaching business logic. DTOs MUST use `class-validator` decorators for
required fields, optional fields, string lengths, numeric bounds, booleans, email
formatting, and custom constraints. Global validation MUST transform inputs, whitelist
allowed properties, and reject non-whitelisted fields (`forbidNonWhitelisted: true`).

API responses MUST preserve the standard global envelope:

```json
{ "success": true, "data": ... }
```

Errors MUST preserve the standard error envelope:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Description" }, "timestamp": "...", "path": "..." }
```

Services MUST map MongoDB documents into clean public response objects (`toResponse`),
ensuring internal database fields (`_id`, `__v`, `password_hash`, `token_hash`, encryption salts)
are never exposed directly.

**Rationale**: Predictable response shapes and strict schema abstraction prevent
data leakage and maintain clean frontend-backend interoperability.

### VI. Simplicity & Focused Change

Implement the minimum change that satisfies the specification. Do not refactor unrelated
modules, rename broad surfaces, or introduce new abstractions unless the feature explicitly requires them.

Prefer existing infrastructure services (`src/infrastructure/crypto`, `src/infrastructure/email`,
`src/infrastructure/secrets`) and shared common utilities over duplicate implementations. Avoid over-engineering and YAGNI violations.

Avoid isolated adjustments in a single layer when changes touch shared DTOs, guards,
services, or database schemas — those changes MUST be coordinated end-to-end.

**Rationale**: Small, focused diffs reduce QA risk, make PR reviews clear, and prevent
unintended regressions in production.

### VII. Manual Quality Assurance

Automated test suites are **not** configured as mandatory delivery gates in this repository.
Quality assurance relies on manual validation and production QA unless the user explicitly requests automated tests.

Business logic MUST still be written for future testability: low coupling, high cohesion,
pure functions where practical, thin controllers delegating to injectable services, and isolated dependencies.

`tasks.md` MUST NOT plan or request automated tests (unit, integration, e2e) unless the user
explicitly asks for them. Instead, `tasks.md` MUST include **manual validation steps**
(API endpoint execution, request payload tests, MongoDB state verification, auth/error scenarios)
equivalent to the acceptance criteria in `spec.md`.

**Rationale**: Reflects project QA practices while keeping code structurally testable if
test automation is introduced later.

---

## Security Requirements

- Protected operations MUST require an authenticated JWT and an active persisted session in MongoDB.
- Authorization checks for user-owned documents MUST filter by authenticated user identifier in the database query.
- Public endpoints MUST be limited to intentionally public resources (e.g., public notes, health checks).
- Passwords MUST meet DTO validation constraints and be hashed before storage.
- Recovery codes MUST expire and be hashed before storage.
- JWT signing MUST include issuer configuration and expiration.
- Persisted token material MUST be hashed before storage.
- Note encryption MUST use authenticated encryption (AES-256-GCM) and must not persist plain note titles or content.
- Error responses MUST avoid leaking stack traces, database internals, secrets, credentials, tokens, hashes, or decrypted content.
- Email failures MUST be logged safely and returned through generic service errors.
- Secrets and required environment values MUST never be hardcoded in source files, documentation, or Spec Kit artifacts.

## Performance Requirements

- Feature queries over user-owned collections SHOULD keep filtering by indexed ownership fields such as `userId`, `user_id`, and related indexed references.
- List endpoints SHOULD use predictable sorting and avoid unnecessary post-query filtering in application memory when the database can filter.
- Services SHOULD avoid returning full Mongoose documents when a lean, normalized response object is sufficient.
- Cryptographic operations MUST be limited to fields that require protection and avoid repeated encryption/decryption outside the response or persistence path.
- Health checks MUST remain low cost and avoid expensive database diagnostics by default.
- Additional third-party dependencies MUST be strictly justified by feature value, compatibility with NestJS/Mongoose, and performance impact.
- Endpoints that may return large collections SHOULD support pagination or bounded result sets.
- The production build (`npm run build`) and linting (`npm run lint`) MUST pass cleanly without warnings or errors.

---

## Spec Kit Workflow: Complex vs. Simple Features

Specification-Driven Development (SDD) is the mandatory workflow for this project.
To balance thoroughness with efficiency, features are classified by complexity to scale
the number of generated design artifacts:

### 1. Feature Classification Criteria

| Classification | Criteria / Triggers | Required Artifacts |
|---|---|---|
| **Complex Feature** *(Standard Flow)* | • New domain modules, controllers, or major business capabilities<br>• New database entities, Mongoose schemas, or data migrations<br>• Authentication, authorization, session lifecycle, or crypto changes<br>• External service integrations (SMTP, secrets, external providers)<br>• High-risk security or cross-cutting architectural changes | Full artifact pipeline:<br>1. `spec.md`<br>2. `research.md`<br>3. `plan.md`<br>4. `data-model.md`<br>5. `requirements.md`<br>6. `tasks.md` |
| **Simple Feature** *(Streamlined Flow)* | • Minor DTO field additions or validation adjustments<br>• Minor query optimizations or response property enhancements<br>• Non-breaking bug fixes to existing services or controllers without new schemas or architectural ambiguity<br>• Logging or error messaging refinements | Streamlined artifact pipeline:<br>1. `spec.md`<br>2. `plan.md`<br>3. `tasks.md`<br>*(Omits `research.md`, `data-model.md`, and `requirements.md` to avoid unnecessary overhead)* |

### 2. Execution Order per Classification

#### A. Complex Features (Full Flow)
1. `spec.md` — Primary feature specification (`Status: Draft` initially).
2. `research.md` — Technical research, architecture decisions, and ambiguity resolution.
3. `plan.md` — Technical implementation plan and Constitution Check.
4. `data-model.md` — Entity schemas, state transitions, and data contracts.
5. `requirements.md` — Requirements validation checklist.
6. `tasks.md` — Actionable, dependency-ordered tasks with manual validation steps (generated ONLY after `requirements.md` is approved).

#### B. Simple Features (Streamlined Flow)
1. `spec.md` — Scoped feature specification with prioritized user stories, acceptance criteria, and edge cases (`Status: Draft` initially).
2. `plan.md` — Lightweight implementation plan with Constitution Check and affected files structure.
3. `tasks.md` — Actionable, dependency-ordered task list with manual validation steps (generated immediately after `plan.md`).

### 3. Workflow Rules for AI Agents & Developer Boundaries

- **Language**: Spec Kit artifacts MUST use English for technical names, entities, headings, and structure.
- **Forbidden Agent Tasks**:
  - `tasks.md` MUST NOT include Git operations (commits, pushes, branch switching, rebasing). Git operations are strictly developer responsibilities.
  - `tasks.md` MUST NOT include `dotnet` commands for application validation, build, or execution.
  - `tasks.md` MUST NOT include automated test generation/execution unless explicitly requested by the user.
- **Manual QA Tasks**: Every user story in `tasks.md` MUST contain explicit manual verification tasks mapping to the acceptance criteria in `spec.md` (e.g., API requests via curl/Postman, DB state verification, auth validation).

---

## Anti-Regression Checklist

Before completing an implementation or marking a feature done, verify:

- [ ] **Modular Boundary**: Controllers remain thin; business rules and persistence orchestration reside inside services; schemas define Mongoose models.
- [ ] **Auth & Session**: Protected routes enforce `JwtAuthGuard` and validate active MongoDB sessions; tokens, passwords, and recovery codes stored only as hashes.
- [ ] **Encryption at Rest**: Private notes encrypted with authenticated AES-256-GCM before database write; plain content never exposed in logs or DB directly.
- [ ] **Contract Validation**: Request payloads strictly validated via class-validator DTOs; global ValidationPipe whitelisting enforced.
- [ ] **Response Envelope**: All successful responses wrapped in `{ success: true, data }`; exceptions normalized through global exception filter `{ success: false, error }`.
- [ ] **Type Safety**: Strict TypeScript enforced; no `var`, `any`, or uncontracted objects; interfaces start with `I`.
- [ ] **Error Handling**: No swallowed/generic `try/catch`; safe logging without exposing secrets, credentials, or PII.
- [ ] **Performance & Indexes**: Queries filter by indexed fields (`userId`, `user_id`); lean responses avoid returning unneeded Mongoose document overhead.
- [ ] **Spec Kit Compliance & Closure**: All tasks verified through manual validation steps; feature status in `spec.md` updated from `Draft` to `Done`.

---

## Post-Implementation Closure

After the AI agent completes all tasks in `tasks.md` for a feature, the agent MUST
automatically update the `Status` property in that feature's `spec.md` from `Draft` to `Done`.

This update is mandatory as the final systemic step of the AI implementation cycle and is
independent of subsequent manual QA performed by the developer in staging or production.

---

## Governance

This constitution is the authoritative source for Organizando Tudo API
architectural and development principles. Specifications, plans, tasks, code
changes, PR reviews, and documentation MUST be checked against these guidelines
before an implementation is considered complete.

The principles described here represent practices already evident in the
project codebase. Any new feature, architectural change, or code review MUST
adhere to these guidelines to avoid introducing architectural regressions,
domain inconsistencies, sensitive data exposure, or security failures.

Significant changes to these practices MUST be justified in versioning,
including the reason for the change, affected principles or sections, version
impact, and required updates to Spec Kit templates or project documentation.
Versioning follows semantic rules:

- MAJOR: incompatible governance changes or removal/redefinition of core principles.
- MINOR: new principles, new mandatory sections, or material expansion of guidance.
- PATCH: clarifications, wording improvements, and non-semantic corrections.

Compliance review MUST verify preservation of the NestJS module boundary,
strict typing, DTO contract validation, standard response envelopes, security
and encryption rules, the scaled Spec Kit flow (simple vs. complex), manual quality,
and anti-regression checks.

**Version**: 1.1.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-08-18
