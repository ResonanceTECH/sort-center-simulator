import { StatusChip } from '@/components/status/StatusChip';
import type { SemanticStatus } from '@/types/scm/semantic';

const RISK_LABEL: Partial<Record<SemanticStatus, string>> = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  WARNING: 'MEDIUM',
  NO_DATA: 'NO DATA',
  NORMAL: 'NORMAL',
  INFO: 'INFO',
  SUCCESS: 'OK',
};

interface ShipmentRiskBadgeProps {
  status: SemanticStatus;
  size?: 'small' | 'medium';
}

export function ShipmentRiskBadge({ status, size = 'small' }: ShipmentRiskBadgeProps) {
  return <StatusChip status={status} label={RISK_LABEL[status] ?? status} size={size} />;
}
