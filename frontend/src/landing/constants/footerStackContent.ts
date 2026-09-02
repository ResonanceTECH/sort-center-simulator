export type FooterStackIconId =
  | 'react'
  | 'typescript'
  | 'vite'
  | 'mui'
  | 'gsap'
  | 'fastapi'
  | 'postgresql'
  | 'python'
  | 'numpy'
  | 'networkx'
  | 'mujoco';

export interface FooterStackItem {
  id: string;
  name: string;
  icon: FooterStackIconId;
  span?: 1 | 2;
}

export const FOOTER_STACK_ITEMS: FooterStackItem[] = [
  { id: 'react', name: 'React 19', icon: 'react', span: 2 },
  { id: 'typescript', name: 'TypeScript', icon: 'typescript' },
  { id: 'vite', name: 'Vite', icon: 'vite' },
  { id: 'mui', name: 'MUI', icon: 'mui' },
  { id: 'gsap', name: 'GSAP', icon: 'gsap', span: 2 },
  { id: 'fastapi', name: 'FastAPI', icon: 'fastapi' },
  { id: 'python', name: 'Python', icon: 'python' },
  { id: 'postgresql', name: 'PostgreSQL', icon: 'postgresql' },
  { id: 'numpy', name: 'NumPy', icon: 'numpy' },
  { id: 'networkx', name: 'NetworkX', icon: 'networkx' },
  { id: 'mujoco', name: 'MuJoCo', icon: 'mujoco', span: 2 },
];
