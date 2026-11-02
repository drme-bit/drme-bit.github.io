# Dr.ME portfolio

An interactive developer portfolio built with Next.js App Router, React, TypeScript, Geist, and SCSS. Production is hosted on Vercel.

## Local development

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run start
npm run lint
npm test
```

## Deployment

Connect the GitHub repository to Vercel. Vercel builds the app with `npm run build` and deploys it; configure required environment variables in the Vercel project settings. There is no GitHub Pages build or Firebase infrastructure in this repository.

## Project structure

- `src/app` — routes, API handlers, providers, and global styles
- `src/features` — page sections and product features
- `src/entities` — portfolio content and domain data
- `src/widgets` — navigation, workspace, mascot, and other page-level UI
- `src/shared` — reusable UI, hooks, and utilities
- `public` — static images, media, icons, and résumé
