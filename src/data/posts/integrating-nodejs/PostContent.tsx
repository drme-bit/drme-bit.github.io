'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PostContent.module.scss';

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className={styles['code-block']}>
      <div className={styles['code-lang']}>{lang}</div>
      <pre className={styles['code-pre']}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles['section']}${visible ? ` ${styles['is-visible']}` : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function PostContent() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles['hero-glow']} />
        <div className={styles['hero-content']}>
          <div className={styles['hero-badge']}>Backend</div>
          <h1 className={styles['hero-title']}>
            Integrating a<br />
            <span className={styles['hero-accent']}>Node.js Backend</span>
          </h1>
          <p className={styles['hero-desc']}>
            Moving beyond static sites — adding a server layer for auth, rate limiting, and
            write operations that actually matter.
          </p>
          <div className={styles['hero-meta']}>
            <span>Jul 20, 2026</span>
            <span className={styles['hero-sep']}>/</span>
            <span>5 min read</span>
          </div>
        </div>
      </header>

      {/* Architecture diagram */}
      <Section>
        <div className={styles['arch']}>
          <h2 className={styles['section-title']}>Architecture Overview</h2>
          <div className={styles['arch-flow']}>
            <div className={styles['arch-node']}>
              <span className={styles['arch-node-label']}>Client</span>
              <span className={styles['arch-node-sub']}>React / Next.js</span>
            </div>
            <div className={styles['arch-arrow']}>→</div>
            <div className={`${styles['arch-node']} ${styles['arch-node--primary']}`}>
              <span className={styles['arch-node-label']}>API Route</span>
              <span className={styles['arch-node-sub']}>Next.js Edge</span>
            </div>
            <div className={styles['arch-arrow']}>→</div>
            <div className={styles['arch-node']}>
              <span className={styles['arch-node-label']}>Middleware</span>
              <span className={styles['arch-node-sub']}>Auth / Rate Limit</span>
            </div>
            <div className={styles['arch-arrow']}>→</div>
            <div className={`${styles['arch-node']} ${styles['arch-node--warm']}`}>
              <span className={styles['arch-node-label']}>Firestore</span>
              <span className={styles['arch-node-sub']}>Admin SDK</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Why a backend */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>#</span>
            Why a backend at all
          </h2>
          <p className={styles['body-text']}>
            A portfolio site does not need a backend. But this one has features that benefit
            from server-side logic: the reviews system writes to Firestore, the contact form
            needs validation, and I wanted rate limiting to prevent abuse. Next.js App Router
            makes this trivial — API routes live inside the same project, deploy to the same
            Vercel function, and share types with the frontend.
          </p>
        </div>
      </Section>

      {/* API Routes */}
      <Section delay={0.1}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>#</span>
            Next.js API Routes
          </h2>
          <p className={styles['body-text']}>
            Each API route is a standard Next.js Route Handler. The server has full access
            to environment variables, Firebase Admin, and any Node.js API — no CORS, no
            separate deployment, no cold starts on a different region.
          </p>
          <CodeBlock
            lang="typescript"
            code={`// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.text || body.text.length > 500) {
    return NextResponse.json(
      { error: 'Invalid review' },
      { status: 400 }
    );
  }

  await db.collection('reviews').add({
    ...body,
    approved: false,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}`}
          />
        </div>
      </Section>

      {/* Firebase Admin */}
      <Section delay={0.1}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>#</span>
            Firebase Admin for server-side writes
          </h2>
          <p className={styles['body-text']}>
            The client-side Firebase SDK works fine for reads and auth, but server-side writes
            need Firebase Admin. It bypasses security rules (since the server is trusted) and
            gives access to admin-only operations like querying across all users or writing to
            protected collections.
          </p>
          <CodeBlock
            lang="typescript"
            code={`// lib/firebase-admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
    }),
  });
}

export const db = getFirestore();`}
          />
        </div>
      </Section>

      {/* Rate Limiting */}
      <Section delay={0.1}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>#</span>
            Rate limiting without Redis
          </h2>
          <p className={styles['body-text']}>
            For a portfolio site, full Redis-backed rate limiting is overkill. A simpler
            approach using Vercel KV or in-memory maps:
          </p>
          <div className={styles['feature-grid']}>
            {[
              { label: 'Vercel KV (Upstash)', desc: 'Serverless Redis, 30k requests/day free tier' },
              { label: 'In-memory Map', desc: 'Fine for single-region, resets on cold start' },
              { label: 'IP or User-based', desc: 'Depending on auth state' },
              { label: 'Sliding window', desc: 'Smooth rate curves, no burst spikes' },
            ].map((f) => (
              <div key={f.label} className={styles['feature-card']}>
                <span className={styles['feature-card-label']}>{f.label}</span>
                <span className={styles['feature-card-desc']}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Middleware */}
      <Section delay={0.1}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>#</span>
            Middleware for auth checks
          </h2>
          <p className={styles['body-text']}>
            Next.js middleware runs before the route handler. Perfect for validating Firebase
            tokens on protected API routes without duplicating auth logic in every handler.
          </p>
          <CodeBlock
            lang="typescript"
            code={`// middleware.ts
import { NextResponse } from 'next/server';
import { verifyAuthToken } from './lib/firebase-admin';

export async function middleware(req: Request) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const decoded = await verifyAuthToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  const headers = new Headers(req.headers);
  headers.set('x-user-id', decoded.uid);

  return NextResponse.next({ request: { headers } });
}`}
          />
        </div>
      </Section>

      {/* Conclusion */}
      <Section delay={0.1}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>#</span>
            When server-side matters
          </h2>
          <p className={styles['body-text']}>
            Most portfolio features work fine as static content. But anything involving user
            data, write operations, or sensitive logic benefits from a server layer. The reviews
            system is the perfect example: client-side auth for the UI, server-side writes for
            data integrity, and middleware for consistent auth checks across all protected routes.
          </p>
        </div>
      </Section>
    </div>
  );
}
