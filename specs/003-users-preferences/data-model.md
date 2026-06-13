# Data Model: Users and Preferences

**Feature**: `003-users-preferences`
**Created**: 2026-06-12
**Status**: Done

## Entities

### User

Stored in the `Users` collection.

**Public profile fields**:

- `id`
- `username`
- `email`
- `preferences`
- `createdAt`
- `updatedAt`

**Sensitive or internal fields not returned by profile response**:

- `password`
- `session.sessionId`
- `session.tokenHash`
- `session.expiresAt`
- `passwordRecovery.codeHash`

### User Preferences

Embedded in User.

**Fields**:

- `language`: Defaults to `en`.
- `colors`: Defaults to `null` and stores optional interface color tokens.

### User Colors

Embedded in User Preferences.

**Supported fields**:

- `backgroundPrimary`
- `backgroundSecondary`
- `textPrimary`
- `textSecondary`
- `borderColor`
- `inputBackground`
- `headerBackground`
- `headerText`
- `primaryButtonBackground`
- `primaryButtonText`
- `secondaryButtonBackground`
- `secondaryButtonText`
- `languageSwitcherBackground`
- `languageSwitcherText`
- `languageSwitcherBorder`

## DTO Contracts

### Update Profile Request

- `username`: Optional string, 3 to 50 characters.
- `email`: Optional valid email.
- `currentPassword`: Required string, 8 to 128 characters.

### Update Colors Request

All supported color fields are optional and must be valid hexadecimal colors when provided.

### Update Language Request

- `language`: Required string, one of `en`, `pt`, or `es`.

## Relationships

- Profile update operates on the authenticated User only.
- Profile update uses Hash Service to verify current password.
- Profile update uses Sessions Service to invalidate active session.
- Profile update uses Email Service for account change notifications.
- Preferences are embedded in User and updated through the users module.

## Validation Rules

- User must exist and be active.
- Current password must match the stored password hash for account-critical updates.
- New username must not be used by another user.
- New email must not be used by another user and must be normalized to lowercase.
- Undefined color fields are ignored.
- Unsupported language values are rejected before persistence.
