# Markdown Creator — React Native Edition

[![Repository Health](https://github.com/mhmdwaelanwr/Markdown-Creator/actions/workflows/repository-health.yml/badge.svg)](https://github.com/mhmdwaelanwr/Markdown-Creator/actions/workflows/repository-health.yml)

A cross-platform Markdown/README creation project built with React Native, React Native Web, JavaScript, and TypeScript. This repository preserves the more developed React Native edition separately from the newer Flutter/Dart edition.

## Project Status

**Clean public baseline / development snapshot.**

The goal of this repository stage is to preserve the strongest React Native version in a safe, understandable, build-oriented state so development can resume later without losing the original architecture or product work.

The codebase contains a visual editor, Markdown generation/import helpers, live-preview UI, command-palette and editor components, localization support, AI/GitHub/Firebase service layers, and a web entry point. Some integrations require runtime configuration and should be treated as development features until they are revalidated end-to-end.

## Stack

- React 18
- React Native 0.72
- React Native Web
- JavaScript + TypeScript
- Webpack
- Jest
- ESLint
- Firebase client libraries
- Google Generative AI SDK
- React Navigation
- i18next

The exact dependency baseline is pinned in `package-lock.json`.

## Main Areas

```text
Markdown-Creator/
├── App.js
├── index.js
├── index.web.js
├── src/
│   ├── components/     # Editor, dialogs, live preview and reusable UI
│   ├── config/         # Runtime integration configuration placeholders
│   ├── constants/      # Shared constants
│   ├── context/        # Shared application context
│   ├── core/           # Core helpers / editor logic
│   ├── hooks/          # React hooks
│   ├── l10n/           # Localization resources
│   ├── models/         # Project/editor models
│   ├── navigation/     # Navigation wiring
│   ├── platform/       # Platform-specific helpers
│   ├── providers/      # State providers
│   ├── screens/        # Main application screens
│   ├── services/       # Markdown, AI, GitHub, Firebase and utility services
│   └── theme/          # Shared visual theme
├── web/                # Web shell/assets
├── webpack.config.js
├── package.json
└── package-lock.json
```

## Setup

Use a modern Node.js LTS release and npm.

```bash
npm ci
```

Start Metro:

```bash
npm start
```

Web development:

```bash
npm run web
```

Android/iOS scripts are retained from the React Native project:

```bash
npm run android
npm run ios
```

Native platform projects and environment configuration may need regeneration/revalidation before a fresh mobile build. The repository currently treats the JavaScript/TypeScript source as the preserved baseline rather than claiming a verified production mobile release.

## Quality Commands

```bash
npm run typecheck
npm run lint
npm test
npm run web:build
```

These commands represent the intended quality gates. Older dependencies/code may still require modernization before every gate is fully green on current toolchains; that work is tracked in the roadmap rather than hidden.

## External Configuration

No API key should be committed to this repository.

- GIPHY credentials were removed from the archived source before publication.
- Firebase Web configuration is intentionally blank in `src/config/firebaseConfig.web.js`.
- AI/GitHub/Firebase integrations should receive credentials through a safe runtime configuration flow when development resumes.

If a credential was ever used in an older local copy, rotate it before reuse.

## Documentation

- [Roadmap](ROADMAP.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Related Edition

The newer Flutter/Dart implementation lives separately in `mhmdwaelanwr/Markdown-Creator-Dart`. Keeping the two editions separate avoids mixing unrelated framework histories and makes it possible to revisit either architecture later.

## License

Original project-specific source code and materials are copyright © 2026 Mohamed Anwar. All rights reserved unless a specific file or third-party dependency states otherwise. Third-party packages remain governed by their own licenses.
