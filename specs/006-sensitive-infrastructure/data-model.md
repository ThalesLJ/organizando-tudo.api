# Data Model: Sensitive Infrastructure

**Feature**: `006-sensitive-infrastructure`
**Created**: 2026-06-12
**Status**: Done

## Entities and Infrastructure Contracts

### Hash Service

Central service for irreversible hashing.

**Operations**:

- `hash(value)`: Generates a bcrypt hash.
- `verify(hash, plainValue)`: Compares a submitted value with a stored hash.

**Rules**:

- Uses bcrypt cost factor 12.
- Returns false for invalid comparison inputs.
- Returns false when comparison fails internally.
- Does not decrypt any value.

### Encrypted Note Field

Used by the Notes domain for title and content.

**Persisted format**:

```text
ivHex:authTagHex:encryptedHex
```

**Cryptographic parameters**:

- Authenticated reversible encryption.
- Derived key length: 32 bytes.
- IV length: 16 bytes.
- Auth tag length: 16 bytes.
- AAD: `additional-data`.
- Derivation salt: `salt`.
- Secret source: configured encryption key.

### SMTP Secret

Stored in the `Settings` collection.

**Persisted fields**:

- `key`
- `value`
- `createdAt`
- `updatedAt`

**Required keys**:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

**Rules**:

- Each credential is stored as a separate document.
- `SMTP_PORT` must resolve to a positive number.
- Missing or invalid values return a generic email service unavailable result.
- No API endpoint exposes or edits these values.

### Email Payload

Internal payload sent by the Email Service.

**Fields**:

- `to`
- `subject`
- `text`

**Implemented transactional emails**:

- Password recovery code.
- Account data changed warning.
- Account data update confirmation.

## Relationships

- Auth service uses Hash Service for passwords and recovery codes.
- Sessions service uses Hash Service for JWT token hashes.
- Notes service uses Note Encryption Service for title/content.
- Email service uses Secrets Service to load SMTP settings.
- Auth and Users services use Email Service to send transactional messages.

## Sensitive Data Exposure Rules

- Passwords, session tokens, and recovery codes are never persisted in plain text.
- SMTP credentials are never returned in responses.
- SMTP credentials are never handled by controllers.
- Decrypted note content is not logged.
- Secret-related failures use generic client-facing errors.
