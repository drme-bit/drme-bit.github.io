import { blog } from '@/features/blog/lib';
import { projects } from '@/features/projects/lib/registry';
import type { BlogPost } from '@/features/blog/lib';
import type { Project } from '@/features/projects/lib';

export interface ContentSource {
  listPosts(): BlogPost[];
  getPost(slug: string): BlogPost | null;
  listProjects(): Project[];
  getProject(id: string): Project | null;
}

class StaticContentSource implements ContentSource {
  listPosts(): BlogPost[] {
    return blog.all;
  }

  getPost(slug: string): BlogPost | null {
    return blog.get(slug) ?? null;
  }

  listProjects(): Project[] {
    return projects.all;
  }

  getProject(id: string): Project | null {
    return projects.get(id) ?? null;
  }
}

export const contentSource: ContentSource = new StaticContentSource();