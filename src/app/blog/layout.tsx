import { PostTransitionProvider } from '@/features/blog/model/PostTransitionContext';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <PostTransitionProvider>{children}</PostTransitionProvider>;
}
