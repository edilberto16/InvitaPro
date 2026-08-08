# InvitaPro Agent Rules

## Project
InvitaPro is a Next.js application for creating, managing, publishing, and validating digital invitations.

## Runtime and package manager
- Node.js: 22.x
- Package manager: pnpm 11.13.1
- Always use pnpm. Do not use npm or yarn.

## Required validation
After code changes, run:

```bash
pnpm run validate
```

That command must execute, in order:
1. ESLint
2. TypeScript type checking
3. Production build

A change is not considered validated if any stage fails.

## Critical product areas
Treat these as regression-sensitive:
- Admin
- Mi Cuenta / client area
- Studio / visual editor
- Public invitations
- Templates
- RSVP
- Guests
- Check-in
- Invitation modalities

## Review rules
Look for:
- TypeScript and React errors
- Next.js routing/rendering issues
- stale or duplicated state
- preview/public-view inconsistencies
- duplicated business logic
- dead code and unused dependencies
- authorization mistakes
- unsafe input handling
- accidental secret exposure
- unnecessary renders or network calls
- regressions between Admin and Client

## UI rules
When UI changes are involved, verify:
- mobile and desktop behavior
- overflow and clipping
- spacing and readability
- Studio preview behavior
- published invitation behavior
- template consistency between Admin and Client

## Safety
- Never commit .env files or credentials.
- Do not perform destructive database migrations automatically.
- Do not delete production data.
- Do not make unrelated refactors while fixing a focused issue.

## Change discipline
Before a substantial architecture change:
1. Explain the problem.
2. Identify affected files.
3. State the regression risk.
4. Propose the smallest safe solution.

Prefer small, reviewable changes.

## Documentation
Keep README.md and CHANGELOG.md current for meaningful completed changes.
