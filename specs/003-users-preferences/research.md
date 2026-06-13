# Research: Users and Preferences

**Feature**: `003-users-preferences`
**Created**: 2026-06-12
**Status**: Done

## Purpose

Document the ambiguity review and decisions for the retroactive Users and Preferences specification.

## Resolved Questions

### Decision: Require current password for account-critical updates

**Resolution**: Username and email updates require the authenticated user's current password.

**Rationale**: Username and email changes are security-sensitive account operations and must re-verify the user's password before persistence.

### Decision: Invalidate session after profile changes

**Resolution**: Successful username or email changes invalidate the current session.

**Rationale**: Account-critical identity changes require re-authentication and align with the documented frontend warning that the user will be logged out.

### Decision: Send profile change notifications

**Resolution**: After a successful account update, the previous email receives a warning and the persisted email receives confirmation.

**Rationale**: Transactional notifications improve account security visibility and are already implemented through the centralized email service.

### Decision: Merge color preferences

**Resolution**: Submitted color fields are merged with existing saved fields; omitted fields are preserved.

**Rationale**: Partial updates should not erase existing customization.

### Decision: Restrict language values

**Resolution**: Language preference is limited to `en`, `pt`, and `es`.

**Rationale**: These are the implemented supported language values.

## Constitutional Alignment

- All endpoints are private and require active session validation.
- User responses omit passwords and sensitive internals.
- DTO validation defines account update, color, and language constraints.
- Email logic stays centralized in infrastructure.
- No automated test tasks or repository validation commands are introduced.

## Outcome

No unresolved ambiguity remains for this retroactive specification.
