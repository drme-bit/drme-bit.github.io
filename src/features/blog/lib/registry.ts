import { BlogRepository } from './blog-repository';
import type { BlogPostData } from './types';

/*  Import all post metadata  */

import integratingMeta from '@/entities/post/integrating-nodejs/meta';
import cobeMeta from '@/entities/post/why-i-replaced-cobe/meta';
import portfolioMeta from '@/entities/post/building-my-portfolio/meta';
import discordMeta from '@/entities/post/discord-orb-quests/meta';

/*  Raw data array (used by list page for sync access)  */

export const BLOG_POSTS_DATA: BlogPostData[] = [
  integratingMeta,
  cobeMeta,
  portfolioMeta,
  discordMeta,
];

/*  Singleton repository instance  */

export const blog = new BlogRepository();
blog.registerAll(BLOG_POSTS_DATA);

/*  Re-export  */

export { CATEGORIES } from './constants';
