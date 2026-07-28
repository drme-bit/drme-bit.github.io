import type { BlogPostData, BlogSection } from './types';

/*  BlogPost class ── */

export class BlogPost {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly readTime: string;
  readonly category: string;
  readonly excerpt: string;
  readonly summary: string;
  readonly tags: string[];
  readonly featured: boolean;
  readonly icon: string;
  readonly coverImage: string;
  readonly sections: BlogSection[];
  readonly theme: {
    primary: string;
    bg: string;
    accent: string;
    glow: string;
  };

  constructor(data: BlogPostData) {
    this.slug = data.slug;
    this.title = data.title;
    this.date = data.date;
    this.readTime = data.readTime;
    this.category = data.category;
    this.excerpt = data.excerpt;
    this.summary = data.summary;
    this.tags = data.tags ?? [];
    this.featured = data.featured ?? false;
    this.icon = data.icon ?? '';
    this.coverImage = data.coverImage ?? '';
    this.sections = data.sections ?? [];
    this.theme = data.theme ?? {
      primary: 'var(--accent-secondary)',
      bg: 'var(--bg)',
      accent: 'var(--accent-secondary)',
      glow: 'rgba(125, 211, 252, 0.1)',
    };
  }

  get formattedDate(): string {
    return new Date(this.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  get formattedDateLong(): string {
    return new Date(this.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/*  BlogRepository — query layer ── */

export class BlogRepository {
  private _posts = new Map<string, BlogPost>();

  /*  Registration  */

  register(data: BlogPostData): BlogPost {
    const post = new BlogPost(data);
    this._posts.set(post.slug, post);
    return post;
  }

  registerAll(dataArray: BlogPostData[]): BlogPost[] {
    return dataArray.map(d => this.register(d));
  }

  /*  Getters  */

  get(slug: string): BlogPost | undefined {
    return this._posts.get(slug);
  }

  get all(): BlogPost[] {
    return Array.from(this._posts.values());
  }

  get featured(): BlogPost[] {
    return this.all.filter(p => p.featured);
  }

  get recent(): BlogPost[] {
    return this.all
      .filter(p => !p.featured)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get categories(): string[] {
    return [...new Set(this.all.map(p => p.category))];
  }

  /*  Query methods  */

  byCategory(category: string): BlogPost[] {
    return this.all.filter(p => p.category === category);
  }

  search(query: string): BlogPost[] {
    const q = query.toLowerCase();
    return this.all.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  prevNext(slug: string): { prev: BlogPost | null; next: BlogPost | null } {
    const list = this.all;
    const idx = list.findIndex(p => p.slug === slug);
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx < list.length - 1 ? list[idx + 1] : null,
    };
  }

  /*  Stats  */

  get stats() {
    return {
      total: this._posts.size,
      featured: this.featured.length,
      categories: this.categories.length,
    };
  }
}
