import { NextRequest, NextResponse } from 'next/server';
import { contentSource } from '@/shared/api/content-source';
import { serializePostSummary } from '@/shared/api/serialize';

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get('category');
  const featured = sp.get('featured') === '1';
  const search = sp.get('search');
  const limit = clampInt(sp.get('limit'), 10, 1, 100);
  const offset = clampInt(sp.get('offset'), 0, 0, 10000);

  let posts = contentSource.listPosts();
  if (category) posts = posts.filter((p) => p.category === category);
  if (featured) posts = posts.filter((p) => p.featured);
  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  posts = posts
    .slice()
    .sort((a, b) => Number(b.featured) - Number(a.featured) || Date.parse(b.date) - Date.parse(a.date));

  const total = posts.length;
  const data = posts.slice(offset, offset + limit).map(serializePostSummary);

  return NextResponse.json({ data, meta: { total, limit, offset } });
}