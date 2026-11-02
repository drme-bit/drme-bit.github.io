import type { BlogPost } from '@/features/blog/lib';
import type { Project } from '@/features/projects/lib';
import type {
  PostDetailDto,
  PostListDto,
  ProjectDetailDto,
  ProjectListDto,
  ProjectSkillDto,
} from './types';

export function serializePostSummary(p: BlogPost): PostListDto {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    readTime: p.readTime,
    category: p.category,
    excerpt: p.excerpt,
    summary: p.summary,
    tags: p.tags,
    featured: p.featured,
    icon: p.icon,
    coverImage: p.coverImage,
    formattedDate: p.formattedDate,
  };
}

export function serializePostDetail(p: BlogPost): PostDetailDto {
  return {
    ...serializePostSummary(p),
    theme: p.theme,
    sections: p.sections,
  };
}

export function serializeProjectSkill(s: Project['techSkills'][number]): ProjectSkillDto {
  return {
    name: s.name,
    level: s.level,
    group: s.group,
    category: s.category,
  };
}

export function serializeProjectSummary(pr: Project): ProjectListDto {
  return {
    id: pr.id,
    title: pr.title,
    desc: pr.desc,
    status: pr.status,
    image: pr.image,
    url: pr.url,
    repo: pr.repo,
    tech: pr.techNames,
    features: pr.features,
  };
}

export function serializeProjectDetail(pr: Project): ProjectDetailDto {
  return {
    ...serializeProjectSummary(pr),
    fullDesc: pr.fullDesc,
    images: pr.images,
    logo: pr.logo,
    stages: pr.stages,
    architecture: pr.architecture,
    challenges: pr.challenges,
    plans: pr.plans,
    video: pr.video,
    techSkills: pr.techSkills.map(serializeProjectSkill),
    avgSkillLevel: pr.avgSkillLevel,
  };
}