# Security and Request Architecture

This document defines how authentication and requests must be handled securely.

---

## 1) Request Visibility

- All browser requests are visible in DevTools
- It is NOT possible to hide browser requests

---

## 2) Backend-Only Execution

Architecture:

Browser → Next.js Backend → External APIs

Responsibility split:

- Next.js backend:
  - Receives frontend requests
  - Stores token in HttpOnly cookie
  - Forwards token as Bearer to external API
- External API backend:
  - Connects to MongoDB
  - Signs and validates JWT
  - Validates session and business rules

Rules:

- Frontend must NOT call external APIs directly
- All calls must go through Next.js

---

## 3) Example Flow

Frontend:

```ts
fetch("/api/user")
```

Backend:

```ts
const token = cookies().get("auth_token")?.value

await fetch("https://external-api.com/user", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

---

## 4) JWT Handling

- Stored in HttpOnly cookie
- Not accessible via JavaScript
- Automatically sent to backend
- Signature validation is done only by external API

---

## 5) External API Communication

- Backend extracts token from cookie
- Sends token as Bearer
- External API is the only layer that accesses MongoDB

---

## 6) Security Rules

- Never store token in localStorage
- Never expose token to frontend
- Always validate on external API backend
- Always use HTTPS
- Use HttpOnly cookies

---

## 7) Security Model

- Payload is public
- Signature is private
- Security relies on:
  - Signature validation in external API
  - Session validation in external API
  - Token expiration

---

## 8) Key Principle

You do not hide requests  
You move logic to the backend