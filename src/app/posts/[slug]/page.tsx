import PostPageClient from './PostPageClient';

export function generateStaticParams() {
  return [
    { slug: 'integrating-nodejs' },
    { slug: 'why-i-replaced-cobe' },
    { slug: 'building-my-portfolio' },
  ];
}

export default function PostPage() {
  return <PostPageClient />;
}
