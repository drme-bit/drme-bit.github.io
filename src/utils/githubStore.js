const OWNER = 'drme-bit';
const REPO = 'drme-bit.github.io';
const BRANCH = 'main';
const TOKEN_KEY = 'gh_archive_token';

const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

function auth() {
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function check(res) {
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
  return res;
}

function guessMime(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
    pdf: 'application/pdf', zip: 'application/zip', json: 'application/json',
    txt: 'text/plain', md: 'text/markdown', csv: 'text/csv',
  };
  return map[ext] || 'application/octet-stream';
}

function mimeCat(mime) {
  if (mime.startsWith('image/')) return 'images';
  if (mime.startsWith('video/')) return 'videos';
  return 'documents';
}

function toEntry(item) {
  return {
    name: item.name,
    path: item.path,
    sha: item.sha,
    size: item.size,
    type: guessMime(item.name),
    category: mimeCat(guessMime(item.name)),
    download_url: item.download_url,
  };
}

function toDirEntry(item) {
  return {
    name: item.name,
    path: item.path,
    sha: item.sha,
    size: 0,
    type: 'application/octet-stream',
    category: 'documents',
    download_url: null,
    isDir: true,
  };
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthed() {
  return !!getToken();
}

export async function listFiles(path = 'uploads') {
  const res = await fetch(`${API}/${path}`, { headers: auth() });
  if (res.status === 404) return [];
  check(res);
  const items = await res.json();
  if (!Array.isArray(items)) return [];
  return items.map((i) => (i.type === 'dir' ? toDirEntry(i) : toEntry(i)));
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export async function uploadFile(file, currentPath = 'uploads') {
  if (!getToken()) throw new Error('Auth required');
  const path = `${currentPath}/${file.name}`;
  const content = await toBase64(file);
  const body = { message: `Upload ${file.name}`, content, branch: BRANCH };

  const exist = await fetch(`${API}/${encodeURIComponent(path)}`, { headers: auth() });
  if (exist.ok) body.sha = (await exist.json()).sha;

  const res = await fetch(`${API}/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  check(res);
  const data = await res.json();
  return toEntry(data.content);
}

export async function deleteFile(path, sha) {
  if (!getToken()) throw new Error('Auth required');
  const res = await fetch(`${API}/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Delete ${path}`, sha, branch: BRANCH }),
  });
  check(res);
}

export function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${u[i]}`;
}
