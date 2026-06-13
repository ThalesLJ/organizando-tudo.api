<!--
Sync Impact Report
Version change: 1.0.0 -> 1.0.1
Modified principles:
- Project Language and Spec Kit Artifacts: mixed artifact language guidance -> English-only artifact content
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- .specify/templates/plan-template.md: pending alignment with mandatory artifact order, English-only project content, and manual validation rules
- .specify/templates/spec-template.md: pending alignment with English-only project content and manual validation language
- .specify/templates/tasks-template.md: pending alignment to remove automated test task examples and forbid repository or build validation tasks
- .specify/templates/commands/*.md: not present
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
mapping. Schemas MUST define MongoDB persistence shape through Mongoose.

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

Rationale: the implemented API already separates HTTP concerns, application
logic, persistence mapping, and cross-cutting infrastructure, which keeps
features easier to reason about and safer to extend.

### II. Explicit Typed Code and Naming

The general project language is English. All names for classes, properties,
methods, functions, variables, business rules, entities, DTOs, modules,
controllers, providers, services, repositories, schemas, and contracts MUST be
written in English while remaining consistent with the application domain.

Code MUST follow C#/.NET-style naming preferences where they are compatible with
the TypeScript/NestJS ecosystem:

- Classes, DTOs, schemas, modules, controllers, services, decorators, guards,
  filters, interceptors, enums, and exported types MUST use PascalCase.
- Methods, functions, properties, parameters, and local variables MUST use
  camelCase.
- Interfaces MUST always start with `I`.
- Immutable global constants MAY use UPPER_SNAKE_CASE when they represent shared
  static values.
- File and folder names SHOULD continue to follow the existing NestJS convention
  based on lowercase domain names and suffixes such as `.module.ts`,
  `.service.ts`, `.controller.ts`, `.schema.ts`, and `.dto.ts`.

Types MUST be explicit at module boundaries, public methods, DTOs, schemas,
interfaces, controllers, service returns, and infrastructure contracts. The use
of `var`, `dynamic`, implicit broad typing, unjustified `any`, uncontracted
objects, broad casts, and type suppressions without real handling is forbidden.
`unknown` MAY be used only when explicit narrowing or controlled error handling
happens before consumption.

Rationale: the current codebase already uses TypeScript strictness, explicit
return types, DTO classes, schema classes, typed request payloads, and typed
service dependencies to keep behavior readable and predictable.

### III. Validated Contracts and Consistent Responses

All request input MUST be validated through DTOs and NestJS validation
mechanisms before it reaches business logic. DTOs MUST use `class-validator`
decorators for required fields, optional fields, lengths, numeric bounds,
booleans, email addresses, hex colors, and other known constraints. Global
validation behavior MUST continue to transform input, whitelist allowed
properties, and reject non-whitelisted fields.

API responses MUST preserve the global envelope:

```text
success: true, data: ...
success: false, error: { code, message }, timestamp, path
```

Services MUST map MongoDB documents into public response contracts. Internal
database fields such as `_id`, `user_id`, `budget_id`, encrypted payloads,
passwords, password hashes, token hashes, SMTP secrets, and recovery code hashes
MUST NOT be exposed directly. Existing external response names such as `id`,
`userId`, `budgetId`, `createdAt`, and `updatedAt` MUST remain consistent unless
a specification explicitly documents a breaking contract change.

Rationale: the implemented API uses a global response interceptor, a global
exception filter, DTO validation, and service-level `toResponse` mapping to keep
client contracts consistent and sensitive internals hidden.

### IV. Security by Default

Authentication and authorization MUST remain explicit for private resources.
Private endpoints MUST use `JwtAuthGuard` or an equivalent guard that validates
the JWT, session identifier, token hash, session validity, expiration, and user
activity. Public endpoints MUST be intentionally declared and MUST NOT expose
private user data.

Sensitive values MUST be protected throughout the lifecycle:

- Passwords, tokens, recovery codes, and SMTP credentials MUST never be stored or
  returned in plain text.
- Passwords, recovery codes, and session tokens MUST be stored only as hashes
  when persisted.
- Notes content and title values MUST remain encrypted at rest before
  persistence and decrypted only when constructing authorized response payloads
  or intentionally public note responses.
- Environment variables required for bootstrapping MUST be validated at startup.
- Secrets read from storage MUST fail with generic service-level errors when
  incomplete or invalid.
- Logs MUST avoid secrets, tokens, credentials, passwords, recovery codes, and
  decrypted note content.
- Generic `try-catch` blocks without proper handling, safe logging, error
  normalization, fallback behavior, or controlled propagation MUST NOT be used.

Rationale: the implemented system already treats session ownership, password
hashing, token hashing, recovery code hashing, note encryption, and secret
retrieval as security-sensitive infrastructure rather than incidental feature
logic.

### V. Manual Quality and Future Testability

The current quality process is focused on QA in the production environment. This
project does not have an automated test suite configured, even though Jest
configuration and scripts are present. No specification, plan, checklist, data
model, or `tasks.md` MUST require creation, execution, or maintenance of unit,
integration, end-to-end, coverage, or equivalent automated tests.

When validation is needed, `tasks.md` MUST include equivalent manual testing
steps that allow the developer to validate each delivered behavior through the
running application, API calls, persisted data inspection, and user-visible
outcomes. Manual validation tasks MUST be specific enough to confirm success,
failure, authorization, persistence, and edge cases for each user story.

Business logic MUST still be developed to favor future testability:

- Dependencies MUST be injected through NestJS providers instead of hardcoded
  inside methods.
- Controllers MUST stay thin so services can be exercised independently later.
- Business rules MUST be cohesive and avoid unnecessary coupling between
  unrelated modules.
- External effects such as email, secrets, hashing, encryption, and persistence
  MUST remain behind injectable services or models.
- New code MUST avoid hidden global state and ambiguous side effects.

Rationale: although automated tests are not currently part of delivery, the
implemented structure already favors isolated services, explicit dependencies,
and manual validation through clear API behavior.

## Project Language and Spec Kit Artifacts

Project code, technical names, domain names used in code, entities, properties,
methods, contracts, business rules, DTOs, schemas, modules, providers, and API
response field names MUST remain in English.

Project-specific content in Spec Kit artifacts MUST be written in English,
including specifications, plans, research, data models, requirements,
checklists, and tasks. The original English structure, headings, and section
names from Spec Kit templates MUST be preserved when they are part of the
adopted template standard.

Rationale: the codebase, API contracts, documentation, and planning artifacts
must share one language to avoid inconsistent domain terms, duplicated business
vocabulary, and translation drift between implementation and specifications.

## Architecture Decisions

The API is a NestJS 11 application using a single `src` source root, global
configuration validation, Mongoose for MongoDB persistence, Passport JWT for
authentication, bcrypt for hashing, Node crypto for note encryption, Nodemailer
for email delivery, and global response/error normalization.

The established request flow is:

```text
HTTP request -> Controller -> DTO validation -> Guard/decorator -> Service -> Mongoose/Infrastructure -> Response mapping -> Global response envelope
```

Architecture work MUST preserve these decisions unless a specification
explicitly justifies a replacement:

- The global API prefix is `api`.
- Environment validation happens during application bootstrap.
- MongoDB collections are mapped with Mongoose schemas and timestamps.
- User-owned data MUST be queried by authenticated user identifier.
- Private notes MUST be encrypted at rest; public reads are allowed only for
  notes explicitly marked public.
- User preferences include language and color customization and MUST remain part
  of the profile domain.
- Session invalidation MUST occur when security-sensitive account data changes.
- Existing persisted legacy field names in MongoDB collections MUST be preserved
  when required for compatibility, but new public API contracts SHOULD use
  idiomatic camelCase names.
- Health checks MUST remain lightweight and report application/database
  availability without exposing sensitive configuration.

## Security Requirements

- Protected operations MUST require an authenticated JWT and an active persisted
  session.
- Authorization checks for user-owned documents MUST filter by authenticated
  user identifier in the database query.
- Public endpoints MUST be limited to intentionally public resources and safe
  operational status responses.
- Passwords MUST meet DTO validation constraints and be hashed before storage.
- Recovery codes MUST expire and be hashed before storage.
- JWT signing MUST include issuer configuration and expiration.
- Persisted token material MUST be hashed before storage.
- Note encryption MUST use authenticated encryption and must not persist plain
  note titles or content.
- Error responses MUST avoid leaking stack traces, database internals, secrets,
  credentials, tokens, hashes, or decrypted content.
- Email failures MUST be logged safely and returned through generic service
  errors.
- Secrets and required environment values MUST never be hardcoded in source
  files, documentation, or Spec Kit artifacts.

## Performance Requirements

- Feature queries over user-owned collections SHOULD keep filtering by indexed
  ownership fields such as `userId`, `user_id`, and related indexed references.
- List endpoints SHOULD use predictable sorting and SHOULD avoid unnecessary
  post-query filtering in application memory when the database can filter.
- Services SHOULD avoid returning full Mongoose documents when a normalized
  response object is sufficient.
- Cryptographic work MUST be limited to fields that require protection and MUST
  avoid repeated encryption/decryption outside the response or persistence path.
- Health checks MUST remain low cost and avoid expensive diagnostics by default.
- New dependencies MUST be justified by clear feature value, compatibility with
  the NestJS/Mongoose stack, security posture, and operational cost.
- New endpoints that may grow in result size SHOULD define pagination, filtering,
  or scoped retrieval in the feature specification before implementation.

## Mandatory Spec Kit Flow

Specification-Driven Development is the mandatory project workflow. When
planning new features through Spec Kit, artifacts MUST be generated in the exact
order below:

1. `spec.md` as the primary feature specification.
2. `research.md` as ambiguity research and resolution.
3. `plan.md` as the technical implementation plan.
4. `data-model.md` as data and entity modeling.
5. `requirements.md` as the requirements validation checklist.

The `tasks.md` file is mandatory, but MUST be generated and worked on only after
the complete validation and approval required by `requirements.md`.

No task described in `tasks.md` or any other generated artifact MUST validate,
fix, or execute actions in the local or remote repository. No task MUST run
`dotnet` commands for application validation, build, execution, or diagnostics.
Any repository operation or application compilation/validation command is manual
developer work and outside the AI agent execution scope.

## Development Workflow and Quality Gates

Every new feature MUST start from the mandatory Spec Kit artifacts before
implementation, except for narrow documentation-only corrections.

Every feature plan MUST pass the constitutional gates before implementation:

- The affected NestJS module boundary is identified.
- Controllers remain thin and services own business behavior.
- DTO validation is defined for every request payload.
- Authentication and authorization behavior is identified for every private
  endpoint or protected operation.
- User-owned persistence queries include authenticated ownership filtering.
- Sensitive data storage, logging, and response exposure are explicitly checked.
- Environment variable or secret changes are documented without exposing values.
- Public API response contracts are normalized and avoid database internals.
- Performance impact is considered for queries, encryption/decryption, list
  endpoints, and new dependencies.
- Manual validation steps are defined instead of automated test tasks.
- `tasks.md` generation happens only after complete approval of the
  `requirements.md` checklist.

Documentation that describes architecture, security, Spec Kit workflow,
configuration, environment variables, or API behavior MUST be updated when a
change modifies the documented behavior.

## Post-Implementation Closure

After the AI agent completes the technical implementation tasks, the agent MUST
automatically update the `Status` property in the related feature `spec.md` from
`Draft` to `Done`.

This update is independent of the developer's manual validations and tests and
MUST be performed systemically as the closure of the AI cycle.

## Governance

This constitution is the authoritative source for Organizando Tudo API
architectural and development principles. Specifications, plans, tasks, code
changes, reviews, and documentation MUST be checked against these guidelines
before an implementation is considered complete.

The principles described here represent practices already evident in the
project codebase and the developer's stated workflow preferences. Any new
feature, architectural change, or code review MUST adhere to these guidelines to
avoid introducing architectural regressions, domain inconsistencies, sensitive
data exposure, security failures, performance regressions, or validation gaps.

Significant changes to these practices MUST be justified in versioning,
including the reason for the change, affected principles or sections, version
impact, and required updates to Spec Kit templates or project documentation.
Versioning follows semantic rules:

- MAJOR: incompatible governance changes or removal/redefinition of core
  principles.
- MINOR: new principles, new mandatory sections, or material expansion of
  guidance.
- PATCH: clarifications, wording improvements, and non-semantic corrections.

Compliance review MUST verify preservation of the NestJS module boundary,
explicit typing and naming, DTO validation, consistent response mapping,
security controls, performance constraints, manual quality validation, mandatory
Spec Kit flow, and post-implementation closure.

**Version**: 1.0.1 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
