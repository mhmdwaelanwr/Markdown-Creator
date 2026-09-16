# Security Policy

Markdown Creator is currently a development snapshot, not a production-hosted service.

## Secrets and Credentials

Never commit:

- API keys or access tokens
- Firebase service credentials
- GitHub tokens
- signing keys/certificates
- `.env` files
- passwords or user session data

Archived GIPHY credentials were removed before publication. Firebase Web configuration is intentionally blank in the public baseline.

If a credential appeared in an older local copy, treat it as exposed and rotate it before reuse.

## External Integrations

AI, GitHub, Firebase, authentication, publishing, and media-search features must be revalidated before production use. Client-side applications cannot safely hide a long-lived secret simply by moving it to a JavaScript constant or bundle-time variable.

## Reporting

Do not publish a sensitive vulnerability, leaked credential, or personal data in a public issue. Report it privately to the repository owner with enough detail to reproduce the problem safely.

## Production Boundary

Before any real-user release, review authentication, authorization, token storage, network transport, logging, dependency health, Firebase rules, GitHub scopes, and data retention.
