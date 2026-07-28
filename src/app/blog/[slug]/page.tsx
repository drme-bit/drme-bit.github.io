import { blog } from '@/features/blog/lib';
import PostPageClient from './PostPageClient';

export function generateStaticParams() {
  return blog.all.map(p => ({ slug: p.slug }));
}

export default function PostPage() {
  return <PostPageClient />;
}
