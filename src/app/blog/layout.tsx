import { PostTransitionProvider } from '@/features/blog/lib/PostTransitionContext';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <PostTransitionProvider>{children}</PostTransitionProvider>;
}
