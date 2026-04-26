## Expanses Specification

This document defines the Expanses (Expenses) domain migrated from Organizando Bolso legacy.

---

## 1) Data Model

MongoDB collection: `Expenses`

Fields:

- `id` (ObjectId)
- `user_id` (ObjectId, owner, persisted key)
- `budget_id` (ObjectId reference to budget, persisted key)
- `name` (string, required)
- `amount` (decimal, required)
- `description` (string, optional)
- `color` (string, optional)
- `created_at` (Date, persisted key)
- `updated_at` (Date, persisted key)

Terminology:

- Legacy project uses `Expense/Expenses` in code.
- Current documentation keeps `Expanses` naming to match requested feature naming.
- API response contract exposes normalized keys (`userId`, `budgetId`, `createdAt`, `updatedAt`) while storage keeps legacy persisted keys.

---

## 2) API Endpoints

External API (NestJS):

- `GET /api/expenses` (list authenticated user expenses)
- `GET /api/expenses/:id` (get one expense by id and owner)
- `POST /api/expenses` (create expense for authenticated user)
- `PUT /api/expenses/:id` (update expense by id and owner)
- `DELETE /api/expenses/:id` (delete expense by id and owner)

Next.js BFF internal routes:

- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/:id`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

---

## 3) Security Rules

- All Expanses endpoints require authenticated session.
- User can only access own expenses.
- Expanses of another user must not be exposed.

---

## 4) Business Rules

- `userId` is always derived from authenticated token.
- Expense creation/update requires `budgetId`, `name`, and `amount`.
- Legacy behavior does not enforce strict referential validation between `budgetId` and budget ownership on API layer.

---

## 5) Financial UI Integration

Expanses are used in:

- `Dashboard`: total spent, total remaining, and expenses shown in a flat card grid with category context per expense item.
- `Financial`: CRUD list and forms for expense management.

Financial page layout requirements:

- Keep flow after budgets sections.
- Expanse creation form must appear before expanses listing.
- New section labels in Financial must be translatable (`en`, `pt`, `es`).

Dashboard expenses layout requirements:

- Keep section title as "Expenses by Category".
- Display one card per expanse item (not grouped container blocks).
- Each expanse card must show: expanse name, budget/category name, description, and amount.
