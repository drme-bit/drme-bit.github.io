export function getAccentRGB() {
  const v = getComputedStyle(document.body).getPropertyValue('--accent').trim();
  const m = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (m) return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  return { r: 232, g: 228, b: 223 };
}
