import { NextRequest, NextResponse } from 'next/server';
import { contentSource } from '@/shared/api/content-source';
import { serializeProjectSummary } from '@/shared/api/serialize';

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const status = sp.get('status');
  const skill = sp.get('skill');
  const search = sp.get('search');
  const limit = clampInt(sp.get('limit'), 10, 1, 100);

  let items = contentSource.listProjects();
  if (status) {
    const s = status.toUpperCase();
    items = items.filter((p) => p.status === s);
  }
  if (skill) items = items.filter((p) => p.hasSkill(skill));
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.techNames.some((t) => t.toLowerCase().includes(q)),
    );
  }

  const total = items.length;
  const data = items.slice(0, limit).map(serializeProjectSummary);

  return NextResponse.json({ data, meta: { total, limit } });
}