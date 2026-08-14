import type { SvgIconComponent } from '@mui/icons-material';
import {
  ArticleOutlined,
  BarChartOutlined,
  CheckCircleOutline,
  CompareArrowsOutlined,
  DescriptionOutlined,
  EditOutlined,
  ErrorOutline,
  FolderOutlined,
  HelpOutline,
  PlayCircleOutline,
  SettingsOutlined,
  TuneOutlined,
  ViewInArOutlined,
} from '@mui/icons-material';

const ICON_REGISTRY: Record<string, SvgIconComponent> = {
  FolderOutlined,
  EditOutlined,
  TuneOutlined,
  PlayCircleOutline,
  ViewInArOutlined,
  BarChartOutlined,
  CompareArrowsOutlined,
  DescriptionOutlined,
  ArticleOutlined,
  SettingsOutlined,
  CheckCircleOutline,
  ErrorOutline,
};

export function getIcon(name: string): SvgIconComponent {
  return ICON_REGISTRY[name] ?? HelpOutline;
}
