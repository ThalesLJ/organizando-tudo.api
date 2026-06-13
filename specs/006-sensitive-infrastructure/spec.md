# Feature Specification: Sensitive Infrastructure

**Feature Branch**: `[006-sensitive-infrastructure]`

**Created**: 2026-06-12

**Status**: Done

**Input**: Retroactive specification generated from the implemented crypto, secrets, and email infrastructure, Domain Map, `docs/hash-password.md`, `docs/hash-notes.md`, `docs/mails.md`, and `docs/security.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Protect irreversible sensitive values with hashing (Priority: P1)

The system needs a centralized hashing service so passwords, session tokens, and recovery codes are never stored in plain text and are validated by comparison instead of decryption.

**Why this priority**: Passwords, tokens, and recovery codes are high-impact secrets and must remain protected if persistence is exposed.

**Independent Test**: Can be validated by registering, logging in, and requesting recovery codes, then inspecting persisted values to confirm only bcrypt hashes are stored and validation succeeds only through comparison.

**Acceptance Scenarios**:

1. **Given** a password must be persisted, **When** the system stores it, **Then** it is converted to a bcrypt hash before persistence.
2. **Given** a JWT must be persisted for session validation, **When** the session is created, **Then** only a bcrypt hash of the token is stored.
3. **Given** a recovery code must be persisted, **When** the code is generated, **Then** only a bcrypt hash of the code is stored.
4. **Given** a user submits a password, token, or recovery code for validation, **When** verification runs, **Then** the system compares the submitted value with the stored hash and never decrypts the stored value.
5. **Given** invalid hash or plain-value inputs are provided to verification, **When** comparison runs, **Then** verification returns false instead of exposing internal comparison details.

---

### User Story 2 - Protect note title and content with reversible encryption (Priority: P1)

The system needs a centralized note encryption service so note title and content are encrypted at rest and decrypted only when building authorized or intentionally public responses.

**Why this priority**: Notes must be readable to users but protected in persistence.

**Independent Test**: Can be validated by creating a note, inspecting persisted title/content for encrypted format, then reading the note through authorized and public routes as applicable.

**Acceptance Scenarios**:

1. **Given** a note title or content is being saved, **When** the field is persisted, **Then** the system stores an encrypted value.
2. **Given** a note is returned through an authorized private response, **When** the response is built, **Then** the system decrypts title and content.
3. **Given** a note is returned through an intentionally public response, **When** the response is built, **Then** the system decrypts title and content.
4. **Given** encrypted data has an invalid format or cannot be decrypted, **When** decryption fails, **Then** the system logs safe diagnostics and returns a generic decryption failure.
5. **Given** old encrypted data requires compatibility handling, **When** modern decryption fails, **Then** the system attempts legacy-compatible decryption before failing.

---

### User Story 3 - Load SMTP credentials from protected database settings (Priority: P1)

The system needs email credentials to be stored in MongoDB settings rather than environment variables or source code.

**Why this priority**: SMTP credentials are operational secrets and must not be hardcoded, logged, returned, or edited through application endpoints.

**Independent Test**: Can be validated by inserting required SMTP settings in the database and confirming email can be sent, then removing one key or invalidating the port and confirming only a generic email service error is returned.

**Acceptance Scenarios**:

1. **Given** all required SMTP settings exist, **When** email sending starts, **Then** the system loads the credentials from the `Settings` collection.
2. **Given** any required SMTP setting is missing, **When** email sending starts, **Then** the system returns a generic email service unavailable error.
3. **Given** `SMTP_PORT` is not a positive number, **When** credentials are loaded, **Then** the system returns a generic email service unavailable error.
4. **Given** clients use the public API, **When** they inspect available routes, **Then** there is no endpoint for reading or editing SMTP settings.

---

### User Story 4 - Send transactional emails only through backend services (Priority: P2)

The system needs a centralized email service for password recovery and account update notifications.

**Why this priority**: Transactional email must be controlled by backend infrastructure so controllers and clients do not handle SMTP credentials or delivery logic.

**Independent Test**: Can be validated by triggering password recovery and profile update flows, then confirming emails are sent through centralized infrastructure or failures are safely logged with generic client responses.

**Acceptance Scenarios**:

1. **Given** a password recovery code is generated for an existing user, **When** email sending succeeds, **Then** the user receives the recovery code email.
2. **Given** account data is changed, **When** notification sending succeeds, **Then** the previous email receives a change warning and the persisted email receives an update confirmation.
3. **Given** email delivery fails, **When** the failure is handled, **Then** the system logs the failure internally and returns a generic email service unavailable error where applicable.
4. **Given** a controller handles an account or recovery request, **When** email delivery is needed, **Then** the controller delegates to a service and does not contain email logic.

### Edge Cases

- bcrypt hashing is intentionally irreversible and passwords cannot be decrypted.
- Passwords are plain text only transiently during request handling.
- The current bcrypt cost factor is 12.
- Hash verification catches internal comparison errors and returns false.
- Note encryption uses reversible authenticated encryption because original note text must be displayed later.
- Note encryption depends on consistent `ENCRYPTION_KEY`, key derivation, fixed salt, fixed AAD, IV/tag lengths, and stored format.
- Logs must not include secrets, tokens, credentials, passwords, recovery codes, or decrypted note content.
- SMTP provider is expected to be SMTP-based, with Gmail SMTP documented as the intended provider, but credentials are loaded from database settings.
- Settings collection access is backend-only, and operational database access is expected to be restricted, such as through VPN-only access.
- There is no application interface to edit SMTP settings; operators modify the database directly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a centralized hash service.
- **FR-002**: The hash service MUST generate bcrypt hashes with cost factor 12.
- **FR-003**: The hash service MUST verify submitted plain values by comparing them with stored hashes.
- **FR-004**: The hash service MUST return false for missing, non-string, or invalid comparison inputs.
- **FR-005**: The hash service MUST return false when bcrypt comparison fails internally.
- **FR-006**: Passwords MUST be hashed before persistence during registration and password reset.
- **FR-007**: Login MUST validate passwords by hash comparison and not by decryption.
- **FR-008**: Session JWTs MUST be stored only as hashes when persisted.
- **FR-009**: Recovery codes MUST be stored only as hashes when persisted.
- **FR-010**: The system MUST NOT provide any password decryption process.
- **FR-011**: The system MUST provide centralized reversible encryption for note title and content.
- **FR-012**: Note encryption MUST use authenticated encryption for fields that need later recovery.
- **FR-013**: Note encryption MUST derive a 32-byte key from configured encryption material.
- **FR-014**: Note encryption MUST use a 16-byte IV and 16-byte authentication tag for the current encrypted format.
- **FR-015**: Note encryption MUST use fixed AAD `additional-data`.
- **FR-016**: Note encryption MUST use fixed key-derivation salt `salt`.
- **FR-017**: Note encryption MUST persist encrypted fields as `ivHex:authTagHex:encryptedHex`.
- **FR-018**: Note encryption MUST fail early when required encryption configuration is missing.
- **FR-019**: Note decryption MUST validate encrypted field format before returning clear text.
- **FR-020**: Note decryption MUST attempt legacy-compatible decryption when current decryption fails.
- **FR-021**: Note decryption failures MUST log only safe diagnostics and MUST return a generic decryption error.
- **FR-022**: The system MUST store SMTP credentials in the `Settings` collection.
- **FR-023**: SMTP settings MUST use one document per key/value pair.
- **FR-024**: SMTP settings MUST include `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
- **FR-025**: SMTP credentials MUST NOT be stored in source code.
- **FR-026**: SMTP credentials MUST NOT be loaded from environment variables in the current email infrastructure.
- **FR-027**: SMTP credentials MUST NOT be returned in API responses.
- **FR-028**: SMTP credentials MUST NOT be exposed in logs.
- **FR-029**: There MUST be no API endpoint or application interface to read or edit SMTP settings.
- **FR-030**: Secret retrieval MUST return a generic email service unavailable error when any required SMTP key is missing.
- **FR-031**: Secret retrieval MUST return a generic email service unavailable error when `SMTP_PORT` is not a positive number.
- **FR-032**: The system MUST provide a centralized email service.
- **FR-033**: Email delivery MUST use SMTP credentials loaded by the secrets service.
- **FR-034**: Email delivery MUST send password recovery code emails.
- **FR-035**: Email delivery MUST send account data change warning emails to the previous email address.
- **FR-036**: Email delivery MUST send account data update confirmation emails to the persisted email address.
- **FR-037**: Controllers MUST NOT contain SMTP credential loading, transport configuration, or send-mail logic.
- **FR-038**: Email delivery failures MUST be logged internally and returned as generic service errors where propagated.
- **FR-039**: Password recovery code email failures MUST be logged without changing the successful anti-enumeration response of the recovery-code request route.
- **FR-040**: Sensitive infrastructure modules MUST remain reusable backend services rather than feature-controller logic.

