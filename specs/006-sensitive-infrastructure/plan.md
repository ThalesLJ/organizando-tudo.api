# Implementation Plan: Sensitive Infrastructure

**Branch**: `[006-sensitive-infrastructure]` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-sensitive-infrastructure/spec.md`

## Summary

The implemented sensitive infrastructure provides centralized hashing, reversible note encryption, SMTP secret retrieval from MongoDB settings, and transactional email delivery for password recovery and account updates.

## Technical Context

**Language/Version**: TypeScript on NestJS 11

**Primary Dependencies**: bcryptjs, Node crypto, NestJS config service, Mongoose, Nodemailer

**Storage**: MongoDB `Settings` collection for SMTP secrets; feature collections store hashes or encrypted values

**Testing**: Manual validation only; automated test creation or execution is not required by project constitution

**Target Platform**: Node.js API service

**Project Type**: Shared backend infrastructure for a web service API

**Performance Goals**: Hashing and encryption must be applied only where needed and not repeated outside persistence or response paths

**Constraints**: No hardcoded secrets, no secret exposure in responses, no decrypted note content in logs, no password decryption path, no SMTP settings API

**Scale/Scope**: Covers hash service, note encryption service, secrets service, email service, and transactional email usage

## Constitution Check

- **Modular NestJS API Boundary**: PASS. Sensitive operations remain in infrastructure services injected into feature services.
- **Explicit Typed Code and Naming**: PASS. Infrastructure contracts use English names and explicit types.
- **Validated Contracts and Consistent Responses**: PASS. Feature DTOs validate payloads before sensitive infrastructure receives values.
- **Security by Default**: PASS. Passwords/tokens/codes are hashed, notes are encrypted, SMTP credentials are not exposed.
- **Manual Quality and Future Testability**: PASS. Infrastructure is injectable and validation remains manual for this retroactive pass.
- **Mandatory Spec Kit Flow**: PASS. Required artifacts are present; `tasks.md` is omitted by explicit retroactive request.

## Project Structure

### Documentation (this feature)

```text
specs/006-sensitive-infrastructure/
├── spec.md
├── research.md
├── plan.md
├── data-model.md
└── requirements.md
```

### Source Code (repository root)

```text
src/infrastructure/
├── crypto/
│   ├── hash.service.ts
│   └── note-encryption.service.ts
├── email/
│   ├── email.module.ts
│   └── email.service.ts
└── secrets/
    ├── secrets.module.ts
    ├── secrets.service.ts
    └── schemas/secret.schema.ts
```

**Structure Decision**: Sensitive reusable behavior stays under `src/infrastructure` and is consumed by feature services through dependency injection.

## Implementation Notes

- No code implementation is required by this retroactive artifact.
- Future cryptographic changes must document compatibility with existing hashes or encrypted note payloads.
- Future email changes must preserve backend-only credential handling.

## Complexity Tracking

No constitutional violations are required for the current sensitive infrastructure behavior.
