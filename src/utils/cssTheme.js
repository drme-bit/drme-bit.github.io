let accent = '#e8e4df';
let bg = '#0a0a0a';
let accentSecondary = '#7dd3fc';

function read() {
  const s = getComputedStyle(document.body);
  const newAccent = s.getPropertyValue('--accent').trim();
  const newBg = s.getPropertyValue('--bg').trim();
  if (newAccent) accent = newAccent;
  if (newBg) bg = newBg;
  const newSecondary = s.getPropertyValue('--accent-secondary').trim();
  if (newSecondary) accentSecondary = newSecondary;
}

read();

if (typeof MutationObserver !== 'undefined') {
  new MutationObserver(read).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

export function getAccent() { return accent; }
export function getBg() { return bg; }
export function getAccentSecondary() { return accentSecondary; }
