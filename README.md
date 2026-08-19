# Organizando Tudo API

Organizando Tudo API is the high-performance NestJS backend for the Organizando Tudo ecosystem. It serves as the authoritative source of truth for business logic, user authentication, persisted session validation, encrypted note storage, financial management (budgets and expenses), transactional email notifications, and MongoDB persistence.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) 11
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Passport](https://www.passportjs.org/) and `@nestjs/jwt`
- **Validation**: [class-validator](https://github.com/typestack/class-validator) and [class-transformer](https://github.com/typestack/class-transformer)
- **Security & Cryptography**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for hashing, Node.js `crypto` for AES-256-GCM note encryption at rest
- **Email Delivery**: [Nodemailer](https://nodemailer.com/) with MongoDB-persisted secret resolution
- **Code Quality**: ESLint and Prettier

## Architecture

This application follows a **Modular Layered Architecture** with strict domain boundaries. Every feature module is self-contained with its own controllers, services, DTOs, and Mongoose schemas, while cross-cutting concerns reside in centralized common and infrastructure packages.

```text
HTTP Request -> Controller -> DTO Validation -> Guard / Decorator -> Service -> Mongoose Schema -> Response Interceptor -> Standard Envelope
```

### Architectural Highlights

- **Standard Response Envelope**: All API responses are uniformly wrapped by a global response interceptor (`{ success: true, data: ... }`) and errors are handled by a global exception filter (`{ success: false, error: { code, message }, timestamp, path }`).
- **Encrypted Notes at Rest**: Private notes are automatically encrypted using authenticated cryptographic ciphers before persistence to MongoDB and decrypted only when requested by authorized users.
- **Session-Validated Authentication**: Protected endpoints enforce both JWT token integrity and active persisted session validation in MongoDB, enabling immediate single-session revocation.
- **Isolated Secret Management**: Sensitive credentials (such as SMTP credentials) are stored securely in MongoDB and resolved at runtime via an isolated secrets service rather than static environment files.

## Project Structure

```text
organizando-tudo.api/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD deployment workflow for self-hosted Linux runner
├── .specify/                       # Spec Kit memory, configurations, and templates
│   └── memory/
│       └── constitution.md         # Project constitution and architectural principles
├── specs/                          # Specification-Driven Development feature specs
├── src/
│   ├── common/                     # Cross-cutting decorators, filters, guards, and interceptors
│   │   ├── decorators/             # Custom NestJS parameter decorators (e.g., CurrentUser)
│   │   ├── filters/                # Global HTTP exception filters
│   │   ├── guards/                 # JWT and session authentication guards
│   │   ├── interceptors/           # Global response envelope interceptors
│   │   └── interfaces/             # Shared TypeScript interfaces and contracts
│   ├── config/                     # Configuration schemas and environment validation
│   │   └── env.validation.ts       # Environment variable bootstrap validation
│   ├── infrastructure/             # Infrastructure services and external integrations
│   │   ├── crypto/                 # Cryptographic helpers (AES-256-GCM note encryption)
│   │   ├── email/                  # Nodemailer SMTP transactional email service
│   │   └── secrets/                # MongoDB-backed secret loader for SMTP credentials
│   ├── modules/                    # Domain feature modules
│   │   ├── auth/                   # Authentication, registration, login, and password recovery
│   │   ├── budgets/                # Budget planning and management
│   │   ├── expenses/               # Expense tracking and categorization
│   │   ├── health/                 # Operational health check endpoint
│   │   ├── notes/                  # Encrypted private notes and public note sharing
│   │   ├── sessions/               # Persisted user session lifecycle and token hashing
│   │   └── users/                  # User profile and UI preference persistence
│   ├── app.module.ts               # Root NestJS application module
│   └── main.ts                     # Application entry point, global pipes, and filters
├── .env.example                    # Template environment variables file
├── nest-cli.json                   # NestJS CLI configuration
├── package.json                    # Project metadata, dependencies, and npm scripts
├── README.md                       # Project documentation
├── tsconfig.build.json             # TypeScript production build configuration
└── tsconfig.json                   # TypeScript compiler configuration
```

## Environment Variables

Create a local `.env` file in the project root based on [`.env.example`](./.env.example):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/organizandotudo
JWT_SECRET=your-jwt-secret-key-min-32-chars
JWT_ISSUER=organizandotudo-api
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
```

### Variable Descriptions

- `PORT`: Port used by the NestJS API during local execution and under PM2 process management.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key used to sign and verify JWT authentication tokens.
- `JWT_ISSUER`: Issuer claim validated on incoming JWT tokens.
- `ENCRYPTION_KEY`: 256-bit cryptographic key used for encrypting note titles and content at rest.

> [!NOTE]
> SMTP credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) are not read from `.env`. They are securely loaded from MongoDB by the secrets infrastructure module.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 LTS or 22 LTS recommended)
- [MongoDB](https://www.mongodb.com/) (version 6.0+)
- `npm` (version 10+)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd organizando-tudo.api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your local environment:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

5. The API will listen on the port defined by `PORT`. The health endpoint will be available at [`http://localhost:3000/api/health`](http://localhost:3000/api/health).

## Available Scripts

```bash
# Starts the NestJS application
npm run start

# Starts the application in development watch mode
npm run start:dev

# Starts the application in debug watch mode
npm run start:debug

# Compiles the production build into dist/
npm run build

# Starts the compiled production application
npm run start:prod

# Runs ESLint across the codebase
npm run lint

# Formats source files with Prettier
npm run format
```

## Deployment

The project includes an automated deployment pipeline powered by GitHub Actions defined in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

- **Target Architecture**: Self-hosted Linux runner with PM2 process supervisor.
- **Workflow Triggers**: Automatic on push to `master`, or manual via `workflow_dispatch`.
- **Deployment Flow**:
  1. Synchronizes project source to active release directory (excluding build artifacts and cache).
  2. Injects production environment configuration from `API_ENV_FILE`.
  3. Installs clean production dependencies (`npm install`) and compiles the TypeScript project (`npm run build`).
  4. Restarts the PM2 process with zero-downtime reload under `API_PM2_APP_NAME`.
  5. Runs post-deployment external health check against `https://organizandotudo.api.thaleslj.com/api/health`.

## SDD (Microsoft Speckit)

This project is developed using **Specification-Driven Development (SDD)** with Microsoft Spec Kit. All features, architecture modifications, and bug fixes must originate from structured specifications before code changes are applied.

- **Agent Guidance & Setup**: [`AGENTS.md`](./AGENTS.md)
- **Project Constitution**: [`.specify/memory/constitution.md`](./.specify/memory/constitution.md)
- **Feature Specifications**: [`specs/`](./specs/)

Main Spec Kit commands:

```text
/speckit.constitution - Establish or update project principles
/speckit.specify      - Create a baseline feature specification
/speckit.plan         - Create technical implementation plan
/speckit.tasks        - Generate actionable task breakdown
/speckit.implement    - Execute implementation tasks
```