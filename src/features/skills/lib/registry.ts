import { SkillGraph } from '@/entities/skill';
import type { SkillData } from '@/entities/skill';
import { SKILLS_DATA, ICON_MAP } from '@/entities/skill';
import { PROJECTS } from '@/entities/project';
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
