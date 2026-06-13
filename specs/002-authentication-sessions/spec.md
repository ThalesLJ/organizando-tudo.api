# Feature Specification: Authentication and Sessions

**Feature Branch**: `[002-authentication-sessions]`

**Created**: 2026-06-12

**Status**: Done

**Input**: Retroactive specification generated from the implemented authentication/session modules, Domain Map, `docs/autentication.md`, `docs/security.md`, `docs/hash-password.md`, and `docs/mails.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register an account securely (Priority: P1)

A visitor needs to create an account with username, email, and password so they can later access private features.

**Why this priority**: Registration creates the user identity and establishes password protection, default preferences, and initial inactive session state.

**Independent Test**: Can be validated by calling `POST /api/auth/register` with valid data, then confirming the response succeeds without exposing credentials and that duplicate username or email registrations are rejected.

**Acceptance Scenarios**:

1. **Given** a new visitor provides a username, email, and password that satisfy validation rules, **When** registration is submitted, **Then** the system creates the user and returns a successful domain result.
2. **Given** the email already exists, **When** registration is submitted, **Then** the system rejects the request without creating a duplicate account.
3. **Given** the username already exists, **When** registration is submitted, **Then** the system rejects the request without creating a duplicate account.
4. **Given** a user is created, **When** the user document is persisted, **Then** the password is stored only as an irreversible bcrypt hash and the initial session is invalid.

---

### User Story 2 - Log in with a single active session (Priority: P1)

A registered user needs to authenticate with email or username and receive a token that represents exactly one active session.

**Why this priority**: Login is the entry point for private features and must invalidate older tokens when a new session starts.

**Independent Test**: Can be validated by logging in, calling a private endpoint with the returned token, then logging in again and confirming the previous token no longer works.

**Acceptance Scenarios**:

1. **Given** an active user provides a valid email and password, **When** login is submitted, **Then** the system returns a JWT and the current username.
2. **Given** an active user provides a valid username and password, **When** login is submitted, **Then** the system returns a JWT and the current username.
3. **Given** no email or username is provided, **When** login is submitted, **Then** the system rejects the request as invalid.
4. **Given** a user logs in successfully, **When** a session is created, **Then** a new session identifier is generated, the JWT is stored only as a hash, expiration is persisted, and previous session data is replaced.
5. **Given** `keepLoggedIn` is true, **When** the token is issued, **Then** the token expires in 30 days.
6. **Given** `keepLoggedIn` is absent or false, **When** the token is issued, **Then** the token expires in 8 hours.

---

### User Story 3 - Access private routes only with a valid persisted session (Priority: P1)

An authenticated user needs private routes to accept only tokens that are signed, unexpired, and still match the active session stored for that user.

**Why this priority**: The system must not trust JWT signature alone; stolen, expired, replaced, or invalidated tokens must stop working.

**Independent Test**: Can be validated by calling any private endpoint with a valid token, with an old token after a new login, with a token after logout, and with an expired or malformed token.

**Acceptance Scenarios**:

1. **Given** a valid signed token with a matching active persisted session, **When** a private route is called, **Then** the request is allowed.
2. **Given** the user is inactive or missing, **When** a private route is called, **Then** the request is rejected.
3. **Given** the persisted session is invalid, missing required session fields, expired, or has a different session identifier, **When** a private route is called, **Then** the request is rejected.
4. **Given** the bearer token does not match the stored token hash, **When** a private route is called, **Then** the request is rejected.

---

### User Story 4 - Log out and invalidate the active session (Priority: P1)

A signed-in user needs to log out so the current token stops working even before JWT expiration.

**Why this priority**: Logout must be server-enforced and must not rely only on client cookie removal.

**Independent Test**: Can be validated by logging in, calling `POST /api/auth/logout`, then using the same token against a private endpoint and confirming it is rejected.

**Acceptance Scenarios**:

1. **Given** a user has a valid active session, **When** logout is submitted, **Then** the session is marked invalid and session identifier, token hash, and expiration are cleared.
2. **Given** logout has succeeded, **When** the previous token is used again, **Then** the request is rejected.

---

### User Story 5 - Recover a password without account enumeration (Priority: P2)

A user who forgot their password needs to request a recovery code and set a new password without revealing whether an email is registered.

**Why this priority**: Password recovery must be usable and must not leak account existence.

**Independent Test**: Can be validated by requesting a code for existing and non-existing emails, verifying both return success, then resetting the password with a valid code and confirming the old session is invalid.

**Acceptance Scenarios**:

1. **Given** any syntactically valid email is submitted to request a recovery code, **When** `POST /api/auth/send-code` is called, **Then** the system returns success.
2. **Given** the email belongs to an existing user, **When** a recovery code is generated, **Then** a 6-digit code is stored only as a bcrypt hash and expires after 10 minutes.
3. **Given** a previous code exists for the same email, **When** a new code is generated, **Then** the previous code record is replaced.
4. **Given** email delivery fails during code sending, **When** the route completes, **Then** the failure is logged and the route still returns success.
5. **Given** a valid active recovery code and new valid password are submitted, **When** the code is verified, **Then** the password is replaced with a new bcrypt hash, the user session is invalidated, and the used code is removed.
6. **Given** an invalid or expired code is submitted, **When** verification runs, **Then** the system rejects the request with a generic invalid-or-expired result.

### Edge Cases

- Registration and login emails are normalized to lowercase.
- Usernames are compared as the submitted username value.
- Inactive users cannot authenticate and receive the same invalid credentials behavior as missing users.
- JWT payload is readable and must not contain sensitive values.
- JWT signing and validation are owned only by the external API.
- The web layer may store the token in an HttpOnly cookie and forward it as a bearer token, but it must not generate, sign, or validate JWT signatures.
- Password hashes, token hashes, and recovery code hashes are irreversible and cannot be decrypted.
- Invalid hash comparison inputs return false rather than throwing usable details to clients.
- Logs must not include passwords, tokens, recovery codes, hashes, or secrets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose registration at `POST /api/auth/register`.
- **FR-002**: Registration MUST require `username`, `email`, and `password`.
- **FR-003**: Registration username MUST be a non-empty string from 3 to 50 characters.
- **FR-004**: Registration email MUST be a valid email address and MUST be normalized to lowercase before lookup and persistence.
- **FR-005**: Registration password MUST be a non-empty string from 8 to 128 characters.
- **FR-006**: Registration MUST reject an email or username already used by another account.
- **FR-007**: Registration MUST hash the password with bcrypt before persistence.
- **FR-008**: A newly registered user MUST start with language preference `en`, colors `null`, and invalid session state.
- **FR-009**: Registration MUST return only a successful domain result and MUST NOT return password, hash, token, or session material.
- **FR-010**: The system MUST expose login at `POST /api/auth/login`.
- **FR-011**: Login MUST accept either `email` or `username`, plus `password` and optional `keepLoggedIn`.
- **FR-012**: Login MUST reject requests that provide neither email nor username.
- **FR-013**: Login MUST reject missing, inactive, or password-mismatched users with invalid credentials.
- **FR-014**: Login MUST compare the submitted password with the persisted bcrypt hash without decrypting the password.
- **FR-015**: Login MUST generate a unique session identifier for every successful authentication.
- **FR-016**: Login MUST issue a JWT containing `sub`, `username`, and `sessionId`, plus standard issued-at and expiration claims.
- **FR-017**: JWT signing MUST use the configured secret and issuer.
- **FR-018**: Login MUST use a 30-day expiration when `keepLoggedIn` is true and 8 hours otherwise.
- **FR-019**: Login MUST persist only a hash of the issued JWT as `session.tokenHash`.
- **FR-020**: Login MUST persist `session.sessionId`, `session.expiresAt`, `session.isValid: true`, and update `lastLoginAt`.
- **FR-021**: A successful login MUST replace any previous active session for the same user.
- **FR-022**: Login MUST return the JWT and `user.username` as the domain payload.
- **FR-023**: Private routes MUST use a guard that validates the JWT signature, issuer, expiration, bearer token presence, active user, active session, session identifier, session expiration, and token hash.
- **FR-024**: Controllers for private routes MUST read the authenticated user from the validated request context.
- **FR-025**: The system MUST expose logout at `POST /api/auth/logout` as an authenticated route.
- **FR-026**: Logout MUST invalidate the current user's persisted session and clear session identifier, token hash, and expiration.
- **FR-027**: The system MUST expose recovery code request at `POST /api/auth/send-code`.
- **FR-028**: Recovery code request MUST require a valid email address and normalize it to lowercase.
- **FR-029**: Recovery code request MUST return success even when no user exists for the email.
- **FR-030**: Recovery code request MUST generate a 6-digit numeric code for existing users.
- **FR-031**: Recovery codes MUST be stored only as bcrypt hashes in the `Codes` collection.
- **FR-032**: Recovery codes MUST expire after 10 minutes.
- **FR-033**: Recovery code request MUST upsert by email and replace any previous code for the same email.
- **FR-034**: Recovery code request MUST attempt delivery through the centralized email service.
- **FR-035**: Recovery code email delivery failure MUST be logged internally and MUST NOT change the successful route response.
- **FR-036**: The system MUST expose password reset at `POST /api/auth/verify-code`.
- **FR-037**: Password reset MUST require a 6-character code and a new password from 8 to 128 characters.
- **FR-038**: Password reset MUST search only active, non-expired recovery code records.
- **FR-039**: Password reset MUST verify the submitted code by comparing it with stored bcrypt hashes.
- **FR-040**: Password reset MUST replace the user password with a new bcrypt hash, invalidate the user session, and delete the used recovery code.
- **FR-041**: Password reset MUST reject invalid, expired, or orphaned codes with a generic invalid-or-expired response.
- **FR-042**: Passwords, JWTs, and recovery codes MUST never be stored in plain text.
- **FR-043**: Passwords, JWTs, and recovery codes MUST never be returned in API responses.
- **FR-044**: JWT payloads MUST NOT contain sensitive data.

### Key Entities *(include if feature involves data)*

- **User**: Account identity with username, lowercase email, hashed password, active flag, session state, preferences, and login timestamps.
- **User Session**: Single active session state containing session identifier, token hash, expiration, and validity flag.
- **JWT**: Signed bearer token containing non-sensitive identity/session claims used with persisted session validation.
- **Recovery Code**: Temporary password reset code stored as hash with email and expiration in the `Codes` collection.
- **Hash**: Irreversible bcrypt output used for passwords, tokens, and recovery codes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of created passwords are persisted only as bcrypt hashes.
- **SC-002**: 100% of successful logins create exactly one active persisted session for the user.
- **SC-003**: 100% of replaced, logged-out, expired, or hash-mismatched tokens are rejected on private routes.
- **SC-004**: Users can complete login with valid credentials and access private routes in under 1 minute during normal operating conditions.
- **SC-005**: Password recovery code requests return the same success outcome for existing and non-existing emails.
- **SC-006**: 100% of successful password resets invalidate the previous active session and remove the used code.

## Assumptions

- This is a retroactive specification for behavior already implemented in the current project.
- `tasks.md` is intentionally omitted for this retroactive documentation pass.
- The web BFF stores JWTs in HttpOnly cookies and forwards them as bearer tokens, while the external API remains responsible for all JWT and session validation.
- Recovery email text is transactional and intentionally simple in the current implementation.
- Existing automated test creation or execution is outside this specification.
