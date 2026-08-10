import { ProjectRepository } from './project-repository';
import { PROJECTS } from '@/entities/project';
import { graph } from '@/features/skills/lib/registry';
import type { ProjectData } from './project-repository';

/*  Singleton repository instance ── */

export const projects = new ProjectRepository();

/*  Register all projects from data  */

for (const project of PROJECTS) {
  projects.register({
    id: project.id,
    title: project.title,
    desc: project.desc,
    fullDesc: project.fullDesc,
    tech: project.tech,
    status: project.status ?? 'ACTIVE',
    image: project.image ?? null,
    images: project.images ?? [],
    url: project.url ?? '#',
    repo: project.repo ?? '',
    features: project.features ?? [],
    logo: project.logo ?? null,
    stages: project.stages ?? [],
    architecture: project.architecture ?? '',
    challenges: project.challenges ?? '',
    plans: project.plans ?? '',
    sections: project.sections ?? [],
    video: project.video ?? null,
  } as ProjectData);
}

/*  Link to skill graph for bidirectional resolution  */

projects.linkSkills(() => graph.allSkills);
