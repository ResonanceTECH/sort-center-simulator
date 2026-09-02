import { SCREENS_SHOWCASE, SCREENS_SHOWCASE_ITEMS } from '@/landing/constants/screensShowcaseContent';
import { ScreensShowcaseSection } from '@/landing/sections/ScreensShowcaseSection';

export function ScreensSection() {
  return (
    <ScreensShowcaseSection
      id={SCREENS_SHOWCASE.id}
      title={SCREENS_SHOWCASE.title}
      subtitle={SCREENS_SHOWCASE.subtitle}
      items={SCREENS_SHOWCASE_ITEMS}
    />
  );
}
