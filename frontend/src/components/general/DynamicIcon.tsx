import type { SxProps, Theme } from '@mui/material';
import { getIcon } from '@/utils/iconRegistry';

interface DynamicIconProps {
  name: string;
  sx?: SxProps<Theme>;
}

export function DynamicIcon({ name, sx }: DynamicIconProps) {
  const Icon = getIcon(name);
  return <Icon sx={sx} />;
}
