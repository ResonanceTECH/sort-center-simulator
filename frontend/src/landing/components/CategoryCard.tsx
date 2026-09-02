import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { LottiePlayer } from '@/landing/components/LottiePlayer';
import { cardSx, tagPillSx } from '@/landing/styles/landingStyles';
import { LANDING } from '@/landing/styles/tokens';

interface CategoryCardProps {
  title: string;
  tags: readonly string[];
  image?: string;
  lottie?: string;
  width?: string | number | Record<string, string | number>;
}

export function CategoryCard({ title, tags, image, lottie, width = { xs: 280, md: 320 } }: CategoryCardProps) {
  return (
    <Box sx={{ ...cardSx, width, flex: '0 0 auto' }}>
      <Box
        sx={{
          height: 200,
          bgcolor: LANDING.subtle,
          borderBottom: `1px solid ${LANDING.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {image ? (
          <Box
            component="img"
            src={image}
            alt={title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
        ) : lottie ? (
          <LottiePlayer src={lottie} ariaLabel={title} maxWidth="100%" />
        ) : null}
      </Box>
      <Box sx={{ p: `${LANDING.cardPadding}px` }}>
        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: LANDING.ink,
            mb: 1.5,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>
        <TagRow>{tags.map((tag) => (
          <Box key={tag} sx={tagPillSx}>
            {tag}
          </Box>
        ))}</TagRow>
      </Box>
    </Box>
  );
}

function TagRow({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
      {children}
    </Stack>
  );
}
