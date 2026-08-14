export const PROJECT_STATUS_LABELS = {
  active: 'Активный',
  draft: 'Черновик',
  archived: 'Архив',
} as const;

/** Status styling within Ozon palette only */
export const PROJECT_STATUS_STYLES = {
  active: {
    color: '#005BFF',
    background: 'rgba(0, 91, 255, 0.10)',
  },
  draft: {
    color: 'rgba(0, 26, 52, 0.64)',
    background: 'rgba(0, 26, 52, 0.06)',
  },
  archived: {
    color: '#001A34',
    background: 'rgba(0, 26, 52, 0.10)',
  },
} as const;
