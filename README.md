# portfolio

Terminal‑inspired portfolio built with React, Three.js, and SCSS.

[buy me a coffee](https://ko-fi.com/drmebit)

## dev

```bash
npm run dev       # → localhost:3000
npm run build     # → dist/
npm run preview   # preview the build
```

## stack

- **React 18** + **Vite** — fast dev, code-split builds
- **Three.js / R3F** — 3D terrain scene with scroll-driven camera
- **cobe** — interactive globe with skill markers and arcs
- **SCSS** — global design tokens (`--space-*`, `--radius-*`, `--accent-*`)
- **Firebase** — Firestore reviews, Google auth
- **motion** — scroll animations, infinite testimonials
- **react-icons** — Feather + dev icons

## design tokens

Spacing and border-radius use a consistent scale in `global.scss`:

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
├── components/
│   ├── layout/     DrawerMenu, Navbar, Footer, SmoothScrolling
│   └── ui/         Globe, Mascot, SearchBar, TestimonialsColumn, ...
├── config/         Firebase config
├── contexts/       ThemeContext, TerrainContext
├── data/           blog posts, skills, projects, experience
├── hooks/          useReveal, useScrollPhase
├── pages/
│   ├── Main/       Hero, About, Skills, Experience, Projects, Blog, Reviews, Contacts
│   ├── PostPage/   individual blog post
│   ├── PostsList/  blog listing
│   ├── ProjectPage/individual project
│   └── NotFound/   404
└── styles/         global.scss (tokens, reset, animations)
```
