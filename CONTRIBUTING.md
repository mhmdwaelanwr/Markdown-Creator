# Contributing

Keep `main` as the clean baseline and use focused branches/PRs for deeper work.

## Before a Change

Read `README.md`, `ROADMAP.md`, and `SECURITY.md`.

Prefer completing one real product concern at a time instead of adding architecture or dependencies only for appearance.

## Intended Checks

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run web:build
```

If an older dependency prevents a check from passing on a current toolchain, document the incompatibility and fix it in a focused modernization change rather than hiding the failure.

## Repository Hygiene

Do not commit generated output, dependency folders, local debug screenshots, editor metadata, signing files, service credentials, `.env` files, or real user data.

Keep the React Native and Flutter/Dart implementations as separate repositories unless there is a deliberate migration plan.
