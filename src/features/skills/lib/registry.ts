import { SkillGraph } from './skill-graph';
import type { SkillData } from './skill-graph';
import { SKILLS_DATA, ICON_MAP } from './raw-data';
import { PROJECTS } from '@/features/projects/lib/raw-data';
import { GROUP_COLORS } from './constants';

/*  Singleton graph instance ── */

export const graph = new SkillGraph();

/*  Register all skills  */

graph.registerSkills(SKILLS_DATA as SkillData[]);

/*  Register all projects  */

for (const project of PROJECTS) {
  graph.registerProject({
    id: project.id,
    title: project.title,
    desc: project.desc,
    tech: project.tech,
    status: project.status ?? 'ACTIVE',
    image: project.image ?? null,
  });
}

/*  Resolve all bidirectional refs  */

graph.resolve();

/*  Attach icons to skills  */

for (const skill of graph.allSkills) {
  skill.icon = ICON_MAP[skill.name];
}

/*  Re-export for convenience  */

export { GROUP_COLORS, ICON_MAP };