### Key Entities *(include if feature involves data)*

- **Hash Service**: Central infrastructure service for irreversible bcrypt hashing and verification.
- **Note Encryption Service**: Central infrastructure service for reversible authenticated encryption and decryption of note fields.
- **SMTP Secret**: Key/value setting stored in the `Settings` collection for email transport credentials.
- **Email Service**: Central infrastructure service that configures SMTP transport and sends transactional emails.
- **Transactional Email**: Backend-generated email for password recovery, account change warning, or account update confirmation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of persisted passwords, session tokens, and recovery codes are stored as hashes, never plain text.
- **SC-002**: 100% of password validations use hash comparison and never decryption.
- **SC-003**: 100% of persisted note title/content values are encrypted before storage.
- **SC-004**: 100% of note decryption failures avoid exposing decrypted content or encryption secrets.
- **SC-005**: 100% of SMTP credential reads require all five required settings and a positive numeric port.
- **SC-006**: 100% of transactional emails are sent through centralized backend email infrastructure.
- **SC-007**: 0 API endpoints expose SMTP settings for read or write operations.

## Assumptions

- This is a retroactive specification for behavior already implemented in the current project.
- `tasks.md` is intentionally omitted for this retroactive documentation pass.
- Operators manage SMTP settings directly in the database with restricted database access.
- Gmail SMTP is the documented provider expectation, but the current contract is the SMTP settings key set rather than hardcoded provider values.
- Existing automated test creation or execution is outside this specification.
