import buildingMyPortfolio from './building-my-portfolio';

export const BLOG_POSTS = [buildingMyPortfolio];

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostIndex(slug) {
  return BLOG_POSTS.findIndex((post) => post.slug === slug);
}
