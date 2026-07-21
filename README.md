# portfolio

Terminal‑inspired portfolio built with Next.js, Three.js, and SCSS.

[buy me a coffee](https://ko-fi.com/drmebit)

## dev

```bash
npm run dev       # → localhost:3000
npm run build     # → .next/
npm run start     # production server
```

## stack

- **Next.js 15** + **App Router** — file-based routing, static generation, RSC
- **React 19** — concurrent features, Server Components
- **Three.js / R3F** — 3D terrain scene with scroll-driven camera
- **cobe** — interactive globe with skill markers and arcs
- **SCSS Modules** — design tokens, BEM naming, kebab-case bracket notation
- **Firebase** — Firestore reviews, Google auth
- **motion** — scroll animations, infinite testimonials
- **react-icons** — Feather + dev icons
- **Tailwind CSS v4** — utility classes where needed
- **Vercel** — deployment, analytics, speed insights

## design tokens

Spacing and border-radius use a consistent scale in `globals.scss`:

```
--space-xs: 4px     --radius-xs: 4px
--space-sm: 8px     --radius-sm: 8px
--space-md: 16px    --radius-md: 12px
--space-lg: 24px    --radius-lg: 16px
--space-xl: 32px    --radius-xl: 24px
                     --radius-full: 9999px
```

## structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # root layout, ThemeProvider, fonts
│   ├── page.tsx            # main page (RSC wrapper)
│   ├── globals.scss        # tokens, reset, utilities
│   ├── posts/              # /posts route
│   │   ├── page.tsx        # posts list
│   │   └── [slug]/         # dynamic post pages
│   ├── project/[id]/       # dynamic project pages
│   └── not-found.tsx       # 404
├── features/               # Feature-sliced sections
│   ├── hero/ui/            # Hero
│   ├── about/ui/           # About
│   ├── skills/ui/          # Skills (globe + filters)
│   ├── experience/ui/      # Experience
│   ├── projects/ui/        # Projects
│   ├── blog/ui/            # Blog
│   ├── reviews/ui/         # Reviews
│   ├── contacts/ui/        # Contacts
│   └── theme/ui/           # ThemeProvider
├── widgets/                # Reusable widgets
│   ├── navbar/             # Dock navigation
│   ├── mascot/             # AI mascot
│   └── archive/            # Project archive
├── shared/
│   ├── hooks/              # useReveal, useScrollPhase, useHorizontalScroll
│   ├── styles/             # _mixins.scss, _animations.scss
│   └── ui/
│       ├── atoms/          # Skeleton, TapRipple
│       ├── molecules/      # SectionHeader, SearchBar, GitHubStatus, ...
│       └── organisms/      # Globe, Cursor, LoadingScreen
├── providers/              # SceneProvider, ModalProvider
├── config/                 # Firebase config
└── data/                   # blog posts, skills, projects
```

## conventions

- **CSS Modules**: kebab-case class names, bracket notation in TSX (`styles['post-page']`)
- **Feature-sliced design**: features/, widgets/, shared/ layers
- **Atomic design**: atoms → molecules → organisms
- **SCSS mixins**: `section-base`, `reveal-base`, `terminal-bar`, `backdrop-blur`
- **Scroll-driven**: `useScrollPhase` hook drives CSS custom properties (`--scroll`, `--sp`)
