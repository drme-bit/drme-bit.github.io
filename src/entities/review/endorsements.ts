/*  Static endorsements shown in the Kind words section. Photos live in
    public/images/endorsements/ — referenced by absolute path.  */

export interface Endorsement {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  /** Photo URL — initials tile is rendered when absent. */
  image?: string;
  /** Tile background for the initials fallback. */
  color?: string;
  /** Discord handle shown as plain text (no profile URL known). */
  discordTag?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    discord?: string;
  };
}

export const ENDORSEMENTS: Endorsement[] = [
  {
    id: 'kuliak',
    name: 'Andriy Kuliak',
    image:
      'images/endorsements/kuliak.jpg',
    role: 'diploma supervisor',
    rating: 5,
    color: '#1e3a8a',
    text: 'I had almost nothing to supervise — he designed and built the entire thesis project himself. The Nexagon work reads at master\u2019s level, no less.',
    social: {
      linkedin: 'https://www.linkedin.com/in/andrii-kuliak/',
    },
  },
  {
    id: 'yukhimchyk',
    name: 'Danil Yukhimchyk',
    image: 'images/endorsements/yukhimchyk.png',
    role: 'fellow developer',
    rating: 5,
    color: '#065f46',
    text: 'We\u2019ve been building side by side for years — Roblox experiences, bots, late-night debugging sessions. He writes code I would sign myself: clean, fast, no shortcuts.',
    discordTag: 'gm_108',
  },
  {
    id: 'nishino',
    name: 'nishino',
    image: 'images/endorsements/nishino.png',
    role: 'roblox collaborator',
    rating: 5,
    color: '#5b21b6',
    discordTag: 'nishino',
    text: 'We shipped a Roblox game together. His code is clean and beautiful — systems you can actually read, understand, and extend months later.',
  },
  {
    id: 'zaharison',
    name: 'ZAHARISON2',
    image: 'images/endorsements/zaharison2.png',
    role: 'commission client',
    rating: 5,
    color: '#9a3412',
    discordTag: 'ZAHARISON2',
    text: 'Commissioned custom development work and got exactly what was promised: fast delivery, clear communication, and zero revisions needed.',
  },
];
