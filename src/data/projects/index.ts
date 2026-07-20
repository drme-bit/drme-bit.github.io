import nexagon from './nexagon';
import roblox from './roblox';

export { createProject, STATUS, PRESENTATION } from './helpers';

export const PROJECTS = [nexagon, roblox];

export function getProjectById(id: string) {
  return PROJECTS.find(p => p.id === id);
}

export function getProjectIndex(id: string) {
  return PROJECTS.findIndex(p => p.id === id);
}
