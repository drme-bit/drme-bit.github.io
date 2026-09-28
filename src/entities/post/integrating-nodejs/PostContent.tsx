'use client';

import CodeBlock from '@/shared/ui/CodeBlock/CodeBlock';
import {
  Article,
  Section,
  H2,
  P,
  Grid2,
  MiniCard,
} from '../ui/Article';

const NODES = [
  { label: 'Client', sub: 'React / Next.js', hot: false },
  { label: 'API Route', sub: 'Next.js Edge', hot: true },
  { label: 'Middleware', sub: 'Auth / Rate Limit', hot: false },
  { label: 'Firestore', sub: 'Admin SDK', hot: false },
];

export default function PostContent() {
  return (
    <Article>
      <Section>
        <div className="flex flex-col gap-4">
          <H2>Architecture overview</H2>
          <div className="flex flex-wrap items-stretch gap-2">
            {NODES.map((n, i) => (
              <div key={n.label} className="flex min-w-0 flex-1 items-stretch gap-2">
                <div
                  className={`flex min-w-[120px] flex-1 flex-col gap-0.5 rounded-[var(--radius-md)] border px-3.5 py-3 ${
                    n.hot
                      ? 'border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary)]/[0.07]'
                      : 'border-[var(--border)] bg-[var(--glass)]'
                  }`}
                >
                  <span className="font-mono text-[0.72rem] font-medium text-foreground">{n.label}</span>
                  <span className="font-mono text-[0.62rem] text-[var(--text-ghost)]">{n.sub}</span>
                </div>
                {i < NODES.length - 1 && (
                  <span aria-hidden="true" className="self-center text-[var(--text-ghost)]">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Why a backend at all</H2>
          <P>
            A portfolio site does not need a backend. But this one has features that benefit
            from server-side logic: the reviews system writes to Firestore, the contact form
            needs validation, and I wanted rate limiting to prevent abuse. Next.js App Router
            makes this trivial — API routes live inside the same project, deploy to the same
            Vercel function, and share types with the frontend.
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Next.js API Routes</H2>
          <P>
            Each API route is a standard Next.js Route Handler. The server has full access
            to environment variables, Firebase Admin, and any Node.js API — no CORS, no
            separate deployment, no cold starts on a different region.
          </P>
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

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Firebase Admin for server-side writes</H2>
          <P>
            The client-side Firebase SDK works fine for reads and auth, but server-side writes
            need Firebase Admin. It bypasses security rules (since the server is trusted) and
            gives access to admin-only operations like querying across all users or writing to
            protected collections.
          </P>
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

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Rate limiting without Redis</H2>
          <P>
            For a portfolio site, full Redis-backed rate limiting is overkill. A simpler
            approach using Vercel KV or in-memory maps:
          </P>
          <Grid2>
            {[
              { title: 'Vercel KV (Upstash)', desc: 'Serverless Redis, 30k requests/day free tier' },
              { title: 'In-memory Map', desc: 'Fine for single-region, resets on cold start' },
              { title: 'IP or User-based', desc: 'Depending on auth state' },
              { title: 'Sliding window', desc: 'Smooth rate curves, no burst spikes' },
            ].map((f) => (
              <MiniCard key={f.title} title={f.title} desc={f.desc} />
            ))}
          </Grid2>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Middleware for auth checks</H2>
          <P>
            Next.js middleware runs before the route handler. Perfect for validating Firebase
            tokens on protected API routes without duplicating auth logic in every handler.
          </P>
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

      <Section>
        <div className="flex flex-col gap-4">
          <H2>When server-side matters</H2>
          <P>
            Most portfolio features work fine as static content. But anything involving user
            data, write operations, or sensitive logic benefits from a server layer. The reviews
            system is the perfect example: client-side auth for the UI, server-side writes for
            data integrity, and middleware for consistent auth checks across all protected routes.
          </P>
        </div>
      </Section>
    </Article>
  );
}
