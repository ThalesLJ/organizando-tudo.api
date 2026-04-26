# Authentication Flow Specification

This document describes the authentication flow using JWT tokens with server-side validation and single-session control.

The system uses a single active session per user and relies on JWT validation and database verification on every request.

Important architecture rule:

- MongoDB access is done only by the external API
- JWT signing and validation are done only by the external API
- Next.js does not connect to MongoDB
- Next.js does not generate or validate JWT signatures
- Next.js only proxies requests and stores token in HttpOnly cookie

---

## 1) Registration Flow

Step-by-step:

1. User provides:
   - username
   - email
   - password

2. Frontend sends request to Next.js:

POST /api/auth/register

```json
{
  "username": "Google",
  "email": "google@gmail.com",
  "password": "strongpassword"
}
```

3. Next.js backend:
   - Forwards request to external API `/api/auth/register`

4. External API backend:
   - Validates input
   - Checks if user already exists
   - Hashes password
   - Creates user in database

5. Response:

```json
{
  "success": true
}
```

---

## 2) Login Flow

Step-by-step:

1. User provides:
   - email or username
   - password
   - optional "keep me logged in"

2. Frontend sends to Next.js:

POST /api/auth/login

```json
{
  "identifier": "user@email.com_or_username",
  "password": "user_password",
  "keepLoggedIn": true
}
```

3. Next.js backend:

- Forwards request to external API `/api/auth/login`

4. External API backend:

- Validates credentials
- Generates:
  - sessionId
  - JWT containing:
    - username
    - sessionId
    - iat
    - exp

- Expiration:
  - 30 days if keepLoggedIn = true
  - 8 hours otherwise

- Signs token using secure secret

- Updates user document:
  - session.sessionId
  - session.tokenHash (hashed JWT)
  - session.expiresAt
  - session.isValid = true
  - lastLoginAt

5. External API response:

```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "username": "John"
    }
  }
}
```

6. Next.js sets token in HttpOnly cookie

---

## 3) Authenticated Request Flow

1. Client sends request (cookie automatically included)

2. Next.js backend:

- Extracts JWT from HttpOnly cookie
- Sends JWT as Bearer token to external API

3. External API backend:

- Validates signature
- Validates exp and iat
- Extracts username and sessionId

4. Fetch user from database

5. Validate:

- user exists
- user.isActive is true
- session.isValid is true
- session.sessionId matches token
- session.expiresAt is valid
- tokenHash matches token

6. If valid:
- Allow request

7. If invalid:
- Return 401

---

## 4) Session Control Rules

- Only one active session per user
- New login overwrites previous session
- Previous tokens become invalid

---

## 5) Logout Flow

1. Client sends:

POST /api/auth/logout

2. Next.js backend:

- Forwards request to external API `/api/auth/logout`

3. External API backend:

- session.isValid = false
- clears sessionId and tokenHash

4. Next.js clears cookie

---

## 6) Password Recovery Flow

### Step 1: Request Code

POST /api/auth/send-code

```json
{
  "email": "your-email@outlook.com"
}
```

Behavior in Next.js:

- Always return success
- Forwards request to external API `/api/auth/send-code`

Behavior in external API:

- Always returns success
- If user exists:
  - Generates code
  - Stores code hash in `Codes` collection
  - Sends email

---

### Step 2: Verify Code

POST /api/auth/verify-code

```json
{
  "code": "373882",
  "password": "Strong@Password_123"
}
```

Next.js backend:

- Forwards request to external API `/api/auth/verify-code`

External API backend:

- Validates code
- Updates password
- Invalidates session
- Removes used code from `Codes` collection

---

## 7) JWT Structure

JWT format:

header.payload.signature

### Header (public)

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload (public)

```json
{
  "username": "john_doe",
  "sessionId": "uuid",
  "iat": 1710000000,
  "exp": 1710003600
}
```

Rules:

- Do not store sensitive data
- Payload is readable (Base64)

### Signature (private)

- Generated and validated only by external API secret
- Ensures integrity

---

## 8) Route Access Control

### Public Routes (no authentication required)

These routes must be accessible without a valid session:

- /login
- /register
- /recover (password recovery)

---

### Private Routes (authentication required)

These routes must require a valid session and authenticated user:

- /notes (list notes)
- /add-note (create note)
- /edit-note (edit note)
- /settings

Rules:

- If user is not authenticated:
  - Redirect to /login
- If session is invalid or expired:
  - Redirect to /login

---

## 9) Summary Flow

Register → Next.js forwards → external API creates user  
Login → Next.js forwards → external API generates token/session → Next.js sets HttpOnly cookie  
Request → Next.js forwards with Bearer token → external API validates and returns result  
Invalid token/session → external API returns 401  
Logout → Next.js forwards → external API invalidates session → Next.js clears cookie  
Password reset → Next.js forwards → external API resets password and invalidates session  