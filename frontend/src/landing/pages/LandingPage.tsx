import { LandingLayout } from '@/landing/components/LandingLayout';
import { CtaSection } from '@/landing/sections/CtaSection';
import { DarkFeaturesSection } from '@/landing/sections/DarkFeaturesSection';
import { EmergingPanelSection } from '@/landing/sections/EmergingPanelSection';
import { FaqSection } from '@/landing/sections/FaqSection';
import { HeroSection } from '@/landing/sections/HeroSection';
import { ProductPitchSection } from '@/landing/sections/ProductPitchSection';
import { ScreensSection } from '@/landing/sections/ScreensSection';
import { WorkflowScrollSection } from '@/landing/sections/WorkflowScrollSection';

export function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <WorkflowScrollSection />
      <DarkFeaturesSection />
      <ScreensSection />
      <ProductPitchSection />
      <EmergingPanelSection />
      <FaqSection />
      <CtaSection />
    </LandingLayout>
  );
}
