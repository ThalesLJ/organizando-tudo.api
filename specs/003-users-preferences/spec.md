# Feature Specification: Users and Preferences

**Feature Branch**: `[003-users-preferences]`

**Created**: 2026-06-12

**Status**: Done

**Input**: Retroactive specification generated from the implemented users module, Domain Map, `docs/user_profile.md`, `docs/security.md`, and `docs/mails.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the authenticated profile (Priority: P1)

An authenticated user needs to view their own account profile and preferences without receiving sensitive account data.

**Why this priority**: Profile data is required for account screens and must preserve the private account boundary.

**Independent Test**: Can be validated by calling `GET /api/users/me` with a valid session and confirming the response contains public account fields and preferences but no password or session hash.

**Acceptance Scenarios**:

1. **Given** a user has a valid active session, **When** `GET /api/users/me` is called, **Then** the system returns the user's public profile data.
2. **Given** the authenticated user no longer exists or is inactive, **When** the profile is requested, **Then** the system returns `User not found`.
3. **Given** profile data is returned, **When** the response is inspected, **Then** password, password hash, token hash, recovery code hash, and SMTP secrets are not present.

---

### User Story 2 - Update username or email with current password (Priority: P1)

An authenticated user needs to change username and/or email only after confirming the current password.

**Why this priority**: Username and email are account-critical fields and must require password re-verification, uniqueness checks, session invalidation, and notifications.

**Independent Test**: Can be validated by calling `PATCH /api/users/profile` with a valid session, current password, and new username or email, then confirming the route succeeds, the old token stops working, and notification emails are sent.

**Acceptance Scenarios**:

1. **Given** a valid active session and correct current password, **When** the user changes username, **Then** the username is updated if it is not already used by another user.
2. **Given** a valid active session and correct current password, **When** the user changes email, **Then** the email is normalized to lowercase and updated if it is not already used by another user.
3. **Given** the current password is invalid, **When** profile update is submitted, **Then** the update is rejected and no account data is changed.
4. **Given** the requested username or email belongs to another user, **When** profile update is submitted, **Then** the update is rejected.
5. **Given** the update succeeds, **When** the operation completes, **Then** the user's active session is invalidated and the user must authenticate again.
6. **Given** the update succeeds, **When** notifications are sent, **Then** the old email receives a change warning and the new email receives an update confirmation.

---

### User Story 3 - Persist interface color preferences (Priority: P2)

An authenticated user needs to save custom interface colors that can be used by the consuming web application.

**Why this priority**: Visual preferences personalize the product and must persist without overwriting unspecified values.

**Independent Test**: Can be validated by calling `PATCH /api/users/settings/colors` with one or more valid hex colors, then calling it again with a subset and confirming previous fields remain.

**Acceptance Scenarios**:

1. **Given** a user submits valid hexadecimal color values, **When** color preferences are updated, **Then** the system persists the submitted values in `preferences.colors`.
2. **Given** a user omits some color fields, **When** color preferences are updated, **Then** omitted fields do not erase previously saved values.
3. **Given** a user submits an invalid color value, **When** validation runs, **Then** the request is rejected before business logic runs.
4. **Given** color preferences are saved, **When** the response is returned, **Then** it contains the persisted `colors` object.

---

### User Story 4 - Persist language preference (Priority: P2)

An authenticated user needs to save the preferred interface language.

**Why this priority**: Language preference drives the multilingual user experience in supported consumers.

**Independent Test**: Can be validated by calling `PATCH /api/users/settings/language` with `en`, `pt`, and `es`, and confirming other values are rejected.

**Acceptance Scenarios**:

1. **Given** the user submits `en`, `pt`, or `es`, **When** language preference is updated, **Then** the system persists the submitted language.
2. **Given** the user submits any other value, **When** validation runs, **Then** the request is rejected.
3. **Given** language preference is saved, **When** the response is returned, **Then** it contains the persisted `language`.

### Edge Cases

- All user preference and profile endpoints require a valid JWT and active persisted session.
- Email updates normalize the new email to lowercase before uniqueness checks and persistence.
- A profile update that does not change the email still sends the current email as both the old and new email in the implemented notification flow.
- The user-facing client should warn before profile submission that account information changes will log the user out.
- After a successful profile update, the consuming web application should redirect the user to login and show a success message.
- Color fields submitted as `undefined` are ignored instead of being persisted or used to clear existing values.
- The implemented color preference set includes language-switcher colors in addition to the original documented fields.
- Profile responses expose `id`, `username`, `email`, `preferences`, `createdAt`, and `updatedAt` only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose authenticated profile retrieval at `GET /api/users/me`.
- **FR-002**: Profile retrieval MUST require a valid JWT and active persisted session.
- **FR-003**: Profile retrieval MUST return `id`, `username`, `email`, `preferences`, `createdAt`, and `updatedAt`.
- **FR-004**: Profile retrieval MUST NOT return password, session token hash, recovery code hash, or other sensitive internal values.
- **FR-005**: Profile retrieval MUST reject missing or inactive users with `User not found`.
- **FR-006**: The system MUST expose authenticated account data update at `PATCH /api/users/profile`.
- **FR-007**: Account data update MUST accept optional `username`, optional `email`, and required `currentPassword`.
- **FR-008**: Updated username MUST be a non-empty string from 3 to 50 characters when provided.
- **FR-009**: Updated email MUST be valid when provided and MUST be normalized to lowercase before persistence.
- **FR-010**: Current password MUST be a non-empty string from 8 to 128 characters.
- **FR-011**: Account data update MUST verify the submitted current password against the stored password hash.
- **FR-012**: Account data update MUST reject invalid current passwords.
- **FR-013**: Account data update MUST reject usernames already used by another user.
- **FR-014**: Account data update MUST reject emails already used by another user.
- **FR-015**: Account data update MUST invalidate the user's active session after a successful change.
- **FR-016**: Account data update MUST return only `{ success: true }` as the domain payload on success.
- **FR-017**: Account data update MUST send an account change warning to the previous email address.
- **FR-018**: Account data update MUST send an account update confirmation to the persisted email address after the change.
- **FR-019**: Email sending MUST be handled by the centralized backend email service and not by controllers.
- **FR-020**: The system MUST expose authenticated color preference update at `PATCH /api/users/settings/colors`.
- **FR-021**: Color preference update MUST accept only optional hexadecimal color fields.
- **FR-022**: Color preference update MUST support `backgroundPrimary`, `backgroundSecondary`, `textPrimary`, `textSecondary`, `borderColor`, `inputBackground`, `headerBackground`, `headerText`, `primaryButtonBackground`, `primaryButtonText`, `secondaryButtonBackground`, `secondaryButtonText`, `languageSwitcherBackground`, `languageSwitcherText`, and `languageSwitcherBorder`.
- **FR-023**: Color preference update MUST merge submitted defined fields with existing color preferences.
- **FR-024**: Color preference update MUST NOT erase existing fields that are omitted from the request.
- **FR-025**: Color preference update MUST return the persisted `colors` object.
- **FR-026**: The system MUST expose authenticated language preference update at `PATCH /api/users/settings/language`.
- **FR-027**: Language preference update MUST accept only `en`, `pt`, or `es`.
- **FR-028**: Language preference update MUST persist the selected value in `preferences.language`.
- **FR-029**: Language preference update MUST return the persisted `language`.
- **FR-030**: User data MUST be persisted in the `Users` collection.
- **FR-031**: User records MUST include username, email, password, active status, session, password recovery data, preferences, last login timestamp, creation timestamp, and update timestamp where applicable.
- **FR-032**: The user schema MUST default language to `en` and colors to `null`.

### Key Entities *(include if feature involves data)*

- **User**: Authenticated account record stored in `Users`, containing identity, password hash, active status, session state, preferences, and timestamps.
- **User Preferences**: User-level settings containing language and optional color customization.
- **User Colors**: Optional hex color values for the supported interface color tokens.
- **Profile Update Request**: Account-critical change request requiring current password and optional new username or email.
- **Account Notification Email**: Transactional email sent after successful account data changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of profile responses omit password and session hash fields.
- **SC-002**: 100% of profile updates with invalid current password are rejected without changing account data.
- **SC-003**: 100% of successful profile updates invalidate the current session.
- **SC-004**: 100% of duplicate username or email update attempts are rejected.
- **SC-005**: 100% of color preference updates preserve omitted existing color fields.
- **SC-006**: 100% of unsupported language values are rejected before persistence.

## Assumptions

- This is a retroactive specification for behavior already implemented in the current project.
- `tasks.md` is intentionally omitted for this retroactive documentation pass.
- The consuming web application is responsible for showing the pre-submit logout warning and redirecting to login after successful profile changes.
- Email delivery uses the centralized email infrastructure specified separately.
- Existing automated test creation or execution is outside this specification.
