import { describe, it, expect, beforeEach } from 'vitest';
import { BlogRepository } from './blog-repository';
import type { BlogPostData } from './types';

const A: BlogPostData = {
  slug: 'post-a', title: 'Alpha', date: '2025-01-01', readTime: '3 min', category: 'dev',
  excerpt: 'a', summary: 'a', tags: ['react'], featured: true,
};
const B: BlogPostData = {
  slug: 'post-b', title: 'Beta', date: '2025-06-01', readTime: '5 min', category: 'dev',
  excerpt: 'b', summary: 'b', tags: ['rust'],
};
const C: BlogPostData = {
  slug: 'post-c', title: 'Gamma', date: '2025-03-01', readTime: '2 min', category: 'meta',
  excerpt: 'c', summary: 'c', tags: ['design', 'react'],
};

function buildRepo(): BlogRepository {
  const repo = new BlogRepository();
  repo.registerAll([A, B, C]);
  return repo;
}

let repo: BlogRepository;

beforeEach(() => {
  repo = buildRepo();
});

describe('BlogRepository', () => {
  it('gets and lists posts', () => {
    expect(repo.get('post-a')!.title).toBe('Alpha');
    expect(repo.get('missing')).toBeUndefined();
    expect(repo.all).toHaveLength(3);
  });

  it('separates featured and recent', () => {
    expect(repo.featured.map(p => p.slug)).toEqual(['post-a']);
    /*  recent: non-featured, newest first  */
    expect(repo.recent.map(p => p.slug)).toEqual(['post-b', 'post-c']);
  });

  it('groups categories and filters by them', () => {
    expect(repo.categories.sort()).toEqual(['dev', 'meta']);
    expect(repo.byCategory('dev').map(p => p.slug).sort()).toEqual(['post-a', 'post-b']);
    expect(repo.byCategory('nope')).toEqual([]);
  });

  it('searches title and tags', () => {
    expect(repo.search('alpha').map(p => p.slug)).toEqual(['post-a']);
    expect(repo.search('react').map(p => p.slug).sort()).toEqual(['post-a', 'post-c']);
    expect(repo.search('missing')).toEqual([]);
  });

  it('provides prev/next navigation', () => {
    const first = repo.prevNext('post-a');
    expect(first.prev).toBeNull();
    expect(first.next?.slug).toBe('post-b');

    const last = repo.prevNext('post-c');
    expect(last.next).toBeNull();
    expect(last.prev?.slug).toBe('post-b');

    expect(repo.prevNext('missing')).toEqual({ prev: null, next: null });
  });

  it('formats dates and reports stats', () => {
    expect(repo.get('post-a')!.formattedDate).toMatch(/Jan 1, 2025/);
    expect(repo.stats).toEqual({ total: 3, featured: 1, categories: 2 });
  });
});
