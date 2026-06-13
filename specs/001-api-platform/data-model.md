# Data Model: API Platform

**Feature**: `001-api-platform`
**Created**: 2026-06-12
**Status**: Done

## Overview

This domain does not introduce a single business collection. It defines platform-level contracts, runtime configuration, module boundaries, and response envelopes shared by the full API.

## Platform Contracts

### API Application

Represents the NestJS backend service.

**Responsibilities**:

- Own global route prefixing.
- Own global DTO validation.
- Own global success response wrapping.
- Own global error normalization.
- Own MongoDB connection setup.
- Register feature modules.

**Current modules**:

- `SessionsModule`
- `AuthModule`
- `UsersModule`
- `NotesModule`
- `BudgetsModule`
- `ExpensesModule`
- `HealthModule`

### Runtime Configuration

Required values validated during bootstrap.

| Name | Required | Rule |
|------|----------|------|
| `PORT` | Yes | Must be a positive number |
| `MONGO_URI` | Yes | Must be present |
| `JWT_SECRET` | Yes | Must be present |
| `JWT_ISSUER` | Yes | Must be present |
| `ENCRYPTION_KEY` | Yes | Must be present |

### Success Response Envelope

Applied globally to successful controller responses.

```json
{
  "success": true,
  "data": {}
}
```

### Error Response Envelope

Applied globally to handled and unexpected failures.

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Error message"
  },
  "timestamp": "2026-06-12T00:00:00.000Z",
  "path": "/api/example"
}
```

## Relationships

- API Application uses Runtime Configuration to bootstrap safely.
- API Application connects to MongoDB through Mongoose.
- Feature Modules register schemas for their own persistence needs.
- Controllers return domain payloads; Response Envelope is applied globally.
- Exceptions are normalized through the Error Response Envelope.

## Validation Rules

- DTO-backed input must be transformed.
- DTO-backed input must be whitelisted.
- Non-whitelisted properties must be rejected.
- Missing required runtime values must fail startup.
- Internal database fields and sensitive values must not be exposed directly.

## Notes

- Health status and deployment runtime data are modeled in `007-operational-observability`.
- Business entities are modeled in their respective feature domains.
