import { DynamicIcon } from '@/components/general/DynamicIcon';

interface NavIconProps {
  name: string;
  sx?: object;
}

export function NavIcon({ name, sx }: NavIconProps) {
  return <DynamicIcon name={name} sx={{ fontSize: 20, ...sx }} />;
}
