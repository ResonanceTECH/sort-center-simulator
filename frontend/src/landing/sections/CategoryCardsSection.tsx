import { Box } from '@mui/material';
import { CategoryCard } from '@/landing/components/CategoryCard';
import { Reveal } from '@/landing/components/Reveal';
import { PRODUCT } from '@/landing/constants/content';
import { sectionInnerSx, sectionSx } from '@/landing/styles/landingStyles';

export function CategoryCardsSection() {
  return (
    <Box component="section" id={PRODUCT.id} sx={sectionSx}>
      <Box sx={sectionInnerSx}>
        <Reveal>
          <Box className="landing-scroll-row">
            {PRODUCT.capabilities.map((cap) => (
              <CategoryCard
                key={cap.id}
                title={cap.title}
                tags={cap.tags}
                image={'image' in cap ? cap.image : undefined}
                lottie={'lottie' in cap ? cap.lottie : undefined}
              />
            ))}
          </Box>
        </Reveal>
      </Box>
    </Box>
  );
}
