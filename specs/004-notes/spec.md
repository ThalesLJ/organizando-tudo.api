# Feature Specification: Notes

**Feature Branch**: `[004-notes]`

**Created**: 2026-06-12

**Status**: Done

**Input**: Retroactive specification generated from the implemented notes module, Domain Map, `docs/hash-notes.md`, and `docs/security.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create private or public notes with encrypted content (Priority: P1)

An authenticated user needs to create notes with title, content, and optional public visibility while the stored title and content remain encrypted at rest.

**Why this priority**: Note creation is the core value of the notes domain and must protect private user data in persistence.

**Independent Test**: Can be validated by calling `POST /api/notes` with a valid session, then inspecting the API response for readable text and the persisted document for encrypted title/content.

**Acceptance Scenarios**:

1. **Given** an authenticated user submits a valid title and content, **When** the note is created, **Then** the system persists the note for that user and returns the readable note data.
2. **Given** `isPublic` is omitted, **When** the note is created, **Then** the note is private by default.
3. **Given** the note is persisted, **When** the database record is inspected, **Then** title and content are stored in encrypted text format rather than plain text.
4. **Given** the client attempts to provide an owner in the payload, **When** the note is created, **Then** ownership still comes only from the authenticated token.

---

### User Story 2 - List and read only owned private notes (Priority: P1)

An authenticated user needs to list and read their own notes without exposing another user's notes.

**Why this priority**: Note privacy depends on filtering every private read by the authenticated owner.

**Independent Test**: Can be validated by creating notes for two users, then confirming each user can list and read only their own notes.

**Acceptance Scenarios**:

1. **Given** a user has multiple notes, **When** `GET /api/notes` is called, **Then** the system returns only notes owned by the authenticated user.
2. **Given** notes are listed, **When** the response is returned, **Then** notes are ordered from newest to oldest and title/content are decrypted for display.
3. **Given** a user requests one owned note by ID, **When** `GET /api/notes/:id` is called, **Then** the system returns the decrypted note.
4. **Given** a user requests another user's note by ID, **When** `GET /api/notes/:id` is called, **Then** the system returns `Note not found`.

---

### User Story 3 - Read public notes without authentication (Priority: P2)

Any visitor needs to read a note without authentication only when the owner intentionally marked it public.

**Why this priority**: Public note sharing must be supported without weakening private note ownership.

**Independent Test**: Can be validated by creating one public note and one private note, then calling `GET /api/notes/public/:id` without a token for both IDs.

**Acceptance Scenarios**:

1. **Given** a note exists and is marked public, **When** `GET /api/notes/public/:id` is called without authentication, **Then** the system returns the decrypted public note.
2. **Given** a note exists but is private, **When** the public endpoint is called, **Then** the system returns `Note not found`.
3. **Given** the note does not exist, **When** the public endpoint is called, **Then** the system returns `Note not found`.

---

### User Story 4 - Update and remove owned notes (Priority: P1)

An authenticated user needs to edit or remove only their own notes.

**Why this priority**: Users must control their content while ownership prevents cross-user modification or deletion.

**Independent Test**: Can be validated by updating and deleting an owned note, then attempting the same operations against another user's note and confirming the other user's note is unaffected.

**Acceptance Scenarios**:

1. **Given** a user owns a note, **When** title or content is updated, **Then** changed text fields are encrypted before persistence and decrypted in the response.
2. **Given** a user owns a note, **When** `isPublic` is updated, **Then** the visibility flag is changed without requiring title or content changes.
3. **Given** a user attempts to update another user's note, **When** the update is submitted, **Then** the system returns `Note not found`.
4. **Given** a user removes an owned note, **When** deletion succeeds, **Then** the system returns `{ success: true }`.
5. **Given** a user attempts to remove another user's note or a missing note, **When** deletion runs, **Then** the system returns `Note not found`.

### Edge Cases

- All private note endpoints require a valid JWT and active persisted session.
- Public reads are intentionally unauthenticated but filter by `isPublic: true`.
- Note ownership is always derived from the authenticated token and stored as `userId`.
- The API response for notes omits `userId`.
- Stored note title and content use the format `ivHex:authTagHex:encryptedHex`.
- Decryption validates encrypted format, IV length, and auth tag length.
- If current decryption fails, the service attempts legacy compatibility decryption before failing.
- Decryption failure logs technical diagnostics without logging decrypted note content.
- Encryption depends on the configured `ENCRYPTION_KEY`, fixed salt, fixed AAD, and the stored encrypted format remaining consistent.
- The current implementation does not include pagination for note listing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose authenticated note creation at `POST /api/notes`.
- **FR-002**: Note creation MUST require `title` as a non-empty string up to 120 characters.
- **FR-003**: Note creation MUST require `content` as a non-empty string up to 5000 characters.
- **FR-004**: Note creation MUST accept optional boolean `isPublic`.
- **FR-005**: Note creation MUST default `isPublic` to false when omitted.
- **FR-006**: Note ownership MUST be derived from the authenticated user identifier and not from client payload.
- **FR-007**: Note title and content MUST be encrypted before persistence.
- **FR-008**: Note creation MUST return the normalized note response with decrypted title and content.
- **FR-009**: The system MUST expose authenticated note listing at `GET /api/notes`.
- **FR-010**: Note listing MUST filter by authenticated `userId`.
- **FR-011**: Note listing MUST sort by creation time descending.
- **FR-012**: Note listing MUST decrypt title and content before returning each note.
- **FR-013**: The system MUST expose authenticated private note retrieval at `GET /api/notes/:id`.
- **FR-014**: Private note retrieval MUST query by note ID and authenticated `userId`.
- **FR-015**: Private note retrieval MUST return `Note not found` when the note does not exist or belongs to another user.
- **FR-016**: The system MUST expose unauthenticated public note retrieval at `GET /api/notes/public/:id`.
- **FR-017**: Public note retrieval MUST query by note ID and `isPublic: true`.
- **FR-018**: Public note retrieval MUST return `Note not found` for missing or private notes.
- **FR-019**: The system MUST expose authenticated note update at `PUT /api/notes/:id`.
- **FR-020**: Note update MUST accept optional title up to 120 characters, optional content up to 5000 characters, and optional boolean `isPublic`.
- **FR-021**: Note update MUST query by note ID and authenticated `userId`.
- **FR-022**: Note update MUST encrypt title when title is provided.
- **FR-023**: Note update MUST encrypt content when content is provided.
- **FR-024**: Note update MUST update visibility when `isPublic` is provided.
- **FR-025**: Note update MUST return the normalized note response with decrypted title and content.
- **FR-026**: The system MUST expose authenticated note deletion at `DELETE /api/notes/:id`.
- **FR-027**: Note deletion MUST delete by note ID and authenticated `userId`.
- **FR-028**: Note deletion MUST return `Note not found` when no owned note is deleted.
- **FR-029**: Successful note deletion MUST return `{ success: true }` as the domain payload.
- **FR-030**: Notes MUST be stored in the `Notes` collection.
- **FR-031**: Note records MUST include encrypted title, encrypted content, public visibility, owner identifier, creation timestamp, and update timestamp.
- **FR-032**: Note encryption MUST use authenticated reversible encryption because the original text must be shown later.
- **FR-033**: Note encryption MUST use a derived 32-byte key, 16-byte IV, 16-byte authentication tag, fixed AAD `additional-data`, and configured encryption secret.
- **FR-034**: Persisted encrypted note fields MUST use `ivHex:authTagHex:encryptedHex`.
- **FR-035**: Missing encryption configuration MUST fail early during service initialization.
- **FR-036**: Decryption failures MUST return a generic decryption error and MUST NOT expose note content.

### Key Entities *(include if feature involves data)*

- **Note**: User-owned text record with encrypted title, encrypted content, visibility flag, owner identifier, and timestamps.
- **Encrypted Note Field**: Stored text value containing IV, authentication tag, and encrypted payload.
- **Public Note**: A note intentionally marked public and readable without authentication through the public endpoint.
- **Private Note**: A note readable, updateable, and removable only by its authenticated owner.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of persisted note titles and contents are stored encrypted, not as plain text.
- **SC-002**: 100% of private note reads, updates, and deletions filter by authenticated owner.
- **SC-003**: 100% of public unauthenticated reads return data only for notes marked public.
- **SC-004**: 100% of note responses return readable title/content while omitting owner identifiers.
- **SC-005**: 100% of failed ownership checks return not found behavior rather than exposing another user's resource details.

## Assumptions

- This is a retroactive specification for behavior already implemented in the current project.
- `tasks.md` is intentionally omitted for this retroactive documentation pass.
- Existing stored notes may require legacy decryption compatibility.
- Public note visibility is controlled only by the `isPublic` flag.
- Existing automated test creation or execution is outside this specification.
