# Contributing Guide

Thanks for your interest in improving the Image Tools Web Portal!

## Development Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   npx next dev -p 3005
   ```
3. Create a feature branch off `develop`:
   ```bash
   git checkout -b feature/<short-name> develop
   ```

## Standards

- Keep changes focused and minimal; avoid unrelated refactors.
- TypeScript: prefer explicit types for public interfaces.
- Accessibility: ensure interactive elements are keyboard-accessible.
- Performance: avoid heavy client-side processing in shared layout.

## Commits and PRs

- Use clear commit messages (e.g., `Fix: JPEG validation edge-case`).
- Open PRs against `develop`.
- Request review for UI changes; attach screenshots if applicable.

## Environment Variables

If you are wiring AdSense, set:
```bash
NEXT_PUBLIC_ADS_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADS_SLOT=1234567890
```

## Releases

- Merge `develop` → `main` when ready to deploy.
- Production deploys are triggered via Vercel when the repo is connected.