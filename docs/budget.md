## Budget Specification

This document defines the Budget domain migrated from Organizando Bolso legacy.

---

## 1) Data Model

MongoDB collection: `Budgets`

Fields:

- `id` (ObjectId)
- `user_id` (ObjectId, owner, persisted key)
- `name` (string, required)
- `amout` (decimal, required, persisted key kept for legacy compatibility)
- `icon` (string, required)
- `color` (string, required)
- `created_at` (Date, persisted key)
- `updated_at` (Date, persisted key)

Legacy compatibility:

- API response contract exposes normalized keys (`userId`, `amount`, `createdAt`, `updatedAt`) while storage keeps legacy persisted keys.

---

## 2) API Endpoints

External API (NestJS):

- `GET /api/budgets` (list authenticated user budgets)
- `GET /api/budgets/:id` (get one budget by id and owner)
- `POST /api/budgets` (create budget for authenticated user)
- `PUT /api/budgets/:id` (update budget by id and owner)
- `DELETE /api/budgets/:id` (delete budget by id and owner)

Next.js BFF internal routes:

- `GET /api/budgets`
- `POST /api/budgets`
- `GET /api/budgets/:id`
- `PUT /api/budgets/:id`
- `DELETE /api/budgets/:id`

---

## 3) Security Rules

- All Budget endpoints require authenticated session.
- User can only access own budgets.
- Access to budget from another user must not expose resource details.

---

## 4) Business Rules

- `userId` is always derived from authenticated token, never trusted from client payload.
- `amount` must be persisted as numeric value.
- Dashboard summary and budget overview are computed from Budget + Expense data in frontend.

---

## 5) Financial UI Integration

Budget is used in two pages:

- `Dashboard`: budget overview cards and financial summary.
- `Financial`: CRUD list and forms for budget management.

Financial page layout requirements:

- Order must be:
  1. Budget creation form
  2. Budgets listing
  3. Expanse creation form
  4. Expanses listing

Dashboard layout requirements:

- Financial summary must be displayed in a top row with 3 cards (total budget, total spent, total remaining).
- Budget overview must be displayed below summary as a card grid.
- Each budget card must show: category name, budget amount, spent amount, remaining amount.
