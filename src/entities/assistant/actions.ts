/*  Action links let the model point at real portfolio destinations without
    knowing the site's routing. The assistant writes `assistant://projects`,
    the UI validates it here and turns it into a normal in-app link.  */

const SECTION_ROUTES: Record<string, string> = {
  home: '/#hero',
  about: '/#about',
  experience: '/#experience',
  projects: '/#projects',
  blog: '/#blog',
  reviews: '/#reviews',
  contact: '/#contact',
  resume: '/resume',
};

export function resolveAssistantAction(raw: string): string | null {
  if (!raw.startsWith('assistant://')) return null;

  const target = raw.slice('assistant://'.length).replace(/^\/+|\/+$/g, '');
  if (!target) return null;

  if (target.startsWith('project/')) {
    const id = target.slice('project/'.length);
    return /^[a-z0-9-]+$/i.test(id) ? `/projects/${id}` : null;
  }

  if (target.startsWith('blog/')) {
    const slug = target.slice('blog/'.length);
    return /^[a-z0-9-]+$/i.test(slug) ? `/blog/${slug}` : null;
  }

  return SECTION_ROUTES[target] ?? null;
}
