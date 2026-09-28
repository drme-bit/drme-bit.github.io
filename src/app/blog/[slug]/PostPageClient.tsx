'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { useLenis } from 'lenis/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { blog, CATEGORIES } from '@/features/blog/lib';
import { TransitionLink } from '@/features/transitions';
import { useNav } from '@/app/providers/NavProvider';
import { usePostTransition } from '@/features/blog/model/PostTransitionContext';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';

gsap.registerPlugin(ScrollTrigger);

/*  Progress Bar — driven by Lenis scroll frames (smooth), native scroll
    listener as fallback. Native-only updates visibly step behind Lenis.  */

function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      const update = (scroll: number, limit: number) =>
        setProgress(limit > 0 ? (scroll / limit) * 100 : 0);
      update(lenis.scroll, lenis.limit);
      const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) =>
        update(scroll, limit);
      lenis.on('scroll', onScroll);
      return () => {
        lenis.off('scroll', onScroll);
      };
    }
    function onScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      setProgress(scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lenis]);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[1000] h-[2px] bg-transparent">
      <div
        className="h-full bg-[var(--accent-secondary)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/*  Table of contents — built from the rendered article headings
    (PostContent loads async, so observe the DOM, not props).  */

interface TocItem {
  id: string;
  label: string;
  level: number;
}

