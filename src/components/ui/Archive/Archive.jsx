import { useState, useEffect, useRef, useCallback } from 'react';
import {
  listFiles, uploadFile, deleteFile, formatSize,
  isAuthed, getToken, setToken, clearToken,
} from '../../../utils/githubStore';
import './Archive.scss';

function FileIcon({ type, isDir }) {
  if (isDir) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    );
  }
  if (type?.startsWith('image/')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    );
  }
  if (type?.startsWith('video/')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 10l5 3-5 3v-6z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

const CATEGORIES = [
  { id: 'all', label: 'all files' },
  { id: 'images', label: 'images' },
  { id: 'videos', label: 'videos' },
  { id: 'documents', label: 'documents' },
];

export default function Archive({ onClose }) {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('all');
  const [currentPath, setCurrentPath] = useState('uploads');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authed, setAuthed] = useState(isAuthed());
  const [showAuth, setShowAuth] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [loginError, setLoginError] = useState(null);
  const dropRef = useRef(null);
  const fileRef = useRef(null);

  const load = useCallback(async (path) => {
    setLoading(true);
    setError(null);
    try {
      const all = await listFiles(path);
      setFiles(all);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(currentPath); }, [currentPath, authed]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        if (preview) setPreview(null);
        else if (showAuth) setShowAuth(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose, preview, showAuth]);

  const goUp = useCallback(() => {
    const parent = currentPath.split('/').slice(0, -1).join('/');
    if (parent && parent !== '') {
      setCurrentPath(parent);
      setCategory('all');
    }
  }, [currentPath]);

  const enterDir = useCallback((dirPath) => {
    setCurrentPath(dirPath);
    setCategory('all');
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!authed) { setShowAuth(true); setLoginError(null); return; }
    const dropped = Array.from(e.dataTransfer.files);
    for (const f of dropped) {
      try {
        await uploadFile(f, currentPath);
      } catch (err) {
        setError(err.message);
      }
    }
    if (dropped.length > 0) load(currentPath);
  }, [authed, currentPath, load]);

  const handleUpload = useCallback(() => {
    if (!authed) { setShowAuth(true); setLoginError(null); return; }
    fileRef.current?.click();
  }, [authed]);

  const handleFilePick = useCallback(async (e) => {
    const picked = Array.from(e.target.files);
    if (!picked.length) return;
    for (const f of picked) {
      try {
        await uploadFile(f, currentPath);
      } catch (err) {
        setError(err.message);
      }
    }
    load(currentPath);
    e.target.value = '';
  }, [currentPath, load]);

  const handleDelete = useCallback(async (entry) => {
    if (!authed) { setShowAuth(true); setLoginError(null); return; }
    try {
      await deleteFile(entry.path, entry.sha);
      load(currentPath);
      if (preview?.path === entry.path) setPreview(null);
    } catch (err) {
      setError(err.message);
    }
  }, [authed, currentPath, load, preview]);

  const handleLogin = useCallback(async () => {
    const t = tokenInput.trim();
    if (!t) return;
    setLoginError(null);

    const test = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!test.ok) {
      setLoginError('Invalid or expired token');
      return;
    }

    setToken(t);
    setAuthed(true);
    setShowAuth(false);
    setTokenInput('');
    setLoginError(null);
  }, [tokenInput]);

  const handleLogout = useCallback(() => {
    clearToken();
    setAuthed(false);
  }, []);

  /* dirs and files filtered by category; dirs always shown */
  const filtered = category === 'all'
    ? files
    : files.filter((f) => f.isDir || f.category === category);

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const pathParts = currentPath.split('/');

  return (
    <div
      className={`archive-overlay${dragOver ? ' is-dragover' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      ref={dropRef}
    >
      <div className="archive" onClick={(e) => e.stopPropagation()}>
        {/* bar */}
        <div className="archive-bar">
          <div className="archive-bar-dots">
            <span className="archive-dot archive-dot--red" onClick={onClose} />
            <span className="archive-dot archive-dot--yellow" />
            <span className="archive-dot archive-dot--green" />
          </div>

          {/* breadcrumb */}
          <div className="archive-breadcrumb">
            {pathParts.length > 1 && (
              <button className="archive-breadcrumb-up" onClick={goUp} title="go up">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
            )}
            {pathParts.map((part, i) => (
              <span key={i} className="archive-breadcrumb-part">
                {i > 0 && <span className="archive-breadcrumb-sep">/</span>}
                <span className={i === pathParts.length - 1 ? 'archive-breadcrumb-current' : ''}>
                  {part}
                </span>
              </span>
            ))}
          </div>

          <div className="archive-bar-actions">
            {authed ? (
              <span className="archive-bar-user" onClick={handleLogout} title="logout">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
            ) : (
              <button className="archive-bar-login" onClick={() => { setShowAuth(true); setLoginError(null); }}>
                login
              </button>
            )}
            {authed && (
              <button className="archive-bar-upload" onClick={handleUpload} title="upload file">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="archive-body">
          {/* sidebar */}
          <div className="archive-sidebar">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`archive-sidebar-item${category === c.id ? ' is-active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* main */}
          <div className="archive-main">
            {loading ? (
              <div className="archive-empty"><span className="archive-loading">loading…</span></div>
            ) : error ? (
              <div className="archive-empty"><span className="archive-error">{error}</span></div>
            ) : filtered.length === 0 ? (
              <div className="archive-empty">
                <div className="archive-dropzone-hint">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>{authed ? 'drag & drop or upload' : 'no files yet'}</span>
                </div>
              </div>
            ) : (
              <div className="archive-grid">
                {filtered.map((f) => (
                  <div
                    key={f.path}
                    className={`archive-file${f.isDir ? ' is-dir' : ''}${preview?.path === f.path ? ' is-selected' : ''}`}
                    onClick={() => {
                      if (f.isDir) {
                        enterDir(f.path);
                      } else if (f.type?.startsWith('image/') || f.type?.startsWith('video/')) {
                        setPreview(f);
                      } else if (f.download_url) {
                        window.open(f.download_url, '_blank');
                      }
                    }}
                  >
                    <div className="archive-file-preview">
                      {!f.isDir && f.type?.startsWith('image/') ? (
                        <img src={f.download_url} alt={f.name} className="archive-file-thumb" />
                      ) : (
                        <FileIcon type={f.type} isDir={f.isDir} />
                      )}
                    </div>
                    <div className="archive-file-info">
                      <span className="archive-file-name">{f.name}</span>
                      <span className="archive-file-meta">{f.isDir ? 'folder' : formatSize(f.size)}</span>
                    </div>
                    {authed && !f.isDir && (
                      <button
                        className="archive-file-delete"
                        onClick={(e) => { e.stopPropagation(); handleDelete(f); }}
                        title="delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* status bar */}
        <div className="archive-status">
          <span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span>
          <span>{formatSize(totalSize)}</span>
        </div>

        {/* hidden file input */}
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFilePick} />
      </div>

      {/* auth dialog */}
      {showAuth && (
        <div className="archive-auth-overlay" onClick={() => setShowAuth(false)}>
          <div className="archive-auth" onClick={(e) => e.stopPropagation()}>
            <div className="archive-auth-title">GitHub Token</div>
            <p className="archive-auth-desc">
              Paste a{' '}
              <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noreferrer">
                fine-grained PAT
              </a>{' '}
              with <code>contents: write</code> access to this repo.
            </p>
            <input
              className={`archive-auth-input${loginError ? ' has-error' : ''}`}
              type="password"
              placeholder="ghp_..."
              value={tokenInput}
              onChange={(e) => { setTokenInput(e.target.value); setLoginError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            {loginError && <span className="archive-auth-error">{loginError}</span>}
            <div className="archive-auth-actions">
              <button className="archive-auth-btn archive-auth-btn--cancel" onClick={() => setShowAuth(false)}>
                Cancel
              </button>
              <button
                className="archive-auth-btn archive-auth-btn--save"
                onClick={handleLogin}
                disabled={!tokenInput.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* file preview overlay */}
      {preview && (preview.type?.startsWith('image/') || preview.type?.startsWith('video/')) && (
        <div className="archive-preview-overlay" onClick={() => setPreview(null)}>
          {preview.type?.startsWith('video/') ? (
            <video
              src={preview.download_url}
              className="archive-preview-video"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img src={preview.download_url} alt={preview.name} className="archive-preview-img" />
          )}
        </div>
      )}
    </div>
  );
}
