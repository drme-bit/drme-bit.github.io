'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { db, auth, googleProvider } from '@/shared/config/firebase';
import { FiSend, FiLogIn, FiLogOut } from 'react-icons/fi';
import styles from './Comments.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface Comment {
  id: string;
  uid: string;
  name: string;
  photoURL?: string;
  text: string;
  createdAt?: Date | null;
}

/* ─── Comments ───────────────────────────────────────────── */

export default function Comments() {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Real-time comments
  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: Comment[] = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() ?? null } as Comment;
      });
      setComments(items);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !user || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'comments'), {
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        text: trimmed,
        approved: true,
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch {}
    setSending(false);
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className={styles.comments}>
      <div className={styles.header}>
        <span className={styles.title}>live comments</span>
        <span className={styles.count}>{comments.length}</span>
      </div>

      {/* Login / User info */}
      <div className={styles.userBar}>
        {user ? (
          <div className={styles.userInfo}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>{user.displayName?.[0] || '?'}</div>
            )}
            <span className={styles.userName}>{user.displayName}</span>
            <button className={styles.iconBtn} onClick={handleLogout} title="Sign out">
              <FiLogOut />
            </button>
          </div>
        ) : (
          <button className={styles.loginBtn} onClick={handleLogin}>
            <FiLogIn />
            <span>Sign in with Google</span>
          </button>
        )}
      </div>

      {/* Comment list */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>loading comments...</div>
        ) : comments.length === 0 ? (
          <div className={styles.empty}>no comments yet. be the first!</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className={styles.comment}>
              {c.photoURL ? (
                <img src={c.photoURL} alt="" className={styles.commentAvatar} />
              ) : (
                <div className={styles.commentAvatarPlaceholder}>{c.name[0]}</div>
              )}
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentName}>{c.name}</span>
                  <span className={styles.commentTime}>{formatTime(c.createdAt)}</span>
                </div>
                <p className={styles.commentText}>{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      {user && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="write a comment..."
            disabled={sending}
          />
          <button
            className={styles.sendBtn}
            type="submit"
            disabled={!text.trim() || sending}
          >
            <FiSend />
          </button>
        </form>
      )}
    </div>
  );
}
