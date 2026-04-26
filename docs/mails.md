# Email Service Specification

This document defines how email sending must be implemented in the system.

---

## 1) Overview

The system must support sending transactional emails for:

- password recovery
- account updates (email/username change)
- security notifications

All email operations must be executed by the backend (NestJS).

---

## 2) Email Provider

- Email delivery must use SMTP
- Provider: Google (Gmail SMTP)

---

## 3) Credentials Storage

SMTP credentials must NOT be stored in environment variables.

They must be stored in MongoDB in a dedicated collection:

Collection name: Settings

---

## 4) Settings Collection Structure

The Settings collection must follow this structure:

```json
{
  "key": "string",
  "value": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Rules

- Each credential must be stored as a separate document
- The "key" identifies the secret
- The "value" stores the secret value

---

## 5) Standard Keys

The following keys must be defined in the Settings collection:

- SMTP_HOST  
- SMTP_PORT  
- SMTP_USER  
- SMTP_PASS  
- SMTP_FROM  

Expected values:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=replace_with_password
SMTP_FROM=noreply@example.com
```

---

## 6) Access Control

- The Settings collection must NOT be exposed via any API endpoint
- There must be NO interface to edit these values from the application
- The only way to modify this data is directly in the database

---

## 7) Database Security

- Access to the database must be restricted
- Database access is allowed only through VPN

This ensures:

- Credentials are protected from external access
- Only authorized operators can modify sensitive data

---

## 8) Email Service Layer

Email sending must be handled by a dedicated service in the backend.

Responsibilities:

- Load SMTP credentials from database
- Configure SMTP transport
- Send emails

---

## 9) Usage Rules

- Email sending must be triggered only from backend services
- Controllers must not handle email logic directly
- All email logic must be centralized

---

## 10) Failure Handling

- Email failures must not expose sensitive information
- Errors should be logged internally
- The system should return a generic response to the client

---

## 11) Security Rules

- Credentials must never be hardcoded
- Credentials must never be exposed in logs
- Credentials must never be returned in responses
- Credentials must only be accessed server-side

---

## 12) Core Principle

Email infrastructure is a sensitive component.

All operations must be:

- secure
- isolated
- controlled exclusively by the backend