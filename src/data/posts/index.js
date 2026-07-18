import buildingMyPortfolio from './building-my-portfolio';
import whyReplacedCobe from './why-i-replaced-cobe-with-three-globe';

export const BLOG_POSTS = [whyReplacedCobe, buildingMyPortfolio];

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostIndex(slug) {
  return BLOG_POSTS.findIndex((post) => post.slug === slug);
}
