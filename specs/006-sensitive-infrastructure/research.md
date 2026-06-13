# Research: Sensitive Infrastructure

**Feature**: `006-sensitive-infrastructure`
**Created**: 2026-06-12
**Status**: Done

## Purpose

Document the ambiguity review and decisions for the retroactive Sensitive Infrastructure specification.

## Resolved Questions

### Decision: Use bcrypt hashing for irreversible secrets

**Resolution**: Passwords, session tokens, and recovery codes are stored only as bcrypt hashes and verified by comparison.

**Rationale**: These values must never be decrypted or returned in plain text.

### Decision: Keep note encryption reversible and authenticated

**Resolution**: Note titles and content use reversible authenticated encryption because original text must be displayed later.

**Rationale**: Notes differ from passwords because the application must recover their original value for authorized or intentionally public responses.

### Decision: Store SMTP credentials in MongoDB settings

**Resolution**: SMTP credentials are stored as key/value documents in the `Settings` collection and are not exposed by any API endpoint.

**Rationale**: The project documentation and implementation treat email credentials as database-managed operational secrets rather than environment variables.

### Decision: Centralize transactional email delivery

**Resolution**: Password recovery and account update notifications are sent only through the centralized backend email service.

**Rationale**: Controllers must not own SMTP configuration or direct send-mail logic.

### Decision: Return generic errors for secret or email failures

**Resolution**: Missing SMTP keys, invalid SMTP port, and email delivery failures return generic service-level errors where propagated.

**Rationale**: Error messages must not leak secrets, credential names beyond expected configuration requirements, transport internals, or provider details.

## Constitutional Alignment

- Sensitive values are hashed, encrypted, or loaded through controlled infrastructure.
- Logs must avoid secrets, passwords, tokens, recovery codes, SMTP credentials, and decrypted note content.
- Infrastructure remains injectable and reusable.
- No automated test tasks or repository validation commands are introduced.

## Outcome

No unresolved ambiguity remains for this retroactive specification.
