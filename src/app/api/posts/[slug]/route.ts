import { NextRequest, NextResponse } from 'next/server';
import { contentSource } from '@/shared/api/content-source';
import { serializePostDetail } from '@/shared/api/serialize';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const post = contentSource.getPost(slug);
  if (!post) {
    return NextResponse.json({ error: 'post not found' }, { status: 404 });
  }
  return NextResponse.json({ data: serializePostDetail(post) });
}