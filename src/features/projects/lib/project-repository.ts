import type { Skill, SkillGroup, SkillCategory } from '@/features/skills/lib/skill-graph';

/*  Types ── */

export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'DEPRECATED';

export interface ProjectStage {
  title: string;
  duration: string;
  desc: string;
}

export interface ProjectData {
  id: string;
  title: string;
  desc: string;
  fullDesc?: string;
  tech: string[];
  status?: string;
  image?: string | null;
  images?: string[];
  url?: string;
  repo?: string;
  features?: string[];
  logo?: string | null;
  stages?: ProjectStage[];
  architecture?: string;
  challenges?: string;
  plans?: string;
  sections?: unknown[];
  video?: string | null;
}

/*  Project class ── */

export class Project {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly fullDesc: string;
  readonly status: ProjectStatus;
  readonly image: string | null;
  readonly images: string[];
  readonly url: string;
  readonly repo: string;
  readonly features: string[];
  readonly logo: string | null;
  readonly stages: ProjectStage[];
  readonly architecture: string;
  readonly challenges: string;
  readonly plans: string;
  readonly sections: unknown[];
  readonly video: string | null;

  techSkills: Skill[] = [];
  readonly _rawTech: string[];

  constructor(data: ProjectData) {
    this.id = data.id;
    this.title = data.title;
    this.desc = data.desc;
    this.fullDesc = data.fullDesc ?? '';
    this.status = (data.status as ProjectStatus) ?? 'ACTIVE';
    this.image = data.image ?? null;
    this.images = data.images ?? [];
    this.url = data.url ?? '#';
    this.repo = data.repo ?? '';
    this.features = data.features ?? [];
    this.logo = data.logo ?? null;
    this.stages = data.stages ?? [];
    this.architecture = data.architecture ?? '';
    this.challenges = data.challenges ?? '';
    this.plans = data.plans ?? '';
    this.sections = data.sections ?? [];
    this.video = data.video ?? null;
    this._rawTech = data.tech ?? [];
  }

  /*  Computed  */

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  get isPaused(): boolean {
    return this.status === 'PAUSED';
  }

  get isDeprecated(): boolean {
    return this.status === 'DEPRECATED';
  }

  get techNames(): string[] {
    return this._rawTech;
  }

  get hasImages(): boolean {
    return this.images.length > 0;
  }

  get hasStages(): boolean {
    return this.stages.length > 0;
  }

  get hasFeatures(): boolean {
    return this.features.length > 0;
  }

  /*  Skill queries  */

  hasSkill(skillName: string): boolean {
    return this.techSkills.some(s => s.name === skillName);
  }

  skillsByGroup(group: SkillGroup): Skill[] {
    return this.techSkills.filter(s => s.group === group);
  }

  skillsByCategory(category: SkillCategory): Skill[] {
    return this.techSkills.filter(s => s.category === category);
  }

  getSkillLevel(skillName: string): number | undefined {
    return this.techSkills.find(s => s.name === skillName)?.level;
  }

  get avgSkillLevel(): number {
    if (this.techSkills.length === 0) return 0;
    const sum = this.techSkills.reduce((acc, s) => acc + s.level, 0);
    return Math.round((sum / this.techSkills.length) * 10) / 10;
  }

  /*  Content  */

  getStage(index: number): ProjectStage | undefined {
    return this.stages[index];
  }

  hasFeature(feature: string): boolean {
    return this.features.some(f => f.includes(feature));
  }
}

/*  ProjectRepository — query layer  */

export class ProjectRepository {
  private _projects = new Map<string, Project>();
  private _skills: (() => Skill[]) | null = null;

  /*  Registration  */

  register(data: ProjectData): Project {
    const project = new Project(data);
    this._projects.set(project.id, project);
    return project;
  }

  registerAll(dataArray: ProjectData[]): Project[] {
    return dataArray.map(d => this.register(d));
  }

  /*  Link to skill graph  */

  linkSkills(skillGetter: () => Skill[]): void {
    this._skills = skillGetter;
    this.resolve();
  }

  private resolve(): void {
    if (!this._skills) return;
    const allSkills = this._skills();

    for (const project of this._projects.values()) {
      project.techSkills = project._rawTech
        .map(name => allSkills.find(s => s.name === name))
        .filter((s): s is Skill => s !== undefined);
    }
  }

  /*  Getters  */

  get(id: string): Project | undefined {
    return this._projects.get(id);
  }

  get all(): Project[] {
    return Array.from(this._projects.values());
  }

  get active(): Project[] {
    return this.all.filter(p => p.isActive);
  }

  get paused(): Project[] {
    return this.all.filter(p => p.isPaused);
  }

  get deprecated(): Project[] {
    return this.all.filter(p => p.isDeprecated);
  }

  /*  Query methods  */

  byStatus(status: ProjectStatus): Project[] {
    return this.all.filter(p => p.status === status);
  }

  bySkill(skillName: string): Project[] {
    return this.all.filter(p => p.hasSkill(skillName));
  }

  bySkills(skillNames: string[]): Project[] {
    return this.all.filter(p => skillNames.every(name => p.hasSkill(name)));
  }

  byGroup(group: SkillGroup): Project[] {
    return this.all.filter(p => p.skillsByGroup(group).length > 0);
  }

  byCategory(category: SkillCategory): Project[] {
    return this.all.filter(p => p.skillsByCategory(category).length > 0);
  }

  /*  Search  */

  search(query: string): Project[] {
    const q = query.toLowerCase();
    return this.all.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.techNames.some(t => t.toLowerCase().includes(q)) ||
      p.features.some(f => f.toLowerCase().includes(q))
    );
  }

  find(predicate: (project: Project) => boolean): Project[] {
    return this.all.filter(predicate);
  }

  /*  Stats  */

  get stats() {
    return {
      total: this._projects.size,
      active: this.active.length,
      paused: this.paused.length,
      deprecated: this.deprecated.length,
      totalFeatures: this.all.reduce((acc, p) => acc + p.features.length, 0),
      totalStages: this.all.reduce((acc, p) => acc + p.stages.length, 0),
    };
  }
}