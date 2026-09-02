import { Box, Stack, Typography } from '@mui/material';
import { Reveal } from '@/landing/components/Reveal';
import { PRODUCT } from '@/landing/constants/content';
import {
  bodyTextSx,
  cardSx,
  sectionInnerSx,
  sectionSx,
  sectionTitleSx,
  tagPillSx,
} from '@/landing/styles/landingStyles';

export function ProductPitchSection() {
  const { pitch } = PRODUCT;

  return (
    <Box component="section" sx={sectionSx}>
      <Box sx={sectionInnerSx}>
        <Reveal>
          <Box sx={{ ...cardSx, p: `${28}px` }}>
            <Typography component="h2" sx={{ ...sectionTitleSx, mb: 2 }}>
              {pitch.title}
            </Typography>
            <Typography sx={{ ...bodyTextSx, maxWidth: 720, mb: 2.5 }}>{pitch.body}</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
              <Box sx={tagPillSx}>{pitch.audience}</Box>
            </Stack>
          </Box>
        </Reveal>
      </Box>
    </Box>
  );
}
