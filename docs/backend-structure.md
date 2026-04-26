# NestJS Architecture Specification

This document defines the architectural structure and development rules for the NestJS API.

The NestJS application is responsible for business logic, authentication, session control, and data persistence.

---

## 1) Architectural Role

The NestJS API is the core backend of the system.

Responsibilities:

- Handle authentication and authorization
- Generate and validate JWT tokens
- Manage user sessions
- Execute business rules
- Handle data persistence (MongoDB)
- Provide endpoints consumed by Next.js (BFF)

---

## 2) Architectural Pattern

The project follows a modular architecture with clear separation of responsibilities.

Key characteristics:

- Feature-based modular structure
- Separation between controllers, services, and infrastructure
- Centralized business logic in services
- Reusable infrastructure components

---

## 3) Application Structure

The application must be organized into:

- Modules (feature-based)
- Common layer
- Infrastructure layer
- Configuration layer

---

## 4) Modules

Each module represents a domain or feature.

Examples of domains:

- authentication
- users
- notes
- sessions

Each module must encapsulate:

- controllers
- services
- data access
- validation logic

Modules must remain independent and cohesive.

---

## 5) Controllers

Responsibilities:

- Handle incoming requests
- Validate input (DTOs)
- Call services

Constraints:

- Must not contain business logic
- Must not access database directly

---

## 6) Services

Responsibilities:

- Implement business logic
- Orchestrate operations
- Interact with data layer

Constraints:

- Must not handle HTTP concerns
- Must not depend on controllers

---

## 7) Data Layer

Responsible for:

- Database access (MongoDB)
- Data persistence and retrieval

Must be abstracted from business logic.

---

## 8) Infrastructure Layer

Responsible for:

- Database connection
- Cryptography (hashing)
- Email services
- External integrations

This layer must be reusable and isolated from business rules.

---

## 9) Authentication

Responsibilities:

- Generate JWT tokens
- Validate tokens
- Manage sessions
- Enforce single active session per user

Rules:

- JWT must be signed using a secure secret
- Sessions must be validated against database
- Tokens must not be trusted without session validation

---

## 10) Security Rules

- Never store sensitive data in JWT payload
- Always hash sensitive data (passwords, tokens)
- Always validate user identity before critical operations
- Invalidate sessions on:
  - logout
  - password change
  - credential updates

---

## 11) Validation

- All input must be validated using DTOs
- Use strict validation rules
- Reject invalid or malformed data

---

## 12) Error Handling

- Use centralized exception handling
- Do not expose internal errors
- Return standardized error responses

---

## 13) Environment Variables

- Sensitive values must be stored in environment variables
- Never expose secrets in code

---

## 14) Environment Security (Mandatory)

- No environment variable fallback is allowed
- No secret values may be hardcoded in the source code

Rules:

- Never define default values for secrets
- Never use patterns like:
  process.env.SECRET || "default_value"

- If a required environment variable is missing:
  - The application must fail immediately

This ensures:

- No accidental exposure of secrets
- No insecure configurations
- Strong security guarantees

---

## 15) Naming Convention (Mandatory)

All source code must be written in English.

This includes:

- variable names
- function names
- class names
- file names
- folder names
- constants
- types and interfaces

Rules:

- Do not use Portuguese (or any other language) in code
- Maintain consistency across modules

---

## 16) Core Principle

The NestJS API is the source of truth.

All business logic, validation, and security must be enforced here.

No critical logic should exist outside the backend.