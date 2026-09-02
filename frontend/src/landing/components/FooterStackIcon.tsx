import type { FooterStackIconId } from '@/landing/constants/footerStackContent';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true as const,
};

export function FooterStackIcon({ id }: { id: FooterStackIconId }) {
  switch (id) {
    case 'react':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="2.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(60 12 12)"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(120 12 12)"
          />
        </svg>
      );
    case 'typescript':
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 10h8v1.6H11v6.4H9V11.6H8V10zm7.8 3.2c.8-.2 1.4-.7 1.8-1.4.4.7 1 1.2 1.8 1.4-.6.8-1.5 1.3-2.6 1.3s-2-.5-2.6-1.3z" />
        </svg>
      );
    case 'vite':
      return (
        <svg {...iconProps}>
          <path d="M12 3 4 6.5v7L12 21l8-7.5v-7L12 3zm0 2.2 5.5 2.5L12 10.2 6.5 7.7 12 5.2zM6 8.8l5 2.3v6.8l-5-4.6V8.8zm12 0v4.5l-5 4.6v-6.8l5-2.3z" />
        </svg>
      );
    case 'mui':
      return (
        <svg {...iconProps}>
          <path d="M4 6.5 12 4l8 2.5v11L12 20l-8-2.5V6.5zm2 1.8v7.9l5 1.6V9.9L6 8.3zm10 0-5 1.6v6.9l5-1.6V8.3z" />
        </svg>
      );
    case 'gsap':
      return (
        <svg {...iconProps}>
          <path d="M5 17V7h4.2c2.4 0 3.8 1.2 3.8 3.1 0 1.3-.7 2.3-1.9 2.8L14 17h-2.4l-2.3-3.6H7.2V17H5zm2.2-5.4h1.8c1 0 1.5-.5 1.5-1.3s-.5-1.2-1.5-1.2H7.2v2.5zM15 17V7h5.5v1.8H17v2.5h3v1.7h-3v2.2h3.5V17H15z" />
        </svg>
      );
    case 'fastapi':
      return (
        <svg {...iconProps}>
          <path d="M12 3 4 19h3.5l1.3-3h7.4l1.3 3H20L12 3zm0 6.2 2.4 5.6H9.6L12 9.2z" />
        </svg>
      );
    case 'python':
      return (
        <svg {...iconProps}>
          <path d="M12 4c-2.8 0-4.2 1.4-4.2 3.1V9h4.1v1H7.3C5.1 10 4 11.3 4 13.4 4 15.8 5.4 17 7.8 17H9v-2.8c0-1.8 1.2-3.2 3-3.2h3.4c1.9 0 3.1-1.5 3.1-3.4V7.1C18.5 5.4 17.1 4 14.3 4H12zm-1.1 1.8c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zM12 20c2.8 0 4.2-1.4 4.2-3.1V15h-4.1v-1h4.8c2.2 0 3.3 1.3 3.3 3.4 0 2.4-1.4 3.6-3.8 3.6H15v2.8c0 1.8-1.2 3.2-3 3.2H8.6c-1.9 0-3.1 1.5-3.1 3.4V16.9C5.5 18.6 6.9 20 9.7 20H12zm1.1-1.8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
        </svg>
      );
    case 'postgresql':
      return (
        <svg {...iconProps}>
          <path d="M12 3c-3.1 0-5.5 2.2-5.5 5.5 0 2.1 1.1 3.9 2.8 4.9L8 21l2.5-1.2c.5.1 1 .2 1.5.2 3.1 0 5.5-2.2 5.5-5.5S15.1 3 12 3zm0 2c1.9 0 3.5 1.6 3.5 3.5S13.9 12 12 12s-3.5-1.6-3.5-3.5S10.1 5 12 5z" />
        </svg>
      );
    case 'numpy':
      return (
        <svg {...iconProps}>
          <path d="M5 5h3.5l2 6.5L12.5 5H16l-3.5 14h-2.2L7 9.5 5.8 19H3L5 5zm11.5 0H20l-1.8 7.2L20 19h-3.5l-1.3-5.2L14 19h-3.3l3.8-14z" />
        </svg>
      );
    case 'networkx':
      return (
        <svg {...iconProps}>
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="6" r="2.2" />
          <circle cx="12" cy="18" r="2.2" />
          <path d="M7.8 7.5 10.5 16M16.2 7.5 13.5 16M8 6h8" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'mujoco':
      return (
        <svg {...iconProps}>
          <path d="M6 8h12v2H6V8zm0 6h12v2H6v-2zm2-4v8h2V10H8zm6 0v8h2V10h-2z" />
        </svg>
      );
    default:
      return null;
  }
}
