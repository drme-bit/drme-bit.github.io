export default {
  slug: 'why-i-replaced-cobe-with-three-globe',
  title: 'Why I replaced cobe with three-globe',
  date: '2026-07-19',
  readTime: '6 min read',
  category: 'Frontend',
  excerpt: 'cobe looked great in demos but fell apart in production. Here is what went wrong and why three-globe was the right call.',
  summary: 'A deep dive into the technical reasons behind migrating from cobe to three-globe for the interactive skill globe on this portfolio. Covers rendering limitations, mobile performance, marker projection, and the flexibility three-globe provides for arcs, polygons, and custom data.',
  tags: ['React', 'Three.js', 'three-globe', 'cobe', 'WebGL', 'R3F'],
  featured: false,
  sections: [
    {
      heading: 'The original choice: cobe',
      body: 'cobe is a beautiful library. The demo on their homepage is hypnotic — a glowing globe with smooth rotation and a minimal API. It ships as a single canvas element, takes a few config options, and just works. For a portfolio site, it seemed like the perfect choice: small bundle, zero dependencies, and it looks impressive with almost no effort. I integrated it into the Skills section and for about a week everything was fine.',
    },
    {
      heading: 'Where cobe fell apart',
      body: 'The first problem was marker projection. cobe renders everything onto a 2D canvas. To place HTML labels over the globe, I needed to convert latitude/longitude coordinates into screen-space pixel positions. cobe exposes a globe projection callback, but it only fires during its internal render loop and gives you limited access to the projection math. I ended up reverse-engineering the rotation matrix from cobe internals to compute screen positions myself — fragile and brittle. The second problem was mobile performance. cobe renders at the canvas pixel ratio, and on high-DPI phones that means drawing a 3x resolution globe at 60fps. There is no way to cap the pixel ratio, no way to reduce detail on mobile, and no way to pause rendering when the globe is off-screen. On an iPhone 15 Pro the battery drain was noticeable. The third problem was the feature ceiling. I wanted arcs connecting skill groups, polygon outlines for country borders, glow effects on hover, and custom point sizes per skill level. cobe supports none of these. It is a single-purpose rendering library — a gorgeous one, but a dead end for anything beyond a static glowing sphere.',
    },
    {
      heading: 'Why three-globe won',
      body: 'three-globe is built on top of Three.js and integrates directly with React Three Fiber. This means it runs in a full 3D scene with proper depth, lighting, and camera controls. Marker projection becomes trivial — Three.js has a built-in Vector3.project() method that converts any 3D point to screen space in one call. No reverse-engineering, no fragile hacks. For performance, R3F gives me granular control: I can set the pixel ratio, use lower-poly geometries on mobile, and pause rendering with frameloop="demand" when the globe is idle. The feature set is also orders of magnitude larger. three-globe supports arcs, custom SVG polygons, point clouds with per-point sizing and coloring, hexagonal bins, rings, labels, and custom HTML elements — all out of the box. I can connect skill groups with animated arcs, highlight countries where I have worked, and render custom marker shapes per skill category. The bundle is larger than cobe, but tree-shaking keeps the actual shipped code reasonable, and the R3F scene is shared with other 3D elements on the page.',
    },
    {
      heading: 'The migration in practice',
      body: 'The migration took about two days. The hardest part was rebuilding the marker overlay system — computing screen positions from lat/lng in the R3F render loop, then positioning absolutely-positioned DOM elements over the canvas. I wrote a GlobeManager class that handles filter, search, select, and disabled states as pure state updates, keeping the R3F component clean. Arcs were straightforward: group skills by category, connect consecutive markers within each group, and set arc color from the CSS accent variable. The result is a globe that spins smoothly on mobile, projects markers accurately, handles 50+ interactive points, and looks significantly better than the cobe version ever did.',
    },
    {
      heading: 'When to still use cobe',
      body: 'cobe is not a bad library. If you need a quick, decorative globe with zero interactivity — a hero background, a loading screen, a visual accent — cobe is still the fastest path to a good-looking result. The API is simpler, the bundle is smaller, and you do not need to understand Three.js at all. But the moment you need custom markers, screen-space projection, mobile optimization, or any feature beyond "glowing spinning sphere," you will hit a wall. For interactive, data-driven globes, three-globe with R3F is the clear choice.',
    },
  ],
};
