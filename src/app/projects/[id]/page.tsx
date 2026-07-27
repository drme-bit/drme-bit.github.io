import { projects } from '@/features/projects/lib/registry';
import ProjectPageClient from './ProjectPageClient';

export function generateStaticParams() {
  return projects.all.map((project) => ({ id: project.id }));
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectPageClient params={params} />;
}
