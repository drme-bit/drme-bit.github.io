/*  Backdrop photo gallery — single source of truth for floating images.
    To add a photo, drop the file into public/images/backdrop/ and append
    an entry here (width/height only set the box; object-cover crops).  */

export interface BackdropPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const BACKDROP_PHOTOS: BackdropPhoto[] = [
  {
    src: '/media/projects/nexagon/images/nexagon_main.webp',
    alt: 'Nexagon monitoring dashboard',
    width: 320,
    height: 200,
  },
  {
    src: '/media/projects/project-gmod/images/pgm_overview.webp',
    alt: 'GMod Roblox overview',
    width: 320,
    height: 200,
  },
  {
    src: '/media/projects/roblox/images/garden_vs_brainrot.webp',
    alt: 'Garden vs Brainrot game',
    width: 320,
    height: 200,
  },
  {
    src: '/images/demonstration/kanban-demo.webp',
    alt: 'Kanban workflow demo',
    width: 320,
    height: 200,
  },
  {
    src: '/images/perspective.webp',
    alt: 'Perspective notes',
    width: 320,
    height: 200,
  },
  {
    src: '/media/projects/roblox/images/vault_overview.webp',
    alt: 'Vault overview',
    width: 320,
    height: 200,
  },
];
