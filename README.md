# Image Tools Web Portal

Deploy-ready Next.js 16 web portal that aggregates multiple client-side image tools with a consistent UI, theme toggle, and optional AdSense integration.

## Badges

- Deploy with Vercel: https://vercel.com/new/import?s=https://github.com/mkamalhussain/imagetoolswebportal
- Repository: https://github.com/mkamalhussain/imagetoolswebportal

## Getting Started

Prerequisites:
- Node 18+ and npm

Install and run dev server:
```bash
npm install
npx next dev -p 3005
```

Production build:
```bash
npm run build
npm run start
```

## Environment Variables

The portal supports optional AdSense.
Create a `.env.local` file and set:
```bash
NEXT_PUBLIC_ADS_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADS_SLOT=1234567890
```

See `.env.example` for the variable names.

## Vercel Deployment

This repository is ready for Vercel.

1. Import the repo in Vercel Dashboard: https://vercel.com/new
2. Set "Root Directory" to `imagetoolswebportal`
3. Add environment variables (if using AdSense)
4. Deploy to Production

Optional region pinning is configured via `vercel.json` (`iad1`).

## Branches

- `main`: stable, deployable
- `develop`: integration branch for work-in-progress changes

## Contributing

Please see `CONTRIBUTING.md` for guidelines.
