export const PROJECT_STATUS_LABELS = {
  active: 'Активный',
  draft: 'Черновик',
  archived: 'Архив',
} as const;

/** Status styling within zinc landing palette */
export const PROJECT_STATUS_STYLES = {
  active: {
    color: '#09090b',
    background: 'rgba(9, 9, 11, 0.08)',
  },
  draft: {
    color: '#52525b',
    background: 'rgba(9, 9, 11, 0.04)',
  },
  archived: {
    color: '#09090b',
    background: 'rgba(9, 9, 11, 0.08)',
  },
} as const;
