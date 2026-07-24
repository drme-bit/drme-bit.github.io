export interface Project {
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
  stages?: { title: string; duration: string; desc: string }[];
  architecture?: string;
  challenges?: string;
}

export interface ProjectCardProps {
  project: Project;
  index: number;
  isActive: boolean;
}
