export type ProjectStatus = 'active' | 'draft' | 'archived';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  throughput: string;
  area: string;
  updatedAt: string;
  thumbnail: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardData {
  projects: Project[];
  notifications: Notification[];
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}
