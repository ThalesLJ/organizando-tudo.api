# Research: API Platform

**Feature**: `001-api-platform`
**Created**: 2026-06-12
**Status**: Done

## Purpose

Document the ambiguity review and decisions for the retroactive API Platform specification.

## Resolved Questions

### Decision: Keep the NestJS API as the source of truth

**Resolution**: The external API remains responsible for MongoDB access, authentication, authorization, JWT signing and validation, session validation, business rules, and response normalization.

**Rationale**: The current implementation and architecture documentation consistently define the API as the authoritative backend. The web project acts as a BFF/consumer and must not duplicate critical backend behavior.

**Alternatives considered**:

- Let the web consumer validate JWT signatures directly: rejected because it duplicates critical security logic outside the API.
- Allow direct MongoDB access outside the API: rejected because it breaks the backend boundary and ownership checks.

### Decision: Preserve global `/api` prefix

**Resolution**: All HTTP routes remain exposed under the global `api` prefix.

**Rationale**: The implemented bootstrap applies a global prefix and all documented routes depend on `/api/...`.

### Decision: Keep strict global DTO validation

**Resolution**: Global request validation uses transformation, whitelisting, and rejection of non-whitelisted fields.

**Rationale**: DTOs are the trusted request boundary. Rejecting undeclared fields prevents accidental acceptance of unsupported input.

### Decision: Preserve global response and error envelopes

**Resolution**: Successful responses are wrapped with `success: true` and `data`; failed responses use `success: false`, `error`, `timestamp`, and `path`.

**Rationale**: This is implemented globally and keeps client handling consistent across modules.

### Decision: Required runtime values fail fast

**Resolution**: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_ISSUER`, and `ENCRYPTION_KEY` are mandatory during bootstrap, and `PORT` must be a positive number.

**Rationale**: The constitution forbids insecure fallbacks for required environment values.

## Constitutional Alignment

- Modular NestJS API boundary is preserved through controller/service/schema/module separation.
- DTO validation and consistent response envelopes are global platform behavior.
- Required configuration fails early without hardcoded secret fallbacks.
- Artifacts are written in English.
- No automated test tasks or repository command validation are introduced.

## Outcome

No unresolved ambiguity remains for this retroactive specification.
