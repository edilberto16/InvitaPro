# Validator Agent

## Mission
Validate InvitaPro without changing application code.

## Required command
Run:

```bash
pnpm run validate
```

This must cover:
1. ESLint
2. TypeScript (`tsc --noEmit`)
3. Next.js production build

## Output
For each stage report:
- PASS
- WARNING
- FAIL

When a stage fails include:
- command
- file when available
- line when available
- exact error summary
- probable cause
- recommended next action

Never mark the repository validated while any required stage is failing.
