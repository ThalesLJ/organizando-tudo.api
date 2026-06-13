# Research: Finance

**Feature**: `005-finance`
**Created**: 2026-06-12
**Status**: Done

## Purpose

Document the ambiguity review and decisions for the retroactive Finance specification.

## Resolved Questions

### Decision: Preserve legacy persisted field names

**Resolution**: Budgets keep `user_id`, `amout`, `created_at`, and `updated_at`; expenses keep `user_id`, `budget_id`, `created_at`, and `updated_at`.

**Rationale**: The domain was migrated from legacy financial data, and compatibility with existing persisted field names is required.

### Decision: Expose normalized API contracts

**Resolution**: Public responses use `userId`, `amount`, `budgetId`, `createdAt`, and `updatedAt`.

**Rationale**: API consumers should receive idiomatic camelCase contracts while storage remains legacy-compatible.

### Decision: Enforce owner filtering on finance resources

**Resolution**: Budget and expense read/update/delete operations filter by authenticated owner.

**Rationale**: Financial records are private user data and must not reveal cross-user resource existence.

### Decision: Document current expense budget-reference limitation

**Resolution**: The current API records submitted `budgetId` but does not strictly validate that the budget belongs to the same user before expense creation or update.

**Rationale**: This is current implemented behavior and must be captured accurately for future audits.

### Decision: Keep dashboard aggregation outside current API scope

**Resolution**: The API exposes base budget and expense records; the web consumer computes dashboard summaries.

**Rationale**: No aggregate dashboard endpoint exists in the current API.

## Constitutional Alignment

- Finance endpoints are private and require active session validation.
- User-owned persistence queries include authenticated owner filtering where implemented.
- Public contracts are normalized and avoid database internals.
- Known current behavior around expense budget-reference validation is documented explicitly.
- No automated test tasks or repository validation commands are introduced.

## Outcome

No unresolved ambiguity remains for this retroactive specification.
