import { PostTransitionProvider } from './PostTransitionContext';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <PostTransitionProvider>{children}</PostTransitionProvider>;
}
