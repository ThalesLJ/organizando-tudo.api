# Feature Specification: Finance

**Feature Branch**: `[005-finance]`

**Created**: 2026-06-12

**Status**: Done

**Input**: Retroactive specification generated from the implemented budgets and expenses modules, Domain Map, `docs/budget.md`, `docs/expanses.md`, and `docs/security.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage owned budgets (Priority: P1)

An authenticated user needs to create, list, read, update, and delete only their own budget categories or spending limits.

**Why this priority**: Budgets are the foundation for financial organization and ownership isolation.

**Independent Test**: Can be validated by creating budgets for two users and confirming each authenticated user can operate only on their own records.

**Acceptance Scenarios**:

1. **Given** a valid authenticated user submits a budget name, amount, icon, and color, **When** `POST /api/budgets` is called, **Then** the system creates a budget owned by that user.
2. **Given** a user has budgets, **When** `GET /api/budgets` is called, **Then** the system returns only that user's budgets ordered newest first.
3. **Given** a user requests one owned budget by ID, **When** `GET /api/budgets/:id` is called, **Then** the system returns the normalized budget response.
4. **Given** a user updates an owned budget, **When** `PUT /api/budgets/:id` is called with valid fields, **Then** only the submitted fields are changed.
5. **Given** a user deletes an owned budget, **When** `DELETE /api/budgets/:id` is called, **Then** the system deletes it and returns a success domain result.
6. **Given** a budget belongs to another user, **When** a user attempts to read, update, or delete it, **Then** the system returns `Budget not found`.

---

### User Story 2 - Manage owned expenses (Priority: P1)

An authenticated user needs to create, list, read, update, and delete their own expenses associated with budget identifiers.

**Why this priority**: Expenses are required to calculate spent and remaining values in the financial experience.

**Independent Test**: Can be validated by creating expenses for two users and confirming each authenticated user can operate only on their own expense records.

**Acceptance Scenarios**:

1. **Given** a valid authenticated user submits budget ID, name, and amount, **When** `POST /api/expenses` is called, **Then** the system creates an expense owned by that user.
2. **Given** description is omitted, **When** an expense is created, **Then** the system persists an empty description.
3. **Given** color is omitted, **When** an expense is created, **Then** the system persists the default color `#8b5cf6`.
4. **Given** a user has expenses, **When** `GET /api/expenses` is called, **Then** the system returns only that user's expenses ordered newest first.
5. **Given** a user requests one owned expense by ID, **When** `GET /api/expenses/:id` is called, **Then** the system returns the normalized expense response.
6. **Given** a user updates an owned expense, **When** `PUT /api/expenses/:id` is called with valid fields, **Then** only submitted fields are changed.
7. **Given** a user deletes an owned expense, **When** `DELETE /api/expenses/:id` is called, **Then** the system deletes it and returns a success domain result.
8. **Given** an expense belongs to another user, **When** a user attempts to read, update, or delete it, **Then** the system returns `Expense not found`.

---

### User Story 3 - Preserve legacy persistence while exposing normalized contracts (Priority: P1)

API consumers need camelCase public contracts while the database preserves legacy field names migrated from the previous financial system.

**Why this priority**: Compatibility with existing persisted data must not leak legacy storage naming into the external API contract.

**Independent Test**: Can be validated by creating budgets and expenses, inspecting persisted field names, and comparing them with API response field names.

**Acceptance Scenarios**:

1. **Given** a budget is persisted, **When** the database document is inspected, **Then** owner is stored as `user_id`, amount is stored as `amout`, and timestamps use `created_at` and `updated_at`.
2. **Given** a budget is returned through the API, **When** the response is inspected, **Then** owner is `userId`, amount is `amount`, and timestamps are `createdAt` and `updatedAt`.
3. **Given** an expense is persisted, **When** the database document is inspected, **Then** owner is `user_id`, budget reference is `budget_id`, and timestamps use `created_at` and `updated_at`.
4. **Given** an expense is returned through the API, **When** the response is inspected, **Then** owner is `userId`, budget reference is `budgetId`, and timestamps are `createdAt` and `updatedAt`.

