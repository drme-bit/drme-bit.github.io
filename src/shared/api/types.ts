import type { BlogSection } from '@/features/blog/lib';

/*  Post DTOs ── */

export interface PostListDto {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
  summary: string;
  tags: string[];
  featured: boolean;
  icon: string;
  coverImage: string;
  formattedDate: string;
}

export interface PostDetailDto extends PostListDto {
  theme: {
    primary: string;
    bg: string;
    accent: string;
    glow: string;
  };
  sections: BlogSection[];
}

/*  Project DTOs ── */

export interface ProjectSkillDto {
  name: string;
  level: number;
  group: string;
  category: string;
}

export interface ProjectListDto {
  id: string;
  title: string;
  desc: string;
  status: string;
  image: string | null;
  url: string;
  repo: string;
  tech: string[];
  features: string[];
}

export interface ProjectDetailDto extends ProjectListDto {
  fullDesc: string;
  images: string[];
  logo: string | null;
  stages: { title: string; duration: string; desc: string }[];
  architecture: string;
  challenges: string;
  plans: string;
  video: string | null;
  techSkills: ProjectSkillDto[];
  avgSkillLevel: number;
}