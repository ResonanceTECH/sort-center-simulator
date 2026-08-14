import { createContext, useContext } from 'react';
import type { ScenarioDetail } from '@/types/projectWorkspace';

export interface ScenarioOutletContext {
  scenario: ScenarioDetail;
}

export const ScenarioContext = createContext<ScenarioOutletContext | null>(null);

export function useScenarioContext() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error('useScenarioContext must be used within ScenarioLayout');
  }
  return ctx;
}