---

### User Story 4 - Feed financial dashboard and management views (Priority: P2)

The consuming web application needs budget and expense base data to compute dashboard summaries and render financial management screens.

**Why this priority**: The current API intentionally exposes base records while the web consumer computes dashboard aggregates.

**Independent Test**: Can be validated by fetching budgets and expenses, then manually computing total budget, total spent, remaining amount, and per-budget display values in the consuming application.

**Acceptance Scenarios**:

1. **Given** the web dashboard has budget and expense data, **When** it computes the summary, **Then** it can display total budget, total spent, and total remaining.
2. **Given** the web dashboard renders budget overview cards, **When** budgets and expenses are combined, **Then** each budget card can show category name, budget amount, spent amount, and remaining amount.
3. **Given** the web dashboard renders expenses by category, **When** expenses are displayed, **Then** each expense card can show expense name, budget/category context, description, and amount.
4. **Given** the financial management page renders forms and lists, **When** the page is ordered, **Then** it shows budget creation, budgets listing, expense creation, and expenses listing in that order.

### Edge Cases

- All finance endpoints require a valid JWT and active persisted session.
- Budget and expense ownership always comes from the authenticated token, never from client payload.
- Budget amount is submitted and returned as `amount` but persisted as legacy `amout`.
- Expense `budgetId` is converted to a persisted budget reference field named `budget_id`.
- The current API does not strictly validate that an expense `budgetId` belongs to the same user before creating or updating an expense.
- The current API does not expose aggregated financial dashboard endpoints.
- The documentation uses `Expanses` in some legacy naming, while current code and API contracts use `Expenses`.
- Missing budget or expense records and records owned by another user produce not-found behavior without exposing ownership details.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose authenticated budget creation at `POST /api/budgets`.
- **FR-002**: Budget creation MUST require `name` as a non-empty string up to 120 characters.
- **FR-003**: Budget creation MUST require `amount` as a number greater than or equal to 0.
- **FR-004**: Budget creation MUST require `icon` as a non-empty string up to 60 characters.
- **FR-005**: Budget creation MUST require `color` as a hexadecimal color.
- **FR-006**: Budget ownership MUST be derived from the authenticated user.
- **FR-007**: Budget amount MUST be persisted in the legacy `amout` field.
- **FR-008**: The system MUST expose authenticated budget listing at `GET /api/budgets`.
- **FR-009**: Budget listing MUST filter by authenticated owner and sort by `created_at` descending.
- **FR-010**: The system MUST expose authenticated budget retrieval at `GET /api/budgets/:id`.
- **FR-011**: Budget retrieval MUST query by budget ID and authenticated owner.
- **FR-012**: The system MUST expose authenticated budget update at `PUT /api/budgets/:id`.
- **FR-013**: Budget update MUST accept optional `name`, `amount`, `icon`, and `color` using the same validation constraints as creation where applicable.
- **FR-014**: Budget update MUST update only submitted fields.
- **FR-015**: Budget update MUST write submitted `amount` values to the legacy `amout` field.
- **FR-016**: The system MUST expose authenticated budget deletion at `DELETE /api/budgets/:id`.
- **FR-017**: Budget deletion MUST delete by budget ID and authenticated owner.
- **FR-018**: Missing or cross-owner budget access MUST return `Budget not found`.
- **FR-019**: Successful budget deletion MUST return `{ success: true }` as the domain payload.
- **FR-020**: Budget responses MUST normalize `_id` to `id`, `user_id` to `userId`, `amout` to `amount`, `created_at` to `createdAt`, and `updated_at` to `updatedAt`.
- **FR-021**: Budgets MUST be stored in the `Budgets` collection with `user_id`, `name`, `amout`, `icon`, `color`, `created_at`, and `updated_at`.
- **FR-022**: The system MUST expose authenticated expense creation at `POST /api/expenses`.
- **FR-023**: Expense creation MUST require `budgetId` as a non-empty string.
- **FR-024**: Expense creation MUST require `name` as a non-empty string up to 120 characters.
- **FR-025**: Expense creation MUST require `amount` as a number greater than or equal to 0.
- **FR-026**: Expense creation MUST accept optional `description` up to 500 characters.
- **FR-027**: Expense creation MUST accept optional `color` as a hexadecimal color.
- **FR-028**: Expense creation MUST default missing `description` to an empty string.
- **FR-029**: Expense creation MUST default missing `color` to `#8b5cf6`.
- **FR-030**: Expense ownership MUST be derived from the authenticated user.
- **FR-031**: Expense creation MUST persist the submitted budget identifier in `budget_id`.
- **FR-032**: The system MUST expose authenticated expense listing at `GET /api/expenses`.
- **FR-033**: Expense listing MUST filter by authenticated owner and sort by `created_at` descending.
- **FR-034**: The system MUST expose authenticated expense retrieval at `GET /api/expenses/:id`.
- **FR-035**: Expense retrieval MUST query by expense ID and authenticated owner.
- **FR-036**: The system MUST expose authenticated expense update at `PUT /api/expenses/:id`.
- **FR-037**: Expense update MUST accept optional `budgetId`, `name`, `amount`, `description`, and `color` using validation constraints defined for expense payloads.
- **FR-038**: Expense update MUST update only submitted fields.
- **FR-039**: Expense update MUST persist submitted `budgetId` values in `budget_id`.
- **FR-040**: The system MUST expose authenticated expense deletion at `DELETE /api/expenses/:id`.
- **FR-041**: Expense deletion MUST delete by expense ID and authenticated owner.
- **FR-042**: Missing or cross-owner expense access MUST return `Expense not found`.
- **FR-043**: Successful expense deletion MUST return `{ success: true }` as the domain payload.
- **FR-044**: Expense responses MUST normalize `_id` to `id`, `user_id` to `userId`, `budget_id` to `budgetId`, `created_at` to `createdAt`, and `updated_at` to `updatedAt`.
- **FR-045**: Expenses MUST be stored in the `Expenses` collection with `user_id`, `budget_id`, `name`, `amount`, `description`, `color`, `created_at`, and `updated_at`.
- **FR-046**: The API MUST provide base budget and expense data for dashboard calculations but MUST NOT expose an aggregate dashboard endpoint in the current scope.
- **FR-047**: The consuming web financial page SHOULD order sections as budget creation form, budgets listing, expense creation form, and expenses listing.
- **FR-048**: The consuming web dashboard SHOULD compute total budget, total spent, total remaining, per-budget spent, and per-budget remaining from budget and expense data.

