import { createContext, useContext } from 'react';
import type { ProjectDetail } from '@/types/projectWorkspace';
import type { ProjectAccess } from '@/types/rbac';

export interface ProjectOutletContext {
  project: ProjectDetail;
  access: ProjectAccess | null;
  refresh: () => void;
}

export const ProjectContext = createContext<ProjectOutletContext | null>(null);

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProjectContext must be used within ProjectLayout');
  }
  return ctx;
}
