import { BlogRepository } from './blog-repository';
import type { BlogPostData } from './types';

/*  Import all post metadata  */

import integratingMeta from '@/data/posts/integrating-nodejs/meta';
import cobeMeta from '@/data/posts/why-i-replaced-cobe/meta';
import portfolioMeta from '@/data/posts/building-my-portfolio/meta';

/*  Raw data array (used by list page for sync access)  */

export const BLOG_POSTS_DATA: BlogPostData[] = [
  integratingMeta,
  cobeMeta,
  portfolioMeta,
];

/*  Singleton repository instance  */

export const blog = new BlogRepository();
blog.registerAll(BLOG_POSTS_DATA);

/*  Re-export  */

export { CATEGORIES } from './constants';
