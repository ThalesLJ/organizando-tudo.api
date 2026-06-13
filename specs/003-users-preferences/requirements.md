# Requirements Checklist: Users and Preferences

**Purpose**: Validate that the retroactive Users and Preferences artifact set follows the constitution and captures implemented behavior.
**Created**: 2026-06-12
**Feature**: [spec.md](./spec.md)

## Artifact Completeness

- [x] REQ001 `spec.md` exists and has `Status: Done`.
- [x] REQ002 `research.md` exists and resolves all ambiguity.
- [x] REQ003 `plan.md` exists and documents the technical plan.
- [x] REQ004 `data-model.md` exists and documents entities and DTO contracts.
- [x] REQ005 `requirements.md` exists in the feature root.
- [x] REQ006 `tasks.md` is intentionally not generated for this retroactive pass.

## Constitutional Validation

- [x] REQ007 User module boundaries are documented.
- [x] REQ008 DTO validation is documented for profile, colors, and language.
- [x] REQ009 Authentication and session requirements are documented for every endpoint.
- [x] REQ010 Sensitive user fields are excluded from public contracts.
- [x] REQ011 Session invalidation after account-critical update is documented.
- [x] REQ012 Manual validation is documented instead of automated test tasks.
- [x] REQ013 Artifact content is written in English.

## Behavioral Coverage

- [x] REQ014 Authenticated profile retrieval is covered.
- [x] REQ015 Profile update with current password is covered.
- [x] REQ016 Username uniqueness is covered.
- [x] REQ017 Email uniqueness and lowercase normalization are covered.
- [x] REQ018 Profile-change email notifications are covered.
- [x] REQ019 Color preference merge behavior is covered.
- [x] REQ020 Language allow-list behavior is covered.

## Notes

- The documented color set includes the implemented language switcher color fields.
