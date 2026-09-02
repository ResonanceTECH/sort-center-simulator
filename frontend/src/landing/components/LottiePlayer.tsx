import { Lottie } from 'lottie-react';
import { Box, Skeleton } from '@mui/material';
import { Suspense } from 'react';

interface LottiePlayerProps {
  src: string;
  loop?: boolean;
  ariaLabel?: string;
  maxWidth?: number | string;
}

export function LottiePlayer({
  src,
  loop = true,
  ariaLabel,
  maxWidth = 480,
}: LottiePlayerProps) {
  return (
    <Box
      role="img"
      aria-label={ariaLabel}
      sx={{ width: '100%', maxWidth, mx: 'auto' }}
    >
      <Suspense
        fallback={
          <Skeleton
            variant="rounded"
            sx={{ width: '100%', aspectRatio: '1', borderRadius: '16px' }}
          />
        }
      >
        <Lottie src={src} loop={loop} autoplay style={{ width: '100%' }} />
      </Suspense>
    </Box>
  );
}
