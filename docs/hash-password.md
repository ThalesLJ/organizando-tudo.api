# User Password Hashing

## Overview

In `organizandotudo.api`, user passwords are not encrypted in a reversible way. They are protected using **bcrypt hashing**, which is intentionally **irreversible**.

This means:

- the API **never** stores plain-text passwords;
- the API **never** needs to decrypt passwords;
- for authentication, the API compares the provided password with the stored hash.

## Where this happens in the project

The password flow is centralized in `HashService`:

- `hash(value)` -> generates a hash using `bcryptjs`
- `verify(hash, plainValue)` -> validates the typed password against the stored hash

Main usage in the authentication module:

- `register` -> generates hash before saving user
- `login` -> compares provided password with stored hash
- `verifyCode` (password recovery) -> generates a new hash and updates password

## How the hash is generated

In the `hash` function, the project uses:

- `bcryptjs` library
- computational cost `saltRounds = 12`

Conceptually:

1. It receives the password in plain text (in memory only during the request).
2. bcrypt generates an internal salt and applies multiple derivation rounds.
3. It returns a hash string (bcrypt format) for database persistence.

Example bcrypt hash format:

`$2a$12$w6Q3...`

Basic interpretation:

- `$2a$` -> bcrypt variant
- `12` -> cost factor (salt rounds)
- remaining part -> encoded salt + hash

## How validation works (without decrypting)

During authentication (`login` and `validateUser`), the system:

1. Finds the user in the database.
2. Retrieves the hash stored in `user.password`.
3. Executes `bcrypt.compare(typedPassword, storedHash)`.
4. If it returns `true`, the password is correct.
5. If it returns `false`, it returns invalid credentials.

Important point: `compare` does **not decrypt** the hash. It recalculates internally and compares securely.

## Full system flows

### User registration

1. Client sends `username`, `email`, `password`.
2. API checks whether username/email already exists.
3. API generates bcrypt hash (`hash`).
4. API saves user with `password` already hashed.
5. API returns JWT token.

### User login

1. Client sends `email` or `username`, and `password`.
2. API finds user by email or username.
3. API compares password with `verify`.
4. If valid, it generates JWT.
5. If invalid, it returns `Unauthorized`.

### Password reset

1. User receives a verification code by email.
2. User sends code + new password.
3. API validates code and user.
4. API generates a new hash for the new password.
5. API updates `user.password` with the new hash.

## "Encryption" vs "Hashing" in the password context

For user passwords, the correct approach is **hashing**, not reversible encryption.

- **Hashing (bcrypt)**:
  - irreversible
  - ideal for passwords
  - comparison-based validation (`compare`)

- **Reversible encryption**:
  - has encrypt/decrypt
  - used when recovering original data is required
  - not recommended for password storage

## About "decrypting a password"

Technically, following security best practices:

- bcrypt password hashes **cannot be decrypted**;
- if there is a need to recover original text, then it is not password hashing, but another type of data using reversible encryption.

In the current project, this is already correct:

- passwords use bcrypt hashing (irreversible);
- sensitive note data uses reversible encryption methods (`encrypt` and `decrypt`).

## Security advantages of this approach

- reduces database leak impact (does not directly expose original passwords);
- cracking cost is high because of `saltRounds = 12`;
- avoids dependency on a key to "decrypt passwords";
- clearly separates concepts: password hashing vs business data encryption.

## Limits and attention points

- hashing does not prevent weak passwords; strong password policy is still required;
- cost factor should be periodically re-evaluated as hardware evolves;
- login attempt limits and monitoring help against online brute force;
- logs must not store plain-text passwords.

## Final technical summary

- In this system, a user password:
  - is plain text only during the request;
  - is converted to bcrypt hash before persistence;
  - is never decrypted;
  - is validated through `bcrypt.compare`.

- Therefore:
  - there is a process to "protect password" (hashing);
  - there is no process to "decrypt password";
  - reversible encryption exists only for other application data.
