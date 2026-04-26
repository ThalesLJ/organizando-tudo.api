# Notes Encryption and Decryption

## Overview

In `organizandotudo.api`, note text fields (`title` and `content`) are protected with reversible encryption.

This means:

- when saving to the database, the text is encrypted;
- when returning through the API, the text is decrypted;
- unlike passwords, here the system needs to recover the original value.

## Where this happens in the project

The logic is split across two points:

- `src/modules/common/services/encryption.service.ts`
  - `encryptData(data: string): string`
  - `decryptData(encryptedData: string): string`
  - aliases used in the project: `encrypt()` and `decrypt()`

- `src/modules/notes/notes.service.ts`
  - calls `encrypt()` before persisting `title` and `content`;
  - calls `decrypt()` before responding to the client.

## Algorithm and parameters used

In `EncryptionService`, the main parameters are:

- algorithm: `aes-256-gcm`
- derived key length: `32` bytes
- IV length: `16` bytes
- expected tag length: `16` bytes

The key is not directly loaded from `.env`. It is derived at runtime:

1. reads `ENCRYPTION_KEY` from configuration;
2. executes `crypto.scryptSync(secret, 'salt', 32)`;
3. uses the resulting buffer as the symmetric key.

If `ENCRYPTION_KEY` is missing, the service throws: `ENCRYPTION_KEY not configured`.

## Notes encryption logic

When a note is created or updated, text fields are processed by `encrypt()`.

Internal `encryptData` flow:

1. Derives the key through `getKey()`.
2. Generates a random IV using `crypto.randomBytes(16)`.
3. Creates the cipher with `crypto.createCipher('aes-256-gcm', key)`.
4. Sets fixed AAD: `additional-data`.
5. Encrypts the text (`utf8` -> `hex`).
6. Collects auth tag with `getAuthTag()`.
7. Returns string in format: `ivHex:tagHex:encryptedHex`.

Persisted format in MongoDB for `title` and `content`:

`<iv_in_hex>:<tag_in_hex>:<encrypted_content_in_hex>`

## Notes decryption logic

Whenever the API needs to return note data to the client, it runs `decrypt()`.

Internal `decryptData` flow:

1. Splits the stored string by `:`.
2. Validates that there are 3 parts.
3. Rebuilds `iv` and `tag` from hex.
4. Derives the key again using `getKey()`.
5. Creates decipher with `crypto.createDecipher('aes-256-gcm', key)`.
6. Sets the same fixed AAD: `additional-data`.
7. Applies `setAuthTag(tag)`.
8. Decrypts payload (`hex` -> `utf8`).
9. Returns original text.

If any step fails, the service throws: `Data decryption failed`.

## Full note lifecycle in the system

### Creation

In `NotesService.create`:

1. Receives `title`, `content`, `isPublic`.
2. Encrypts `title` and `content`.
3. Persists only encrypted values in the database.
4. Returns the saved document.

### Listing

In `NotesService.findAll`:

1. Reads documents from the database.
2. For each note, decrypts `title` and `content`.
3. Returns paginated response with readable text to the client.

### Find by ID

In `NotesService.findOne`:

1. Finds the user's note.
2. Decrypts text fields.
3. Returns decrypted data.

### Update

In `NotesService.update`:

1. Validates that the note exists.
2. If `title` is present in payload, encrypts it again.
3. If `content` is present in payload, encrypts it again.
4. Updates in the database.
5. Decrypts before building response.

### Public/private toggle

In `NotesService.togglePublic`:

1. Updates only `isPublic`.
2. Keeps `title` and `content` as stored in the database.
3. Decrypts text fields for the response.

## Data structure in the database

Note schema (`src/modules/notes/schemas/note.schema.ts`):

- `title: string` -> encrypted value in textual format
- `content: string` -> encrypted value in textual format
- `isPublic: boolean`
- `userId`
- `deletedAt`, `createdAt`, `updatedAt`

Even though they are `string`, `title` and `content` are not stored as plain text.

## Relationship between key, read path, and consistency

To decrypt correctly, the system must keep consistency in:

- same `ENCRYPTION_KEY`;
- same key derivation process (`scryptSync` with the same fixed salt);
- same AAD (`additional-data`);
- preserved `iv:tag:encrypted` format.

Any change in these elements can prevent reading already stored notes.

## Behavior in case of error

`EncryptionService` encapsulates exceptions and returns generic errors:

- `Data encryption failed`
- `Data decryption failed`
- when decryption fails, the backend logs technical diagnostics (note id, field, part count, and hex format validation) to support investigation without exposing note content.

In practice, this covers scenarios such as:

- payload outside expected format;
- inconsistent key;
- corrupted data;
- failure in the cryptographic process.

## Difference from password flow

- Notes: reversible encryption (encrypt/decrypt), because the system needs to show original text.
- Passwords: irreversible hash (bcrypt), because the system should not recover original password.

## Final technical summary

- Note fields are encrypted in the write path (`create` and `update`).
- Note fields are decrypted in the read path (`findAll`, `findOne`, `togglePublic`, and `update` response).
- Persistence uses textual format composed of `iv`, `tag`, and encrypted payload.
- The process depends directly on `ENCRYPTION_KEY` and the same cryptographic configuration across the full data lifecycle.
