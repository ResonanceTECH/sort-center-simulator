export type SemanticStatus =
  | 'NORMAL'
  | 'INFO'
  | 'WARNING'
  | 'HIGH'
  | 'CRITICAL'
  | 'SUCCESS'
  | 'NO_DATA';

export type ComparisonSemantic = 'BEST' | 'RISK' | 'TARGET_REACHED' | 'TARGET_NOT_REACHED';
