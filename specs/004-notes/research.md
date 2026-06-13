# Research: Notes

**Feature**: `004-notes`
**Created**: 2026-06-12
**Status**: Done

## Purpose

Document the ambiguity review and decisions for the retroactive Notes specification.

## Resolved Questions

### Decision: Encrypt title and content at rest

**Resolution**: Note `title` and `content` are encrypted before persistence and decrypted only when constructing authorized or intentionally public responses.

**Rationale**: Notes must be displayed later, so reversible encryption is required, but plain text must not be stored.

### Decision: Use authenticated encryption format

**Resolution**: Persisted encrypted fields use `ivHex:authTagHex:encryptedHex`.

**Rationale**: The current encryption service uses authenticated encryption and validates IV/auth-tag structure before returning clear text.

### Decision: Enforce ownership on private operations

**Resolution**: Private create/list/read/update/delete operations use the authenticated user identifier as the ownership boundary.

**Rationale**: Notes are private by default and must not expose, update, or remove another user's notes.

### Decision: Allow unauthenticated reads only for public notes

**Resolution**: `GET /api/notes/public/:id` is intentionally public and returns only notes marked `isPublic: true`.

**Rationale**: Public sharing is implemented without weakening private note routes.

### Decision: Preserve legacy decryption compatibility

**Resolution**: If current decryption fails, the service attempts legacy-compatible decryption before returning a generic failure.

**Rationale**: Existing persisted data may require compatibility handling.

## Constitutional Alignment

- Private endpoints require active session validation.
- User-owned note operations filter by authenticated owner.
- Encrypted values and owner identifiers are not leaked through public response contracts.
- Cryptographic behavior remains in infrastructure.
- No automated test tasks or repository validation commands are introduced.

## Outcome

No unresolved ambiguity remains for this retroactive specification.
