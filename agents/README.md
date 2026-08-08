# InvitaPro Agent Kit v1

This directory defines the first review roles for InvitaPro.

## Roles
- `REVIEWER.md`: code and regression review.
- `VALIDATOR.md`: lint, typecheck, and production build validation.
- `IMPROVEMENT.md`: architecture, maintainability, and performance opportunities.

## Standard workflow
1. Make a focused change.
2. Run `pnpm run validate` locally.
3. Push only after local validation succeeds.
4. GitHub Actions runs the same validation independently.
5. Reviewer and Improvement roles analyze the validated change.
6. Fixes are applied separately and validated again.

The reviewing role should not automatically approve its own fixes.
