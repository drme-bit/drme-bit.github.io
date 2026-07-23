import { PROJECTS } from '@/data/projectsData';
import ProjectPageClient from './ProjectPageClient';

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectPageClient params={params} />;
}
