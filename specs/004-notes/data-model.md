# Data Model: Notes

**Feature**: `004-notes`
**Created**: 2026-06-12
**Status**: Done

## Entities

### Note

Stored in the `Notes` collection.

**Persisted fields**:

- `title`: Encrypted string.
- `content`: Encrypted string.
- `isPublic`: Boolean visibility flag, default false.
- `userId`: Owner identifier.
- `createdAt`: Creation timestamp.
- `updatedAt`: Update timestamp.

**Public response fields**:

- `id`
- `title`
- `content`
- `isPublic`
- `createdAt`
- `updatedAt`

**Fields intentionally omitted from response**:

- `userId`
- Encrypted title/content payloads.

### Encrypted Note Field

String format used for persisted note title and content.

```text
ivHex:authTagHex:encryptedHex
```

**Components**:

- `ivHex`: Hex-encoded initialization vector.
- `authTagHex`: Hex-encoded authentication tag.
- `encryptedHex`: Hex-encoded encrypted payload.

### Public Note

A Note with `isPublic: true`.

**Rules**:

- Can be read without authentication through the public endpoint.
- Still stores title/content encrypted at rest.
- Still returns decrypted title/content in the public response.

## DTO Contracts

### Create Note Request

- `title`: Required non-empty string, up to 120 characters.
- `content`: Required non-empty string, up to 5000 characters.
- `isPublic`: Optional boolean.

### Update Note Request

- `title`: Optional string, up to 120 characters.
- `content`: Optional string, up to 5000 characters.
- `isPublic`: Optional boolean.

## Relationships

- Note belongs to one authenticated user through `userId`.
- Private read/update/delete operations query by `_id` and `userId`.
- Public read operation queries by `_id` and `isPublic: true`.
- Note service depends on Note Encryption Service for title/content transformation.

## Validation Rules

- Private note operations require active session.
- Create requires title and content.
- Update accepts partial changes.
- `isPublic` defaults to false on creation.
- Encrypted data must have the expected three-part format before successful decryption.
- Decryption failure returns a generic error and must not expose decrypted content.
