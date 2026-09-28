/*  Deterministic guest identity from the anonymous uid: stable per
    browser, no PII, no storage of its own.  */

const ADJECTIVES = [
  'Swift', 'Quiet', 'Bright', 'Cosmic', 'Neon', 'Pixel', 'Turbo', 'Mellow',
  'Frosty', 'Solar', 'Lunar', 'Rapid', 'Calm', 'Vivid', 'Silent', 'Electric',
];

const ANIMALS = [
  'Fox', 'Owl', 'Badger', 'Heron', 'Mole', 'Jay', 'Newt', 'Wren',
  'Lynx', 'Otter', 'Raven', 'Toad', 'Viper', 'Whale', 'Yak', 'Zebra',
];

export interface GuestIdentity {
  name: string;
  color: string;
}

function hashUid(uid: string): number {
  let h = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function guestIdentity(uid: string): GuestIdentity {
  const h = hashUid(uid);
  const name = `${ADJECTIVES[h % ADJECTIVES.length]} ${ANIMALS[(h >> 4) % ANIMALS.length]}`;
  // Vivid hues, off the status-green so presence never reads as "online".
  const hue = (h >> 8) % 360;
  return { name, color: `hsl(${hue} 85% 62%)` };
}
