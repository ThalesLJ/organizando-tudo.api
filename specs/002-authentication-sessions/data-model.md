# Data Model: Authentication and Sessions

**Feature**: `002-authentication-sessions`
**Created**: 2026-06-12
**Status**: Done

## Entities

### User

Stored in the `Users` collection.

**Fields used by this domain**:

- `username`: Unique account username.
- `email`: Unique normalized lowercase email.
- `password`: Bcrypt password hash.
- `isActive`: Determines whether the account can authenticate.
- `session`: Current persisted session state.
- `preferences`: Defaulted on registration.
- `lastLoginAt`: Updated on successful login.
- `createdAt`: Creation timestamp.
- `updatedAt`: Update timestamp.

### User Session

Embedded in the user record.

**Fields**:

- `sessionId`: Unique identifier included in the JWT payload.
- `tokenHash`: Bcrypt hash of the issued JWT.
- `expiresAt`: Persisted session expiration date.
- `isValid`: Server-side session validity flag.

**Rules**:

- Only one active session exists per user.
- New login replaces previous session data.
- Logout clears session identifier, token hash, and expiration while marking the session invalid.

### JWT

Bearer token issued by the API.

**Payload fields**:

- `sub`: User identifier.
- `username`: Current username.
- `sessionId`: Current active session identifier.
- `iat`: Issued-at timestamp.
- `exp`: Expiration timestamp.

**Rules**:

- Payload must not contain sensitive data.
- Token signing and validation belong only to the external API.
- Persisted token material is stored only as a hash.

### Recovery Code

Stored in the `Codes` collection.

**Fields**:

- `email`: Normalized lowercase email associated with the code.
- `codeHash`: Bcrypt hash of the 6-digit recovery code.
- `expiresAt`: Expiration timestamp.
- `createdAt`: Creation timestamp.
- `updatedAt`: Update timestamp.

**Rules**:

- Code expires after 10 minutes.
- Code request upserts by email.
- Used code is removed after successful password reset.

## DTO Contracts

### Register Request

- `username`: Required string, 3 to 50 characters.
- `email`: Required valid email.
- `password`: Required string, 8 to 128 characters.

### Login Request

- `email`: Optional valid email.
- `username`: Optional string, 3 to 50 characters.
- `password`: Required string, 8 to 128 characters.
- `keepLoggedIn`: Optional boolean.

### Send Code Request

- `email`: Required valid email.

### Verify Code Request

- `code`: Required string, exactly 6 characters.
- `password`: Required string, 8 to 128 characters.

## Relationships

- User owns one embedded session.
- Recovery Code belongs to a normalized email and resolves to a user at verification time.
- JWT `sub` references User.
- JWT `sessionId` must match User Session.
- User Session `tokenHash` must match the bearer token received on private requests.