function PostToc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    let els: HTMLElement[] = [];
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let disposed = false;

    const attach = (root: HTMLElement) => {
      const collect = () => {
        const found = Array.from(root.querySelectorAll('h2[id], h3[id]')) as HTMLElement[];
        setItems(
          found.map((el) => ({
            id: el.id,
            label: (el.textContent ?? '').trim(),
            level: el.tagName === 'H3' ? 1 : 0,
          })),
        );
        return found;
      };

      els = collect();
      io = new IntersectionObserver(
        (list) => {
          list.forEach((entry) => {
            if (entry.isIntersecting) setActive((entry.target as HTMLElement).id);
          });
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
      );
      els.forEach((el) => io!.observe(el));
      mo = new MutationObserver(() => {
        if (!io) return;
        els.forEach((el) => io!.unobserve(el));
        els = collect();
        els.forEach((el) => io!.observe(el));
      });
      mo.observe(root, { childList: true, subtree: true });
    };

    const cleanup = () => {
      mo?.disconnect();
      io?.disconnect();
    };

    // The article loads async (dynamic PostContent) — wait for it instead
    // of giving up when it isn't in the DOM yet.
    const root = document.getElementById('post-article');
    if (root) {
      attach(root);
      return cleanup;
    }
    const waiter = new MutationObserver(() => {
      if (disposed) return;
      const r = document.getElementById('post-article');
      if (r) {
        waiter.disconnect();
        attach(r);
      }
    });
    waiter.observe(document.body, { childList: true, subtree: true });
    return () => {
      disposed = true;
      waiter.disconnect();
      cleanup();
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col">
      <p className="m-0 px-2 pb-2 text-[13px] font-medium text-foreground">
        On this page
      </p>
      <div className="flex flex-col gap-px">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActive(item.id);
                scrollToTarget(`#${CSS.escape(item.id)}`);
              }}
              aria-current={isActive || undefined}
              className={`w-full cursor-pointer truncate rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                item.level === 1 ? 'pl-5' : ''
              } ${
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/*  Dynamic PostContent loader  */

const POST_COMPONENTS: Record<string, React.ComponentType> = {
  'integrating-nodejs': dynamic(
    () => import('@/entities/post/integrating-nodejs/PostContent'),
    { ssr: false, loading: () => <p className="m-0 px-5 py-24 text-center font-mono text-[0.72rem] text-[var(--text-ghost)]">loading...</p> }
  ),
  'why-i-replaced-cobe': dynamic(
    () => import('@/entities/post/why-i-replaced-cobe/PostContent'),
    { ssr: false, loading: () => <p className="m-0 px-5 py-24 text-center font-mono text-[0.72rem] text-[var(--text-ghost)]">loading...</p> }
  ),
  'building-my-portfolio': dynamic(
    () => import('@/entities/post/building-my-portfolio/PostContent'),
    { ssr: false, loading: () => <p className="m-0 px-5 py-24 text-center font-mono text-[0.72rem] text-[var(--text-ghost)]">loading...</p> }
  ),
  'discord-orb-quests': dynamic(
    () => import('@/entities/post/discord-orb-quests/PostContent'),
    { ssr: false, loading: () => <p className="m-0 px-5 py-24 text-center font-mono text-[0.72rem] text-[var(--text-ghost)]">loading...</p> }
  ),
};

/*  Main Component  */

export default function PostPageClient() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { transitionFrom } = usePostTransition();
  const { setPageConfig } = useNav();
  const post = blog.get(slug);

  const clipFrom = useMemo(() => {
    if (typeof window === 'undefined' || !transitionFrom) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top = transitionFrom.y;
    const right = vw - transitionFrom.x - transitionFrom.width;
    const bottom = vh - transitionFrom.y - transitionFrom.height;
    const left = transitionFrom.x;
    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  }, [transitionFrom]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { prev: prevPost, next: nextPost } = blog.prevNext(slug);

  useEffect(() => {
    if (!post) router.replace('/blog');
  }, [post, router]);

  // Configure nav with prev/next arrows
  useEffect(() => {
    if (!post) return;
    setPageConfig({
      pagination: {
        prev: prevPost
          ? { label: prevPost.title, href: `/blog/${prevPost.slug}`, onClick: () => router.push(`/blog/${prevPost.slug}`) }
          : undefined,
        next: nextPost
          ? { label: nextPost.title, href: `/blog/${nextPost.slug}`, onClick: () => router.push(`/blog/${nextPost.slug}`) }
          : undefined,
      },
    });
  }, [post, prevPost, nextPost, router, setPageConfig, slug]);

  if (!post) return null;

  const PostContent = POST_COMPONENTS[slug];

  return (
    <PostLayout post={post} PostContent={PostContent} clipFrom={clipFrom} />
  );
}

function PostLayout({
  post,
  PostContent,
  clipFrom,
}: {
  post: NonNullable<ReturnType<typeof blog.get>>;
  PostContent: React.ComponentType | undefined;
  clipFrom: string | null;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const heroInnerRef = useRef<HTMLDivElement>(null);
  const cat = CATEGORIES[post.category] || CATEGORIES.Frontend;

  // Hero gets covered by the content card: inner copy drifts up + fades.
  useGSAP(() => {
    const inner = heroInnerRef.current;
    const hero = heroRef.current;
    if (!inner || !hero) return;
    const tween = gsap.to(inner, {
      yPercent: -8,
      opacity: 0.6,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className="-mt-11 w-full animate-rise pb-20">
      <ProgressBar />

      {/* Hero — sticky, pulled under the navbar, content slides over */}
      <header ref={heroRef} className="sticky -top-11 z-[1] flex min-h-[62vh] items-end overflow-hidden border-b border-[var(--border)] will-change-transform">
        <div ref={heroInnerRef} className="mx-auto w-full max-w-[1160px] px-5 pt-28 pb-14 will-change-[transform,opacity] max-[700px]:px-4">
          <p className="m-0 font-mono text-[0.66rem] tracking-[0.08em] text-[var(--text-dim)]">
            <TransitionLink href="/" className="no-underline transition-colors hover:text-foreground">home</TransitionLink>
            <span aria-hidden="true"> / </span>
            <TransitionLink href="/blog" className="no-underline transition-colors hover:text-foreground">blog</TransitionLink>
          </p>
          <p className="m-0 mt-6 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
            {post.category}
          </p>
          <h1 className="m-0 mt-4 max-w-[18ch] font-display text-[clamp(2rem,5.5vw,3.4rem)] font-bold leading-[1.05] tracking-[var(--tracking-section)] text-foreground">
            {post.title}
          </h1>
          <p className="m-0 mt-3 max-w-[56ch] text-[0.95rem] leading-[1.65] text-muted-foreground">
            {post.excerpt}
          </p>
          <p className="m-0 mt-4 flex items-center gap-2 font-mono text-[0.66rem] text-[var(--text-ghost)]">
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span aria-hidden="true">/</span>
            <span>{post.readTime}</span>
          </p>
        </div>
      </header>

      {/* Content card overlapping the hero */}
      <div className="relative z-[2] -mt-6 rounded-t-[24px] border-t border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto grid w-full max-w-[1160px] gap-10 px-5 pt-10 [grid-template-columns:minmax(0,1fr)_250px] max-[1024px]:grid-cols-1 max-[700px]:px-4">
          <div className="min-w-0">
            {PostContent && clipFrom ? (
              <motion.div
                initial={{ clipPath: clipFrom }}
                animate={{ clipPath: 'inset(0)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <PostContent />
              </motion.div>
            ) : (
              PostContent && <PostContent />
            )}
          </div>
          <aside className="max-[1024px]:hidden">
            <div className="sticky top-24">
              <PostToc />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
