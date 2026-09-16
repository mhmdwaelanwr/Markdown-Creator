# Markdown Creator — React Native Roadmap

This repository is being preserved in stages. The current priority is to keep the strongest React Native version safe, understandable, and easy to resume later rather than forcing a full rewrite or modernization in one pass.

## Phase 0 — Repository Baseline

- preserve the more developed React Native source
- remove embedded credentials and debug artifacts
- document the current architecture and project status
- harden `.gitignore`
- add repository-health checks
- keep framework history separate from the Flutter/Dart edition

## Phase 1 — Revalidate the Existing App

- run a clean dependency install on a current Node LTS release
- fix TypeScript errors
- consolidate duplicate ESLint configuration
- make Jest tests deterministic
- verify the web build
- verify the main editor, importer, generator, live preview, command palette, dialogs, and project state
- document which AI/Firebase/GitHub features are actually wired end-to-end

## Phase 2 — Runtime Configuration

- centralize external-service configuration
- add safe runtime configuration for GIPHY
- revalidate Gemini/AI settings
- revalidate Firebase authentication/data flows
- revalidate GitHub publishing/scanning flows
- ensure no credential is stored in source or logs

## Phase 3 — Dependency Modernization

- review React Native upgrade path
- review React/React Native Web compatibility
- update deprecated packages where justified
- remove unused dependencies
- add automated dependency/security review
- regenerate native projects only after the JavaScript/TypeScript baseline is stable

## Phase 4 — Product Polish

- finish visual-editor interaction issues
- improve drag/drop behavior across web and native
- refine live preview and empty/error states
- review localization coverage
- add accessible keyboard/touch interactions
- add screenshots and a short demo after the UI is stable

## Phase 5 — Release Direction

Choose deliberately between:

1. continuing this React Native edition as a maintained product, or
2. treating it as the historical React Native branch while future product work continues in the Flutter/Dart edition.

Do not merge both framework implementations into one repository only for cosmetic consolidation.
