import { Box } from '@mui/material';
import { RecentProjects } from '@/components/general/RecentProjects';
import { WelcomeRow } from '@/components/general/WelcomeSection';
import type { DashboardData } from '@/types/general';

interface GeneralContentProps {
  data: DashboardData;
  searchQuery: string;
}

export function GeneralContent({ data, searchQuery }: GeneralContentProps) {
  return (
    <>
      <WelcomeRow />
      <Box sx={{ mb: 3 }}>
        <RecentProjects projects={data.projects} searchQuery={searchQuery} />
      </Box>
    </>
  );
}
