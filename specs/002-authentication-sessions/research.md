# Research: Authentication and Sessions

**Feature**: `002-authentication-sessions`
**Created**: 2026-06-12
**Status**: Done

## Purpose

Document the ambiguity review and decisions for the retroactive Authentication and Sessions specification.

## Resolved Questions

### Decision: Keep a single active session per user

**Resolution**: Every successful login generates a new session identifier, stores only a hash of the issued JWT, persists expiration, marks the session valid, and replaces previous session data.

**Rationale**: The implemented session model invalidates old tokens after a new login and supports server-side logout and account-change invalidation.

### Decision: Validate persisted session on every private route

**Resolution**: Private routes require JWT validation plus persisted-session validation, including active user, session validity, matching session identifier, unexpired session, and matching token hash.

**Rationale**: Signature validation alone is not enough because logout, password reset, profile changes, and new logins must invalidate old tokens before JWT expiration.

### Decision: Support login by email or username

**Resolution**: Login accepts either normalized email or username with password. Missing identifiers are rejected.

**Rationale**: The current API supports both identifiers and returns a consistent invalid-credentials result for missing, inactive, or password-mismatched users where applicable.

### Decision: Preserve anti-enumeration password recovery behavior

**Resolution**: Recovery code requests return success even when the email is not registered.

**Rationale**: This avoids exposing whether an email belongs to an account.

### Decision: Store passwords, tokens, and recovery codes only as hashes

**Resolution**: Passwords, session JWTs, and recovery codes are stored as bcrypt hashes and validated by comparison.

**Rationale**: These values must be irreversible at rest and must never be decrypted.

## Constitutional Alignment

- Private endpoints depend on `JwtAuthGuard` and persisted session validation.
- Passwords, tokens, and recovery codes are not persisted or returned in plain text.
- DTO constraints are explicit for registration, login, code request, and code verification.
- Email delivery remains centralized in backend infrastructure.
- No automated test tasks or local repository commands are introduced.

## Outcome

No unresolved ambiguity remains for this retroactive specification.
