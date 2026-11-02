import { NextRequest, NextResponse } from 'next/server';
import { contentSource } from '@/shared/api/content-source';
import { serializeProjectDetail } from '@/shared/api/serialize';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const project = contentSource.getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'project not found' }, { status: 404 });
  }
  return NextResponse.json({ data: serializeProjectDetail(project) });
}