import type { IconType } from 'react-icons';

/*  Types ── */

export type SkillGroup = 'frontend' | 'backend' | 'tools';
export type SkillCategory = 'language' | 'framework' | 'runtime' | 'database' | 'DevOps' | 'graphics' | 'other';

export interface SkillData {
  name: string;
  group: SkillGroup;
  category: SkillCategory;
  level: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  desc: string;
  funLevel: string;
  related: string[];
  projects: string[];
}

export interface ProjectData {
  id: string;
  title: string;
  desc: string;
  tech: string[];
  status?: string;
  image?: string | null;
}

/*  Skill class ── */

export class Skill {
  readonly name: string;
  readonly group: SkillGroup;
  readonly category: SkillCategory;
  readonly level: number;
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
  readonly desc: string;
  readonly funLevel: string;

  /* raw string refs stored for deferred resolution */
  readonly _relatedNames: string[];
  readonly _projectIds: string[];

  relatedSkills: Skill[] = [];
  usedInProjects: Project[] = [];
  icon?: IconType;

  constructor(data: SkillData) {
    this.name = data.name;
    this.group = data.group;
    this.category = data.category;
    this.level = data.level;
    this.difficulty = data.difficulty;
    this.desc = data.desc;
    this.funLevel = data.funLevel;
    this._relatedNames = data.related ?? [];
    this._projectIds = data.projects ?? [];
  }

  get difficultyLabel(): string {
    const labels = { 1: 'beginner', 2: 'easy', 3: 'moderate', 4: 'hard', 5: 'expert' };
    return labels[this.difficulty];
  }

  get levelPercent(): number {
    return (this.level / 5) * 100;
  }

  hasProject(projectId: string): boolean {
    return this.usedInProjects.some(p => p.id === projectId);
  }

  isRelatedTo(skillName: string): boolean {
    return this.relatedSkills.some(s => s.name === skillName);
  }
}

/*  Project class ── */

export class Project {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly status: string;
  readonly image: string | null;
  readonly _rawTech: string[];

  techSkills: Skill[] = [];

  constructor(data: ProjectData) {
    this.id = data.id;
    this.title = data.title;
    this.desc = data.desc;
    this.status = data.status ?? 'ACTIVE';
    this.image = data.image ?? null;
    this._rawTech = data.tech ?? [];
  }

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  get skillNames(): string[] {
    return this.techSkills.map(s => s.name);
  }

  hasSkill(skillName: string): boolean {
    return this.techSkills.some(s => s.name === skillName);
  }

  skillsByGroup(group: SkillGroup): Skill[] {
    return this.techSkills.filter(s => s.group === group);
  }

  skillsByCategory(category: SkillCategory): Skill[] {
    return this.techSkills.filter(s => s.category === category);
  }
}

/*  SkillGraph — bidirectional relationship manager ── */

export class SkillGraph {
  private _skills = new Map<string, Skill>();
  private _projects = new Map<string, Project>();
  private _resolved = false;

  /*  Registration  */

  registerSkill(data: SkillData): Skill {
    const skill = new Skill(data);
    this._skills.set(skill.name, skill);
    this._resolved = false;
    return skill;
  }

  registerProject(data: ProjectData): Project {
    const project = new Project(data);
    this._projects.set(project.id, project);
    this._resolved = false;
    return project;
  }

  registerSkills(dataArray: SkillData[]): Skill[] {
    return dataArray.map(d => this.registerSkill(d));
  }

  registerProjects(dataArray: ProjectData[]): Project[] {
    return dataArray.map(d => this.registerProject(d));
  }

  /*  Resolution — resolves string refs to object refs  */

  resolve(): this {
    this._resolved = true;

    for (const skill of this._skills.values()) {
      skill.relatedSkills = skill._relatedNames
        .filter(name => this._skills.has(name))
        .map(name => this._skills.get(name)!);
    }

    for (const project of this._projects.values()) {
      project.techSkills = project._rawTech
        .filter(name => this._skills.has(name))
        .map(name => this._skills.get(name)!);
    }

    for (const skill of this._skills.values()) {
      skill.usedInProjects = skill._projectIds
        .filter(id => this._projects.has(id))
        .map(id => this._projects.get(id)!);
    }

    return this;
  }

  private ensureResolved(): void {
    if (!this._resolved) this.resolve();
  }

  /*  Getters  */

  getSkill(name: string): Skill | undefined {
    this.ensureResolved();
    return this._skills.get(name);
  }

  getProject(id: string): Project | undefined {
    this.ensureResolved();
    return this._projects.get(id);
  }

  get allSkills(): Skill[] {
    this.ensureResolved();
    return Array.from(this._skills.values());
  }

  get allProjects(): Project[] {
    this.ensureResolved();
    return Array.from(this._projects.values());
  }

  /*  Query methods  */

  skillsByGroup(group: SkillGroup): Skill[] {
    this.ensureResolved();
    return this.allSkills.filter(s => s.group === group);
  }

  skillsByCategory(category: SkillCategory): Skill[] {
    this.ensureResolved();
    return this.allSkills.filter(s => s.category === category);
  }

  skillsUsedInProject(projectId: string): Skill[] {
    this.ensureResolved();
    const project = this._projects.get(projectId);
    return project ? project.techSkills : [];
  }

  projectsUsingSkill(skillName: string): Project[] {
    this.ensureResolved();
    const skill = this._skills.get(skillName);
    return skill ? skill.usedInProjects : [];
  }

  relatedSkills(skillName: string): Skill[] {
    this.ensureResolved();
    const skill = this._skills.get(skillName);
    return skill ? skill.relatedSkills : [];
  }

  /*  Filter / search  */

  findSkills(predicate: (skill: Skill) => boolean): Skill[] {
    this.ensureResolved();
    return this.allSkills.filter(predicate);
  }

  findProjects(predicate: (project: Project) => boolean): Project[] {
    this.ensureResolved();
    return this.allProjects.filter(predicate);
  }

  searchSkills(query: string): Skill[] {
    const q = query.toLowerCase();
    return this.findSkills(s =>
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.group.includes(q) ||
      s.category.includes(q)
    );
  }

  /*  Stats  */

  get stats() {
    this.ensureResolved();
    return {
      totalSkills: this._skills.size,
      totalProjects: this._projects.size,
      byGroup: {
        frontend: this.skillsByGroup('frontend').length,
        backend: this.skillsByGroup('backend').length,
        tools: this.skillsByGroup('tools').length,
      },
      byCategory: Object.fromEntries(
        (['language', 'framework', 'runtime', 'database', 'DevOps', 'graphics', 'other'] as SkillCategory[])
          .map(cat => [cat, this.skillsByCategory(cat).length])
      ),
    };
  }
}