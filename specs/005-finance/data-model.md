# Data Model: Finance

**Feature**: `005-finance`
**Created**: 2026-06-12
**Status**: Done

## Entities

### Budget

Stored in the `Budgets` collection.

**Persisted fields**:

- `_id`
- `user_id`
- `name`
- `amout`
- `icon`
- `color`
- `created_at`
- `updated_at`

**Public response fields**:

- `id`
- `userId`
- `name`
- `amount`
- `icon`
- `color`
- `createdAt`
- `updatedAt`

**Rules**:

- `user_id` is derived from the authenticated user.
- `amout` stores the public `amount` value for legacy compatibility.
- Reads, updates, and deletes filter by `_id` and `user_id`.

### Expense

Stored in the `Expenses` collection.

**Persisted fields**:

- `_id`
- `user_id`
- `budget_id`
- `name`
- `amount`
- `description`
- `color`
- `created_at`
- `updated_at`

**Public response fields**:

- `id`
- `userId`
- `budgetId`
- `name`
- `amount`
- `description`
- `color`
- `createdAt`
- `updatedAt`

**Rules**:

- `user_id` is derived from the authenticated user.
- `budget_id` stores the submitted budget identifier.
- Missing description defaults to an empty string.
- Missing color defaults to `#8b5cf6`.
- Reads, updates, and deletes filter by `_id` and `user_id`.

## DTO Contracts

### Create Budget Request

- `name`: Required non-empty string, up to 120 characters.
- `amount`: Required number, minimum 0.
- `icon`: Required non-empty string, up to 60 characters.
- `color`: Required hexadecimal color.

### Update Budget Request

- `name`: Optional string, up to 120 characters.
- `amount`: Optional number, minimum 0.
- `icon`: Optional string, up to 60 characters.
- `color`: Optional hexadecimal color.

### Create Expense Request

- `budgetId`: Required non-empty string.
- `name`: Required non-empty string, up to 120 characters.
- `amount`: Required number, minimum 0.
- `description`: Optional string, up to 500 characters.
- `color`: Optional hexadecimal color.

### Update Expense Request

- `budgetId`: Optional string.
- `name`: Optional string, up to 120 characters.
- `amount`: Optional number, minimum 0.
- `description`: Optional string, up to 500 characters.
- `color`: Optional hexadecimal color.

## Relationships

- Budget belongs to one authenticated user through `user_id`.
- Expense belongs to one authenticated user through `user_id`.
- Expense references a budget identifier through `budget_id`.
- The current API does not strictly enforce same-owner budget reference validation during expense create/update.

## Derived Consumer Models

### Financial Summary

Computed by the web consumer from budget and expense lists.

- Total budget.
- Total spent.
- Total remaining.

### Budget Overview

Computed by the web consumer per budget.

- Budget category name.
- Budget amount.
- Spent amount.
- Remaining amount.

### Expense Card

Rendered by the web consumer per expense.

- Expense name.
- Budget/category context.
- Description.
- Amount.
