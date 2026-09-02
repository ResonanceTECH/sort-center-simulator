import type { ReactNode } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export interface EntityTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface EntityTabsProps {
  tabs: EntityTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function EntityTabs({ tabs, activeTab, onTabChange }: EntityTabsProps) {
  const active = tabs.find((t) => t.id === activeTab);

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, v: string) => onTabChange(v)}
        sx={{
          mb: 2,
          borderBottom: kit.border.hairline,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.id} value={tab.id} label={tab.label} />
        ))}
      </Tabs>
      {active?.content}
    </Box>
  );
}