### Key Entities *(include if feature involves data)*

- **Budget**: User-owned financial category or spending limit stored with legacy persistence fields and normalized public contract fields.
- **Expense**: User-owned spending record associated with a budget identifier and normalized public contract fields.
- **Financial Summary**: Consumer-computed totals for budget amount, spent amount, and remaining amount.
- **Budget Overview Card**: Consumer display model combining a budget with related expenses to show category, budget amount, spent amount, and remaining amount.
- **Expense Card**: Consumer display model showing expense name, budget/category context, description, and amount.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of budget operations filter by authenticated owner.
- **SC-002**: 100% of expense read, update, and delete operations filter by authenticated owner.
- **SC-003**: 100% of budget responses expose `amount` while preserving persisted `amout`.
- **SC-004**: 100% of expense responses expose `budgetId` while preserving persisted `budget_id`.
- **SC-005**: 100% of missing or cross-owner finance resource requests return not-found behavior.
- **SC-006**: The web consumer can compute total budget, total spent, and total remaining using only the budget and expense list endpoints.

## Assumptions

- This is a retroactive specification for behavior already implemented in the current project.
- `tasks.md` is intentionally omitted for this retroactive documentation pass.
- Strict validation that an expense budget reference belongs to the same user is documented as not implemented in the current behavior.
- Aggregated dashboard endpoints are outside the current API scope.
- Existing automated test creation or execution is outside this specification.
